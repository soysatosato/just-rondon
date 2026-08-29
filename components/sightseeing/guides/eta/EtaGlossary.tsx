"use client";

import { useMemo, useState } from "react";
import { etaGlossary } from "./content";

/**
 * アプリの英語画面の対訳。
 *
 * 以前は GFM テーブル3枚だった。MarkdownBody が表に min-w-[32rem] を
 * 掛けるため、スマホでは横スクロールしないと日本語側が読めない。
 * アプリの前で止まっている人に、横スクロールしながら30行の中から
 * 目的の1行を探させる形になっていた。
 *
 * 検索できる縦積みのリストにする。読者は画面に出ている英語を数文字
 * 打てばよく、英語と日本語が常に上下で揃う。
 */
export default function EtaGlossary() {
  const [query, setQuery] = useState("");

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return etaGlossary;
    return etaGlossary
      .map((g) => ({
        ...g,
        entries: g.entries.filter(
          (e) =>
            e.en.toLowerCase().includes(q) || e.ja.includes(query.trim())
        ),
      }))
      .filter((g) => g.entries.length > 0);
  }, [query]);

  const hits = groups.reduce((n, g) => n + g.entries.length, 0);

  return (
    <div className="space-y-4">
      <div className="relative">
        <svg
          aria-hidden
          viewBox="0 0 20 20"
          fill="none"
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
        >
          <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="2" />
          <path d="M13.5 13.5L17 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="画面に出ている英語を入力（例: chip）"
          aria-label="英語画面の文言を検索"
          className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 dark:border-neutral-700 dark:bg-neutral-900 dark:text-gray-100"
        />
      </div>

      {query.trim() && (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {hits > 0 ? `${hits}件` : "見つかりませんでした。英語を数文字だけ入れてみてください。"}
        </p>
      )}

      <div className="space-y-6">
        {groups.map((group) => (
          <div key={group.id}>
            <p className="text-xs font-bold tracking-wide text-gray-500 dark:text-gray-400">
              {group.label}
            </p>
            <ul className="mt-2 divide-y divide-gray-200 rounded-lg border border-gray-200 dark:divide-neutral-800 dark:border-neutral-700">
              {group.entries.map((entry) => (
                <li key={entry.en} className="px-3 py-2.5">
                  <p className="font-mono text-sm font-medium text-gray-900 dark:text-gray-100">
                    {entry.en}
                  </p>
                  <p className="mt-0.5 text-sm text-gray-600 dark:text-gray-400">
                    {entry.ja}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
