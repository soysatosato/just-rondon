/**
 * 観光パス(/sightseeing/passes)の損益計算に使う金額を一元管理する。
 *
 * この記事の主張は1つだけ——「元が取れる条件は狭い」。主張が数字に
 * 全面的に寄りかかっているので、1つでも古いと記事ごと嘘になる。
 * したがって本文にはべた書きせず、必ずここを参照する。
 *
 * 入場料は lib/sightseeing/budget.ts の ADMISSIONS から引く。
 * ここに重複して持たないこと。予算記事と別の数字を持った瞬間、
 * 同じサイトの2本の記事がロンドン塔に違う値段を付けることになる。
 * ここが持つのは「パス側の価格」と「パス固有の対象/対象外」だけ。
 *
 * 価格の取り方:
 * - 施設の入場料は budget.ts の運用にそろえて「大人・当日窓口」を使う。
 *   オンライン事前購入で安くなる施設が多く、事前価格を使うとパスが
 *   不利になりすぎる。パスに有利な側の数字で計算しても結論が変わらない、
 *   という形にしておきたい。
 * - パスの価格は販売側の定価。割引コードは載せない(すぐ失効する)。
 * - パス比較サイトが載せる「通常価格」は使わない。後述の夏季VAT減税中の
 *   一時価格が混ざっており、平常時より2〜3割安く見える。
 *
 * 2026年夏のVAT減税について:
 * 2026年6月25日〜9月1日、英政府の Great British Summer Savings により
 * 施設入場料のVATが20%→5%に下がっていた。9月2日から元の税率に戻る。
 * この記事の数字はすべて「戻ったあと」の標準料金。夏に見た価格と
 * 食い違うのはこのため。
 */

import { ADMISSIONS, gbp } from "./budget";

/** 情報の基準時点。記事の dataAsOf バッジに出る。 */
export const PASS_AS_OF = "2026年9月";

/** ISO日付。記事の updatedAt(Article.dateModified)に出る。 */
export const PASS_UPDATED_AT = "2026-09-01";

/**
 * 2026年夏のVAT減税。9月1日で終了する。
 *
 * 記事に書くのは「終わった」という事実のほうで、減税後の価格ではない。
 * 夏のあいだに調べて£24だったセント・ポールが£27になっている理由を
 * 説明できないと、読者は数字のほうを疑う。
 */
export const SUMMER_VAT_CUT = {
  from: "2026年6月25日",
  to: "2026年9月1日",
  normalRate: 20,
  reducedRate: 5,
  name: "Great British Summer Savings",
} as const;

/* -----------------------------------------------------
   ロンドンパス(Go City All-Inclusive)
   日数制。初回利用日から連続した日数で切れる。
----------------------------------------------------- */

export type PassPrice = { adult: number; child: number };

/** 大人／子供(5〜15歳)。5歳未満は無料。 */
export const LONDON_PASS: readonly (PassPrice & { days: number })[] = [
  { days: 1, adult: 99, child: 69 },
  { days: 2, adult: 149, child: 99 },
  { days: 3, adult: 179, child: 119 },
  { days: 4, adult: 199, child: 139 },
  { days: 5, adult: 219, child: 159 },
  { days: 6, adult: 239, child: 179 },
  { days: 7, adult: 259, child: 189 },
  { days: 10, adult: 279, child: 199 },
] as const;

/**
 * エクスプローラー・パス(Go City)。日数ではなく施設数で買う。
 *
 * 日数制と並べて出す価値がある。ロンドンの主要館が無料である以上、
 * 多くの旅行者にとって足りないのは「日数」ではなく「有料施設の数」で、
 * 施設数制のほうが素直に当てはまる場面が多い。
 */
export const EXPLORER_PASS: readonly (PassPrice & { picks: number })[] = [
  { picks: 2, adult: 64, child: 49 },
  { picks: 3, adult: 89, child: 64 },
  { picks: 4, adult: 109, child: 79 },
  { picks: 5, adult: 129, child: 89 },
  { picks: 6, adult: 149, child: 99 },
  { picks: 7, adult: 159, child: 109 },
] as const;

/**
 * マーリン系のコンボ券。ロンドン・アイ、マダム・タッソー、
 * シーライフ、ロンドン・ダンジョン、シュレック——すべて同じ運営会社。
 * 大人・子供の別を公式が出しておらず、時間帯で動くため代表額のみ。
 */
export const MERLIN_COMBOS = [
  { label: "2施設（ロンドン・アイ＋マダム・タッソーなど）", price: 49 },
  { label: "3施設", price: 54 },
  { label: "5施設すべて", price: 59 },
  { label: "5施設＋Big Bus", price: 69 },
] as const;

/** グリニッジのデイパス。対象は有料の2館のみ。 */
export const GREENWICH = {
  dayPassAdult: 38,
  dayPassChild: 19,
  observatory: 24,
  cuttySark: 22,
  /** 同じ敷地にある無料の館。デイパスの対象外なのは「元から無料」だから。 */
  freeSites: ["国立海事博物館", "クイーンズ・ハウス"],
} as const;

/** Big Bus の24時間券。パスに含まれる乗り降り自由バスの単体価格。 */
export const HOP_ON_BUS_FROM = 32;

/* -----------------------------------------------------
   損益分岐
----------------------------------------------------- */

/**
 * 損益分岐の積み上げに使う有料施設。
 *
 * 並び順は「安い順」でも「有名順」でもなく、実際に回る順序に近い
 * 中心部→郊外にしてある。安い順に並べると分岐点が不当に遠のき、
 * 高い順に並べるとパスが不当に有利になる。どちらも読者を騙す並びになる。
 *
 * ハンプトン・コート宮殿とシェイクスピアズ・グローブ座も対象だが、
 * 公式サイトで標準料金を確認できなかったため入れていない。
 * 確認できない数字を1つ混ぜると、表全体が検算できなくなる。
 */
export const BREAK_EVEN_LADDER = [
  {
    name: "ロンドン塔",
    price: ADMISSIONS.towerOfLondon,
    where: "中心部",
  },
  {
    name: "ウェストミンスター寺院",
    price: ADMISSIONS.westminsterAbbey,
    where: "中心部",
  },
  {
    name: "セント・ポール大聖堂",
    price: ADMISSIONS.stPaulsCathedral,
    where: "中心部",
  },
  {
    name: "タワーブリッジ（展示）",
    price: ADMISSIONS.towerBridge,
    where: "中心部",
  },
  {
    name: "キュー・ガーデン",
    price: ADMISSIONS.kewGardens,
    where: "西郊・半日",
  },
  {
    name: "王立天文台（グリニッジ）",
    price: GREENWICH.observatory,
    where: "東郊・半日",
  },
  {
    name: "カティサーク（グリニッジ）",
    price: GREENWICH.cuttySark,
    where: "東郊・半日",
  },
  {
    name: "ウィンザー城",
    price: ADMISSIONS.windsorCastle,
    where: "郊外・ほぼ1日",
  },
] as const;

/** 累計額つきの梯子。表示側はこれを回すだけにする。 */
export function breakEvenRows() {
  let running = 0;
  return BREAK_EVEN_LADDER.map((row, i) => {
    running += row.price;
    return { ...row, nth: i + 1, cumulative: running };
  });
}

/**
 * 何施設目でパス代を超えるか。超えない場合は null。
 *
 * 「ちょうど同額」は超えたとみなさない。同額なら、予約の手間と
 * 対象施設に縛られる不自由だけが残るので、読者にとっては負けである。
 */
export function attractionsToBreakEven(passPrice: number): number | null {
  const hit = breakEvenRows().find((r) => r.cumulative > passPrice);
  return hit ? hit.nth : null;
}

/** 損益分岐までの合計額。 */
export function breakEvenTotal(passPrice: number): number | null {
  const hit = breakEvenRows().find((r) => r.cumulative > passPrice);
  return hit ? hit.cumulative : null;
}

/** パスに含まれるバス・クルーズを「元から買うつもりだった」とみなす補正額。 */
export const BUS_CREDIT = HOP_ON_BUS_FROM;

/* -----------------------------------------------------
   対象・対象外
----------------------------------------------------- */

/**
 * ロンドンパスの対象外で、かつ多くの旅行者が行きたがる施設。
 *
 * 「100以上の施設」という宣伝文句の穴はここに出る。数の多さは、
 * 行きたい施設が入っていることを意味しない。
 */
export const NOT_INCLUDED = [
  {
    name: "チャーチル戦時執務室",
    note: `別途 ${gbp(ADMISSIONS.churchillWarRooms)} 前後。どのパスにも入っていない`,
  },
  {
    name: "バッキンガム宮殿（ステートルーム）",
    note: "夏季の公開期間のみ、条件付きで対象になる年がある",
  },
  {
    name: "ワーナー・ブラザース スタジオツアー（ハリー・ポッター）",
    note: `別途 ${gbp(ADMISSIONS.harryPotterStudio)}。要事前予約で当日券は出ない`,
  },
  {
    name: "シーライフ・ロンドン水族館",
    note: "マーリン系のコンボ券の側に入っている",
  },
  {
    name: "国会議事堂ツアー",
    note: "別途。英国民は無料枠があるが旅行者は有料",
  },
] as const;

export const PASS_SOURCES = [
  {
    label: "Go City — London Pass の商品ページ",
    url: "https://gocity.com/london/en-us/products/all-inclusive",
  },
  {
    label: "Historic Royal Palaces — Tower of London の料金",
    url: "https://www.hrp.org.uk/tower-of-london/visit/tickets-and-prices/",
  },
  {
    label: "Westminster Abbey — 拝観料",
    url: "https://www.westminster-abbey.org/visit-us/prices-and-entry-times",
  },
  {
    label: "St Paul's Cathedral — チケット種別と料金",
    url: "https://www.stpauls.co.uk/ticket-types-and-prices",
  },
  {
    label: "Tower Bridge — 入場券",
    url: "https://www.towerbridge.org.uk/whats-on/entry-to-tower-bridge",
  },
  {
    label: "Kew Gardens — チケット",
    url: "https://www.kew.org/kew-gardens/visit-kew-gardens/tickets",
  },
  {
    label: "Royal Museums Greenwich — 料金とデイパス",
    url: "https://www.rmg.co.uk/plan-your-visit/tickets-prices",
  },
  {
    label: "Royal Collection Trust — Windsor Castle",
    url: "https://www.rct.uk/visit/windsor-castle",
  },
  {
    label: "Imperial War Museums — Churchill War Rooms",
    url: "https://www.iwm.org.uk/visits/churchill-war-rooms/booking",
  },
  {
    label: "The London Eye — マルチアトラクション券",
    url: "https://www.londoneye.com/tickets-and-prices/multi-attraction-tickets/",
  },
  {
    label: "GOV.UK — Great British Summer Savings（2026年夏のVAT減税）",
    url: "https://www.gov.uk/government/news/great-british-summer-savings-vat-slashed-to-save-families-money-on-days-out",
  },
] as const;
