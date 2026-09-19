-- コラムと、その本文に登場する観光スポットの対応を持たせる。
--
-- コラム側には「この記事に出てくる観光スポット」、スポット側には
-- 「このスポットが出てくるコラム」を出す。1行で両方向の導線になる。
--
-- 本文中の名前から表示時に導出しないのは、名前一致が通りすがりの言及まで
-- 拾う一方で、「国会議事堂」「グローブ座」のような別の呼び名を取りこぼすため。
-- 載せるかどうかは人が決め、名前一致は候補出しにだけ使う
-- (scripts/link-column-attractions.ts suggest)。

-- CreateTable
CREATE TABLE "ContentAttraction" (
    "id" SERIAL NOT NULL,
    "contentId" TEXT NOT NULL,
    "attractionId" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContentAttraction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ContentAttraction_attractionId_idx" ON "ContentAttraction"("attractionId");

-- CreateIndex
CREATE UNIQUE INDEX "ContentAttraction_contentId_attractionId_key" ON "ContentAttraction"("contentId", "attractionId");

-- AddForeignKey
ALTER TABLE "ContentAttraction" ADD CONSTRAINT "ContentAttraction_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "Content"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentAttraction" ADD CONSTRAINT "ContentAttraction_attractionId_fkey" FOREIGN KEY ("attractionId") REFERENCES "Attraction"("id") ON DELETE CASCADE ON UPDATE CASCADE;
