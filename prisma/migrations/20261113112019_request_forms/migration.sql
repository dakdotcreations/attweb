-- CreateEnum
CREATE TYPE "ServiceFormType" AS ENUM ('GENERAL', 'FLIGHT', 'STUDY_ABROAD');

-- CreateEnum
CREATE TYPE "InquiryKind" AS ENUM ('GENERAL', 'FLIGHT', 'STUDY_ABROAD');

-- AlterTable
ALTER TABLE "inquiry" ADD COLUMN     "details" JSONB,
ADD COLUMN     "kind" "InquiryKind" NOT NULL DEFAULT 'GENERAL';

-- AlterTable
ALTER TABLE "service" ADD COLUMN     "formType" "ServiceFormType" NOT NULL DEFAULT 'GENERAL';

-- CreateTable
CREATE TABLE "partner_institution" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "logoId" TEXT,
    "status" "PublishStatus" NOT NULL DEFAULT 'DRAFT',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "partner_institution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inquiry_institution" (
    "inquiryId" TEXT NOT NULL,
    "institutionId" TEXT,
    "name" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "rank" INTEGER NOT NULL,

    CONSTRAINT "inquiry_institution_pkey" PRIMARY KEY ("inquiryId","rank")
);

-- CreateIndex
CREATE INDEX "partner_institution_status_country_sortOrder_idx" ON "partner_institution"("status", "country", "sortOrder");

-- CreateIndex
CREATE INDEX "inquiry_institution_institutionId_idx" ON "inquiry_institution"("institutionId");

-- CreateIndex
CREATE INDEX "inquiry_kind_createdAt_idx" ON "inquiry"("kind", "createdAt");

-- AddForeignKey
ALTER TABLE "partner_institution" ADD CONSTRAINT "partner_institution_logoId_fkey" FOREIGN KEY ("logoId") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inquiry_institution" ADD CONSTRAINT "inquiry_institution_inquiryId_fkey" FOREIGN KEY ("inquiryId") REFERENCES "inquiry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inquiry_institution" ADD CONSTRAINT "inquiry_institution_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "partner_institution"("id") ON DELETE SET NULL ON UPDATE CASCADE;
