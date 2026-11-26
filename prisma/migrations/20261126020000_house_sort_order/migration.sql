ALTER TABLE "houses" ADD COLUMN IF NOT EXISTS "sort_order" INTEGER NOT NULL DEFAULT 0;

-- Give every existing house a stable, unique position (oldest first).
UPDATE "houses" h
SET "sort_order" = o.rn
FROM (
  SELECT "id", ROW_NUMBER() OVER (ORDER BY "created_at" ASC, "id" ASC) AS rn FROM "houses"
) o
WHERE h."id" = o."id";
