import { createFileRoute } from "@tanstack/react-router";

// Serves files uploaded through the admin panel (stored in PostgreSQL).
export const Route = createFileRoute("/uploads/$name")({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        const { readUpload } = await import("@/lib/server/uploads");
        const file = await readUpload(params.name);
        if (!file) return new Response("Not found", { status: 404 });

        const total = file.data.byteLength;
        const headers: Record<string, string> = {
          "content-type": file.mimeType,
          "cache-control": "public, max-age=31536000, immutable",
          "accept-ranges": "bytes",
          "x-content-type-options": "nosniff",
        };

        // Range support so videos can be seeked in Safari and mobile browsers.
        const range = /^bytes=(\d*)-(\d*)$/.exec(request.headers.get("range") ?? "");
        if (range && (range[1] || range[2])) {
          const start = range[1] ? Number(range[1]) : Math.max(total - Number(range[2]), 0);
          const end = range[1] && range[2] ? Math.min(Number(range[2]), total - 1) : total - 1;
          if (start > end || start >= total) {
            return new Response(null, {
              status: 416,
              headers: { "content-range": `bytes */${total}` },
            });
          }
          return new Response(file.data.slice(start, end + 1), {
            status: 206,
            headers: {
              ...headers,
              "content-range": `bytes ${start}-${end}/${total}`,
              "content-length": String(end - start + 1),
            },
          });
        }

        return new Response(file.data, {
          headers: { ...headers, "content-length": String(total) },
        });
      },
    },
  },
});
