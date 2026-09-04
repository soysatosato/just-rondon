-- 読み物の日別閲覧数。/reading の週間ランキングの集計元。
--
-- Content.views は累計しか持たない。累計だけで並べると上位は
-- 公開から時間の経った記事で固定され、/reading のいちばん目立つ場所が
-- 何ヶ月も同じ顔のままになる。直近だけを数える軸を足して、
-- ハブの顔が毎週入れ替わるようにする。
--
-- 累計を置き換えないのは、この表が消せる前提のデータだから。
-- 週間ランキングに要るのは直近7日ぶんだけなので古い行は捨ててよいが、
-- 累計は捨ててはいけない。役割が違うので別々に持つ。
--
-- day は UTC の日付。7日ぶんの合計を出す用途では、どのタイムゾーンで
-- 日を切っても順位はほとんど動かない。
--
-- 加算は /api/views から。累計の加算と同じトランザクションで行うので、
-- 片方だけ増えることはない。

CREATE TABLE "ContentDailyView" (
    "id" SERIAL NOT NULL,
    "contentId" TEXT NOT NULL,
    "day" DATE NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ContentDailyView_pkey" PRIMARY KEY ("id")
);

-- 1記事につき1日1行。加算は upsert で行うのでこの制約が要る。
CREATE UNIQUE INDEX "ContentDailyView_contentId_day_key" ON "ContentDailyView"("contentId", "day");

-- 集計は「直近7日」で絞ってから合計するため。
CREATE INDEX "ContentDailyView_day_idx" ON "ContentDailyView"("day");

-- 記事を消したら日別の記録も一緒に消す。順位付けにしか使わないので、
-- 参照先の無い行を残す意味がない。
ALTER TABLE "ContentDailyView" ADD CONSTRAINT "ContentDailyView_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "Content"("id") ON DELETE CASCADE ON UPDATE CASCADE;
