"use client";

import { useMemo, useState } from "react";
import type { Content } from "@prisma/client";
import BritishEnglishCard from "@/components/british-english/BritishEnglishCard";
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
 * イギリス英語の書庫。検索・頭文字・並べ替え・ページ送り。
 *
 * コラムと違ってタグを持たないので、絞り込みの軸は頭文字にした。読者が
 * 「あの単語、なんだっけ」と戻ってくるときに手掛かりになるのは意味の
 * 分類ではなく綴りだから。辞書と同じ引き方ができるようにする。
 *
 * 全件を一度に描かないのは、毎日1語増えるため。いま27語だが、半年で
 * 200語を超える。そのときに1画面で全部を出しても誰も下まで行かない。
 */

/** 1ページに並べる語数。3列 × 4行。 */
const PAGE_SIZE = 12;

type SortKey = "new" | "popular";

const SORTS: { key: SortKey; label: string }[] = [
  { key: "new", label: "新着順" },
  { key: "popular", label: "読まれた順" },
];

/** 頭文字。英語の見出しが無ければ「#」に寄せる。 */
function initialOf(item: Content): string {
  const head = (item.engTitle ?? "").trim().charAt(0).toUpperCase();
  return head >= "A" && head <= "Z" ? head : "#";
}

function matches(item: Content, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [item.engTitle, item.title, item.summary]
    .filter(Boolean)
    .some((field) => (field as string).toLowerCase().includes(q));
}

export default function BritishEnglishBrowser({
  entries,
}: {
  entries: Content[];
}) {
  const [query, setQuery] = useState("");
  const [initial, setInitial] = useState<string | null>(null);
  const [sort, setSort] = useState<SortKey>("new");

  /* 実際に語がある頭文字だけを出す。A-Z を常に26個並べると、その大半が
     0件のボタンになる。 */
  const initials = useMemo(() => {
    const counts = new Map<string, number>();
    for (const e of entries) {
      const key = initialOf(e);
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return [...counts.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [entries]);

  const visible = useMemo(() => {
    const filtered = entries.filter(
      (e) => matches(e, query) && (!initial || initialOf(e) === initial),
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
  }, [entries, query, initial, sort]);

  const { current, totalPages, start, pageItems, goTo, listRef } =
    usePagination(visible, PAGE_SIZE);

  const isFiltering = query.trim() !== "" || initial !== null;

  const clearFilters = () => {
    setQuery("");
    setInitial(null);
  };

  return (
    <section aria-labelledby="be-archive-heading">
      <ArchiveHeading
        accent="british-english"
        eyebrow="Archive"
        title="これまでの言葉"
        id="be-archive-heading"
      >
        <SortToggle
          accent="british-english"
          value={sort}
          options={SORTS}
          onChange={setSort}
        />
      </ArchiveHeading>

      <div className="mb-6 space-y-3">
        <SearchBox
          accent="british-english"
          value={query}
          onChange={setQuery}
          placeholder="単語・意味で探す（例: cheers、パブ、皮肉）"
          label="イギリス英語をキーワードで検索"
        />

        <div className="flex flex-wrap gap-1.5">
          <FilterChip
            accent="british-english"
            active={initial === null}
            onClick={() => setInitial(null)}
            label="すべて"
            count={entries.length}
          />
          {initials.map(([letter]) => (
            <FilterChip
              key={letter}
              accent="british-english"
              active={initial === letter}
              onClick={() => setInitial(initial === letter ? null : letter)}
              label={letter}
            />
          ))}
        </div>
      </div>

      <div ref={listRef} className="scroll-mt-24">
        {visible.length === 0 ? (
          <EmptyResult accent="british-english" onReset={clearFilters} />
        ) : (
          <>
            <p className="mb-4 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">
                {visible.length} 語
              </span>
              {isFiltering ? "が該当" : "を公開中"}
              {totalPages > 1 &&
                ` ・ ${start + 1}–${start + pageItems.length} 語目を表示`}
            </p>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {pageItems.map((item) => (
                <BritishEnglishCard key={item.id} item={item} />
              ))}
            </div>

            {totalPages > 1 && (
              <Pager
                accent="british-english"
                current={current}
                total={totalPages}
                onChange={goTo}
                label="イギリス英語一覧のページ送り"
              />
            )}
          </>
        )}
      </div>
    </section>
  );
}
