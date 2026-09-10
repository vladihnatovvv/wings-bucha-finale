import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

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

function uploadRoot() {
  const configured = process.env.UPLOAD_DIR || "public/uploads";
  return path.isAbsolute(configured) ? configured : path.join(process.cwd(), configured);
}

function publicBaseUrl() {
  return (process.env.PUBLIC_UPLOAD_BASE_URL || "/uploads").replace(/\/$/, "");
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
  const allowed =
    file.type.startsWith("image/") ||
    file.type === "application/pdf" ||
    file.type.startsWith("video/");

  if (!allowed) {
    throw new Error("Only image, PDF and video files are allowed");
  }

  const extension = MIME_EXTENSIONS[file.type] || path.extname(file.name) || ".jpg";
  const filename = `${Date.now()}-${cleanName(file.name) || "file"}${extension}`;
  const root = uploadRoot();
  await mkdir(root, { recursive: true });
  await writeFile(path.join(root, filename), Buffer.from(await file.arrayBuffer()));

  return { url: `${publicBaseUrl()}/${filename}` };
}
