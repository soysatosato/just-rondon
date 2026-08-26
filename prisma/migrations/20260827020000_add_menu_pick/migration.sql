-- 店で頼むべき一皿を行にする。SouvenirPick の restaurants 版。
--
-- Restaurant.body は平均180字で、扱っているのは「なぜこの店か」——
-- 歴史、内装、予約の仕組み。**席に着いた後の話が無い**ので、メニューを
-- 渡された時点で読者は放り出される。店まで案内しておいて注文で
-- 詰まらせるのは、土産ページが棚の前で銘柄を出せなかったのと同じ穴。
--
-- 本文に皿名が紛れている店(ディシュームの black daal 等)もあるが、
-- 地の文なので拾いにくく、写真を貼る先も無い。
--
-- 画像を nullable にしてあるのは撮影が後追いになるため。既存の店写真は
-- 12件すべて Commons の外観写真で、料理が1枚も写っていない
-- (RestaurantCard のコメント参照)。自分で撮った料理写真の置き場が
-- ここになる。

CREATE TABLE "MenuPick" (
    "id" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameJa" TEXT,
    "priceRange" TEXT,
    "reason" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'signature',
    "image" TEXT,
    "imageSource" TEXT,
    "imageCredit" TEXT,
    "imageLink" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MenuPick_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "MenuPick_restaurantId_displayOrder_idx" ON "MenuPick"("restaurantId", "displayOrder");

ALTER TABLE "MenuPick" ADD CONSTRAINT "MenuPick_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
