-- スタンプ帳を「旅のしおり」として公開するリンク(/stamps/shiori/…)。1人1本。
--
-- これから行く友人に、自分が行った場所をエリアごとにまとめて渡す。
-- リンクを知っていれば、ログインしていない人でも開ける。
--
-- ★ prisma migrate diff を DB に向けて作り直さないこと。Content / ContentSection の
--   image* 列(DB にだけあり schema.prisma に無い)を DROP する文が混ざる。
--   このファイルは旧 schema.prisma と新 schema.prisma の差分から作った。
--
-- ★ 20260930000000_add_stamp_friends より後に当てること(どちらも Profile を指すだけで
--   互いには依存しないが、フォルダ名の順に当たる)。

-- token は URL に載せる値そのもの。StampInvite と違ってハッシュにしない理由は
-- schema.prisma の StampShare。
-- CreateTable
CREATE TABLE "StampShare" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StampShare_pkey" PRIMARY KEY ("id")
);

-- 1人1本。
-- CreateIndex
CREATE UNIQUE INDEX "StampShare_profileId_key" ON "StampShare"("profileId");

-- しおりを開くときは token で引く。
-- CreateIndex
CREATE UNIQUE INDEX "StampShare_token_key" ON "StampShare"("token");

-- 退会したら、公開していたしおりも一緒に消える。
-- AddForeignKey
ALTER TABLE "StampShare" ADD CONSTRAINT "StampShare_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("clerkId") ON DELETE CASCADE ON UPDATE CASCADE;
