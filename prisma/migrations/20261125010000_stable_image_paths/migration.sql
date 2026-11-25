-- Houses created from an older build stored image paths with a build hash
-- (e.g. /assets/type-duplex-BjP-Yg3S.jpg). Those files disappear on the next build,
-- so point them to the permanent copies in /images.

UPDATE "houses" SET "img" = '/images/type-duplex-640.webp'
  WHERE "img" LIKE '/assets/type-duplex-%';
UPDATE "houses" SET "facade" = '/images/type-duplex-960.webp'
  WHERE "facade" LIKE '/assets/type-duplex-%';

UPDATE "houses" SET "img" = '/images/type-townhouse-one-640.webp'
  WHERE "img" LIKE '/assets/type-townhouse-%' AND "type" = 'townhouse-one-floor';
UPDATE "houses" SET "facade" = '/images/type-townhouse-one-960.webp'
  WHERE "facade" LIKE '/assets/type-townhouse-%' AND "type" = 'townhouse-one-floor';
UPDATE "houses" SET "img" = '/images/type-townhouse-640.webp'
  WHERE "img" LIKE '/assets/type-townhouse-%';
UPDATE "houses" SET "facade" = '/images/type-townhouse-960.webp'
  WHERE "facade" LIKE '/assets/type-townhouse-%';

UPDATE "houses" SET "img" = '/images/type-cottage-640.webp'
  WHERE "img" LIKE '/assets/type-cottage-%';
UPDATE "houses" SET "facade" = '/images/type-cottage-960.webp'
  WHERE "facade" LIKE '/assets/type-cottage-%';

UPDATE "houses" SET "img" = '/images/hero-house-640.webp'
  WHERE "img" LIKE '/assets/hero-house-%';
UPDATE "houses" SET "facade" = '/images/hero-house-1120.webp'
  WHERE "facade" LIKE '/assets/hero-house-%';
