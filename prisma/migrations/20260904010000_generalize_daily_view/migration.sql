-- 日別閲覧数を、読み物以外(観光スポット・美術館・ミュージカル)にも広げる。
--
-- 前の migration で作った ContentDailyView は Content への外部キーを
-- 持っていて、読み物しか数えられなかった。同じ「累計だけだと顔が
-- 変わらない」問題は観光スポットとミュージカルの一覧にもあるので、
-- 対象を targetType で持つ1つの表に作り直す。
--
-- 表を4つに分けなかった理由: 順位付けにしか使わないデータなので、
-- 外部キーで参照整合を守る価値より、加算と集計のコードが1本で済む
-- ことのほうが大きい。参照先が消えても行が残るかわりに、読み出し側は
-- id で引き直して見つからなかったものを落とす。
--
-- ContentDailyView は前日に作ったばかりで1行も入っておらず、集計に
-- 使う前に作り直せる。移行するデータは無い。

DROP TABLE "ContentDailyView";

CREATE TABLE "DailyView" (
    "id" SERIAL NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "day" DATE NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "DailyView_pkey" PRIMARY KEY ("id")
);

-- 1対象につき1日1行。加算は upsert で行うのでこの制約が要る。
CREATE UNIQUE INDEX "DailyView_targetType_targetId_day_key" ON "DailyView"("targetType", "targetId", "day");

-- 集計は「ある種類の、直近7日」で絞ってから合計する。
CREATE INDEX "DailyView_targetType_day_idx" ON "DailyView"("targetType", "day");
