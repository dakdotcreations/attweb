-- AlterEnum
ALTER TYPE "InquiryKind" ADD VALUE 'MEDICAL';

-- AlterEnum
ALTER TYPE "ServiceFormType" ADD VALUE 'MEDICAL';

-- CreateTable
CREATE TABLE "medical_partner" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "logoId" TEXT,
    "status" "PublishStatus" NOT NULL DEFAULT 'DRAFT',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "medical_partner_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "medical_partner_status_country_sortOrder_idx" ON "medical_partner"("status", "country", "sortOrder");

-- AddForeignKey
ALTER TABLE "medical_partner" ADD CONSTRAINT "medical_partner_logoId_fkey" FOREIGN KEY ("logoId") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE CASCADE;
