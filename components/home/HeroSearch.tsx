"use client";

import SearchTrigger from "@/components/search/SearchTrigger";

/**
 * トップのヒーローの検索欄。押すとサイト内検索(SearchDialog)が開く。
 *
 * 以前ここにあったのは、虫眼鏡と「探す…」の文言を付けたセレクトで、
 * 12の行き先から選んで「Go」を押すものだった。検索窓に見えるのに文字を
 * 打てず、「大英博物館」と打とうとした人がここでつまずいていた。
 *
 * 欄の下にあった「例:」の語は外した。下の近道と合わせて3段になり、
 * 1画面目に同じ強さの押せる場所が17か所並んでいた(2026-10-19)。
 * 例の語は、検索の画面を開いたときに何も打っていなければ出る(SearchDialog)。
 */
export default function HeroSearch() {
  return (
    <div className="max-w-xl">
      <SearchTrigger
        variant="field"
        placeholder="スポット・美術館・ミュージカル・手続きを検索"
        className="h-12 text-sm shadow-lg shadow-slate-900/10 dark:shadow-black/40"
      />
    </div>
  );
}
