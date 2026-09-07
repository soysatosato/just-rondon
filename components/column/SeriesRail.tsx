"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import type { ColumnSeries } from "@/lib/column-grouping";

/**
 * 連載の入口。
 *
 * 以前は連載を1つずつ縦に積み、各連載の全話をその場に展開していた。連載が
 * 4本を超えたあたりで、ここだけで画面が何枚ぶんにもなり、下の一覧まで
 * 辿り着かなくなる。連載は増え続ける(毎日更新なので、いずれ数十本になる)
 * ので、増える方向を縦から横に変えた。
 *
 * カードの高さは固定。中の話数リストは3話までを出し、残りは件数だけ添える。
 * 全話はカードから飛んだ先(連載の各話ページ)で辿れるので、ここで全部を
 * 見せる必要はない。ここでの役目は「どの連載があるか」を一望させること。
 */

/** カード内に見出しまで出す話数。これを超えたぶんは件数だけにする。 */
const VISIBLE_EPISODES = 3;

export default function SeriesRail({ series }: { series: ColumnSeries[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(true);

  /* 端に着いたら矢印を消す。scrollWidth と clientWidth の差が無い
     (＝はみ出していない)ときは、そもそも両端扱いにして矢印を出さない。 */
  const syncEdges = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setAtStart(el.scrollLeft <= 1);
    setAtEnd(el.scrollLeft >= max - 1);
  }, []);

  useEffect(() => {
    syncEdges();
    const el = trackRef.current;
    if (!el) return;
    // 画面幅が変わるとはみ出すかどうかも変わる。
    const observer = new ResizeObserver(syncEdges);
    observer.observe(el);
    return () => observer.disconnect();
  }, [syncEdges, series.length]);

  const scrollByCard = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    // カード1枚ぶん(＋間隔)。1枚の幅は最初の子から実測する。
    const card = el.firstElementChild as HTMLElement | null;
    const step = card ? card.offsetWidth + 16 : el.clientWidth * 0.8;
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  if (series.length === 0) return null;

  return (
    <section aria-labelledby="column-series-heading">
      <div className="mb-5 flex items-end justify-between gap-4 border-b border-foreground/15 pb-4">
        <div>
          <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
            <span className="h-3 w-0.5 shrink-0 rounded-full bg-amber-500" />
            Series
          </p>
          <h2
            id="column-series-heading"
            className="mt-2 text-xl font-bold tracking-tight sm:text-2xl"
          >
            続きものを読む
          </h2>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <span className="hidden text-xs text-muted-foreground sm:inline">
            {series.length} 連載
          </span>
          {/* 矢印はポインタのある画面だけ。狭い画面は指で流せる。
              はみ出していないとき(連載が少ないとき)は押しても動かないので出さない。 */}
          {!(atStart && atEnd) && (
            <div className="hidden gap-1 sm:flex">
              <RailButton
                label="前の連載へ"
                disabled={atStart}
                onClick={() => scrollByCard(-1)}
              >
                ←
              </RailButton>
              <RailButton
                label="次の連載へ"
                disabled={atEnd}
                onClick={() => scrollByCard(1)}
              >
                →
              </RailButton>
            </div>
          )}
        </div>
      </div>

      <div className="relative">
        <div
          ref={trackRef}
          onScroll={syncEdges}
          className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {series.map((s) => (
            <SeriesCard key={s.name} series={s} />
          ))}
        </div>

        {/* 右端のぼかし。まだ続きがあることを示す。 */}
        {!atEnd && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-background to-transparent"
          />
        )}
      </div>
    </section>
  );
}

function RailButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={clsx(
        "flex h-8 w-8 items-center justify-center rounded-full border text-sm transition",
        disabled
          ? "cursor-default border-slate-200 text-slate-300 dark:border-slate-800 dark:text-slate-700"
          : "border-slate-300 text-slate-600 hover:border-amber-400 hover:bg-amber-50 hover:text-amber-700 dark:border-slate-700 dark:text-slate-300 dark:hover:border-amber-700 dark:hover:bg-amber-950/40 dark:hover:text-amber-400",
      )}
    >
      {children}
    </button>
  );
}

function SeriesCard({ series }: { series: ColumnSeries }) {
  const cover = series.entries.find((e) => e.image)?.image ?? null;
  const shown = series.entries.slice(0, VISIBLE_EPISODES);
  const rest = series.entries.length - shown.length;

  return (
    <article className="flex w-[272px] shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/70 sm:w-[300px]">
      <div className="relative h-28 w-full overflow-hidden bg-amber-100 dark:bg-amber-950/40">
        {cover && (
          <img
            src={cover}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
            decoding="async"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/10" />
        <div className="absolute inset-x-0 bottom-0 p-3">
          <span className="inline-block rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-white">
            全 {series.entries.length} 回
          </span>
          <h3 className="mt-1.5 line-clamp-2 text-sm font-bold leading-snug text-white">
            {series.name}
          </h3>
        </div>
      </div>

      <ol className="flex min-h-[124px] flex-col gap-0.5 p-2">
        {shown.map((entry) => (
          <li key={entry.id}>
            <Link
              href={`/column/${entry.slug}`}
              className="group flex items-center gap-2 rounded-lg px-2 py-1.5 transition hover:bg-amber-50 dark:hover:bg-amber-950/30"
            >
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-100 text-[10px] font-black tabular-nums text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                {entry.seriesOrder ?? "–"}
              </span>
              <span className="min-w-0 flex-1 truncate text-xs font-medium leading-relaxed group-hover:text-amber-700 dark:group-hover:text-amber-400">
                {entry.title}
              </span>
            </Link>
          </li>
        ))}
        {rest > 0 && (
          <li className="px-2 pt-1 text-[11px] text-muted-foreground">
            ほか {rest} 回
          </li>
        )}
      </ol>
    </article>
  );
}
