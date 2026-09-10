CREATE TABLE IF NOT EXISTS "site_documents" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL DEFAULT '',
  "file_url" TEXT NOT NULL DEFAULT '',
  "sort_order" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "site_documents_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "construction_updates" (
  "id" TEXT NOT NULL,
  "date" TIMESTAMP(3) NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL DEFAULT '',
  "image" TEXT NOT NULL DEFAULT '',
  "progress" INTEGER NOT NULL DEFAULT 0,
  "sort_order" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "construction_updates_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "site_settings" (
  "id" INTEGER NOT NULL DEFAULT 1,
  "scroll_media_video_url" TEXT NOT NULL DEFAULT '',
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "site_settings_pkey" PRIMARY KEY ("id")
);
