// One-time seed of the starter content (house types, houses, contacts, documents,
// construction updates, site settings) taken from the DEFAULT_* constants in the code.
//
// - Runs automatically after `prisma migrate deploy` (see migrate-if-db.mjs).
// - It only seeds a database that has never been seeded: the marker is the `site_settings`
//   row with id=1. After that, the database is the single source of truth and anything
//   deleted in the admin panel stays deleted.
//
// Usage:
//   node scripts/seed.mjs            seed if the database was never seeded
//   node scripts/seed.mjs --dry-run  print what would be inserted, touch nothing
//   node scripts/seed.mjs --force    insert missing starter rows even if already seeded
//                                    (this brings back starter rows that were deleted!)
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { build } from "esbuild";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dryRun = process.argv.includes("--dry-run");
const force = process.argv.includes("--force");

async function loadDefaults() {
  const dir = await mkdtemp(path.join(os.tmpdir(), "wb-seed-"));
  const outfile = path.join(dir, "defaults.mjs");
  try {
    await build({
      stdin: {
        contents: `
          export { DEFAULT_HOUSES, DEFAULT_HOUSE_TYPES } from "@/lib/houses";
          export {
            DEFAULT_CONSTRUCTION_UPDATES,
            DEFAULT_CONTACTS,
            DEFAULT_DOCUMENTS,
            DEFAULT_SITE_SECTIONS,
            DEFAULT_SITE_SETTINGS,
          } from "@/lib/admin-store";
        `,
        resolveDir: root,
        loader: "ts",
      },
      bundle: true,
      format: "esm",
      platform: "node",
      outfile,
      alias: { "@": path.join(root, "src") },
      define: { "import.meta.env.BASE_URL": '"/"' },
      logLevel: "silent",
    });
    return await import(pathToFileURL(outfile).href);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

const defaults = await loadDefaults();
const counts = {
  houseTypes: defaults.DEFAULT_HOUSE_TYPES.length,
  houses: defaults.DEFAULT_HOUSES.length,
  documents: defaults.DEFAULT_DOCUMENTS.length,
  constructionUpdates: defaults.DEFAULT_CONSTRUCTION_UPDATES.length,
};

if (dryRun) {
  console.log("Seed dry run, nothing written:", counts);
  process.exit(0);
}

if (!process.env.DATABASE_URL) {
  console.log("DATABASE_URL is not set; skipping seed.");
  process.exit(0);
}

const { PrismaClient } = await import("@prisma/client");
const prisma = new PrismaClient();

try {
  const alreadySeeded = await prisma.siteSettings.findUnique({ where: { id: 1 } });
  if (alreadySeeded && !force) {
    console.log("Database already seeded; skipping (use --force to add missing starter rows).");
    process.exit(0);
  }

  await prisma.$transaction(async (tx) => {
    await tx.houseType.createMany({ data: defaults.DEFAULT_HOUSE_TYPES, skipDuplicates: true });

    await tx.house.createMany({
      data: defaults.DEFAULT_HOUSES.map((house) => ({
        id: house.id,
        name: house.name,
        type: house.type,
        img: house.img,
        facade: house.facade,
        videoUrl: house.videoUrl,
        area: house.area,
        beds: house.beds,
        baths: house.baths,
        floors: house.floors,
        plot: house.plot,
        priceUsd: house.priceUsd,
        priceUah: house.priceUah ?? null,
        priceCurrency: house.priceCurrency ?? "USD",
        available: house.available,
        features: house.features,
        floorPlans: house.floorPlans,
        unitPlans: house.unitPlans,
      })),
      skipDuplicates: true,
    });

    await tx.siteContacts.upsert({
      where: { id: 1 },
      update: {},
      create: { id: 1, ...defaults.DEFAULT_CONTACTS },
    });

    await tx.siteDocument.createMany({ data: defaults.DEFAULT_DOCUMENTS, skipDuplicates: true });

    await tx.constructionUpdate.createMany({
      data: defaults.DEFAULT_CONSTRUCTION_UPDATES.map((item) => ({
        ...item,
        date: new Date(`${item.date}T00:00:00.000Z`),
      })),
      skipDuplicates: true,
    });

    // Written last: this row is the "already seeded" marker.
    await tx.siteSettings.upsert({
      where: { id: 1 },
      update: {},
      create: {
        id: 1,
        scrollMediaVideoUrl: defaults.DEFAULT_SITE_SETTINGS.scrollMediaVideoUrl,
        sectionsContent: defaults.DEFAULT_SITE_SECTIONS,
      },
    });
  });

  console.log("Seeded starter content:", counts);
} finally {
  await prisma.$disconnect();
}
