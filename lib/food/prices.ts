/**
 * ロンドンの食費節約に関わる金額・条件を一元管理する。
 *
 * なぜ定数にするか:
 * Meal Deal の価格は各チェーンが年1〜2回上げてくる。2024年以降だけでも
 * Tesco は £3.40 → £3.60 → £3.90(Clubcard 価格)、Boots は £3.99 → £4.25 と
 * 動いており、記事本文にべた書きすると改定のたびに全記事を grep して回る
 * ことになる。節約系の記事は金額が命なので、古い数字が残ると記事の信頼が
 * まるごと崩れる。
 *
 * 運用ルール:
 * 1. 記事から金額を書くときは必ずここを参照する(`gbp(MEAL_DEALS.tesco.clubcard)` の形)。
 * 2. 改定時はこのファイルと FOOD_AS_OF / FOOD_UPDATED_AT だけを更新する。
 * 3. 値引き時刻や割引率は店舗ごとにばらつくため、必ず「目安」と書く。
 *    ここに書いた時刻を断定調で記事に出さないこと(店舗差で必ず外れる)。
 *
 * 金額はすべて GBP。2026年8月12日時点。
 */

/** 情報の基準時点。記事の dataAsOf バッジに出る。 */
export const FOOD_AS_OF = "2026年8月";

/** ISO日付。記事の updatedAt(Article.dateModified)に出る。 */
export const FOOD_UPDATED_AT = "2026-08-12";

/**
 * 各チェーンの Meal Deal 価格。
 *
 * standard = 通常価格、member = 会員価格(Clubcard / Nectar / Advantage Card)。
 * 会員価格が無い店は member を省略する。
 */
export const MEAL_DEALS = {
  tesco: { label: "Tesco", standard: 4.0, member: 3.6 },
  sainsburys: { label: "Sainsbury's", standard: 4.0, member: 3.75 },
  boots: { label: "Boots", standard: 4.25, member: 3.99 },
  morrisons: { label: "Morrisons", standard: 3.75, member: 3.5 },
  coop: { label: "Co-op", standard: 4.0, member: 3.5 },
  waitrose: { label: "Waitrose", standard: 5.0 },
  marksAndSpencer: { label: "M&S", standard: 4.5 },
  greggs: { label: "Greggs", standard: 3.85 },
  whsmith: { label: "WHSmith", standard: 4.29 },
} as const;

/** Meal Deal の中で単品価格が高く、組み合わせて得になりやすい商品の目安。 */
export const MEAL_DEAL_MAX_VALUE = {
  /** メイン枠で最も高い部類(寿司・ラップ系)の単品価格目安。 */
  mainSingleHigh: 4.5,
  /** スナック枠の高い部類(ナッツ・チョコ菓子)の単品価格目安。 */
  snackSingleHigh: 1.75,
  /** ドリンク枠の高い部類(スムージー・エナジードリンク)の単品価格目安。 */
  drinkSingleHigh: 2.5,
} as const;

/**
 * 閉店前の値引き。
 *
 * 時刻・割引率は店舗ごとに大きく違うため、記事では必ず「目安」「店舗差あり」を
 * 添えること。ここの数値は複数店舗で確認した中央的な値。
 */
export const CLOSING_DISCOUNTS = {
  /** 日本食チェーン。閉店30分前が目安だが、30%オフの店舗もある。 */
  wasabi: { label: "Wasabi", minutesBefore: 30, offMin: 30, offMax: 50 },
  itsu: { label: "itsu", minutesBefore: 30, offMin: 40, offMax: 50 },
  /** スーパーの値引きシール。夕方に1回目、閉店前に2回目が入ることが多い。 */
  supermarketFirstRound: "16:00〜18:00",
  supermarketFinalRound: "閉店1時間前",
} as const;

/** 売れ残り食品アプリ。価格は袋1つあたりの目安。 */
export const SURPLUS_FOOD_APPS = {
  tooGoodToGo: { label: "Too Good To Go", bagMin: 3.0, bagMax: 5.0 },
  /** Olio は個人間の譲渡が中心で、基本的に無料。 */
  olio: { label: "Olio", free: true },
} as const;

/** 水を買わない場合の節約額。500mlボトルを1日1本買った場合との比較。 */
export const WATER_SAVING = {
  bottlePrice: 1.25,
  perMonth30Days: 37.5,
} as const;

/** 学生・ユース向け割引の代表例。割引率は店舗・時期で変動する。 */
export const STUDENT_DISCOUNTS = {
  totum: { label: "TOTUM", annualFee: 14.99 },
  typicalOffPercent: 10,
} as const;

/** 出典。裏取りせずに数値を書き換えないこと。 */
export const FOOD_SOURCES = [
  {
    label: "Tesco — Meal Deal（Clubcard 価格）",
    url: "https://www.tesco.com/zones/meal-deal",
  },
  {
    label: "Sainsbury's — Meal Deal",
    url: "https://www.sainsburys.co.uk/gol-ui/groceries/meal-deals",
  },
  {
    label: "Too Good To Go — 仕組みと料金",
    url: "https://www.toogoodtogo.com/en-gb/how-it-works",
  },
  {
    label: "Olio — 余剰食品のシェア",
    url: "https://olioapp.com/en/",
  },
  {
    label: "Refill — 無料給水スポット検索",
    url: "https://www.refill.org.uk/",
  },
  {
    label: "Thames Water — 水道水の水質",
    url: "https://www.thameswater.co.uk/help/water-quality",
  },
] as const;

/** 金額を £ 表記にする。lib/housing/rates.ts の gbp と同じ挙動。 */
export function gbp(amount: number): string {
  const hasFraction = !Number.isInteger(amount);
  return `£${amount.toLocaleString("en-GB", {
    minimumFractionDigits: hasFraction ? 2 : 0,
    maximumFractionDigits: 2,
  })}`;
}

/** Meal Deal の通常価格と会員価格の差額。 */
export function mealDealSaving(deal: { standard: number; member?: number }) {
  if (deal.member === undefined) return 0;
  return Math.round((deal.standard - deal.member) * 100) / 100;
}
