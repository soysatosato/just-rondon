-- Instagram のカルーセル投稿(成長施策 C7 の第1段階)と、読み物の画像クレジット。
--
-- 1) Content / ContentSection の image* 列を schema.prisma に載せる。
--    4列とも以前から DB にだけあった(どの migration にも無い)。ここでは
--    IF NOT EXISTS で足すだけなので、本番では何もしない。新しい DB を
--    migration から作り直したときに列が欠けないよう、履歴に残しておく。
--
--    schema に載ったので、prisma migrate diff がこれらを DROP する文を
--    出すことはもう無い。以前の migration に残る「diff を DB に向けて
--    作り直さないこと」の注意は、この migration 以降は不要。
ALTER TABLE "Content" ADD COLUMN IF NOT EXISTS "imageSource" TEXT;
ALTER TABLE "Content" ADD COLUMN IF NOT EXISTS "imageCredit" TEXT;
ALTER TABLE "Content" ADD COLUMN IF NOT EXISTS "imageLink" TEXT;
ALTER TABLE "Content" ADD COLUMN IF NOT EXISTS "imageCaption" TEXT;

ALTER TABLE "ContentSection" ADD COLUMN IF NOT EXISTS "imageSource" TEXT;
ALTER TABLE "ContentSection" ADD COLUMN IF NOT EXISTS "imageCredit" TEXT;
ALTER TABLE "ContentSection" ADD COLUMN IF NOT EXISTS "imageLink" TEXT;
ALTER TABLE "ContentSection" ADD COLUMN IF NOT EXISTS "imageCaption" TEXT;

-- 2) Instagram のカルーセル投稿。状態の意味は schema.prisma のコメント。
CREATE TABLE "InstagramPost" (
    "id" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "coverHead" TEXT NOT NULL,
    "coverTail" TEXT,
    "points" JSONB NOT NULL,
    "closingTitle" TEXT NOT NULL,
    "closingBody" TEXT NOT NULL,
    "caption" TEXT NOT NULL,
    "hashtags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" TEXT NOT NULL DEFAULT 'draft',
    "scheduledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InstagramPost_pkey" PRIMARY KEY ("id")
);

-- 管理ページの「承認済み」「予約済み」と、/ig の一覧を日時順に引く。
CREATE INDEX "InstagramPost_status_scheduledAt_idx" ON "InstagramPost"("status", "scheduledAt");

-- スキルが「この記事はもう投稿を作ったか」を見る。
CREATE INDEX "InstagramPost_contentId_idx" ON "InstagramPost"("contentId");

-- 記事が消えたら投稿の原稿も消す(表紙の写真も見出しも記事から描くので残しても描けない)。
ALTER TABLE "InstagramPost" ADD CONSTRAINT "InstagramPost_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "Content"("id") ON DELETE CASCADE ON UPDATE CASCADE;
