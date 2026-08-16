-- AlterTable
-- あらすじを3層に分ける。既存の description は「物語の流れ」の層として
-- そのまま残るので、3列とも nullable で入れて既存31行は NULL のままにする。
--
-- storyHook   : 「どんな話か」の地の文。読者が固有名詞を受け取る前の入口。
-- characters  : 主な登場人物(MusicalCharacter[] の JSON)。並び順も原稿の一部。
-- storyEnding : 結末。折りたたみの中にだけ出すため description から切り出す。
--
-- 表示側は層ごとに出し分ける。埋まっていない作品は従来どおり
-- description だけが出る。
ALTER TABLE "Musical" ADD COLUMN     "storyHook" TEXT,
ADD COLUMN     "characters" JSONB,
ADD COLUMN     "storyEnding" TEXT;
