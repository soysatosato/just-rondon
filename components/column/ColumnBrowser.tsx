"use client";

import { useMemo, useState } from "react";
import type { Content } from "@prisma/client";
import ColumnCard from "@/components/column/ColumnCard";
import { COLUMN_TAGS } from "@/lib/column-taxonomy";
import { countTags, groupColumns, matchesQuery } from "@/lib/column-grouping";
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
          (a, b) =>
            b.views - a.views || b.createdAt.getTime() - a.createdAt.getTime(),
        );
    }
    return filtered;
  }, [columns, query, activeTag, sort]);

  const { current, totalPages, start, pageItems, goTo, listRef } =
    usePagination(visible, PAGE_SIZE);

  const isFiltering = query.trim() !== "" || activeTag !== null;

  const clearFilters = () => {
    setQuery("");
    setActiveTag(null);
  };

  return (
    <section aria-labelledby="column-archive-heading">
      <ArchiveHeading
        accent="column"
        eyebrow="Archive"
        title="すべてのコラム"
        id="column-archive-heading"
      >
        <SortToggle
          accent="column"
          value={sort}
          options={SORTS}
          onChange={setSort}
        />
      </ArchiveHeading>

      <div className="mb-6 space-y-3">
        <SearchBox
          accent="column"
          value={query}
          onChange={setQuery}
          placeholder="キーワードで探す（例: 時計、王室、ロンドン塔）"
          label="コラムをキーワードで検索"
        />

        <div className="flex flex-wrap gap-2">
          <FilterChip
            accent="column"
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
                accent="column"
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
          <EmptyResult accent="column" onReset={clearFilters} />
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
              <Pager
                accent="column"
                current={current}
                total={totalPages}
                onChange={goTo}
                label="コラム一覧のページ送り"
              />
            )}
          </>
        )}
      </div>
    </section>
  );
}
