import { createReadStream, existsSync } from "node:fs";
import { access, stat } from "node:fs/promises";
import http from "node:http";
import { Readable } from "node:stream";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const clientDir = path.join(rootDir, "dist", "client");
const serverEntryPath = path.join(rootDir, "dist", "server", "server.js");
const port = Number(process.env.PORT || 3000);
const host = process.env.HOST || "0.0.0.0";

const mimeTypes = new Map([
  [".css", "text/css; charset=utf-8"],
  [".gif", "image/gif"],
  [".html", "text/html; charset=utf-8"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".mjs", "text/javascript; charset=utf-8"],
  [".png", "image/png"],
  [".svg", "image/svg+xml"],
  [".txt", "text/plain; charset=utf-8"],
  [".webp", "image/webp"],
  [".woff", "font/woff"],
  [".woff2", "font/woff2"],
]);

if (!existsSync(serverEntryPath)) {
  console.error("Missing dist/server/server.js. Run `npm run build` before starting the server.");
  process.exit(1);
}

const serverModule = await import(pathToFileURL(serverEntryPath).href);
const handler = serverModule.default;

if (!handler || typeof handler.fetch !== "function") {
  console.error("dist/server/server.js does not export a default fetch handler.");
  process.exit(1);
}

function getMimeType(filePath) {
  return mimeTypes.get(path.extname(filePath).toLowerCase()) || "application/octet-stream";
}

function isSafeAssetPath(filePath) {
  const relative = path.relative(clientDir, filePath);
  return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative);
}

async function tryServeStatic(urlPath, res) {
  const decodedPath = decodeURIComponent(urlPath);
  const normalizedPath = decodedPath === "/" ? "" : decodedPath.replace(/^\/+/, "");
  const candidatePath = path.join(clientDir, normalizedPath);

  if (!isSafeAssetPath(candidatePath)) {
    return false;
  }

  try {
    await access(candidatePath);
    const info = await stat(candidatePath);
    if (!info.isFile()) return false;

    res.writeHead(200, {
      "content-type": getMimeType(candidatePath),
      "content-length": info.size,
      "cache-control": normalizedPath.startsWith("assets/")
        ? "public, max-age=31536000, immutable"
        : "public, max-age=3600",
    });

    createReadStream(candidatePath).pipe(res);
    return true;
  } catch {
    return false;
  }
}

function createRequest(req) {
  const proto = req.headers["x-forwarded-proto"] || "http";
  const hostHeader = req.headers.host || `localhost:${port}`;
  const url = new URL(req.url || "/", `${proto}://${hostHeader}`);
  const headers = new Headers();

  for (const [key, value] of Object.entries(req.headers)) {
    if (Array.isArray(value)) {
      for (const item of value) headers.append(key, item);
    } else if (value != null) {
      headers.set(key, value);
    }
  }

  const body = req.method === "GET" || req.method === "HEAD" ? undefined : Readable.toWeb(req);

  return new Request(url, {
    method: req.method,
    headers,
    body,
    duplex: body ? "half" : undefined,
  });
}

async function sendFetchResponse(fetchResponse, res) {
  const headers = {};
  fetchResponse.headers.forEach((value, key) => {
    headers[key] = value;
  });

  res.writeHead(fetchResponse.status, headers);

  if (!fetchResponse.body) {
    res.end();
    return;
  }

  Readable.fromWeb(fetchResponse.body).pipe(res);
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);

    if (await tryServeStatic(url.pathname, res)) {
      return;
    }

    const request = createRequest(req);
    const response = await handler.fetch(request, {}, { waitUntil() {} });
    await sendFetchResponse(response, res);
  } catch (error) {
    console.error(error);
    res.writeHead(500, { "content-type": "text/plain; charset=utf-8" });
    res.end("Internal Server Error");
  }
});

server.listen(port, host, () => {
  console.log(`Wings Bucha server listening on http://${host}:${port}`);
});
