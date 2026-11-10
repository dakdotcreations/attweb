-- CreateEnum
CREATE TYPE "InquiryStatus" AS ENUM ('NEW', 'CONTACTED', 'QUOTED', 'WON', 'LOST', 'CLOSED');

-- CreateEnum
CREATE TYPE "InquirySource" AS ENUM ('WEBSITE', 'WHATSAPP', 'EMAIL', 'PHONE', 'WALK_IN', 'OTHER');

-- CreateEnum
CREATE TYPE "ContactChannel" AS ENUM ('WHATSAPP', 'EMAIL', 'PHONE');

-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('UGX', 'USD');

-- CreateEnum
CREATE TYPE "InquiryNoteKind" AS ENUM ('NOTE', 'STATUS_CHANGE');

-- CreateTable
CREATE TABLE "inquiry" (
    "id" TEXT NOT NULL,
    "number" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "country" TEXT,
    "message" TEXT NOT NULL,
    "interest" TEXT,
    "packageId" TEXT,
    "serviceId" TEXT,
    "travelDate" DATE,
    "groupSize" INTEGER,
    "preferredContact" "ContactChannel",
    "currency" "Currency",
    "status" "InquiryStatus" NOT NULL DEFAULT 'NEW',
    "source" "InquirySource" NOT NULL DEFAULT 'WEBSITE',
    "sourceUrl" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inquiry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inquiry_note" (
    "id" TEXT NOT NULL,
    "inquiryId" TEXT NOT NULL,
    "kind" "InquiryNoteKind" NOT NULL DEFAULT 'NOTE',
    "body" TEXT NOT NULL,
    "fromStatus" "InquiryStatus",
    "toStatus" "InquiryStatus",
    "authorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inquiry_note_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "inquiry_number_key" ON "inquiry"("number");

-- CreateIndex
CREATE INDEX "inquiry_status_createdAt_idx" ON "inquiry"("status", "createdAt");

-- CreateIndex
CREATE INDEX "inquiry_createdAt_idx" ON "inquiry"("createdAt");

-- CreateIndex
CREATE INDEX "inquiry_serviceId_idx" ON "inquiry"("serviceId");

-- CreateIndex
CREATE INDEX "inquiry_packageId_idx" ON "inquiry"("packageId");

-- CreateIndex
CREATE INDEX "inquiry_note_inquiryId_createdAt_idx" ON "inquiry_note"("inquiryId", "createdAt");

-- AddForeignKey
ALTER TABLE "inquiry" ADD CONSTRAINT "inquiry_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "tour_package"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inquiry" ADD CONSTRAINT "inquiry_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "service"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inquiry" ADD CONSTRAINT "inquiry_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inquiry_note" ADD CONSTRAINT "inquiry_note_inquiryId_fkey" FOREIGN KEY ("inquiryId") REFERENCES "inquiry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inquiry_note" ADD CONSTRAINT "inquiry_note_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
