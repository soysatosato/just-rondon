-- 観光スポット・美術館・作品のメイン画像に出典の列を足す(2026-10)。
--
-- メイン画像の大半は Wikimedia Commons の CC BY / BY-SA で、作者名と
-- ライセンス名の表示が利用の条件なのに、詳細ページには何も出していなかった
-- (AdSense 不承認後の監査で発覚)。列の意味は読み物(Content)と同じ。
-- 値は scripts/fill-spot-image-credits.ts が Commons の API から埋める。
ALTER TABLE "Attraction" ADD COLUMN "imageSource" TEXT;
ALTER TABLE "Attraction" ADD COLUMN "imageCredit" TEXT;
ALTER TABLE "Attraction" ADD COLUMN "imageLink" TEXT;

ALTER TABLE "Museum" ADD COLUMN "imageSource" TEXT;
ALTER TABLE "Museum" ADD COLUMN "imageCredit" TEXT;
ALTER TABLE "Museum" ADD COLUMN "imageLink" TEXT;

ALTER TABLE "Artwork" ADD COLUMN "imageSource" TEXT;
ALTER TABLE "Artwork" ADD COLUMN "imageCredit" TEXT;
ALTER TABLE "Artwork" ADD COLUMN "imageLink" TEXT;
