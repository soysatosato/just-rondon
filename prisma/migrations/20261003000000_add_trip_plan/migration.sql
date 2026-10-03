-- 旅行プラン(/plan)のアカウント側の控え。1人1本。
--
-- プランの本体はブラウザの localStorage のまま。ログインしている読者の分だけ
-- 写しをここへ送り、別の端末で開けるようにする。
--
-- ★ prisma migrate diff を DB に向けて作り直さないこと。Content / ContentSection の
--   image* 列(DB にだけあり schema.prisma に無い)を DROP する文が混ざる。
--   このファイルは旧 schema.prisma と新 schema.prisma の差分から作った。
--
-- ★ Profile を指すだけなので、未適用の 20260930000000_add_stamp_friends・
--   20260930120000_add_stamp_share とは互いに依存しない(フォルダ名の順に当たる)。

-- spots は共有リンク(?spots=)と同じ形。revision は書くたびに1つ上がり、
-- 別の端末が先に書いていたら上書きせずに止めるのに使う(schema.prisma の TripPlan)。
-- CreateTable
CREATE TABLE "TripPlan" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "spots" TEXT NOT NULL,
    "startDate" TEXT,
    "startMinutes" INTEGER NOT NULL,
    "revision" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TripPlan_pkey" PRIMARY KEY ("id")
);

-- 1人1本。
-- CreateIndex
CREATE UNIQUE INDEX "TripPlan_profileId_key" ON "TripPlan"("profileId");

-- 退会したら、プランの控えも一緒に消える。
-- AddForeignKey
ALTER TABLE "TripPlan" ADD CONSTRAINT "TripPlan_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("clerkId") ON DELETE CASCADE ON UPDATE CASCADE;
