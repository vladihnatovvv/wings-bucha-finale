-- AlterTable
ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "sections_content" JSONB;
