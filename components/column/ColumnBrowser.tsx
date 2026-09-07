"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Content } from "@prisma/client";
import clsx from "clsx";
import ColumnCard from "@/components/column/ColumnCard";
import { COLUMN_TAGS } from "@/lib/column-taxonomy";
import { countTags, groupColumns, matchesQuery } from "@/lib/column-grouping";

/**
 * コラムの書庫。検索・タグ・並べ替え・ページ送り。
 *
 * 連載回もここに混ぜる。以前は「連載」と「読み切り」を分けて出していたが、
 * 分けると検索したときに結果が2箇所に割れて、何本見つかったのかが読めない。
 * 連載の入口は上の SeriesRail が持っているので、ここは「全部が1つの並びで
 * 探せる場所」に振り切る。連載回にはカード側で連載名の帯を出して区別する。
 *
 * 全件を一度に描かないのは、毎日1本増える書庫だから。100本を超えたあたりで
 * 画像100枚ぶんのスクロールになり、下に何があるのか分からなくなる。
 *
 * 絞り込みはすべてクライアント側。全件を props で受け取っているので、
 * サーバーに問い合わせ直さずに済み、タグを押した瞬間に切り替わる。
 */

/** 1ページに並べる本数。3列 × 4行。 */
const PAGE_SIZE = 12;

type SortKey = "new" | "popular";

const SORTS: { key: SortKey; label: string }[] = [
  { key: "new", label: "新着順" },
  { key: "popular", label: "読まれた順" },
];

export default function ColumnBrowser({ columns }: { columns: Content[] }) {
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [sort, setSort] = useState<SortKey>("new");
  const [page, setPage] = useState(1);

  const listRef = useRef<HTMLDivElement>(null);

  // タグの件数は絞り込み前の全件から出す（押すたびに件数が変わると選びにくい）
  const tagCounts = useMemo(() => countTags(columns), [columns]);

  /* 連載名 → 全何回か。カードの帯に出す「第N回」を、2本以上ある連載に
     限るために使う。1本しか無い seriesName は連載として扱わない
     (groupColumns と同じ判断)。 */
  const seriesTotals = useMemo(() => {
    const { series } = groupColumns(columns);
    return new Map(series.map((s) => [s.name, s.entries.length]));
  }, [columns]);

  const visible = useMemo(() => {
    const filtered = columns.filter(
      (c) =>
        matchesQuery(c, query) && (!activeTag || c.tags.includes(activeTag)),
    );
    // 元の配列は createdAt の降順で届く。新着順はその並びのまま。
    if (sort === "popular") {
      return filtered
        .slice()
        .sort(
          (a, b) => b.views - a.views || b.createdAt.getTime() - a.createdAt.getTime(),
        );
    }
    return filtered;
  }, [columns, query, activeTag, sort]);

  // 絞り込みを変えたら1ページ目に戻す。3ページ目を見たまま絞り込むと、
  // 結果が2ページしか無いのに空の面が出る。
  useEffect(() => {
    setPage(1);
  }, [query, activeTag, sort]);

  const totalPages = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const start = (current - 1) * PAGE_SIZE;
  const pageItems = visible.slice(start, start + PAGE_SIZE);

  const isFiltering = query.trim() !== "" || activeTag !== null;

  const goTo = (next: number) => {
    setPage(next);
    // 押した位置は一覧の下端なので、そのままだと次の面の途中から始まる。
    listRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const clearFilters = () => {
    setQuery("");
    setActiveTag(null);
  };

  return (
    <section aria-labelledby="column-archive-heading">
      <div className="mb-5 flex items-end justify-between gap-4 border-b border-foreground/15 pb-4">
        <div>
          <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
            <span className="h-3 w-0.5 shrink-0 rounded-full bg-amber-500" />
            Archive
          </p>
          <h2
            id="column-archive-heading"
            className="mt-2 text-xl font-bold tracking-tight sm:text-2xl"
          >
            すべてのコラム
          </h2>
        </div>

        {/* 並べ替え。2択なのでセレクトにせず、押した状態が見える形で置く。 */}
        <div className="flex shrink-0 items-center gap-1 rounded-full border border-slate-200 bg-white/70 p-1 dark:border-slate-800 dark:bg-slate-900/70">
          {SORTS.map((s) => (
            <button
              key={s.key}
              type="button"
              aria-pressed={sort === s.key}
              onClick={() => setSort(s.key)}
              className={clsx(
                "rounded-full px-3 py-1.5 text-xs font-bold transition",
                sort === s.key
                  ? "bg-amber-500 text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* 検索 + タグ絞り込み */}
      <div className="mb-6 space-y-3">
        <div className="relative">
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="キーワードで探す（例: 時計、王室、ロンドン塔）"
            aria-label="コラムをキーワードで検索"
            className="w-full rounded-full border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-200 dark:border-slate-700 dark:bg-slate-900 dark:focus:border-amber-500 dark:focus:ring-amber-900/60"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <FilterChip
            active={activeTag === null}
            onClick={() => setActiveTag(null)}
            label="すべて"
            count={columns.length}
          />
          {COLUMN_TAGS.map((t) => {
            const count = tagCounts.get(t.key) ?? 0;
            if (count === 0) return null;
            return (
              <FilterChip
                key={t.key}
                active={activeTag === t.key}
                onClick={() => setActiveTag(activeTag === t.key ? null : t.key)}
                label={t.label}
                count={count}
              />
            );
          })}
        </div>
      </div>

      <div ref={listRef} className="scroll-mt-24">
        {visible.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 py-16 text-center dark:border-slate-700">
            <p className="text-muted-foreground">
              該当するコラムが見つかりませんでした。
            </p>
            <button
              type="button"
              onClick={clearFilters}
              className="mt-3 text-sm font-medium text-amber-700 underline dark:text-amber-400"
            >
              絞り込みを解除する
            </button>
          </div>
        ) : (
          <>
            {/* 何本あって、いま何本目を見ているか。1面で収まるときは
                「1–5本目」を足しても何も言っていないので出さない。 */}
            <p className="mb-4 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">
                {visible.length} 本
              </span>
              {isFiltering ? "が該当" : "を公開中"}
              {totalPages > 1 &&
                ` ・ ${start + 1}–${start + pageItems.length} 本目を表示`}
            </p>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {pageItems.map((item) => {
                const total = item.seriesName
                  ? seriesTotals.get(item.seriesName)
                  : undefined;
                return (
                  <ColumnCard
                    key={item.id}
                    item={item}
                    seriesBadge={
                      total && item.seriesName
                        ? `${item.seriesName} 第${item.seriesOrder ?? "?"}回`
                        : undefined
                    }
                  />
                );
              })}
            </div>

            {totalPages > 1 && (
              <Pager current={current} total={totalPages} onChange={goTo} />
            )}
          </>
        )}
      </div>
    </section>
  );
}

function FilterChip({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={clsx(
        "rounded-full border px-3.5 py-1.5 text-sm font-medium transition",
        active
          ? "border-amber-500 bg-amber-500 text-white dark:border-amber-500 dark:bg-amber-500"
          : "border-slate-200 bg-white text-slate-600 hover:border-amber-300 hover:text-amber-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-amber-700 dark:hover:text-amber-400",
      )}
    >
      {label}
      <span
        className={clsx(
          "ml-1.5 text-xs tabular-nums",
          active ? "text-amber-100" : "text-muted-foreground",
        )}
      >
        {count}
      </span>
    </button>
  );
}

/**
 * ページ番号の並び。総数が増えても横1行に収まるよう、現在地の前後と
 * 両端だけを残して間を「…」で畳む。
 */
function pageNumbers(current: number, total: number): (number | "gap")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const keep = new Set([1, total, current - 1, current, current + 1]);
  // 端にいるときは反対側を1つ伸ばして、見える番号の数を揃える。
  if (current <= 3) [2, 3, 4].forEach((n) => keep.add(n));
  if (current >= total - 2) [total - 3, total - 2, total - 1].forEach((n) => keep.add(n));

  const out: (number | "gap")[] = [];
  let prev = 0;
  for (let n = 1; n <= total; n++) {
    if (!keep.has(n)) continue;
    if (prev && n - prev > 1) out.push("gap");
    out.push(n);
    prev = n;
  }
  return out;
}

function Pager({
  current,
  total,
  onChange,
}: {
  current: number;
  total: number;
  onChange: (page: number) => void;
}) {
  return (
    <nav
      aria-label="コラム一覧のページ送り"
      className="mt-10 flex flex-wrap items-center justify-center gap-1.5"
    >
      <PagerButton
        label="前のページへ"
        disabled={current === 1}
        onClick={() => onChange(current - 1)}
      >
        ← 前へ
      </PagerButton>

      {pageNumbers(current, total).map((n, i) =>
        n === "gap" ? (
          <span
            key={`gap-${i}`}
            aria-hidden
            className="px-1 text-sm text-muted-foreground"
          >
            …
          </span>
        ) : (
          <button
            key={n}
            type="button"
            aria-label={`${n} ページ目へ`}
            aria-current={n === current ? "page" : undefined}
            onClick={() => onChange(n)}
            className={clsx(
              "h-9 min-w-9 rounded-full px-3 text-sm font-bold tabular-nums transition",
              n === current
                ? "bg-amber-500 text-white shadow-sm shadow-amber-500/30"
                : "text-muted-foreground hover:bg-amber-50 hover:text-amber-700 dark:hover:bg-amber-950/40 dark:hover:text-amber-400",
            )}
          >
            {n}
          </button>
        ),
      )}

      <PagerButton
        label="次のページへ"
        disabled={current === total}
        onClick={() => onChange(current + 1)}
      >
        次へ →
      </PagerButton>
    </nav>
  );
}

function PagerButton({
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
        "h-9 rounded-full border px-3.5 text-xs font-bold transition",
        disabled
          ? "cursor-default border-slate-200 text-slate-300 dark:border-slate-800 dark:text-slate-700"
          : "border-slate-300 text-slate-600 hover:border-amber-400 hover:bg-amber-50 hover:text-amber-700 dark:border-slate-700 dark:text-slate-300 dark:hover:border-amber-700 dark:hover:bg-amber-950/40 dark:hover:text-amber-400",
      )}
    >
      {children}
    </button>
  );
}
