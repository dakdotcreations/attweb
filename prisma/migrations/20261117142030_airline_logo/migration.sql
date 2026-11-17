-- AlterTable
ALTER TABLE "airline" ADD COLUMN     "logoId" TEXT;

-- AddForeignKey
ALTER TABLE "airline" ADD CONSTRAINT "airline_logoId_fkey" FOREIGN KEY ("logoId") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE CASCADE;
