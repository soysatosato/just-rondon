-- AlterTable
-- 実用情報(料金・所要時間・最寄駅・開館時間)。すべて nullable。
-- 既存行は NULL のまま入り、scripts/migrate-attraction-facts.ts で埋める。
ALTER TABLE "Attraction" ADD COLUMN     "priceAdult" TEXT,
ADD COLUMN     "priceChild" TEXT,
ADD COLUMN     "durationText" TEXT,
ADD COLUMN     "nearestStation" TEXT,
ADD COLUMN     "openingHours" TEXT;

-- CreateTable
CREATE TABLE "AttractionVisitStep" (
    "id" SERIAL NOT NULL,
    "attractionId" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL,
    "kind" TEXT NOT NULL DEFAULT 'highlight',
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AttractionVisitStep_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AttractionVisitStep_attractionId_displayOrder_idx" ON "AttractionVisitStep"("attractionId", "displayOrder");

-- AddForeignKey
ALTER TABLE "AttractionVisitStep" ADD CONSTRAINT "AttractionVisitStep_attractionId_fkey" FOREIGN KEY ("attractionId") REFERENCES "Attraction"("id") ON DELETE CASCADE ON UPDATE CASCADE;
