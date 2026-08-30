"use client";

import { useMemo, useState } from "react";
import {
  BEYOND_THEME_LABELS,
  type BeyondTheme,
  type BeyondTimeFit,
} from "../destinations";
import { timeBuckets } from "./content";

export type ChooserCard = {
  slug: string;
  timeFit: readonly BeyondTimeFit[];
  themes: readonly BeyondTheme[];
  /** 片道の最速所要(分)。並べ替えに使う。 */
  journeyMinutes: number;
  /** サーバーで描画済みのカード。本文はここには入ってこない。 */
  node: React.ReactNode;
};

/**
 * 空き時間と目的から行き先を絞り込む。
 *
 * 時間は単一選択、テーマは複数選択にしている。読者が同時に持てる
 * 空き時間はひとつだけだが、見たいものは複数あるため。
 *
 * テーマは AND ではなく OR。/sightseeing/hotels の AreaChooser と
 * 同じ理由で、11件しかない母数に AND をかけると2つ選んだ時点で
 * ほぼ空になる。一致数の多い順に並べて上へ寄せる。
 *
 * カードの中身はサーバーで描画したものを node として受け取る。
 * ここで描くと、行き先の説明文ごとクライアントバンドルに載る。
 * 絞り込みに要るのは slug と分類だけなので、本文は運ばせない。
 *
 * 絞り込みを外した状態では所要の短い順に並べる。以前の
 * カテゴリ順(日帰り→1泊)と結果はほぼ同じだが、こちらは
 * ページ全体の軸(時間)と並びの根拠が一致する。
 */
export default function DestinationChooser({
  cards,
}: {
  cards: ChooserCard[];
}) {
  const [time, setTime] = useState<BeyondTimeFit | null>(null);
  const [themes, setThemes] = useState<BeyondTheme[]>([]);

  const toggleTheme = (t: BeyondTheme) =>
    setThemes((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );

  // 使われているテーマだけをチップに出す。空振りする選択肢は置かない。
  const availableThemes = useMemo(() => {
    const used = new Set(cards.flatMap((c) => c.themes));
    return (Object.keys(BEYOND_THEME_LABELS) as BeyondTheme[]).filter((t) =>
      used.has(t)
    );
  }, [cards]);

  const ranked = useMemo(() => {
    const byTime = time ? cards.filter((c) => c.timeFit.includes(time)) : cards;
    if (themes.length === 0) {
      return [...byTime].sort((a, b) => a.journeyMinutes - b.journeyMinutes);
    }
    const score = (c: ChooserCard) =>
      c.themes.filter((t) => themes.includes(t)).length;
    return byTime
      .filter((c) => score(c) > 0)
      .sort(
        (a, b) => score(b) - score(a) || a.journeyMinutes - b.journeyMinutes
      );
  }, [cards, time, themes]);

  const bucket = timeBuckets.find((b) => b.id === time);
  const filtered = time !== null || themes.length > 0;

  return (
    <div>
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-5 dark:border-neutral-700 dark:bg-neutral-900">
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          どれだけ時間がありますか
        </p>
        <ul className="mt-3 flex flex-wrap gap-2">
          {timeBuckets.map((b) => {
            const on = b.id === time;
            return (
              <li key={b.id}>
                <button
                  type="button"
                  onClick={() => setTime(on ? null : b.id)}
                  aria-pressed={on}
                  className={`rounded-lg px-4 py-2 text-left text-sm font-semibold transition ${
                    on
                      ? "bg-emerald-600 text-white"
                      : "border border-gray-300 bg-white text-gray-700 hover:border-emerald-400 dark:border-neutral-700 dark:bg-neutral-800 dark:text-gray-300"
                  }`}
                >
                  {b.label}
                  <span
                    className={`ml-2 text-xs font-normal ${
                      on ? "text-emerald-100" : "text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {b.hours}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        <p className="mt-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
          何を見たいですか（複数選べます）
        </p>
        <ul className="mt-3 flex flex-wrap gap-2">
          {availableThemes.map((t) => {
            const on = themes.includes(t);
            return (
              <li key={t}>
                <button
                  type="button"
                  onClick={() => toggleTheme(t)}
                  aria-pressed={on}
                  className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
                    on
                      ? "bg-emerald-600 text-white"
                      : "border border-gray-300 bg-white text-gray-700 hover:border-emerald-400 dark:border-neutral-700 dark:bg-neutral-800 dark:text-gray-300"
                  }`}
                >
                  {BEYOND_THEME_LABELS[t]}
                </button>
              </li>
            );
          })}
        </ul>

        {filtered && (
          <p className="mt-4 flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
            <span>{ranked.length}か所が該当</span>
            <button
              type="button"
              onClick={() => {
                setTime(null);
                setThemes([]);
              }}
              className="underline underline-offset-2"
            >
              条件をクリア
            </button>
          </p>
        )}
      </div>

      {bucket && (
        <p className="mt-4 rounded-lg border-l-4 border-emerald-500 bg-emerald-50 px-4 py-3 text-sm leading-relaxed text-gray-700 dark:bg-emerald-950/30 dark:text-gray-300">
          {bucket.note}
        </p>
      )}

      <ul className="mt-5 space-y-3">
        {ranked.map((card) => (
          <li key={card.slug}>{card.node}</li>
        ))}
      </ul>

      {ranked.length === 0 && (
        <p className="mt-5 rounded-lg border border-gray-200 p-5 text-sm leading-relaxed text-gray-600 dark:border-neutral-700 dark:text-gray-400">
          その組み合わせに当てはまる行き先はありません。条件を減らしてみてください。
        </p>
      )}
    </div>
  );
}
