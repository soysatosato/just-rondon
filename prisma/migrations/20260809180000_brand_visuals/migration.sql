-- ブランドページを可視化するための列を足す。
--
-- Brand.instagramUrl … 公式アカウントの投稿を埋め込む。Restaurant と同じ扱い。
-- BrandItem.image ほか … 定番品そのものの写真。
--
-- どちらも NULL 可なので、既存行があってもそのまま通る。
-- 中身は seed-brands.ts から入る。
ALTER TABLE "Brand" ADD COLUMN "instagramUrl" TEXT;

ALTER TABLE "BrandItem" ADD COLUMN "image" TEXT;
ALTER TABLE "BrandItem" ADD COLUMN "imageSource" TEXT;
ALTER TABLE "BrandItem" ADD COLUMN "imageCredit" TEXT;
ALTER TABLE "BrandItem" ADD COLUMN "imageLink" TEXT;
