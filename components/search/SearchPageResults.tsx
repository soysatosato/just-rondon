"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { useDebouncedCallback } from "use-debounce";

import {
  loadSearchIndex,
  search,
  trackSearch,
  type SearchResult,
} from "@/lib/search/engine";
import SearchResultList from "./SearchResultList";

/**
 * /search?q= の本体。検索の画面(SearchDialog)の「すべての結果を見る」と、
 * Enter で決めずに送ったときの行き先。URL で結果を開き直せる・人に送れる。
 *
 * 照合は SearchDialog と同じ(lib/search/engine.ts)。件数の上限だけ広い。
 */
const RESULT_LIMIT = 60;

export default function SearchPageResults() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const initial = params.get("q") ?? "";

  const [query, setQuery] = useState(initial);
  const [index, setIndex] = useState<Awaited<
    ReturnType<typeof loadSearchIndex>
  > | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    loadSearchIndex()
      .then(setIndex)
      .catch(() => setFailed(true));
  }, []);

  const trimmed = query.trim();
  const results: SearchResult[] = useMemo(
    () => (index && trimmed ? search(index, trimmed, RESULT_LIMIT) : []),
    [index, trimmed],
  );

  // URL は打ち終えてから書き換える。履歴は増やさない。
  const syncUrl = useDebouncedCallback((q: string) => {
    router.replace(q ? `${pathname}?q=${encodeURIComponent(q)}` : pathname, {
      scroll: false,
    });
  }, 400);
  const track = useDebouncedCallback(trackSearch, 1500);

  useEffect(() => {
    if (index && trimmed.length >= 2) track(trimmed, results.length);
  }, [index, trimmed, results.length, track]);

  return (
    <div className="mt-6">
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          syncUrl.flush();
        }}
        className="relative"
      >
        <Search
          className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            syncUrl(e.target.value.trim());
          }}
          placeholder="スポット・美術館・ミュージカル・手続きを検索"
          aria-label="サイト内を検索"
          className="h-12 w-full rounded-full border border-input bg-background pl-11 pr-4 text-base shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </form>

      <div className="mt-6">
        {failed ? (
          <p className="text-sm text-muted-foreground">
            検索の準備ができませんでした。時間をおいてもう一度開いてください。
          </p>
        ) : !trimmed ? (
          <p className="text-sm text-muted-foreground">
            スポット名・美術館・ミュージカルの題名のほか、「所要時間」「GP登録」のような用件でも探せます。
          </p>
        ) : !index ? (
          <p className="text-sm text-muted-foreground">読み込んでいます…</p>
        ) : results.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            <p>「{trimmed}」に当たるページは見つかりませんでした。</p>
            <p className="mt-2">
              言葉を短くするか、カタカナ・英語の表記を変えて試してください。
            </p>
          </div>
        ) : (
          <>
            <p className="mb-2 text-sm text-muted-foreground">
              「{trimmed}」の結果 {results.length}
              {results.length === RESULT_LIMIT ? "件以上" : "件"}
            </p>
            <div className="-mx-4 border-y border-border sm:mx-0 sm:rounded-xl sm:border">
              <SearchResultList results={results} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
