import type { LucideIcon } from "lucide-react";
import { Flower2, Sun, Leaf, Snowflake } from "lucide-react";

export type Season = "spring" | "summer" | "autumn" | "winter";

const MONTH_NAME_TO_NUMBER: Record<string, number> = {
  january: 1,
  february: 2,
  march: 3,
  april: 4,
  may: 5,
  june: 6,
  july: 7,
  august: 8,
  september: 9,
  october: 10,
  november: 11,
  december: 12,
};

/**
 * slug末尾の英語月名(例: "london-events-2025-january")から月番号(1-12)を求める。
 * DBに monthNumber フィールドが無いための暫定措置。
 * 想定外のslugの場合は fallback を返す。
 */
export function getMonthNumber(slug: string, fallback = 1): number {
  const match = slug.match(
    /-(january|february|march|april|may|june|july|august|september|october|november|december)$/i
  );
  if (!match) return fallback;
  return MONTH_NAME_TO_NUMBER[match[1].toLowerCase()] ?? fallback;
}

export function getSeason(monthNumber: number): Season {
  if (monthNumber >= 3 && monthNumber <= 5) return "spring";
  if (monthNumber >= 6 && monthNumber <= 8) return "summer";
  if (monthNumber >= 9 && monthNumber <= 11) return "autumn";
  return "winter";
}

export interface SeasonMeta {
  label: string;
  icon: LucideIcon;
  iconWrapClass: string;
  badgeClass: string;
}

export const SEASON_META: Record<Season, SeasonMeta> = {
  spring: {
    label: "春",
    icon: Flower2,
    iconWrapClass:
      "bg-pink-50 text-pink-600 dark:bg-pink-950/40 dark:text-pink-400",
    badgeClass:
      "border-pink-600/40 bg-pink-600/10 text-pink-700 dark:text-pink-400",
  },
  summer: {
    label: "夏",
    icon: Sun,
    iconWrapClass:
      "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400",
    badgeClass:
      "border-amber-600/40 bg-amber-600/10 text-amber-700 dark:text-amber-400",
  },
  autumn: {
    label: "秋",
    icon: Leaf,
    iconWrapClass:
      "bg-orange-50 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400",
    badgeClass:
      "border-orange-600/40 bg-orange-600/10 text-orange-700 dark:text-orange-400",
  },
  winter: {
    label: "冬",
    icon: Snowflake,
    iconWrapClass:
      "bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-400",
    badgeClass:
      "border-sky-600/40 bg-sky-600/10 text-sky-700 dark:text-sky-400",
  },
};

export function getSeasonMeta(monthNumber: number): SeasonMeta {
  return SEASON_META[getSeason(monthNumber)];
}
