-- 店のページ(/restaurants/<店>)とブランドの事実の確認日のための列。
--
-- Restaurant: 入り方・朝食・休みの曜日・服装・サービス料・確認日・出典を持たせ、
-- 料理ページに属さない店(「絶対行くべき店」だけに出るパブなど)のために
-- dishId を任意にする。所在地(RestaurantBranch)と写真(RestaurantPhoto)は別表。
-- MenuPick: 公式メニューの価格と確認日。Brand: 王室御用達の授与者と確認日。
-- BrandStore: 地図に置くための郵便番号と座標。
--
-- 閲覧の多い表ではないが、列の追加でロックを長く待たないよう短い
-- lock_timeout を付ける(prod-migration-locking の教訓)。
SET lock_timeout = '5s';

-- AlterTable
ALTER TABLE "Brand" ADD COLUMN     "royalWarrantCheckedAt" TIMESTAMP(3),
ADD COLUMN     "royalWarrantGrantor" TEXT,
ADD COLUMN     "royalWarrantSourceUrl" TEXT;

-- AlterTable
ALTER TABLE "BrandStore" ADD COLUMN     "lat" DOUBLE PRECISION,
ADD COLUMN     "lng" DOUBLE PRECISION,
ADD COLUMN     "postcode" TEXT;

-- AlterTable
ALTER TABLE "MenuPick" ADD COLUMN     "officialPrice" DOUBLE PRECISION,
ADD COLUMN     "priceCheckedAt" TIMESTAMP(3),
ADD COLUMN     "priceSourceUrl" TEXT;

-- AlterTable
ALTER TABLE "Restaurant" ADD COLUMN     "bookingNote" TEXT,
ADD COLUMN     "breakfast" BOOLEAN,
ADD COLUMN     "budgetExamples" JSONB,
ADD COLUMN     "closedDaysCheckedAt" TIMESTAMP(3),
ADD COLUMN     "closedWeekdays" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
ADD COLUMN     "cuisine" TEXT,
ADD COLUMN     "dressCode" TEXT,
ADD COLUMN     "factsCheckedAt" TIMESTAMP(3),
ADD COLUMN     "serviceChargePercent" DOUBLE PRECISION,
ADD COLUMN     "sources" JSONB,
ADD COLUMN     "walkIn" BOOLEAN,
ALTER COLUMN "dishId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "RestaurantBranch" (
    "id" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "postcode" TEXT,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "note" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "RestaurantBranch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RestaurantPhoto" (
    "id" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "caption" TEXT NOT NULL,
    "imageSource" TEXT,
    "imageCredit" TEXT,
    "imageLink" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "RestaurantPhoto_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RestaurantBranch_restaurantId_displayOrder_idx" ON "RestaurantBranch"("restaurantId", "displayOrder");

-- CreateIndex
CREATE INDEX "RestaurantPhoto_restaurantId_displayOrder_idx" ON "RestaurantPhoto"("restaurantId", "displayOrder");

-- AddForeignKey
ALTER TABLE "RestaurantBranch" ADD CONSTRAINT "RestaurantBranch_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RestaurantPhoto" ADD CONSTRAINT "RestaurantPhoto_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 新しい表も、ほかの表と同じく Supabase のデータ API から閉じる
-- (20261029000000_close_public_schema_to_data_api)。
ALTER TABLE "RestaurantBranch" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "RestaurantPhoto" ENABLE ROW LEVEL SECURITY;
