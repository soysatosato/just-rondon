-- 読み物の予約公開(docs/reading-scheduled-publishing.md)に使う公開日時。
-- null = 下書き、未来 = 予約中、過去 = 公開済み。
--
-- 列を足して既存の行に createdAt を写すだけ。読み出し側はまだこの列を見ない。
--
-- ★ prisma migrate diff を DB に向けて作り直さないこと。Content / ContentSection の
--   image* 列(DB にだけあり schema.prisma に無い)を DROP する文が混ざる。
--   このファイルは手で書いた。

-- AlterTable
ALTER TABLE "Content" ADD COLUMN "publishedAt" TIMESTAMP(3);

-- いま出ている記事の日付と並び順を変えないよう、書いた日時をそのまま公開日時にする。
-- 読み物以外のカテゴリ(イベント等)も同じ表にあるが、区別せず全行に写す。
UPDATE "Content" SET "publishedAt" = "createdAt";

-- CreateIndex
CREATE INDEX "Content_category_publishedAt_idx" ON "Content"("category", "publishedAt");
