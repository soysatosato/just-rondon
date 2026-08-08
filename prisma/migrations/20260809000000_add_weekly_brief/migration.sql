-- CreateTable
CREATE TABLE "WeeklyBrief" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "weekStart" TIMESTAMP(3) NOT NULL,
    "weekEnd" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "headline" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "image" TEXT,
    "researchedAt" TIMESTAMP(3) NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WeeklyBrief_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeeklyBriefItem" (
    "id" TEXT NOT NULL,
    "briefId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "severity" TEXT,
    "timing" TEXT NOT NULL DEFAULT 'thisWeek',
    "status" TEXT NOT NULL DEFAULT 'confirmed',
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "venue" TEXT,
    "area" TEXT,
    "nearestStation" TEXT,
    "priceInfo" TEXT,
    "isFree" BOOLEAN NOT NULL DEFAULT false,
    "website" TEXT,
    "source" TEXT NOT NULL,
    "sourceName" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WeeklyBriefItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WeeklyBrief_slug_key" ON "WeeklyBrief"("slug");

-- CreateIndex
CREATE INDEX "WeeklyBrief_weekStart_idx" ON "WeeklyBrief"("weekStart");

-- CreateIndex
CREATE INDEX "WeeklyBrief_published_weekStart_idx" ON "WeeklyBrief"("published", "weekStart");

-- CreateIndex
CREATE INDEX "WeeklyBriefItem_briefId_displayOrder_idx" ON "WeeklyBriefItem"("briefId", "displayOrder");

-- AddForeignKey
ALTER TABLE "WeeklyBriefItem" ADD CONSTRAINT "WeeklyBriefItem_briefId_fkey" FOREIGN KEY ("briefId") REFERENCES "WeeklyBrief"("id") ON DELETE CASCADE ON UPDATE CASCADE;

