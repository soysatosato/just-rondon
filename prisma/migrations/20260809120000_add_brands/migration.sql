-- CreateTable
CREATE TABLE "Brand" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "engName" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "blurb" TEXT NOT NULL,
    "story" TEXT NOT NULL,
    "buying" TEXT NOT NULL,
    "founded" INTEGER,
    "origin" TEXT,
    "royalWarrant" BOOLEAN NOT NULL DEFAULT false,
    "priceRange" TEXT,
    "buyAt" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "flagship" TEXT,
    "website" TEXT,
    "tips" TEXT,
    "recommendLevel" INTEGER NOT NULL DEFAULT 0,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "image" TEXT,
    "imageSource" TEXT,
    "imageCredit" TEXT,
    "imageLink" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Brand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BrandItem" (
    "id" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "engName" TEXT,
    "note" TEXT NOT NULL,
    "priceRange" TEXT,
    "affiliateUrl" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BrandItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Brand_slug_key" ON "Brand"("slug");

-- CreateIndex
CREATE INDEX "Brand_category_idx" ON "Brand"("category");

-- CreateIndex
CREATE INDEX "BrandItem_brandId_displayOrder_idx" ON "BrandItem"("brandId", "displayOrder");

-- AddForeignKey
ALTER TABLE "BrandItem" ADD CONSTRAINT "BrandItem_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;
