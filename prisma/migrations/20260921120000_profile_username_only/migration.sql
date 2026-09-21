-- Profile を「Clerk のアカウントとサイト内のユーザーネームを結ぶ行」だけにする。
--
-- Profile は勉強用に作ったテーブルの名残で、メールアドレスと顔写真の写しを
-- 持っていた。どちらも Clerk にあり、写しは本人が Clerk 側で変えても追従せず、
-- 退会後に残る個人情報になる。サイトは写真も本名も出さない方針なので列ごと消す。
--
-- Booking と hasVisited も勉強用の名残。コードからは使われておらず0件で、
-- Profile にぶら下がっていたので一緒に片付ける。
--
-- ★ Content / ContentSection の image* 列(DB にだけあり schema.prisma に無い)は
--   このマイグレーションとは無関係なので触らない。prisma migrate diff で
--   作り直すと、それらを DROP する文が混ざるので注意。

-- DropForeignKey
ALTER TABLE "Booking" DROP CONSTRAINT "Booking_museumId_fkey";

-- DropForeignKey
ALTER TABLE "Booking" DROP CONSTRAINT "Booking_profileId_fkey";

-- DropForeignKey
ALTER TABLE "hasVisited" DROP CONSTRAINT "hasVisited_museumId_fkey";

-- DropForeignKey
ALTER TABLE "hasVisited" DROP CONSTRAINT "hasVisited_profileId_fkey";

-- DropTable
DROP TABLE "Booking";

-- DropTable
DROP TABLE "hasVisited";

-- AlterTable
ALTER TABLE "Profile" DROP COLUMN "email",
DROP COLUMN "profileImage";

-- 一意制約を username から usernameKey(username を小文字にしたもの)へ移す。
-- 大文字小文字だけが違う名前(PimlicoPuffin と pimlicopuffin)を、別の人に
-- 取らせないため。適用時点で行があっても通るよう、埋めてから NOT NULL にする。
ALTER TABLE "Profile" ADD COLUMN "usernameKey" TEXT;
UPDATE "Profile" SET "usernameKey" = lower("username");
ALTER TABLE "Profile" ALTER COLUMN "usernameKey" SET NOT NULL;

-- DropIndex
DROP INDEX "Profile_username_key";

-- CreateIndex
CREATE UNIQUE INDEX "Profile_usernameKey_key" ON "Profile"("usernameKey");
