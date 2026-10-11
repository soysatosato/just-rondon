import type { MonthGuide } from "./types";
import { october } from "./october";
import { november } from "./november";
import { december } from "./december";
import { WRITTEN_MONTHS } from "../written-months";

export type { MonthGuide } from "./types";

/**
 * 本文を書き終えた月。ここに無い月は、平年値・日の出入り・祝日・
 * イベントだけで組み、導入文はDBの月別の行(london-events-<年>)の
 * mainText を借りる。
 */
const GUIDES: Partial<Record<number, MonthGuide>> = {
  10: october,
  11: november,
  12: december,
};

// 検索に出す月(noindex・sitemap・広告)は written-months.js が決める。
// 本文があるのに noindex、本文が無いのに検索に出す、のどちらも起こさない。
const guideMonths = Object.keys(GUIDES).map(Number).sort((a, b) => a - b);
if (guideMonths.join() !== [...WRITTEN_MONTHS].sort((a, b) => a - b).join()) {
  throw new Error(
    `月ページの本文(${guideMonths.join(",")}月)と lib/london-months/written-months.js(${WRITTEN_MONTHS.join(",")}月)が食い違っています。`,
  );
}

export function getMonthGuide(month: number): MonthGuide | null {
  return GUIDES[month] ?? null;
}
