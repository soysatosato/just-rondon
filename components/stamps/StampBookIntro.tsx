import Link from "next/link";
import { ChevronRight, Sparkles, Stamp, Trophy, type LucideIcon } from "lucide-react";

import StampImpression, { type StampArt } from "@/components/stamps/StampImpression";
import { STAMP_META, STAMP_TITLES } from "@/lib/stamps";

/**
 * ログインしていない人に出すスタンプ帳の説明。
 *
 * ここで /sign-in へ即リダイレクトしないのは、ナビゲーションから
 * 「スタンプ帳」を初めて押した人が、何のための機能か分からないまま
 * ログイン画面に立つことになるため。まず何が貯まるのかを見せる。
 *
 * 見本のスタンプは実物と同じ部品で描く。説明の文章より、押すと
 * こういう判が貯まっていくという絵のほうが早く伝わる。
 */

const SAMPLES: { name: string; art: StampArt }[] = [
  {
    name: "ロンドン塔",
    art: {
      type: "attraction",
      engName: "Tower of London",
      category: "historic",
      stampedAt: "2026-05-03T11:00:00Z",
      onSite: true,
      seed: "sample-tower-of-london",
    },
  },
  {
    name: "大英博物館",
    art: {
      type: "museum",
      engName: "British Museum",
      category: null,
      stampedAt: "2026-05-04T11:00:00Z",
      onSite: false,
      seed: "sample-british-museum",
    },
  },
  {
    name: "レ・ミゼラブル",
    art: {
      type: "musical",
      engName: "Les Misérables",
      category: null,
      stampedAt: "2026-05-04T19:30:00Z",
      onSite: false,
      seed: "sample-les-miserables",
    },
  },
];

const FEATURES: { Icon: LucideIcon; title: string; text: string }[] = [
  {
    Icon: Stamp,
    title: "行ったら押す",
    text: "観光スポット・美術館・ミュージカルの各ページにボタンがあります。帰国してからでも、昔行った場所でも押せます。",
  },
  {
    Icon: Sparkles,
    title: "現地で押すと金",
    text: "その場所の近くで、位置情報を付けて押したときだけ金のスタンプになります。",
  },
  {
    Icon: Trophy,
    title: "台紙を制覇する",
    text: "定番スポット、エリア、王室。台紙を埋めると制覇の印が付き、押した数で称号も上がります。",
  },
];

export default function StampBookIntro() {
  return (
    <div className="mx-auto max-w-3xl py-6 sm:py-10">
      <header className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#5b1629] via-[#420f1f] to-[#240811] px-5 py-8 text-white shadow-xl shadow-rose-950/20 sm:px-10 sm:py-10">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-28 h-80 w-80 rounded-full bg-amber-400/15 blur-3xl"
        />
        <div className="relative">
          <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-amber-300/90">
            <span className="h-3 w-0.5 shrink-0 rounded-full bg-amber-400" />
            Stamp Book
          </p>
          <h1 className="mt-3 font-serif text-4xl font-black tracking-tight text-amber-200 sm:text-5xl">
            スタンプ帳
          </h1>
          <p className="mt-4 max-w-lg text-sm leading-relaxed text-white/75">
            行った場所にスタンプを押して、ロンドンを1枚ずつ制覇していく帳面です。
          </p>

          <div className="stamp-paper mt-7 rounded-2xl px-4 pb-3 pt-5 shadow-lg shadow-black/30 sm:px-6">
            <ul className="grid grid-cols-3 gap-3 sm:gap-6">
              {SAMPLES.map(({ name, art }) => (
                <li key={art.seed} className="flex flex-col items-center text-center">
                  <span className="block w-full max-w-[128px]">
                    <StampImpression art={art} />
                  </span>
                  <span className="mt-1.5 text-[11px] font-semibold text-stone-700 dark:text-stone-200">
                    {name}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-right text-[10px] font-semibold tracking-[0.2em] text-stone-400">
              見本
            </p>
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link
              href="/sign-in"
              className="inline-flex items-center rounded-full bg-amber-300 px-6 py-2.5 text-sm font-bold text-[#3a0d1b] transition hover:bg-amber-200"
            >
              ログインして始める
            </Link>
            <Link
              href="/sign-up"
              className="inline-flex items-center rounded-full border border-white/25 px-6 py-2.5 text-sm font-semibold text-white transition hover:border-white/60"
            >
              アカウントを作る
            </Link>
          </div>
        </div>
      </header>

      <ul className="mt-8 grid gap-3 sm:grid-cols-3">
        {FEATURES.map(({ Icon, title, text }) => (
          <li key={title} className="rounded-2xl border border-border p-4">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
              <Icon className="h-4 w-4" aria-hidden />
            </span>
            <p className="mt-3 text-sm font-bold">{title}</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{text}</p>
          </li>
        ))}
      </ul>

      <section className="mt-10" aria-labelledby="intro-titles">
        <h2 id="intro-titles" className="text-sm font-bold">
          押すほど上がる称号
        </h2>
        <ol className="mt-3 flex flex-wrap items-center gap-x-1 gap-y-2 text-xs">
          {STAMP_TITLES.slice(1).map((title, i) => (
            <li key={title.min} className="flex items-center gap-1">
              {i > 0 && (
                <ChevronRight className="h-3 w-3 text-muted-foreground" aria-hidden />
              )}
              <span className="rounded-full border border-border px-2.5 py-1 font-semibold">
                {title.title}
              </span>
            </li>
          ))}
        </ol>
      </section>

      <p className="mt-10 text-xs leading-relaxed text-muted-foreground">
        記事を読むのにログインは要りません。スタンプ帳を使うときだけ必要です。
        まずは
        <Link
          href={STAMP_META.attraction.hubHref}
          className="mx-1 font-semibold text-rose-600 hover:underline dark:text-rose-400"
        >
          観光スポットの一覧
        </Link>
        から見てみてください。
      </p>
    </div>
  );
}
