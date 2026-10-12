-- 読み物に参考資料の列を足す(2026-10)。
--
-- コラムは作成時に出典を調べていたが、ページには載せていなかった
-- (AdSense 不承認後の監査で、コラム74本のうち外部リンクのある記事は0本)。
-- 資料で裏を取れた記事にだけ値を入れ、記事末尾に「参考資料」欄を出す。
-- 値の形は lib/reading-sources.ts。
ALTER TABLE "Content" ADD COLUMN "sources" JSONB;
ALTER TABLE "Content" ADD COLUMN "sourcesCheckedAt" TIMESTAMP(3);
