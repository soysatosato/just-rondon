-- CreateTable
CREATE TABLE "BrandImage" (
    "id" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "section" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "caption" TEXT NOT NULL,
    "imageSource" TEXT,
    "imageCredit" TEXT,
    "imageLink" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BrandImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BrandImage_brandId_section_displayOrder_idx" ON "BrandImage"("brandId", "section", "displayOrder");

-- AddForeignKey
ALTER TABLE "BrandImage" ADD CONSTRAINT "BrandImage_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;
