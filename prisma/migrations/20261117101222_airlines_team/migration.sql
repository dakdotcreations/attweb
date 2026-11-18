-- CreateTable
CREATE TABLE "airline" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "PublishStatus" NOT NULL DEFAULT 'PUBLISHED',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "airline_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team_member" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "photoId" TEXT,
    "whatsapp" TEXT,
    "status" "PublishStatus" NOT NULL DEFAULT 'DRAFT',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "team_member_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "airline_name_key" ON "airline"("name");

-- CreateIndex
CREATE INDEX "airline_status_sortOrder_idx" ON "airline"("status", "sortOrder");

-- CreateIndex
CREATE INDEX "team_member_status_sortOrder_idx" ON "team_member"("status", "sortOrder");

-- CreateIndex
CREATE INDEX "team_member_photoId_idx" ON "team_member"("photoId");

-- AddForeignKey
ALTER TABLE "team_member" ADD CONSTRAINT "team_member_photoId_fkey" FOREIGN KEY ("photoId") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Starting airline list (previously hard-coded in lib/inquiries.ts and the About page).
INSERT INTO "airline" ("id", "name", "status", "sortOrder", "updatedAt")
SELECT 'seed_airline_' || ord, name, 'PUBLISHED', (ord - 1) * 10, CURRENT_TIMESTAMP
FROM unnest(ARRAY[
    'Uganda Airlines',
    'Kenya Airways',
    'Emirates',
    'Qatar Airways',
    'Etihad Airways',
    'Ethiopian Airlines',
    'RwandAir',
    'Turkish Airlines',
    'EgyptAir',
    'KLM',
    'Brussels Airlines',
    'flydubai',
    'Air Arabia',
    'South African Airways',
    'Air Tanzania',
    'Malaysia Airlines'
]) WITH ORDINALITY AS t(name, ord);
