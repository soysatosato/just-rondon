-- 読み物に「公開した後で本文を直した日時」の列を足す(2026-10)。
--
-- 記事の dateModified と OG の modified_time は updatedAt から出していたが、
-- updatedAt は閲覧の加算(/api/views)でも書き換わっていた。閲覧のあった記事
-- 138本のうち100本で updatedAt が lastViewedAt と一致し、中身を直していない
-- 記事が「今日更新された」と名乗っていた。更新日は別の列で持つ。
ALTER TABLE "Content" ADD COLUMN "revisedAt" TIMESTAMP(3);

-- 既存の記事で、公開後に本文を直したと確かめられるのは、2026-10-12 に
-- 参考資料と照合して誤りを直したコラム10本だけ(10/11〜10/20 のバックアップを
-- 突き合わせて確認した。ほかに本文が変わった7本は、曲名の英語表記への統一と
-- 冒頭の年表の削除で、中身は変わっていない)。照合した日時が直した日時になる。
-- 公開前に照合した記事(sourcesCheckedAt が公開より前)は対象にしない。
UPDATE "Content"
SET "revisedAt" = "sourcesCheckedAt"
WHERE "category" IN ('column', 'british-english', 'modern-britain', 'area')
  AND "publishedAt" IS NOT NULL
  AND "sourcesCheckedAt" > "publishedAt";
