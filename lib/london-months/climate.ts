/**
 * ロンドンと東京の月別平年値(1991〜2020年)。
 *
 * 月別ページ(/events/<月>)と旅の実用情報の月別欄が、同じ数字を
 * ここから読む。以前は実用情報の側に丸めた値を手で書いていて、
 * 6月の最高気温や11月の最低気温が平年値と1℃ずれていた。数字を
 * 2箇所に持つと、片方だけ直して食い違うことになる。
 *
 * 平年値は10年に1度しか改訂されない(次の2001〜2030年の値が出るのは
 * 2031年以降)。API にせず、値をそのまま持つ。
 *
 * 実用情報の MonthPicker("use client")からも読むので、サーバー専用の
 * 処理をここに足さないこと。
 */

export type MonthClimate = {
  /** 日最高気温の平年値(℃)。 */
  maxTemp: number;
  /** 日最低気温の平年値(℃)。 */
  minTemp: number;
  /** 月の日照時間の合計(時間)。 */
  sunshineHours: number;
  /** 月の降水量(mm)。 */
  rainfallMm: number;
};

export type LondonMonthClimate = MonthClimate & {
  /** 1mm以上の雨が降る日数。 */
  rainDays: number;
  /** 最低気温が0℃を下回る日数(空気の霜)。 */
  frostDays: number;
};

/**
 * Met Office の Heathrow 観測所、1991〜2020年の平年値。
 *
 * 市中心部の観測所(St James's Park)ではなく Heathrow を使うのは、
 * 日照と雨の日数までそろっている観測所がこちらだから。市中心部は
 * ヒートアイランドで最低気温が1℃ほど高くなるが、旅行の服装を
 * 決める目安としては差がない。
 */
const LONDON: Record<number, LondonMonthClimate> = {
  1: { maxTemp: 8.42, minTemp: 2.68, frostDays: 6.8, sunshineHours: 61.09, rainfallMm: 58.83, rainDays: 11.53 },
  2: { maxTemp: 8.98, minTemp: 2.65, frostDays: 6.2, sunshineHours: 78.81, rainfallMm: 44.96, rainDays: 9.5 },
  3: { maxTemp: 11.73, minTemp: 4.14, frostDays: 2.93, sunshineHours: 124.45, rainfallMm: 38.78, rainDays: 8.47 },
  4: { maxTemp: 15.0, minTemp: 6.03, frostDays: 0.8, sunshineHours: 176.67, rainfallMm: 42.31, rainDays: 8.8 },
  5: { maxTemp: 18.37, minTemp: 9.08, frostDays: 0.03, sunshineHours: 207.49, rainfallMm: 45.91, rainDays: 8.0 },
  6: { maxTemp: 21.57, minTemp: 12.03, frostDays: 0, sunshineHours: 208.39, rainfallMm: 47.25, rainDays: 8.33 },
  7: { maxTemp: 23.89, minTemp: 14.18, frostDays: 0, sunshineHours: 217.81, rainfallMm: 45.8, rainDays: 7.9 },
  8: { maxTemp: 23.4, minTemp: 14.06, frostDays: 0, sunshineHours: 202.12, rainfallMm: 52.78, rainDays: 8.43 },
  9: { maxTemp: 20.22, minTemp: 11.62, frostDays: 0, sunshineHours: 157.11, rainfallMm: 49.61, rainDays: 7.9 },
  10: { maxTemp: 15.81, minTemp: 8.78, frostDays: 0.33, sunshineHours: 115.17, rainfallMm: 65.07, rainDays: 10.8 },
  11: { maxTemp: 11.47, minTemp: 5.26, frostDays: 2.73, sunshineHours: 70.74, rainfallMm: 66.63, rainDays: 11.23 },
  12: { maxTemp: 8.79, minTemp: 3.08, frostDays: 7.17, sunshineHours: 54.96, rainfallMm: 57.05, rainDays: 10.77 },
};

/** 気象庁 東京(47662)、1991〜2020年の平年値。比較の物差しにだけ使う。 */
const TOKYO: Record<number, MonthClimate> = {
  1: { maxTemp: 9.8, minTemp: 1.2, sunshineHours: 192.6, rainfallMm: 59.7 },
  2: { maxTemp: 10.9, minTemp: 2.1, sunshineHours: 170.4, rainfallMm: 56.5 },
  3: { maxTemp: 14.2, minTemp: 5.0, sunshineHours: 175.3, rainfallMm: 116.0 },
  4: { maxTemp: 19.4, minTemp: 9.8, sunshineHours: 178.8, rainfallMm: 133.7 },
  5: { maxTemp: 23.6, minTemp: 14.6, sunshineHours: 179.6, rainfallMm: 139.7 },
  6: { maxTemp: 26.1, minTemp: 18.5, sunshineHours: 124.2, rainfallMm: 167.8 },
  7: { maxTemp: 29.9, minTemp: 22.4, sunshineHours: 151.4, rainfallMm: 156.2 },
  8: { maxTemp: 31.3, minTemp: 23.5, sunshineHours: 174.2, rainfallMm: 154.7 },
  9: { maxTemp: 27.5, minTemp: 20.3, sunshineHours: 126.7, rainfallMm: 224.9 },
  10: { maxTemp: 22.0, minTemp: 14.8, sunshineHours: 129.4, rainfallMm: 234.8 },
  11: { maxTemp: 16.7, minTemp: 8.8, sunshineHours: 149.8, rainfallMm: 96.3 },
  12: { maxTemp: 12.0, minTemp: 3.8, sunshineHours: 174.4, rainfallMm: 57.9 },
};

export const CLIMATE_SOURCES = [
  {
    label: "Met Office – Heathrow の平年値(1991〜2020年)",
    url: "https://www.metoffice.gov.uk/research/climate/maps-and-data/location-specific-long-term-averages/gcpsveqyg",
  },
  {
    label: "気象庁 – 東京の平年値(1991〜2020年)",
    url: "https://www.data.jma.go.jp/obd/stats/etrn/view/nml_sfc_ym.php?prec_no=44&block_no=47662",
  },
] as const;

export function getLondonClimate(month: number): LondonMonthClimate {
  return LONDON[month];
}

export function getTokyoClimate(month: number): MonthClimate {
  return TOKYO[month];
}

/**
 * 気温が最も近い東京の月。
 *
 * 「ロンドンの11月は寒いか」に、℃の数字だけで答えても実感が湧かない。
 * 日本の読者が自分で知っている月に置き換えると、服装が決まる。
 * 最高と最低の両方の差の二乗和で比べる。最高だけで比べると、
 * 朝晩の冷え込みが違う月(ロンドンの12月と東京の2月など)を同じに扱う。
 */
export function tokyoEquivalentMonth(month: number): number {
  const london = LONDON[month];
  let best = 1;
  let bestDistance = Infinity;
  for (let m = 1; m <= 12; m++) {
    const tokyo = TOKYO[m];
    const distance =
      (tokyo.maxTemp - london.maxTemp) ** 2 +
      (tokyo.minTemp - london.minTemp) ** 2;
    if (distance < bestDistance) {
      best = m;
      bestDistance = distance;
    }
  }
  return best;
}
