"use client";

import { useMemo, useState } from "react";
import type { Content } from "@prisma/client";
import ModernBritainCard from "@/components/modern-britain/ModernBritainCard";
import { MODERN_BRITAIN_TAGS } from "@/lib/modern-britain-taxonomy";
import {
  ArchiveHeading,
  EmptyResult,
  FilterChip,
  Pager,
  SearchBox,
  SortToggle,
} from "@/components/reading/archive-ui";
import { usePagination } from "@/components/reading/usePagination";

/**
 * 英国のいまの書庫。検索・テーマ・並べ替え・ページ送り。
 *
 * 時事なので既定は新着順のまま。ただし「あのニュースの話、どこだっけ」で
 * 戻ってくる読み方も多いので、本文の見出し・要約・英語見出しを対象にした
 * 検索を置く。英語見出しはニュースの原題に近いので、英語で覚えている
 * 読者の手掛かりになる。
 */

/** 1ページに並べる本数。3列 × 4行。 */
const PAGE_SIZE = 12;

type SortKey = "new" | "popular";

const SORTS: { key: SortKey; label: string }[] = [
  { key: "new", label: "新着順" },
  { key: "popular", label: "読まれた順" },
];

function matches(item: Content, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [item.title, item.engTitle, item.summary]
    .filter(Boolean)
    .some((field) => (field as string).toLowerCase().includes(q));
}

export default function ModernBritainBrowser({
  entries,
}: {
  entries: Content[];
}) {
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [sort, setSort] = useState<SortKey>("new");

  // 件数は絞り込み前の全件から出す（押すたびに件数が変わると選びにくい）
  const tagCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const e of entries) {
      for (const t of e.tags) counts.set(t, (counts.get(t) ?? 0) + 1);
    }
    return counts;
  }, [entries]);

  const visible = useMemo(() => {
    const filtered = entries.filter(
      (e) => matches(e, query) && (!activeTag || e.tags.includes(activeTag)),
    );
    if (sort === "popular") {
      return filtered
        .slice()
        .sort(
          (a, b) =>
            b.views - a.views || b.createdAt.getTime() - a.createdAt.getTime(),
        );
    }
    return filtered;
  }, [entries, query, activeTag, sort]);

  const { current, totalPages, start, pageItems, goTo, listRef } =
    usePagination(visible, PAGE_SIZE);

  const isFiltering = query.trim() !== "" || activeTag !== null;

  const clearFilters = () => {
    setQuery("");
    setActiveTag(null);
  };

  return (
    <section aria-labelledby="mb-archive-heading">
      <ArchiveHeading
        accent="modern-britain"
        eyebrow="Archive"
        title="これまでの論考"
        id="mb-archive-heading"
      >
        <SortToggle
          accent="modern-britain"
          value={sort}
          options={SORTS}
          onChange={setSort}
        />
      </ArchiveHeading>

      <div className="mb-6 space-y-3">
        <SearchBox
          accent="modern-britain"
          value={query}
          onChange={setQuery}
          placeholder="キーワードで探す（例: 物価、BBC、ストライキ）"
          label="論考をキーワードで検索"
        />

        <div className="flex flex-wrap gap-2">
          <FilterChip
            accent="modern-britain"
            active={activeTag === null}
            onClick={() => setActiveTag(null)}
            label="すべて"
            count={entries.length}
          />
          {MODERN_BRITAIN_TAGS.map((t) => {
            const count = tagCounts.get(t.key) ?? 0;
            if (count === 0) return null;
            return (
              <FilterChip
                key={t.key}
                accent="modern-britain"
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
          <EmptyResult accent="modern-britain" onReset={clearFilters} />
        ) : (
          <>
            <p className="mb-4 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">
                {visible.length} 本
              </span>
              {isFiltering ? "が該当" : "を公開中"}
              {totalPages > 1 &&
                ` ・ ${start + 1}–${start + pageItems.length} 本目を表示`}
            </p>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {pageItems.map((item) => (
                <ModernBritainCard key={item.id} item={item} />
              ))}
            </div>

            {totalPages > 1 && (
              <Pager
                accent="modern-britain"
                current={current}
                total={totalPages}
                onChange={goTo}
                label="論考一覧のページ送り"
              />
            )}
          </>
        )}
      </div>
    </section>
  );
}
