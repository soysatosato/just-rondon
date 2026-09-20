"use client";

import { useMemo, useState } from "react";
import type { Content } from "@prisma/client";
import AreaCard from "@/components/areas/AreaCard";
import { AREA_TAGS } from "@/lib/area-taxonomy";
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
 * 街の書庫。検索・方角・並べ替え・ページ送り。
 *
 * ここに来る読者は二通りいる。「ロンドンのどこに住む/泊まるか」をまだ
 * 決めていない人と、「ブリクストンってどうなの」と街の名前を決めてから
 * 調べに来た人。前者には方角のチップと新着順、後者には検索と名前順が要る。
 *
 * 検索がカタカナと英語の両方に当たるようにしてあるのは、街の名前を
 * どちらで覚えているかが人によって違うため(「Peckham」と打つ人と
 * 「ペッカム」と打つ人が同じくらいいる)。日本語タイトルは頭が
 * カタカナの街名で始まる約束なので、title を対象に入れるだけで拾える。
 */

/** 1ページに並べる本数。3列 × 4行。 */
const PAGE_SIZE = 12;

type SortKey = "new" | "popular" | "name";

const SORTS: { key: SortKey; label: string }[] = [
  { key: "new", label: "新着順" },
  { key: "popular", label: "読まれた順" },
  { key: "name", label: "名前順" },
];

function matches(item: Content, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [item.title, item.engTitle, item.summary, item.description]
    .filter(Boolean)
    .some((field) => (field as string).toLowerCase().includes(q));
}

export default function AreaBrowser({ entries }: { entries: Content[] }) {
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
    if (sort === "name") {
      // 英語名で並べる。カタカナは長音や促音の扱いが辞書によって違って
      // 「同じ規則で並んでいる」と読者に見えないが、英語名なら見た目で
      // 分かる。英語名が無い行は後ろへ。
      return filtered
        .slice()
        .sort((a, b) =>
          (a.engTitle ?? "￿").localeCompare(b.engTitle ?? "￿", "en"),
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
    <section aria-labelledby="areas-archive-heading">
      <ArchiveHeading
        accent="area"
        eyebrow="Archive"
        title="これまでの街"
        id="areas-archive-heading"
      >
        <SortToggle
          accent="area"
          value={sort}
          options={SORTS}
          onChange={setSort}
        />
      </ArchiveHeading>

      <div className="mb-6 space-y-3">
        <SearchBox
          accent="area"
          value={query}
          onChange={setQuery}
          placeholder="街の名前で探す（例: ブリクストン、Peckham、ハックニー区）"
          label="街をキーワードで検索"
        />

        <div className="flex flex-wrap gap-2">
          <FilterChip
            accent="area"
            active={activeTag === null}
            onClick={() => setActiveTag(null)}
            label="すべて"
            count={entries.length}
          />
          {AREA_TAGS.map((t) => {
            const count = tagCounts.get(t.key) ?? 0;
            if (count === 0) return null;
            return (
              <FilterChip
                key={t.key}
                accent="area"
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
          <EmptyResult accent="area" onReset={clearFilters} />
        ) : (
          <>
            <p className="mb-4 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">
                {visible.length} の街
              </span>
              {isFiltering ? "が該当" : "を公開中"}
              {totalPages > 1 &&
                ` ・ ${start + 1}–${start + pageItems.length} 件目を表示`}
            </p>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {pageItems.map((item) => (
                <AreaCard key={item.id} item={item} />
              ))}
            </div>

            {totalPages > 1 && (
              <Pager
                accent="area"
                current={current}
                total={totalPages}
                onChange={goTo}
                label="街一覧のページ送り"
              />
            )}
          </>
        )}
      </div>
    </section>
  );
}
