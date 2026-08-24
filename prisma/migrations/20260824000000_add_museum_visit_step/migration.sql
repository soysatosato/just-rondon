-- 美術館に「着いてからの歩き方」を足す。AttractionVisitStep の美術館版。
--
-- 監査で、47館すべてが description 300字前後・Highlight 3件・Trivia 2件
-- という同じ型で止まっていることが分かった。人が書いた本文は最も厚い
-- national-gallery でも1,267字で、観光スポット側(本文3,000字超 +
-- 歩き方6ステップ)の半分に届かない。
--
-- 不足しているのは「何を見るか」ではなく「どう回るか」。どの入口から
-- 入るか、どの順に回るか、何時に行列が伸びるかは Highlight では表せない
-- (あちらは展示物1件ごとの説明で、館内の動線を持たない)。
-- スポット側で機能している構造をそのまま持ち込む。
--
-- Highlight と分けているのは読者が読むタイミングが違うため。
-- 見どころは行くかどうかを決める段階で読み、歩き方は着いてから読む。

CREATE TABLE "MuseumVisitStep" (
    "id" SERIAL NOT NULL,
    "museumId" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL,
    "kind" TEXT NOT NULL DEFAULT 'highlight',
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MuseumVisitStep_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "MuseumVisitStep_museumId_displayOrder_idx" ON "MuseumVisitStep"("museumId", "displayOrder");

-- 館を消したら歩き方も消える。Highlight / Trivia と同じ扱い。
ALTER TABLE "MuseumVisitStep" ADD CONSTRAINT "MuseumVisitStep_museumId_fkey"
    FOREIGN KEY ("museumId") REFERENCES "Museum"("id") ON DELETE CASCADE ON UPDATE CASCADE;
