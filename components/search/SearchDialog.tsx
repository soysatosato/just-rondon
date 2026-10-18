"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Search } from "lucide-react";
import { useDebouncedCallback } from "use-debounce";

import {
  loadSearchIndex,
  search,
  trackSearch,
  type SearchResult,
} from "@/lib/search/engine";
import { useSearchStore } from "./search-store";
import SearchResultList from "./SearchResultList";

/**
 * サイト内検索の画面。ルートレイアウトに1つだけ置き、useSearchStore で開く。
 *
 * 以前はサイト全体の検索が無く、トップの検索窓に見えるものは12の行き先から
 * 選ぶだけのセレクトだった。770ページあるのに「大英博物館」と打って探す
 * 手段がなく、記事に着地した人は目当てのページをナビの区分から推測する
 * しかなかった。
 *
 * 索引(public/search-index.json)は開いたときに初めて読む。ページを
 * 開くたびに 100KB 余りを読ませないため。
 *
 * スマホでは画面いっぱい、sm 以上は上寄せのパネルにする。
 * ⌘K / Ctrl+K と「/」でも開く。
 */

/** 何も打っていないときに出す近道。検索から来た人がよく探すもの。 */
const QUICK_LINKS = [
  { href: "/sightseeing/must-see", label: "必見スポット" },
  { href: "/sightseeing/itinerary", label: "モデルコース（1〜5日）" },
  { href: "/sightseeing/eta-uk-visa-guide", label: "ETA（電子渡航認証）" },
  { href: "/sightseeing/transport", label: "交通ガイド（地下鉄・バス・空港）" },
  { href: "/musicals/west-end-tickets", label: "ミュージカルのチケットの取り方" },
  { href: "/events", label: "今週のロンドン" },
];

/** 打ち方の例。押すとその語で検索する。 */
const EXAMPLES = ["大英博物館", "所要時間", "オイスター", "ETA", "GP登録", "パブ"];

const RESULT_LIMIT = 20;

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.isContentEditable ||
    ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)
  );
}

export default function SearchDialog() {
  const router = useRouter();
  const { open, query, setOpen, setQuery, openSearch } = useSearchStore();
  const [index, setIndex] = useState<Awaited<
    ReturnType<typeof loadSearchIndex>
  > | null>(null);
  const [failed, setFailed] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  // ⌘K / Ctrl+K で開閉、「/」で開く(入力中は奪わない)。
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (useSearchStore.getState().open) setOpen(false);
        else openSearch();
      } else if (e.key === "/" && !isTypingTarget(e.target)) {
        e.preventDefault();
        openSearch();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [openSearch, setOpen]);

  useEffect(() => {
    if (!open || index) return;
    setFailed(false);
    loadSearchIndex()
      .then(setIndex)
      .catch(() => setFailed(true));
  }, [open, index]);

  const trimmed = query.trim();
  const results: SearchResult[] = useMemo(
    () => (index && trimmed ? search(index, trimmed, RESULT_LIMIT) : []),
    [index, trimmed],
  );

  useEffect(() => setActiveIndex(0), [trimmed]);

  // 打ち終えた語だけを送る(1文字ずつ送らない)。
  const track = useDebouncedCallback(trackSearch, 1500);
  useEffect(() => {
    if (index && trimmed.length >= 2) track(trimmed, results.length);
  }, [index, trimmed, results.length, track]);

  useEffect(() => {
    listRef.current
      ?.querySelector(`#search-result-${activeIndex}`)
      ?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  const close = () => setOpen(false);
  const allResultsHref = `/search?q=${encodeURIComponent(trimmed)}`;

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.nativeEvent.isComposing) return; // 変換中の Enter は確定に使う
    if (e.key === "ArrowDown" && results.length > 0) {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % results.length);
    } else if (e.key === "ArrowUp" && results.length > 0) {
      e.preventDefault();
      setActiveIndex((i) => (i - 1 + results.length) % results.length);
    } else if (e.key === "Enter" && trimmed) {
      e.preventDefault();
      const target = results[activeIndex];
      close();
      router.push(target ? target.u : allResultsHref);
    }
  }

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className="fixed inset-x-0 top-0 z-50 flex h-[100dvh] flex-col bg-background shadow-2xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 sm:inset-x-auto sm:left-1/2 sm:top-[10vh] sm:h-auto sm:max-h-[75vh] sm:w-full sm:max-w-xl sm:-translate-x-1/2 sm:rounded-xl sm:border"
        >
          <DialogPrimitive.Title className="sr-only">
            サイト内を検索
          </DialogPrimitive.Title>

          <div className="flex items-center gap-2 border-b border-border px-3 py-2">
            <Search className="ml-1 h-5 w-5 shrink-0 text-muted-foreground" aria-hidden />
            <input
              type="search"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="スポット・美術館・ミュージカル・手続きを検索"
              aria-label="サイト内を検索"
              role="combobox"
              aria-expanded={results.length > 0}
              aria-controls="search-results"
              aria-activedescendant={
                results.length > 0 ? `search-result-${activeIndex}` : undefined
              }
              className="h-11 min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
            />
            <DialogPrimitive.Close className="h-11 shrink-0 rounded-md px-3 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground">
              閉じる
            </DialogPrimitive.Close>
          </div>

          <div ref={listRef} id="search-results" className="min-h-0 flex-1 overflow-y-auto">
            {failed ? (
              <p className="px-4 py-8 text-center text-sm text-muted-foreground">
                検索の準備ができませんでした。時間をおいてもう一度開いてください。
              </p>
            ) : !trimmed ? (
              <div className="space-y-6 px-4 py-5">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground">
                    たとえば
                  </p>
                  <ul className="mt-2 flex flex-wrap gap-2">
                    {EXAMPLES.map((example) => (
                      <li key={example}>
                        <button
                          type="button"
                          onClick={() => setQuery(example)}
                          className="rounded-full border border-border px-3 py-1.5 text-sm transition hover:border-foreground/40"
                        >
                          {example}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground">
                    よく使われるページ
                  </p>
                  <ul className="mt-1">
                    {QUICK_LINKS.map((link) => (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          onClick={close}
                          className="block py-2.5 text-[15px] hover:underline"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : !index ? (
              <p className="px-4 py-8 text-center text-sm text-muted-foreground">
                読み込んでいます…
              </p>
            ) : results.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                <p>「{trimmed}」に当たるページは見つかりませんでした。</p>
                <p className="mt-2">
                  言葉を短くするか、カタカナ・英語の表記を変えて試してください。
                </p>
              </div>
            ) : (
              <SearchResultList
                results={results}
                activeIndex={activeIndex}
                onNavigate={close}
                idPrefix="search-result"
              />
            )}
          </div>

          {trimmed && results.length > 0 && (
            <div className="flex items-center justify-between gap-3 border-t border-border px-4 py-2.5 text-xs text-muted-foreground">
              <span className="hidden sm:inline">↑↓ で選んで Enter で開く</span>
              <Link
                href={allResultsHref}
                onClick={close}
                className="ml-auto py-1 font-medium text-foreground hover:underline"
              >
                すべての結果を見る →
              </Link>
            </div>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
