-- スタンプ帳のつながり(旅仲間)と、つなぐための招待リンク。
--
-- パートナーや友人とスタンプ帳をつなぎ、2人(以上)が行った場所を重ねて、
-- まだ誰も行っていない場所を並べる(/stamps/together)。
--
-- ★ prisma migrate diff を DB に向けて作り直さないこと。Content / ContentSection の
--   image* 列(DB にだけあり schema.prisma に無い)を DROP する文が混ざる。
--   このファイルは旧 schema.prisma と新 schema.prisma の差分から作った。

-- 1組を1行で持つ。向きは無く、2人の clerkId のうち小さいほうが lowId。
-- CreateTable
CREATE TABLE "StampFriend" (
    "id" TEXT NOT NULL,
    "lowId" TEXT NOT NULL,
    "highId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StampFriend_pkey" PRIMARY KEY ("id")
);

-- 招待リンク。URL に載せた値そのものではなく、その SHA-256 を持つ。
-- CreateTable
CREATE TABLE "StampInvite" (
    "id" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StampInvite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StampFriend_highId_idx" ON "StampFriend"("highId");

-- 同じ2人の組は1行だけ。下の StampFriend_ordered と組み合わせて、
-- 逆向き(lowId と highId を入れ替えた行)も作れないようにする。
-- CreateIndex
CREATE UNIQUE INDEX "StampFriend_lowId_highId_key" ON "StampFriend"("lowId", "highId");

-- CreateIndex
CREATE UNIQUE INDEX "StampInvite_tokenHash_key" ON "StampInvite"("tokenHash");

-- CreateIndex
CREATE INDEX "StampInvite_profileId_idx" ON "StampInvite"("profileId");

-- 期限切れの招待をまとめて消すときに使う。
-- CreateIndex
CREATE INDEX "StampInvite_expiresAt_idx" ON "StampInvite"("expiresAt");

-- どちらかが退会したら、つながりも招待も一緒に消える。
-- AddForeignKey
ALTER TABLE "StampFriend" ADD CONSTRAINT "StampFriend_lowId_fkey" FOREIGN KEY ("lowId") REFERENCES "Profile"("clerkId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StampFriend" ADD CONSTRAINT "StampFriend_highId_fkey" FOREIGN KEY ("highId") REFERENCES "Profile"("clerkId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StampInvite" ADD CONSTRAINT "StampInvite_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("clerkId") ON DELETE CASCADE ON UPDATE CASCADE;

-- lowId は必ず highId より小さい。これで (A, B) と (B, A) の2行が並ぶことも、
-- 自分自身とつながった行ができることも無くなる。Prisma のスキーマでは
-- 書けないので、このテーブルを作り直すときは一緒に書き直すこと。
--
-- 比べるのはバイト順(COLLATE "C")。DB 既定の照合順序は大文字と小文字を
-- 辞書のように並べ("a" < "B")、アプリ側の JavaScript の比較("B" < "a")と
-- 食い違う。Clerk の ID は英数字の大小混じりなので、そのままだと
-- アプリが正しく並べた組をこの制約が弾く。
ALTER TABLE "StampFriend" ADD CONSTRAINT "StampFriend_ordered" CHECK ("lowId" COLLATE "C" < "highId" COLLATE "C");
