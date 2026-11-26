ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "hero_poster_url" TEXT NOT NULL DEFAULT '';
ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "scroll_poster_url" TEXT NOT NULL DEFAULT '';
