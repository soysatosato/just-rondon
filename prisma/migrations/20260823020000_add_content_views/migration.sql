-- Content(コラム・イギリス英語・いまのイギリス)に閲覧の記録を足す。
--
-- Attraction / Museum / Musical と同じ扱いで、読者には出さない内部データ。
-- 「人気の記事」の並べ替えにだけ使う。表示中の数字として出す想定はないため、
-- 多少の取りこぼしは許容する(ボット除外とセッション単位の連投抑止で、
-- 実数より少なめに出る)。
--
-- 加算はクライアントから /api/views を叩いて行う。詳細ページは
-- revalidate=3600 の ISR でキャッシュされるので、サーバーコンポーネントの
-- 本体で数えると1ページあたり1時間に1回しか増えず、ランキングの
-- 並べ替えキーとして使いものにならない。
--
-- 索引に category を含めるのは、この表が1つで複数セクションを兼ねており、
-- ランキングを必ず category で絞ってから views 順に並べるため。
-- slug はこの表では一意ではない(category が違えば同じ slug があり得る)。

ALTER TABLE "Content" ADD COLUMN "views" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Content" ADD COLUMN "lastViewedAt" TIMESTAMP(3);

CREATE INDEX "Content_category_views_idx" ON "Content"("category", "views");
CREATE INDEX "Content_category_lastViewedAt_idx" ON "Content"("category", "lastViewedAt");
