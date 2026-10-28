import {
  AIRPORTS,
  BUS,
  CAPS,
  PAYG_SINGLE_FROM_ZONE1,
  SANTANDER,
  TFL_CAPPING_SOURCE,
  TFL_FARES_SOURCE,
  TFL_SINGLE_FARE_SOURCE,
  TRANSPORT_KEY_DATES,
  TRAVELCARD,
} from "@/lib/transport/rates";
import { MEAL_DEALS, ONS_LONDON_PRICES } from "@/lib/food/prices";
import { ADMISSION_CHANGES, ADMISSIONS, EXTRAS, LODGING } from "@/lib/sightseeing/budget";
import { LONDON_RENT } from "@/lib/housing/rates";
import { COUNCIL_TAX, ENERGY_CAP, TV_LICENCE, WATER } from "@/lib/bills/rates";
import { WAGE_BANDS, WAGE_RATES_EFFECTIVE_FROM } from "@/lib/jobs/rates";
import type { PriceBasisId } from "./bases";

/**
 * 物価ボード(/prices)の品目。
 *
 * ここは数字を持たない。金額はすべて各セクションの定数(lib/<section>/rates.ts
 * など)から引く。ボードのために値を書き写すと、運賃ガイドと物価ボードで
 * 同じ地下鉄運賃が食い違う日が必ず来る。品目を足すときも、まず定数ファイルに
 * 値を置き、ここからはそれを参照する。
 *
 * 並び順は画面の並び順。グループの中は「旅行者がまず払うもの」から。
 */

export type PriceValue = number | { min: number; max: number };

export type PriceGroupId = "transport" | "food" | "sightseeing" | "stay" | "living";

export const PRICE_GROUPS: {
  id: PriceGroupId;
  label: string;
  eyebrow: string;
  lead?: string;
}[] = [
  { id: "transport", label: "移動する", eyebrow: "Getting Around" },
  { id: "food", label: "食べる・飲む", eyebrow: "Food & Drink" },
  { id: "sightseeing", label: "観光する", eyebrow: "Sightseeing" },
  { id: "stay", label: "泊まる", eyebrow: "Stay" },
  {
    id: "living",
    label: "暮らす",
    eyebrow: "Living",
    lead: "留学・ワーキングホリデー・駐在で住む人の固定費。",
  },
];

export type PriceItem = {
  /** 月ごとの記録(snapshots.json)のキー。変えると前月比が途切れる。 */
  id: string;
  group: PriceGroupId;
  label: string;
  /** 継続して払うものの単位。1回きりの支払いは省く。 */
  per?: "月" | "年" | "時間" | "泊";
  price: PriceValue;
  /** 「£45〜」のように下限で示すもの。 */
  from?: boolean;
  basis: PriceBasisId;
  /** 基準の名前の横に添える補足(出どころ・時点・件数)。 */
  basisNote?: string;
  /** 品目ごとの出典。無ければ基準の url を使う。 */
  sourceUrl?: string;
  /** 金額と日付が公表済みの改定。日付を過ぎると自動でこちらの値を出す。 */
  next?: { date: string; price: number };
  /** サイト内で詳しく書いているページ。 */
  href?: string;
};

const ADMISSION_NOTE = "大人・当日・寄付なし";

/** "2026-08" → "2026年8月" */
function monthJa(ym: string): string {
  const [y, m] = ym.split("-").map(Number);
  return `${y}年${m}月`;
}

const ONS_NOTE = (quotes: number) =>
  `${monthJa(ONS_LONDON_PRICES.surveyMonth)}・${quotes}件の中央値`;

export const PRICE_ITEMS: PriceItem[] = [
  /* ---- 移動する ---------------------------------------------------- */
  {
    id: "tube-single",
    group: "transport",
    label: "地下鉄の片道(Zone 1 内・ピーク)",
    price: PAYG_SINGLE_FROM_ZONE1[1].peak,
    basis: "official",
    basisNote: "TfL・タッチ決済",
    sourceUrl: TFL_SINGLE_FARE_SOURCE.url,
    href: "/sightseeing/transport/fares",
  },
  {
    id: "tube-daily-cap",
    group: "transport",
    label: "地下鉄・バスの1日の上限(Zone 1〜2)",
    price: CAPS.zone1to2.daily,
    basis: "official",
    basisNote: "TfL・タッチ決済",
    sourceUrl: TFL_CAPPING_SOURCE.url,
    href: "/sightseeing/transport/fares",
  },
  {
    id: "bus-single",
    group: "transport",
    label: "バスの1回",
    price: BUS.single,
    basis: "official",
    basisNote: "TfL・タッチ決済",
    sourceUrl: "https://tfl.gov.uk/fares/find-fares/bus-and-tram-fares",
    next: { date: TRANSPORT_KEY_DATES.busFareRise, price: BUS.from2026Nov.single },
    href: "/sightseeing/transport/bus",
  },
  {
    id: "heathrow-piccadilly",
    group: "transport",
    label: "ヒースロー空港↔中心部(ピカデリー線)",
    price: AIRPORTS.heathrow.piccadillyFromZone1,
    basis: "official",
    basisNote: "TfL・タッチ決済・ピーク",
    sourceUrl: TFL_SINGLE_FARE_SOURCE.url,
    href: "/sightseeing/transport/airports",
  },
  {
    id: "heathrow-elizabeth",
    group: "transport",
    label: "ヒースロー空港↔中心部(エリザベス・ライン)",
    price: AIRPORTS.heathrow.elizabethFromZone1,
    basis: "official",
    basisNote: "TfL・タッチ決済・ピーク",
    sourceUrl: TFL_SINGLE_FARE_SOURCE.url,
    href: "/sightseeing/transport/airports",
  },
  {
    id: "heathrow-express",
    group: "transport",
    label: "ヒースロー・エクスプレス(当日券)",
    price: AIRPORTS.heathrow.expressOnDay,
    basis: "official",
    basisNote: "Heathrow Express",
    sourceUrl: "https://www.heathrowexpress.com/ticket-fares",
    href: "/sightseeing/transport/airports",
  },
  {
    id: "santander-single",
    group: "transport",
    label: "シェアサイクル1回(30分まで)",
    price: SANTANDER.singleClassic,
    basis: "official",
    basisNote: "TfL・Santander Cycles",
    sourceUrl: "https://tfl.gov.uk/modes/cycling/santander-cycles/what-you-pay",
    href: "/sightseeing/transport/cycling",
  },

  /* ---- 食べる・飲む ------------------------------------------------ */
  {
    id: "meal-deal",
    group: "food",
    label: "Meal Deal(Tesco・Clubcard 会員)",
    price: MEAL_DEALS.tesco.member,
    basis: "official",
    basisNote: "Tesco",
    sourceUrl: "https://www.tesco.com/zones/meal-deal",
    href: "/food/meal-deal",
  },
  {
    id: "pint",
    group: "food",
    label: "パブのラガー1パイント",
    price: ONS_LONDON_PRICES.lagerPint.median,
    basis: "onsQuotes",
    basisNote: ONS_NOTE(ONS_LONDON_PRICES.lagerPint.quotes),
  },
  {
    id: "coffee",
    group: "food",
    label: "カフェのコーヒー1杯",
    price: ONS_LONDON_PRICES.coffee.median,
    basis: "onsQuotes",
    basisNote: ONS_NOTE(ONS_LONDON_PRICES.coffee.quotes),
  },
  {
    id: "afternoon-tea",
    group: "food",
    label: "アフタヌーンティー(1人)",
    price: EXTRAS.afternoonTeaFrom,
    from: true,
    basis: "estimate",
    basisNote: "ホテル系はもっと上",
  },

  /* ---- 観光する ---------------------------------------------------- */
  {
    id: "british-museum",
    group: "sightseeing",
    label: "大英博物館(常設展)",
    price: 0,
    basis: "official",
    basisNote: "寄付は任意",
    sourceUrl: "https://www.britishmuseum.org/visit",
    href: "/museums/british-museum",
  },
  {
    id: "tower-of-london",
    group: "sightseeing",
    label: "ロンドン塔",
    price: ADMISSIONS.towerOfLondon,
    basis: "official",
    basisNote: ADMISSION_NOTE,
    sourceUrl: "https://www.hrp.org.uk/tower-of-london/visit/tickets-and-prices/",
    href: "/sightseeing/tower-of-london",
  },
  {
    id: "westminster-abbey",
    group: "sightseeing",
    label: "ウェストミンスター寺院",
    price: ADMISSIONS.westminsterAbbey,
    basis: "official",
    basisNote: ADMISSION_NOTE,
    sourceUrl: "https://www.westminster-abbey.org/visit-us/prices-and-entry-times",
    href: "/sightseeing/westminster-abbey",
  },
  {
    id: "st-pauls",
    group: "sightseeing",
    label: "セント・ポール大聖堂",
    price: ADMISSIONS.stPaulsCathedral,
    basis: "official",
    basisNote: ADMISSION_NOTE,
    sourceUrl: "https://www.stpauls.co.uk/visit/tickets-and-prices",
    href: "/sightseeing/st-pauls-cathedral",
  },
  {
    id: "london-eye",
    group: "sightseeing",
    label: "ロンドン・アイ",
    price: ADMISSIONS.londonEye,
    basis: "official",
    basisNote: "大人・当日窓口(オンラインは日により安い)",
    sourceUrl: "https://www.londoneye.com/tickets-and-prices/",
    href: "/sightseeing/london-eye",
  },
  {
    id: "harry-potter-studio",
    group: "sightseeing",
    label: "ハリー・ポッター スタジオツアー",
    price: ADMISSIONS.harryPotterStudio,
    basis: "official",
    basisNote: "大人・事前予約制",
    sourceUrl: "https://www.wbstudiotour.co.uk/tickets/",
    next: {
      date: ADMISSION_CHANGES.harryPotterStudio.from,
      price: ADMISSION_CHANGES.harryPotterStudio.price,
    },
    href: "/sightseeing/warner-bros-studio-tour-harry-potter",
  },
  {
    id: "musical-cheap",
    group: "sightseeing",
    label: "ミュージカル(安い席)",
    price: EXTRAS.musicalCheap,
    from: true,
    basis: "estimate",
    href: "/musicals",
  },
  {
    id: "musical-mid",
    group: "sightseeing",
    label: "ミュージカル(中くらいの席)",
    price: EXTRAS.musicalMid,
    basis: "estimate",
    href: "/musicals",
  },

  /* ---- 泊まる ------------------------------------------------------ */
  {
    id: "hostel",
    group: "stay",
    label: "ホステルのドミトリー(1ベッド)",
    per: "泊",
    price: { min: LODGING.hostelDorm.min, max: LODGING.hostelDorm.max },
    basis: "estimate",
    href: "/sightseeing/hotels",
  },
  {
    id: "budget-hotel",
    group: "stay",
    label: "格安チェーンのホテル(1室)",
    per: "泊",
    price: { min: LODGING.budgetHotel.min, max: LODGING.budgetHotel.max },
    basis: "estimate",
    basisNote: "Premier Inn・Travelodge など",
    href: "/sightseeing/hotels",
  },
  {
    id: "mid-hotel",
    group: "stay",
    label: "中級ホテル(1室)",
    per: "泊",
    price: { min: LODGING.midRange.min, max: LODGING.midRange.max },
    basis: "estimate",
    basisNote: "3〜4つ星・Zone 1",
    href: "/sightseeing/hotels",
  },

  /* ---- 暮らす ------------------------------------------------------ */
  {
    id: "rent",
    group: "living",
    label: "家賃の平均(フラット・ハウス1軒)",
    per: "月",
    price: LONDON_RENT.onsGreaterLondonMonthly,
    basis: "onsRent",
    basisNote: LONDON_RENT.onsPeriod,
    href: "/housing/where-to-live",
  },
  {
    id: "room",
    group: "living",
    label: "シェアの1部屋",
    per: "月",
    price: LONDON_RENT.roomGreaterLondonMonthly,
    basis: "spareRoom",
    basisNote: `${LONDON_RENT.spareRoomPeriod}・光熱費込み`,
    href: "/housing/spareroom",
  },
  {
    id: "travelcard-monthly",
    group: "living",
    label: "Travelcard の月額(Zone 1〜2)",
    per: "月",
    price: TRAVELCARD.zone1to2.monthly,
    basis: "official",
    basisNote: "TfL",
    sourceUrl: TFL_FARES_SOURCE.url,
    href: "/sightseeing/transport/travelcard",
  },
  {
    id: "council-tax",
    group: "living",
    label: "Council Tax(Band D)",
    per: "年",
    price: COUNCIL_TAX.londonBandD,
    basis: "mhclg",
    basisNote: `${COUNCIL_TAX.year}年度`,
    href: "/bills/council-tax",
  },
  {
    id: "energy",
    group: "living",
    label: "ガス・電気(典型的な世帯)",
    per: "年",
    price: ENERGY_CAP.typicalAnnual,
    basis: "ofgem",
    basisNote: ENERGY_CAP.period,
    href: "/bills/energy",
  },
  {
    id: "water",
    group: "living",
    label: "水道(典型的な世帯)",
    per: "年",
    price: WATER.typicalAnnual,
    basis: "official",
    basisNote: `${WATER.company}・${WATER.year}年度`,
    sourceUrl: "https://www.thameswater.co.uk/help/account-and-billing/understand-your-bill/value",
    href: "/bills/water",
  },
  {
    id: "tv-licence",
    group: "living",
    label: "TV Licence",
    per: "年",
    price: TV_LICENCE.annual,
    basis: "statutory",
    basisNote: `${TV_LICENCE.since}から`,
    sourceUrl: "https://www.gov.uk/tv-licence",
    href: "/bills/tv-licence",
  },
  {
    id: "minimum-wage",
    group: "living",
    label: "最低賃金(21歳以上)",
    per: "時間",
    price: WAGE_BANDS[0].hourlyRate,
    basis: "statutory",
    basisNote: `${WAGE_RATES_EFFECTIVE_FROM}から`,
    sourceUrl: "https://www.gov.uk/national-minimum-wage-rates",
    href: "/jobs/minimum-wage",
  },
];

/** ISO 日付(ロンドンの日付)が改定日を過ぎていれば改定後の値。 */
export function resolvePrice(item: PriceItem, todayIso: string): PriceValue {
  if (item.next && todayIso >= item.next.date) return item.next.price;
  return item.price;
}

/** 改定がまだ先なら、その予定。 */
export function upcomingChange(
  item: PriceItem,
  todayIso: string,
): { date: string; price: number } | null {
  return item.next && todayIso < item.next.date ? item.next : null;
}

export function samePrice(a: PriceValue, b: PriceValue): boolean {
  if (typeof a === "number" || typeof b === "number") return a === b;
  return a.min === b.min && a.max === b.max;
}
