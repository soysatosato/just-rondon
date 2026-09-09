-- サービスチャージ調査の設問を作り直す。
--
-- 旧設問は「徴収の有無・分配方法・月額」の3つしか数字を取っておらず、
-- 集計に使えなかった。月額は勤務時間を聞いていないためフルタイムと
-- 週2のスタッフが同じ土俵に並び、実際 £0 と週£1,000 が同じ列に入っている。
-- 比較できる単位は「サービスチャージの時給換算」なので monthlyHours を足す。
--
-- 残りの5列は、Tipping Act 2023 が雇用主に課している義務のうち、
-- 働く人が自分で確認できるものをそのまま設問にしたもの。
--   writtenPolicy   … 分配方針を書面にして読める状態にする義務(2024-10-01〜)
--   onPayslip       … 記録の保存義務(3年)と閲覧権の入口になる
--   kitchenIncluded … キッチンの一律除外は公平性の観点で争点になる
--   jobRole         … 上の除外がどちら側から見た証言かで意味が変わる
--   workPeriod      … 施行前(2024-10-01より前)の経験を現在の実態と混ぜないため
--
-- role は Postgres の予約語なので jobRole にしてある。
--
-- 既存69件はすべて null になる。集計側は「未回答」として分母から外す。

ALTER TABLE "ServiceCharge" ADD COLUMN "workPeriod" TEXT;
ALTER TABLE "ServiceCharge" ADD COLUMN "jobRole" TEXT;
ALTER TABLE "ServiceCharge" ADD COLUMN "chargeRatePercent" DOUBLE PRECISION;
ALTER TABLE "ServiceCharge" ADD COLUMN "kitchenIncluded" TEXT;
ALTER TABLE "ServiceCharge" ADD COLUMN "onPayslip" TEXT;
ALTER TABLE "ServiceCharge" ADD COLUMN "writtenPolicy" TEXT;
ALTER TABLE "ServiceCharge" ADD COLUMN "monthlyHours" DOUBLE PRECISION;
