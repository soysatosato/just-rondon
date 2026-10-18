"use client";

import SearchTrigger from "@/components/search/SearchTrigger";
import { useSearchStore } from "@/components/search/search-store";

/**
 * トップのヒーローの検索欄。押すとサイト内検索(SearchDialog)が開く。
 *
 * 以前ここにあったのは、虫眼鏡と「探す…」の文言を付けたセレクトで、
 * 12の行き先から選んで「Go」を押すものだった。検索窓に見えるのに文字を
 * 打てず、「大英博物館」と打とうとした人がここでつまずいていた。
 *
 * 下の「例:」は、何を打てば引けるのか(固有名詞も「所要時間」のような
 * 用件も通る)を見せるためのもの。押すとその語で検索が開く。
 */
const EXAMPLES = ["大英博物館", "所要時間", "ETA", "ミュージカル"];

export default function HeroSearch() {
  const openSearch = useSearchStore((state) => state.openSearch);

  return (
    <div className="max-w-xl">
      <SearchTrigger
        variant="field"
        placeholder="スポット・美術館・ミュージカル・手続きを検索"
        className="h-12 text-sm shadow-lg shadow-slate-900/10 dark:shadow-black/40"
      />
      <p className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span>例:</span>
        {EXAMPLES.map((example) => (
          <button
            key={example}
            type="button"
            onClick={() => openSearch(example)}
            className="rounded-full border border-border px-3 py-1.5 transition hover:border-foreground/40 hover:text-foreground"
          >
            {example}
          </button>
        ))}
      </p>
    </div>
  );
}
