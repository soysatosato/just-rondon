-- AlterTable
-- 見どころと裏話(MusicalAppeal[] の JSON)。
--
-- あらすじは「何が起きるか」しか答えない。劇場でしか起きないこと
-- (舞台機構・生の歌唱・客席の反応)と、知っていると見え方が変わる
-- 制作の背景を別に持つ。kind で見どころと裏話を区別する。
--
-- nullable で入れて既存行は NULL のまま。表示側は層ごと出さない。
ALTER TABLE "Musical" ADD COLUMN     "appeals" JSONB;
