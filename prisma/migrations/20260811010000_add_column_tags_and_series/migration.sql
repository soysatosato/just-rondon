-- コラムが15本を超え、日付順のフラットな一覧では目的の記事に辿り着けなくなった。
-- /column にテーマ絞り込みと連載のグループ表示を入れるため、分類情報を持たせる。
--
-- tags: テーマ分類（history / person / institution / daily / london など）。
--       複数該当しうるので配列。column 以外のカテゴリでは空のまま。
-- seriesName / seriesOrder: 連載コラム用。レン物語・ウェストウッド物語のように
--       複数回にまたがる記事を束ね、詳細ページで前後の回に移動できるようにする。
--       単発コラムでは NULL。
ALTER TABLE "Content" ADD COLUMN "tags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "Content" ADD COLUMN "seriesName" TEXT;
ALTER TABLE "Content" ADD COLUMN "seriesOrder" INTEGER;

-- 連載の回順で並べる用途しかないため、複合インデックスにする。
CREATE INDEX "Content_seriesName_seriesOrder_idx"
    ON "Content"("seriesName", "seriesOrder");
