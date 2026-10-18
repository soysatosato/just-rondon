"use client";

import Link from "next/link";
import type { SearchResult } from "@/lib/search/engine";

/**
 * 検索結果の並び。検索の画面(SearchDialog)と /search の両方で使う。
 *
 * 1件ごとに、区分・見出し・説明の頭を出す。区分を出すのは、同じ名前の
 * ページが複数ある(大英博物館なら「観光」と「美術館ナビ」とコラム)ため。
 */
export default function SearchResultList({
  results,
  activeIndex,
  onNavigate,
  idPrefix,
}: {
  results: SearchResult[];
  /** キーボードで選んでいる行。選んでいなければ -1。 */
  activeIndex?: number;
  onNavigate?: () => void;
  /** 行の id の接頭辞。入力欄の aria-activedescendant から指す。 */
  idPrefix?: string;
}) {
  return (
    <ul role={idPrefix ? "listbox" : undefined} className="divide-y divide-border">
      {results.map((result, i) => (
        <li
          key={result.u}
          id={idPrefix ? `${idPrefix}-${i}` : undefined}
          role={idPrefix ? "option" : undefined}
          aria-selected={idPrefix ? i === activeIndex : undefined}
        >
          <Link
            href={result.u}
            onClick={onNavigate}
            className={`block px-4 py-3 transition hover:bg-muted/60 ${
              i === activeIndex ? "bg-muted" : ""
            }`}
          >
            {result.s && (
              <span className="text-xs font-medium text-muted-foreground">
                {result.s}
              </span>
            )}
            <span className="block text-[15px] font-semibold leading-snug">
              {result.t}
            </span>
            {result.d && (
              <span className="mt-0.5 block line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                {result.d}
              </span>
            )}
          </Link>
        </li>
      ))}
    </ul>
  );
}
