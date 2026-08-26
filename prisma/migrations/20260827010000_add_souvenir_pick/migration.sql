-- 品目の中の個別商品を行にする。
--
-- recommendation(markdown)で銘柄は書けるようになったが、本文中の
-- 「Royal Blend」はあくまで地の文の一部で、そこに商品写真を差し込む先が
-- 無い。撮影した写真を商品ごとに載せるには、商品そのものが行になって
-- image 列を持っている必要がある。
--
-- 画像まわりを最初から nullable にしてあるのは、撮影が後追いになるため。
-- テキストだけ先に入れて運用し、撮れた商品から image を埋めれば、
-- 本文もスキーマも触らずに写真付きへ変わる。BrandImage と同じ
-- source/credit/link の3点セットを持たせて、出典表記の判断は
-- ImageCredit に寄せる。
--
-- role で「定番 / もう一段上 / ばらまき / 季節限定」を区別する。
-- 読者が知りたいのは商品の並びではなく、自分の用途にどれが当たるか。

CREATE TABLE "SouvenirPick" (
    "id" TEXT NOT NULL,
    "souvenirId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameJa" TEXT,
    "size" TEXT,
    "priceRange" TEXT,
    "reason" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'standard',
    "image" TEXT,
    "imageSource" TEXT,
    "imageCredit" TEXT,
    "imageLink" TEXT,
    "affiliateUrl" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SouvenirPick_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "SouvenirPick_souvenirId_displayOrder_idx" ON "SouvenirPick"("souvenirId", "displayOrder");

ALTER TABLE "SouvenirPick" ADD CONSTRAINT "SouvenirPick_souvenirId_fkey" FOREIGN KEY ("souvenirId") REFERENCES "Souvenir"("id") ON DELETE CASCADE ON UPDATE CASCADE;
