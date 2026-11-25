import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { hasDatabaseUrl, prisma } from "./db";

const MIME_EXTENSIONS: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "image/avif": ".avif",
  "application/pdf": ".pdf",
  "video/mp4": ".mp4",
  "video/webm": ".webm",
  "video/quicktime": ".mov",
};

const EXTENSION_MIMES = Object.fromEntries(
  Object.entries(MIME_EXTENSIONS).map(([mime, ext]) => [ext, mime]),
);

// With DATABASE_URL files live in PostgreSQL (table "uploads") and are served by the
// /uploads/$name route. Without it (local demo) they fall back to the UPLOAD_DIR folder.
const PUBLIC_PREFIX = "/uploads";

function uploadRoot() {
  const configured = process.env.UPLOAD_DIR || "public/uploads";
  return path.isAbsolute(configured) ? configured : path.join(process.cwd(), configured);
}

function cleanName(name: string) {
  return name
    .toLowerCase()
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export async function saveUploadedImage(file: File) {
  if (!file.type.startsWith("image/")) {
    throw new Error("Only image files are allowed");
  }

  return saveUploadedFile(file);
}

export async function saveUploadedFile(file: File) {
  const extension = MIME_EXTENSIONS[file.type];

  if (!extension) {
    throw new Error("Only JPG, PNG, WebP, GIF, AVIF, PDF, MP4, WebM and MOV files are allowed");
  }

  const filename = `${Date.now()}-${cleanName(file.name) || "file"}${extension}`;
  const bytes = Buffer.from(await file.arrayBuffer());

  if (hasDatabaseUrl()) {
    await prisma.upload.create({
      data: { id: filename, mimeType: file.type, size: bytes.length, data: bytes },
    });
    return { url: `${PUBLIC_PREFIX}/${filename}` };
  }

  const root = uploadRoot();
  await mkdir(root, { recursive: true });
  await writeFile(path.join(root, filename), bytes);
  const base = (process.env.PUBLIC_UPLOAD_BASE_URL || PUBLIC_PREFIX).replace(/\/$/, "");
  return { url: `${base}/${filename}` };
}

export async function readUpload(
  name: string,
): Promise<{ data: Uint8Array<ArrayBuffer>; mimeType: string } | null> {
  if (!/^[a-z0-9][a-z0-9._-]*$/i.test(name) || name.includes("..")) return null;

  if (hasDatabaseUrl()) {
    const row = await prisma.upload.findUnique({ where: { id: name } });
    if (row) return { data: new Uint8Array(row.data), mimeType: row.mimeType };
  }

  // Legacy files that were written to disk before uploads moved to the database.
  try {
    const data = await readFile(path.join(uploadRoot(), name));
    const mimeType = EXTENSION_MIMES[path.extname(name).toLowerCase()];
    return mimeType ? { data: new Uint8Array(data), mimeType } : null;
  } catch {
    return null;
  }
}
