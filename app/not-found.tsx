"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import RainOnGlass from "@/components/home/RainOnGlass";
import { ancestorCrumbs } from "@/components/navigation/tree";
import { NAV_SECTIONS } from "@/components/navbar/menu";
import { SONGS_PUBLISHED } from "@/lib/musicals/song-pages";
import SearchTrigger from "@/components/search/SearchTrigger";

/**
 * 404。
 *
 * 文言とリンクは最初から見せる。以前は framer-motion で順に浮かび上がらせて
 * いて、唯一の出口「ホームに戻る」が出るまで2.3秒かかり、JS が動くまでは
 * 何も見えなかった(初期値が opacity:0 のままサーバーから届くため)。
 *
 * 行き先は URL から推す。検索から来た人が多いのは公開を止めた曲ページ
 * (/musicals/<作品>/songs/...)なので、そこだけは作品ページへの道を示す。
 * それ以外は、URL の途中にある区分のトップを出す。
 */

type Suggestion = { note?: string; href: string; label: string };

/*
 * URL は usePathname ではなくブラウザから読む。この画面は /_not-found として
 * 1度だけ静的に描かれて全ての404に配られるので、サーバー側の描画では
 * 実際の URL が分からない。ハイドレーション中は null(案内なし)で描き、
 * その直後に URL から案内を出す。
 */
const subscribe = () => () => {};
const readPathname = () => window.location.pathname;
const readNothing = () => null;

function suggestionFor(pathname: string): Suggestion | null {
  const song = pathname.match(/^\/musicals\/([^/]+)\/songs(?:\/|$)/);
  if (song) {
    return {
      note: SONGS_PUBLISHED
        ? "この曲のページは見つかりませんでした。"
        : "曲目と歌詞のページは、現在公開を停止しています。作品のあらすじと見どころは作品ページにまとめています。",
      href: `/musicals/${song[1]}`,
      label: "この作品のページへ",
    };
  }

  const crumbs = ancestorCrumbs(pathname);
  const section = crumbs[crumbs.length - 1];
  return section?.href
    ? { href: section.href, label: `「${section.label}」のページへ` }
    : null;
}

export default function NotFoundPage() {
  const pathname = useSyncExternalStore<string | null>(
    subscribe,
    readPathname,
    readNothing,
  );
  const suggestion = pathname ? suggestionFor(pathname) : null;

  return (
    <div className="relative flex min-h-[80vh] flex-col items-center justify-center overflow-hidden bg-slate-950 p-6 text-center">
      {/* 窓の外の夜景。街灯と信号のにじみ */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-950 to-black" />
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          backgroundImage: [
            "radial-gradient(circle at 18% 82%, rgba(255,183,94,0.28), transparent 42%)",
            "radial-gradient(circle at 74% 88%, rgba(255,120,90,0.18), transparent 38%)",
            "radial-gradient(circle at 50% 20%, rgba(96,140,200,0.22), transparent 55%)",
          ].join(","),
        }}
      />

      {/* ガラスに付いた雨と、稀に光る雷 */}
      <div className="pointer-events-none absolute inset-0 z-10">
        <RainOnGlass />
      </div>

      <div className="relative z-20 flex max-w-xl flex-col items-center">
        <h1 className="mb-4 text-7xl font-extrabold tracking-tight text-slate-100 drop-shadow-[0_2px_18px_rgba(120,160,220,0.35)] sm:text-8xl">
          404
        </h1>

        <h2 className="mb-5 text-2xl font-semibold text-slate-300 sm:text-3xl">
          ページが見つかりません
        </h2>

        <p className="mb-8 text-slate-400">
          {suggestion?.note ??
            "お探しのページは存在しないか、ロンドンの雨の中に隠れてしまったようです。"}
        </p>

        <div className="flex flex-wrap justify-center gap-3">
          {suggestion && (
            <Link
              href={suggestion.href}
              className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white shadow-lg shadow-blue-900/40 transition hover:bg-blue-500"
            >
              {suggestion.label}
            </Link>
          )}
          <Link
            href="/"
            className={
              suggestion
                ? "rounded-lg border border-slate-600 px-6 py-3 font-semibold text-slate-200 transition hover:border-slate-400 hover:text-white"
                : "rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white shadow-lg shadow-blue-900/40 transition hover:bg-blue-500"
            }
          >
            ホームに戻る
          </Link>
        </div>

        {/* 探していたものの名前は分かっている人が多い。URL が変わっても
            名前で引き直せるよう、検索を置く。 */}
        <SearchTrigger
          variant="field"
          placeholder="ページの名前で探す"
          className="mt-8 h-11 max-w-sm text-sm"
        />

        {/* 区分の入口。並びと名前はグローバルナビ(menu.ts)と同じにする。 */}
        <nav aria-label="おもな区分" className="mt-8">
          <ul className="flex flex-wrap justify-center gap-2">
            {NAV_SECTIONS.map((section) => (
              <li key={section.href}>
                <Link
                  href={section.href}
                  className="inline-block rounded-full border border-slate-700 px-3 py-1.5 text-sm text-slate-300 transition hover:border-slate-400 hover:text-white"
                >
                  {section.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}
