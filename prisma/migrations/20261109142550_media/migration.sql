-- CreateTable
CREATE TABLE "media" (
    "id" TEXT NOT NULL,
    "blobKey" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "thumbBlobKey" TEXT NOT NULL,
    "thumbUrl" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "compressed" BOOLEAN NOT NULL,
    "alt" TEXT NOT NULL DEFAULT '',
    "caption" TEXT,
    "showInGallery" BOOLEAN NOT NULL DEFAULT false,
    "galleryCategory" TEXT,
    "uploadedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "media_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "media_blobKey_key" ON "media"("blobKey");

-- CreateIndex
CREATE UNIQUE INDEX "media_thumbBlobKey_key" ON "media"("thumbBlobKey");

-- CreateIndex
CREATE INDEX "media_showInGallery_createdAt_idx" ON "media"("showInGallery", "createdAt");

-- CreateIndex
CREATE INDEX "media_createdAt_idx" ON "media"("createdAt");

-- AddForeignKey
ALTER TABLE "media" ADD CONSTRAINT "media_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
