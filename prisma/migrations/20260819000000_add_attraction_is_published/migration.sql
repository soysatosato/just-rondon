-- Attraction に isPublished を足す。
--
-- 期間限定の催しが終わったあと、ページを伏せるための旗。
-- 行を削除すると AttractionStory / AttractionVisitStep / AttractionSection が
-- cascade で消え、「何を載せていたか」が追えなくなる。会期が再開する催しも
-- あるため、削除ではなくフラグで伏せる。
--
-- 既存の行はすべて公開のままにする(既定値 true)。
ALTER TABLE "Attraction" ADD COLUMN "isPublished" BOOLEAN NOT NULL DEFAULT true;

-- ジュラシック・ワールド：エクスペリエンスを非公開にする。
-- バタシー発電所 NEON での期間限定展示で、2026年1月4日に終了している。
-- ページは料金 £31.90〜 を載せたまま、開催中の施設として残っていた。
-- (終了告知は fix-stale-attraction-notes.ts で旧 AttractionSection には
--  書いてあるが、表示側が AttractionStory に移ったため出ていなかった)
UPDATE "Attraction" SET "isPublished" = false
WHERE "slug" = 'jurassic-world-experience-london';
