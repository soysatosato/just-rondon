-- 記事コメントに運営が返信できるようにする(管理ページ /admin/comments から)。
--
-- 返信は別テーブルにせず、同じ PageComment に parentId 付きで入れる。
-- 返信先を非表示にすれば返信も一緒に出なくなり、将来ログインした読者同士の
-- 返信を開けるときもこの列で足りる。返信は1段だけ。
--
-- isOfficial: 運営の投稿か。記事ページの「運営」表示はこの列からしか描かない。
--             名前欄に「運営」と書けば運営に見える、という作りにしないため。
--
-- ★ prisma migrate diff を DB に向けて作り直さないこと(Content / ContentSection の
--   DB にだけある列を DROP する文が混ざる)。このファイルは手で書いた。
ALTER TABLE "PageComment" ADD COLUMN "parentId" TEXT;
ALTER TABLE "PageComment" ADD COLUMN "isOfficial" BOOLEAN NOT NULL DEFAULT false;

-- 記事ページで「このコメントへの返信」を引くのに使う。
CREATE INDEX "PageComment_parentId_idx" ON "PageComment"("parentId");

-- 返信先が消えたら返信も消す(運営の返信だけが残っても読めない)。
ALTER TABLE "PageComment" ADD CONSTRAINT "PageComment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "PageComment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
