import { spawnSync } from "node:child_process";

if (!process.env.DATABASE_URL) {
  console.log("DATABASE_URL is not set; skipping Prisma migrations and seed.");
  process.exit(0);
}

const shell = process.platform === "win32";

const migrate = spawnSync("npx", ["prisma", "migrate", "deploy"], { stdio: "inherit", shell });
if (migrate.status !== 0) process.exit(migrate.status ?? 1);

// Seeds the starter content once, on a database that was never seeded.
const seed = spawnSync("node", ["scripts/seed.mjs"], { stdio: "inherit", shell });
process.exit(seed.status ?? 1);
