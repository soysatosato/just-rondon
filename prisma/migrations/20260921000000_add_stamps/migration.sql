-- 読者が押したスタンプ。1行が「この人がここへ行った(この作品を観た)」1件。
--
-- 対象は観光スポット・美術館・ミュージカルの3種。多態(targetType + targetKey)に
-- せず対象ごとの外部キーを3本並べたのは、スタンプ帳が押した場所の名前・画像・URLを
-- 必ず引くため。1回のクエリで取れるうえ、対象が消えたスタンプは名前も画像も無く
-- 描けないので、一緒に消えるのが正しい(ON DELETE CASCADE)。
--
-- 「3本のうち必ず1本だけ埋まる」は Prisma のスキーマでは書けないため、
-- 下の CHECK 制約 Stamp_one_target で保証する。Prisma は自分が管理していない
-- CHECK 制約を勝手に消さないが、このテーブルを作り直すときは一緒に書き直すこと。

-- CreateTable
CREATE TABLE "Stamp" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "attractionId" TEXT,
    "museumId" TEXT,
    "musicalId" TEXT,
    "stampedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "onSite" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Stamp_pkey" PRIMARY KEY ("id")
);

-- 同じ場所に2個目は押せない。NULL 同士は衝突しないので、
-- 美術館のスタンプが attractionId = NULL で何行並んでも互いに干渉しない。
-- CreateIndex
CREATE UNIQUE INDEX "Stamp_profileId_attractionId_key" ON "Stamp"("profileId", "attractionId");

-- CreateIndex
CREATE UNIQUE INDEX "Stamp_profileId_museumId_key" ON "Stamp"("profileId", "museumId");

-- CreateIndex
CREATE UNIQUE INDEX "Stamp_profileId_musicalId_key" ON "Stamp"("profileId", "musicalId");

-- スタンプ帳は「自分の分を新しい順」でしか読まない。
-- CreateIndex
CREATE INDEX "Stamp_profileId_stampedAt_idx" ON "Stamp"("profileId", "stampedAt");

-- 押した人。Booking / hasVisited と同じく Profile.clerkId を指す。
-- AddForeignKey
ALTER TABLE "Stamp" ADD CONSTRAINT "Stamp_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("clerkId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stamp" ADD CONSTRAINT "Stamp_attractionId_fkey" FOREIGN KEY ("attractionId") REFERENCES "Attraction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stamp" ADD CONSTRAINT "Stamp_museumId_fkey" FOREIGN KEY ("museumId") REFERENCES "Museum"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stamp" ADD CONSTRAINT "Stamp_musicalId_fkey" FOREIGN KEY ("musicalId") REFERENCES "Musical"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 対象は3本のうち必ず1本だけ。0本(どこのスタンプでもない行)と
-- 2本以上(スタンプ帳で二重に出る行)のどちらも書けないようにする。
ALTER TABLE "Stamp" ADD CONSTRAINT "Stamp_one_target" CHECK (
    (("attractionId" IS NOT NULL)::int + ("museumId" IS NOT NULL)::int + ("musicalId" IS NOT NULL)::int) = 1
);
