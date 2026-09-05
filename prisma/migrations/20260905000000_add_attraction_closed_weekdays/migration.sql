-- 観光スポットに「休みの曜日」を構造として持たせる。
--
-- これまでこの事実は openingHours の散文にしか無く、旅程ビルダーが
-- lib/plan/dates.ts の parseClosedDays() で正規表現から読み取っていた。
-- 実測すると、公開155件のうち読み取れたのは10件しかない。
-- 「この日は閉まっています」は、旅程の警告のうち唯一、現地では直せず
-- 出発前にしか直せないものである。それが大半のスポットで黙っていた。
--
-- 列を作らなかった当初の判断(「原文と二重管理になってずれる」)は
-- 筋が通っていた。翻したのは、2026-09 に15件を追加したときに、
-- 3件の休館日を正しく読ませるために openingHours の文言そのものを
-- 手で調整する必要があったため——「土曜のみ」と書くと他6日が休館だと
-- 誤読されるので「土曜だけ」に書き換える、という作業になった。
-- 書き手が正規表現を意識しないと成立しない時点で、原文任せは無理がある。
--
-- 二重管理は運用で避ける。openingHours には時刻だけを書き、曜日は
-- closedWeekdays だけが持つ。表示側が両方を組み合わせて出す。
--
-- closedDaysCheckedAt を別に持つのは、Postgres のスカラー配列が null を
-- 取れないため。空配列だけでは「調べたうえで曜日休館は無い」と
-- 「まだ調べていない」を区別できない。読者には出さず、点検対象を
-- 洗い出すためだけに使う。

ALTER TABLE "Attraction" ADD COLUMN "closedWeekdays" INTEGER[] DEFAULT ARRAY[]::INTEGER[];
ALTER TABLE "Attraction" ADD COLUMN "closedDaysCheckedAt" TIMESTAMP(3);
ALTER TABLE "Attraction" ADD COLUMN "closedNote" TEXT;
