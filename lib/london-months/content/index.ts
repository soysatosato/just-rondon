import type { MonthGuide } from "./types";
import { october } from "./october";
import { november } from "./november";
import { december } from "./december";

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

export function getMonthGuide(month: number): MonthGuide | null {
  return GUIDES[month] ?? null;
}
