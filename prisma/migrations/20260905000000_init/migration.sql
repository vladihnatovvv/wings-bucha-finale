CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE "house_types" (
  "id" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "plural_label" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "house_types_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "houses" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "img" TEXT NOT NULL,
  "facade" TEXT NOT NULL,
  "area" DOUBLE PRECISION NOT NULL,
  "beds" INTEGER NOT NULL,
  "baths" INTEGER NOT NULL,
  "floors" INTEGER NOT NULL,
  "plot" DOUBLE PRECISION NOT NULL,
  "price_usd" INTEGER NOT NULL,
  "price_uah" INTEGER,
  "price_currency" TEXT NOT NULL DEFAULT 'USD',
  "available" INTEGER NOT NULL,
  "features" TEXT[] NOT NULL,
  "floor_plans" JSONB NOT NULL,
  "unit_plans" JSONB NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "houses_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "leads" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "name" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "email" TEXT NOT NULL DEFAULT '',
  "interest" TEXT NOT NULL DEFAULT '',
  "message" TEXT NOT NULL DEFAULT '',
  "status" TEXT NOT NULL DEFAULT 'new',

  CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "site_contacts" (
  "id" INTEGER NOT NULL DEFAULT 1,
  "phone_display" TEXT NOT NULL,
  "phone_href" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "telegram_url" TEXT NOT NULL,
  "whatsapp_url" TEXT NOT NULL,
  "address" TEXT NOT NULL,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "site_contacts_pkey" PRIMARY KEY ("id")
);
