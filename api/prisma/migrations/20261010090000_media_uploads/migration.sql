-- CreateEnum
CREATE TYPE "upload_status" AS ENUM ('pending', 'ready', 'attached');

-- CreateTable
CREATE TABLE "media_uploads" (
    "id" UUID NOT NULL,
    "owner_id" UUID NOT NULL,
    "status" "upload_status" NOT NULL DEFAULT 'pending',
    "incoming_key" TEXT NOT NULL,
    "content_type" TEXT NOT NULL,
    "bytes" INTEGER NOT NULL,
    "key" TEXT,
    "width" INTEGER,
    "height" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "media_uploads_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "media_uploads_incoming_key_key" ON "media_uploads"("incoming_key");

-- CreateIndex
CREATE UNIQUE INDEX "media_uploads_key_key" ON "media_uploads"("key");

-- CreateIndex
CREATE INDEX "media_uploads_owner_id_status_idx" ON "media_uploads"("owner_id", "status");

-- CreateIndex
CREATE INDEX "media_uploads_status_created_at_idx" ON "media_uploads"("status", "created_at");

-- AddForeignKey
ALTER TABLE "media_uploads" ADD CONSTRAINT "media_uploads_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

