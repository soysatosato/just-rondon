-- buyAt / flagship は BrandStore に一本化する。
-- Brand はまだ1行も入っていないため、この削除でデータは失われない。
ALTER TABLE "Brand" DROP COLUMN "buyAt";
ALTER TABLE "Brand" DROP COLUMN "flagship";

-- appeal は NOT NULL だが既存行が無いので DEFAULT '' で安全に追加できる。
ALTER TABLE "Brand" ADD COLUMN "appeal" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Brand" ALTER COLUMN "appeal" DROP DEFAULT;

-- CreateTable
CREATE TABLE "BrandStore" (
    "id" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "nearestStation" TEXT,
    "note" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BrandStore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BrandFaq" (
    "id" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BrandFaq_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BrandStore_brandId_displayOrder_idx" ON "BrandStore"("brandId", "displayOrder");

-- CreateIndex
CREATE INDEX "BrandFaq_brandId_displayOrder_idx" ON "BrandFaq"("brandId", "displayOrder");

-- AddForeignKey
ALTER TABLE "BrandStore" ADD CONSTRAINT "BrandStore_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrandFaq" ADD CONSTRAINT "BrandFaq_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;
