ALTER TABLE "houses" ADD COLUMN IF NOT EXISTS "video_url" TEXT NOT NULL DEFAULT '';

UPDATE "houses"
SET "type" = 'townhouse-two-floor'
WHERE "type" = 'townhouse';

UPDATE "houses"
SET "type" = 'house'
WHERE "type" = 'cottage';

UPDATE "houses"
SET "name" = 'Таунхаус двоповерховий «Криве»'
WHERE "id" = 'townhouse';

UPDATE "houses"
SET "name" = 'Будинок «Політ»'
WHERE "id" = 'cottage';

UPDATE "houses"
SET "name" = 'Таунхаус одноповерховий «Паркова»',
    "type" = 'townhouse-one-floor',
    "floors" = 1
WHERE "id" = 'townhouse-park';

UPDATE "houses"
SET "name" = 'Будинок «Лісовий»'
WHERE "id" = 'cottage-forest';

DELETE FROM "house_types"
WHERE "id" IN ('townhouse', 'cottage');
