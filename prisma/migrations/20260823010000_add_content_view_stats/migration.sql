-- Attraction / Museum / Musical に閲覧の記録を足す。
--
-- 読者には出さない内部データ。「人気のスポット」「最近見られたスポット」の
-- 並べ替えに使う。表示中の数字として出す想定はないため、多少の取りこぼしは
-- 許容する(ボット除外とセッション単位の連投抑止で、実数より少なめに出る)。
--
-- 加算はクライアントから /api/views を叩いて行う。詳細ページは
-- revalidate=3600 の ISR でキャッシュされるので、サーバーコンポーネントの
-- 本体で数えると1ページあたり1時間に1回しか増えず、ランキングの
-- 並べ替えキーとして使いものにならない。
--
-- 既存の行は「まだ集計していない」状態から始める。views=0 と
-- lastViewedAt=NULL は「一度も見られていない」ではなく
-- 「集計開始前」を含むので、ランキング側は0件を出さない作りにすること。

ALTER TABLE "Attraction" ADD COLUMN "views" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Attraction" ADD COLUMN "lastViewedAt" TIMESTAMP(3);

ALTER TABLE "Museum" ADD COLUMN "views" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Museum" ADD COLUMN "lastViewedAt" TIMESTAMP(3);

ALTER TABLE "Musical" ADD COLUMN "views" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Musical" ADD COLUMN "lastViewedAt" TIMESTAMP(3);

-- ランキングは views / lastViewedAt の降順で取り出すので索引を張る。
CREATE INDEX "Attraction_views_idx" ON "Attraction"("views");
CREATE INDEX "Attraction_lastViewedAt_idx" ON "Attraction"("lastViewedAt");
CREATE INDEX "Museum_views_idx" ON "Museum"("views");
CREATE INDEX "Museum_lastViewedAt_idx" ON "Museum"("lastViewedAt");
CREATE INDEX "Musical_views_idx" ON "Musical"("views");
CREATE INDEX "Musical_lastViewedAt_idx" ON "Musical"("lastViewedAt");
