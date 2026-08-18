-- AttractionStory に source を足す。
--
-- migrate-sections-to-stories.ts は旧 AttractionSection から機械的に作り直す
-- 都合上、スポット単位で deleteMany してから createMany する。そのため
-- seed-attraction-stories-*.ts で手で書き直した本文が、移行スクリプトを
-- 流し直すたびに巻き添えで消えていた。実際、最寄駅を29件補完したあとに移行を
-- 流し直した際、level 5 (10,379字→21,682字) と level 4 (29,737字→46,057字) の
-- 書き直しが両方とも消え、seed を流し直して復旧している。
--
-- 既存行は既定値の "migrated" に倒れる。そのうえで、書き直し済みの
-- level 5 / level 4 のスポットだけ "authored" に更新する。
-- 以後、移行スクリプトは source = 'migrated' の行だけを消す。
ALTER TABLE "AttractionStory" ADD COLUMN "source" TEXT NOT NULL DEFAULT 'migrated';

-- 書き直し済みのスポットを authored にする。この一覧は
-- seed-attraction-stories-level5.ts / -level4.ts の STORIES のキーから
-- 生成したもの (level 5: 11件 / level 4: 28件)。
-- recommendLevel ではなく slug で指定するのは、格付けが後から変わっても
-- 対象がぶれないようにするため。
UPDATE "AttractionStory" SET "source" = 'authored'
WHERE "attractionId" IN (
  SELECT "id" FROM "Attraction" WHERE "slug" IN (
    -- level 5
    'tower-of-london', 'british-museum-london', 'westminster-abbey',
    'st-pauls-cathedral', 'natural-history-museum',
    'national-gallery-london', 'buckingham-palace', 'big-ben', 'london-eye',
    'changing-the-guard-buckingham-palace', 'london-tower-bridge',
    -- level 4
    'churchill-war-rooms', 'hampton-court-palace', 'windsor-castle',
    'kensington-palace', 'royal-observatory-greenwich',
    'abbey-road-beatles', 'imperial-war-museum', 'old-royal-naval-college',
    'science-museum', 'tate-britain',
    'houses-of-parliament-self-guided-audio-tour', 'sky-garden-london',
    'hyde-park-london', 'london-transport-museum', 'madame-tussauds-london',
    'camden-lock-market', 'columbia-road-flower-market',
    'kings-gallery-buckingham-palace', 'royal-mews',
    'battersea-power-station', 'warner-bros-studio-tour-harry-potter',
    'shakespeares-globe-guided-tour', 'tate-modern', 'harrods-london',
    'sea-life-london-aquarium', 'hyde-park-winter-wonderland-2025',
    'kew-gardens-london', 'the-view-from-the-shard'
  )
);
