-- AlterTable
-- Ticketmaster の attraction ID。人が確認した組だけを入れるので nullable。
ALTER TABLE "Musical" ADD COLUMN     "ticketmasterAttractionId" TEXT;

-- CreateTable
-- 取り込んだ公演。Musical を消したら一緒に消す(単独では意味を持たない派生データ)。
CREATE TABLE "MusicalPerformance" (
    "id" TEXT NOT NULL,
    "musicalId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "timeTba" BOOLEAN NOT NULL DEFAULT false,
    "url" TEXT,
    "status" TEXT NOT NULL DEFAULT 'onsale',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MusicalPerformance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
-- 再同期は eventId で upsert するため一意にする。
CREATE UNIQUE INDEX "MusicalPerformance_eventId_key" ON "MusicalPerformance"("eventId");

-- CreateIndex
-- 作品ページが「直近の公演」を引く形に合わせた複合インデックス。
CREATE INDEX "MusicalPerformance_musicalId_startsAt_idx" ON "MusicalPerformance"("musicalId", "startsAt");

-- AddForeignKey
ALTER TABLE "MusicalPerformance" ADD CONSTRAINT "MusicalPerformance_musicalId_fkey" FOREIGN KEY ("musicalId") REFERENCES "Musical"("id") ON DELETE CASCADE ON UPDATE CASCADE;
