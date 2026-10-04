-- 「今月変わったロンドン」月次号(/changes)と、観光スポットの料金の変更履歴。
--
-- ★ prisma migrate diff を DB に向けて作り直さないこと。Content / ContentSection の
--   image* 列(DB にだけあり schema.prisma に無い)を DROP する文が混ざる。
--   このファイルは手で書いた。
--
-- ★ 末尾のトリガーは schema.prisma に現れない(Prisma はトリガーを扱わない)。
--   AttractionPriceChange の行を書くのはアプリではなくこのトリガー。

-- CreateTable
CREATE TABLE "MonthlyChangeIssue" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "monthStart" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "headline" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "image" TEXT,
    "researchedAt" TIMESTAMP(3) NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MonthlyChangeIssue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MonthlyChangeItem" (
    "id" TEXT NOT NULL,
    "issueId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "audience" TEXT NOT NULL,
    "timing" TEXT NOT NULL DEFAULT 'changed',
    "status" TEXT NOT NULL DEFAULT 'confirmed',
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "before" TEXT,
    "after" TEXT,
    "effectiveDate" TIMESTAMP(3),
    "sitePath" TEXT,
    "source" TEXT NOT NULL,
    "sourceName" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MonthlyChangeItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AttractionPriceChange" (
    "id" SERIAL NOT NULL,
    "attractionId" TEXT NOT NULL,
    "field" TEXT NOT NULL,
    "before" TEXT,
    "after" TEXT,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AttractionPriceChange_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MonthlyChangeIssue_slug_key" ON "MonthlyChangeIssue"("slug");

-- CreateIndex
CREATE INDEX "MonthlyChangeIssue_publishedAt_monthStart_idx" ON "MonthlyChangeIssue"("publishedAt", "monthStart");

-- CreateIndex
CREATE INDEX "MonthlyChangeItem_issueId_displayOrder_idx" ON "MonthlyChangeItem"("issueId", "displayOrder");

-- CreateIndex
CREATE INDEX "AttractionPriceChange_changedAt_idx" ON "AttractionPriceChange"("changedAt");

-- CreateIndex
CREATE INDEX "AttractionPriceChange_attractionId_changedAt_idx" ON "AttractionPriceChange"("attractionId", "changedAt");

-- AddForeignKey
ALTER TABLE "MonthlyChangeItem" ADD CONSTRAINT "MonthlyChangeItem_issueId_fkey" FOREIGN KEY ("issueId") REFERENCES "MonthlyChangeIssue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttractionPriceChange" ADD CONSTRAINT "AttractionPriceChange_attractionId_fkey" FOREIGN KEY ("attractionId") REFERENCES "Attraction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 料金が変わるたびに1行残す。
--
-- 料金を書き換えるスクリプトは何本もあり(scripts/add-attractions-*.ts、
-- fill-attraction-facts-*.ts など)、アプリ側で記録させるとどれか1本の
-- 書き忘れがそのまま履歴の穴になる。DB で拾えば経路を問わない。
--
-- 値が変わらない更新(同じ文字列で上書き)は記録しない。INSERT(新規スポット)も
-- 記録しない——「改定」ではなく「掲載開始」なので。
CREATE OR REPLACE FUNCTION record_attraction_price_change() RETURNS trigger AS $$
BEGIN
  IF NEW."priceAdult" IS DISTINCT FROM OLD."priceAdult" THEN
    INSERT INTO "AttractionPriceChange" ("attractionId", "field", "before", "after")
    VALUES (NEW."id", 'priceAdult', OLD."priceAdult", NEW."priceAdult");
  END IF;
  IF NEW."priceChild" IS DISTINCT FROM OLD."priceChild" THEN
    INSERT INTO "AttractionPriceChange" ("attractionId", "field", "before", "after")
    VALUES (NEW."id", 'priceChild', OLD."priceChild", NEW."priceChild");
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "Attraction_record_price_change"
AFTER UPDATE OF "priceAdult", "priceChild" ON "Attraction"
FOR EACH ROW
EXECUTE FUNCTION record_attraction_price_change();
