"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Content } from "@prisma/client";
import clsx from "clsx";
import ColumnCard from "@/components/column/ColumnCard";
import { COLUMN_TAGS, tagLabel } from "@/lib/column-taxonomy";
import { countTags, groupColumns, matchesQuery } from "@/lib/column-grouping";

export default function ColumnBrowser({ columns }: { columns: Content[] }) {
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);

  // タグの件数は絞り込み前の全件から出す（押すたびに件数が変わると選びにくい）
  const tagCounts = useMemo(() => countTags(columns), [columns]);

  const visible = useMemo(
    () =>
      columns.filter(
        (c) =>
          matchesQuery(c, query) && (!activeTag || c.tags.includes(activeTag)),
      ),
    [columns, query, activeTag],
  );

  const { series, standalone } = useMemo(
    () => groupColumns(visible),
    [visible],
  );

  const isFiltering = query.trim() !== "" || activeTag !== null;

  return (
    <div>
      {/* 検索 + タグ絞り込み */}
      <div className="mb-8 space-y-4">
        <div className="relative">
          <span
            aria-hidden
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
          >
            🔍
          </span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="キーワードで探す（例: 時計、王室、ロンドン塔）"
            aria-label="コラムをキーワードで検索"
            className="w-full rounded-full border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:focus:border-sky-500 dark:focus:ring-sky-900"
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
                onClick={() =>
                  setActiveTag(activeTag === t.key ? null : t.key)
                }
                label={t.label}
                count={count}
              />
            );
          })}
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 py-16 text-center dark:border-slate-700">
          <p className="text-muted-foreground">
            該当するコラムが見つかりませんでした。
          </p>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setActiveTag(null);
            }}
            className="mt-3 text-sm font-medium text-sky-600 underline dark:text-sky-300"
          >
            絞り込みを解除する
          </button>
        </div>
      ) : (
        <div className="space-y-12">
          {/* 連載 */}
          {series.length > 0 && (
            <section>
              <SectionHeading
                badge="Series"
                badgeClass="bg-amber-600"
                title="連載で読む"
                note={`${series.length} シリーズ`}
              />
              <div className="space-y-6">
                {series.map((s) => (
                  <SeriesBlock
                    key={s.name}
                    name={s.name}
                    entries={s.entries}
                  />
                ))}
              </div>
            </section>
          )}

          {/* 単発 */}
          {standalone.length > 0 && (
            <section>
              <SectionHeading
                badge="Archive"
                badgeClass="bg-sky-600"
                title={series.length > 0 ? "読み切りコラム" : "コラム一覧"}
                note={`全 ${standalone.length} 本`}
              />
              <div className="grid max-w-full grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
                {standalone.map((item) => (
                  <ColumnCard key={item.id} item={item} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {isFiltering && visible.length > 0 && (
        <p className="mt-8 text-center text-xs text-muted-foreground">
          {columns.length} 本中 {visible.length} 本を表示中
        </p>
      )}
    </div>
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
        "rounded-full border px-4 py-1.5 text-sm font-medium transition",
        active
          ? "border-sky-600 bg-sky-600 text-white dark:border-sky-500 dark:bg-sky-500"
          : "border-slate-200 bg-white text-slate-600 hover:border-sky-300 hover:text-sky-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-sky-700 dark:hover:text-sky-300",
      )}
    >
      {label}
      <span
        className={clsx(
          "ml-1.5 text-xs",
          active ? "text-sky-100" : "text-muted-foreground",
        )}
      >
        {count}
      </span>
    </button>
  );
}

function SectionHeading({
  badge,
  badgeClass,
  title,
  note,
}: {
  badge: string;
  badgeClass: string;
  title: string;
  note: string;
}) {
  return (
    <div className="mb-5 flex items-baseline justify-between gap-4">
      <div>
        <span
          className={clsx(
            "inline-block rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white",
            badgeClass,
          )}
        >
          {badge}
        </span>
        <h2 className="mt-3 text-xl font-bold tracking-tight sm:text-2xl">
          {title}
        </h2>
      </div>
      <p className="shrink-0 text-xs text-muted-foreground">{note}</p>
    </div>
  );
}

function SeriesBlock({
  name,
  entries,
}: {
  name: string;
  entries: Content[];
}) {
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-5 dark:border-amber-900/40 dark:bg-amber-950/10">
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <h3 className="text-base font-bold tracking-tight sm:text-lg">
          {name}
        </h3>
        <span className="shrink-0 text-xs font-medium text-amber-700 dark:text-amber-400">
          全 {entries.length} 回
        </span>
      </div>
      <ol className="space-y-2">
        {entries.map((entry) => (
          <li key={entry.id}>
            <Link
              href={`/column/${entry.slug}`}
              className="group flex items-start gap-3 rounded-xl bg-white/80 px-4 py-3 transition hover:bg-white dark:bg-slate-900/60 dark:hover:bg-slate-900"
            >
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-600 text-xs font-bold text-white">
                {entry.seriesOrder ?? "–"}
              </span>
              <span className="text-sm font-medium leading-relaxed group-hover:text-sky-700 dark:group-hover:text-sky-300">
                {entry.title}
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
