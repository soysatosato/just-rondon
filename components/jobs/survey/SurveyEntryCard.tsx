// components/jobs/survey/SurveyEntryCard.tsx
"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  LoaderCircle,
  Search,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { storePath } from "@/lib/jobs/store-slug";
import { STORE_STATUS_LABEL, type StoreStatus } from "@/utils/service-charge";
import type { StoreSearchResult } from "@/utils/actions/jobs";
import { shortAddress } from "@/components/jobs/stores/StoreRow";
import { useStoreSearch } from "@/components/jobs/useStoreSearch";
import { SURVEY_PROMISES, surveyHref } from "./entry";

/** 回答が届いている店舗の要約。店舗候補の検索結果に「回答◯件」を添えるのに使う。 */
export type AnsweredStore = {
  slug: string;
  responseCount: number;
  status: StoreStatus;
};

/** カードの下に並べる約束。4つめ(辞めた店・良い店)は本文で言っている。 */
const PROMISES = SURVEY_PROMISES.filter((p) => p.key !== "welcome");

/**
 * ダッシュボードの冒頭に置く、アンケートの入口。
 *
 * 以前の入口は集計の下にある灰色の枠とボタンだけで、数字を読み終えた人しか
 * 目にしなかった。ここでは最初の画面で、働いた店の名前を打つところまでを
 * 済ませてもらう。店名を打つのは答えるより気が軽く、打てばその店に回答が
 * いくつあるか(無ければ「最初の1件になる」)が返ってくる。
 * 選んだ店はアンケートへ持ち越し、2問目から始まる。
 */
export default function SurveyEntryCard({
  answered,
  className,
  id,
}: {
  /** placeId → 回答の要約。回答が1件も無い店舗は含まない。 */
  answered: Record<string, AnsweredStore>;
  className?: string;
  id?: string;
}) {
  const [query, setQuery] = useState("");
  const [picked, setPicked] = useState<StoreSearchResult | null>(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const ctaRef = useRef<HTMLAnchorElement | null>(null);
  const inputId = useId();
  const listId = useId();

  const { results, loading } = useStoreSearch(query, picked === null);

  // 候補が入れ替わったら、キーボードで選んでいた位置は無効になる。
  useEffect(() => {
    setActive(-1);
  }, [results]);

  useEffect(() => {
    function onPointerDown(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  function pick(store: StoreSearchResult) {
    setPicked(store);
    setQuery(store.name);
    setOpen(false);
    // 次にやることは「答える」だけなので、ボタンへ進めておく。
    requestAnimationFrame(() => ctaRef.current?.focus());
  }

  function reset() {
    setPicked(null);
    setQuery("");
    requestAnimationFrame(() => inputRef.current?.focus());
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      if (results.length === 0) return;
      e.preventDefault();
      setOpen(true);
      setActive((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      if (results.length === 0) return;
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      if (open && results[active]) {
        e.preventDefault();
        pick(results[active]);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  const typed = query.trim().length >= 2;
  const showList = open && !picked && typed && (results.length > 0 || !loading);
  const known = picked ? answered[picked.id] : undefined;

  return (
    <div
      id={id}
      className={cn(
        "rounded-2xl bg-neutral-950 p-5 text-neutral-50 shadow-xl shadow-black/10 ring-1 ring-black/5 sm:p-6 dark:bg-neutral-900 dark:shadow-none dark:ring-white/10",
        className,
      )}
    >
      <p className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[0.6875rem] font-semibold text-neutral-200">
        <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
        匿名・所要3分・登録不要
      </p>
      <h2 className="mt-3 text-xl font-bold leading-snug tracking-tight text-white sm:text-[1.375rem]">
        あなたの職場は、法律どおり？
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-neutral-300">
        働いた店を選んで答えると、送信する前にその場で判定が出ます。
        辞めた店でも、問題のなかった店でも答えられます。
      </p>

      <div ref={containerRef} className="relative mt-5">
        {picked ? (
          <div className="rounded-xl border border-white/15 bg-white/[0.06] p-3.5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-semibold text-white">
                  {picked.name}
                </p>
                {picked.address && (
                  <p className="mt-0.5 truncate text-xs text-neutral-400">
                    {shortAddress(picked.address)}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={reset}
                className="shrink-0 rounded-md px-1.5 py-0.5 text-xs text-neutral-300 underline underline-offset-4 transition hover:text-white"
              >
                変更
              </button>
            </div>
            <p className="mt-3 border-t border-white/10 pt-3 text-xs leading-relaxed text-neutral-300">
              {!known ? (
                <>
                  この店への回答はまだありません。
                  <span className="font-semibold text-white">
                    あなたの回答が最初の1件
                  </span>
                  になります。
                </>
              ) : known.responseCount === 1 ? (
                <>
                  この店への回答は1件だけです（
                  {STORE_STATUS_LABEL[known.status]}
                  ）。2件目があると、1人の見え方なのか店の運用なのかが見えてきます。
                </>
              ) : (
                <>
                  この店には回答が{known.responseCount}件あります（
                  {STORE_STATUS_LABEL[known.status]}
                  ）。あなたの回答で{known.responseCount + 1}件目になります。
                </>
              )}
              {known && (
                <Link
                  href={storePath(known.slug)}
                  className="ml-1 whitespace-nowrap font-medium text-white underline underline-offset-4 transition hover:opacity-80"
                >
                  回答を読む
                </Link>
              )}
            </p>
          </div>
        ) : (
          <>
            <label
              htmlFor={inputId}
              className="text-xs font-medium text-neutral-400"
            >
              働いたことのある店を探す
            </label>
            <div className="relative mt-1.5">
              <Search
                aria-hidden
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
              />
              <input
                ref={inputRef}
                id={inputId}
                type="text"
                role="combobox"
                aria-expanded={showList}
                aria-controls={listId}
                aria-autocomplete="list"
                aria-activedescendant={
                  showList && active >= 0 ? `${listId}-${active}` : undefined
                }
                autoComplete="off"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setOpen(true);
                }}
                onFocus={() => setOpen(true)}
                onKeyDown={onKeyDown}
                placeholder="店名の一部を入力"
                className="h-12 w-full rounded-xl border border-white/15 bg-white/[0.06] pl-10 pr-10 text-base text-white placeholder:text-neutral-500 transition focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/15"
              />
              {loading && (
                <LoaderCircle
                  aria-hidden
                  className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-neutral-400 motion-reduce:animate-none"
                />
              )}
            </div>

            {showList && (
              <div className="absolute inset-x-0 top-full z-30 mt-2 overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-2xl">
                {results.length > 0 ? (
                  <ul
                    id={listId}
                    role="listbox"
                    aria-label="店舗の候補"
                    className="max-h-72 overflow-auto p-1"
                  >
                    {results.map((r, i) => {
                      const a = answered[r.id];
                      return (
                        <li
                          key={r.id}
                          id={`${listId}-${i}`}
                          role="option"
                          aria-selected={i === active}
                          // 入力欄のフォーカスを外さずに選ばせる。
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => pick(r)}
                          onMouseEnter={() => setActive(i)}
                          className={cn(
                            "flex cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2.5",
                            i === active && "bg-muted",
                          )}
                        >
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-medium">
                              {r.name}
                            </span>
                            {r.address && (
                              <span className="block truncate text-xs text-muted-foreground">
                                {shortAddress(r.address)}
                              </span>
                            )}
                          </span>
                          <span
                            className={cn(
                              "shrink-0 rounded-full px-2 py-0.5 text-[0.6875rem] font-medium",
                              a
                                ? "bg-muted text-muted-foreground"
                                : "border border-foreground/25 text-foreground",
                            )}
                          >
                            {a ? `回答${a.responseCount}件` : "まだ回答なし"}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p
                    id={listId}
                    className="px-4 py-3.5 text-sm leading-relaxed text-muted-foreground"
                  >
                    候補に見つかりませんでした。リストにない店も、アンケートで店名を入れれば答えられます。
                  </p>
                )}
              </div>
            )}
          </>
        )}
      </div>

      <Link
        ref={ctaRef}
        href={picked ? surveyHref({ store: picked.id }) : surveyHref({ q: query })}
        className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-white px-4 text-[0.9375rem] font-semibold text-neutral-950 shadow-sm transition hover:bg-neutral-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950"
      >
        {picked ? "この店について答える" : "診断をはじめる"}
        <ArrowRight className="h-4 w-4" aria-hidden />
      </Link>

      <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-neutral-300">
        {PROMISES.map((p) => (
          <li key={p.key} className="flex items-center gap-1.5">
            <Check aria-hidden className="h-3.5 w-3.5 text-emerald-400" />
            {p.short}
          </li>
        ))}
      </ul>
    </div>
  );
}
