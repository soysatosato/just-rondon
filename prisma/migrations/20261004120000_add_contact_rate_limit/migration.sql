-- お問い合わせフォームの送信回数の上限とブロックリスト(utils/actions/contact.ts)。
--
-- ★ prisma migrate diff を DB に向けて作り直さないこと。Content / ContentSection の
--   image* 列(DB にだけあり schema.prisma に無い)を DROP する文が混ざる。
--   このファイルは手で書いた。

-- AlterTable
ALTER TABLE "Contact" ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN "ip" TEXT;

-- 既存の行は送信日時が分からない。いまの時刻のままだと、適用後1時間は
-- サイト全体の上限(30件/時)を既存の73件が埋めてしまい、誰も送れなくなる。
UPDATE "Contact" SET "createdAt" = '1970-01-01';

-- CreateIndex
CREATE INDEX "Contact_email_createdAt_idx" ON "Contact"("email", "createdAt");
CREATE INDEX "Contact_ip_createdAt_idx" ON "Contact"("ip", "createdAt");
CREATE INDEX "Contact_createdAt_idx" ON "Contact"("createdAt");

-- CreateTable
CREATE TABLE "BlockedContactEmail" (
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BlockedContactEmail_pkey" PRIMARY KEY ("email")
);

-- これまでに届いた営業スパムのアドレスを入れる。読者は日本語で書くので、
-- かなを1文字も含まず、確認リンクも踏まれていない問い合わせをスパムとみなす。
-- 確認済みの問い合わせに使われたアドレスと、運営者自身のアドレスは除く。
INSERT INTO "BlockedContactEmail" ("email")
SELECT DISTINCT lower("email") FROM "Contact"
WHERE "confirmed" = false
  AND "message" !~ '[ぁ-んァ-ン]'
  AND lower("email") NOT IN (SELECT lower("email") FROM "Contact" WHERE "confirmed" = true)
  AND lower("email") NOT IN ('contact@just-rondon.com', 'no-reply@just-rondon.com');
