import Link from "next/link";

import { cn } from "@/lib/utils";
import {
  formatShortDay,
  resolveItems,
  seasonPulse,
  seasonYear,
  weekdayOf,
  type SeasonKind,
} from "@/lib/christmas";
import LightString from "@/components/christmas/LightString";
import styles from "@/components/christmas/christmas.module.css";

/** 次に始まるものを読むときの動詞。 */
const START_VERB: Record<SeasonKind, string> = {
  lights: "点灯",
  market: "開幕",
  rink: "オープン",
  event: "開幕",
  show: "初日",
};

/** トップに出す時期(ロンドンの月)。特集のハブと同じく10月から1月まで。 */
const SEASON_MONTHS = [10, 11, 12, 1];

/**
 * 帯を出す日か。トップは帯が出ている間、「今月のロンドン」の札から
 * 特集へのリンクを外すので、同じ判定をここで1つにしておく。
 *
 * @param today ロンドンの日付 "YYYY-MM-DD"
 */
export function isSeasonBandVisible(today: string): boolean {
  const month = Number(today.slice(5, 7));
  if (!SEASON_MONTHS.includes(month)) return false;
  const year = seasonYear(today);
  return seasonPulse(resolveItems(year), today, year).phase !== "after";
}

/**
 * トップの季節の特集の帯。いまはクリスマス特集(/events/christmas)だけ。
 *
 * 以前は「今月のロンドン」の札3枚のうちの1枚で、スマホでは3画面目に
 * あった。特集はハブと子ページ、34館の年末年始の営業までそろえたもので、
 * この時期のトップでいちばん効く入口なので、ヒーローの直下に置く。
 *
 * 写真は使わず、特集の見出しと同じ夜空と電球にする(ChristmasHero と同じ
 * 理由: 大きな写真は低速回線で表示が遅れる)。中身は lib/christmas から
 * 組むので、点灯日や開幕日を足すとここにも出る。
 *
 * シーズンが終わったら(最後の閉幕日を過ぎたら)何も出さない。
 */
export default function SeasonFeatureBand({ today }: { today: string }) {
  if (!isSeasonBandVisible(today)) return null;

  const year = seasonYear(today);
  const items = resolveItems(year);
  const pulse = seasonPulse(items, today, year);

  const upcoming = items
    .filter((item) => item.edition?.start && item.edition.start >= today)
    .sort((a, b) => a.edition!.start!.localeCompare(b.edition!.start!))
    .slice(0, 3);

  return (
    <div
      className={cn(
        styles.night,
        "relative isolate overflow-hidden rounded-3xl text-white ring-1 ring-black/5",
      )}
    >
      <div
        aria-hidden="true"
        className={cn(styles.snow, "pointer-events-none absolute inset-0 -z-10 opacity-70")}
      />
      <LightString className="pointer-events-none absolute inset-x-0 top-0 w-full" />

      <div className="relative grid gap-6 px-5 pb-7 pt-14 sm:px-8 sm:pt-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:items-end lg:gap-10">
        <div className="min-w-0">
          <p className="text-xs font-bold text-amber-300">特集</p>
          <h2 className="mt-1.5 text-2xl font-bold leading-tight sm:text-3xl">
            ロンドンのクリスマス {year}
          </h2>
          <p className="mt-3 max-w-xl text-base leading-relaxed text-white/85">
            {pulse.phase === "during"
              ? `いま点灯している通りの灯りは${pulse.lights}か所中${pulse.lit}か所、今日開いているマーケットや催しは${pulse.openToday}か所。`
              : "通りの点灯日、マーケットの会期、12月25日に開いている所をまとめています。"}
          </p>
          <Link
            href="/events/christmas"
            className="mt-5 inline-flex h-11 items-center gap-2 rounded-full bg-white px-6 text-sm font-semibold text-slate-900 transition hover:bg-amber-50"
          >
            特集を見る →
          </Link>
        </div>

        {upcoming.length > 0 && (
          <div className="min-w-0">
            <p className="text-xs font-bold text-white/70">これから始まるもの</p>
            <ul className="mt-2 divide-y divide-white/15 border-y border-white/15">
              {upcoming.map((item) => {
                const start = item.edition!.start!;
                return (
                  <li key={item.slug} className="flex items-baseline gap-3 py-2.5 text-sm">
                    <span className="w-[5.5em] shrink-0 font-bold tabular-nums text-amber-300">
                      {formatShortDay(start)}({weekdayOf(start)})
                    </span>
                    <span className="min-w-0">
                      {item.shortTitle} {START_VERB[item.kind]}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
