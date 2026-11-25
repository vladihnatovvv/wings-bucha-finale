// Read-only export of the content tables to a JSON file, so the live data can become the seed.
// Usage: DATABASE_URL="postgresql://..." node scripts/export-db.mjs [output.json]
// Leads (personal data) and uploaded file bytes are NOT exported.
import { writeFile } from "node:fs/promises";
import { PrismaClient } from "@prisma/client";

if (!process.env.DATABASE_URL) {
  console.error("Set DATABASE_URL first.");
  process.exit(1);
}

const out = process.argv[2] || "db-export.json";
const prisma = new PrismaClient();

try {
  const data = {
    exportedAt: new Date().toISOString(),
    houseTypes: await prisma.houseType.findMany({ orderBy: { createdAt: "asc" } }),
    houses: await prisma.house.findMany({ orderBy: { createdAt: "asc" } }),
    siteContacts: await prisma.siteContacts.findMany(),
    siteDocuments: await prisma.siteDocument.findMany({ orderBy: { sortOrder: "asc" } }),
    constructionUpdates: await prisma.constructionUpdate.findMany({
      orderBy: { sortOrder: "asc" },
    }),
    siteSettings: await prisma.siteSettings.findMany(),
    uploads: await prisma.upload.findMany({ select: { id: true, mimeType: true, size: true } }),
  };

  await writeFile(out, JSON.stringify(data, null, 2));

  const text = JSON.stringify(data);
  const dataUrls = (text.match(/data:image\/[a-z+]+;base64/g) || []).length;
  const diskUploads = new Set(text.match(/\/uploads\/[A-Za-z0-9._-]+/g) || []);

  console.log(`Saved ${out}`);
  for (const key of [
    "houseTypes",
    "houses",
    "siteContacts",
    "siteDocuments",
    "constructionUpdates",
    "siteSettings",
    "uploads",
  ]) {
    console.log(`  ${key}: ${data[key].length}`);
  }
  console.log(`Embedded base64 images: ${dataUrls}`);
  console.log(`References to /uploads/...: ${diskUploads.size}`);
} finally {
  await prisma.$disconnect();
}
