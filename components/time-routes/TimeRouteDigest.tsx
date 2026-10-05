import Link from "next/link";
import { ArrowRight } from "lucide-react";

import {
  formatCheckedAt,
  TIME_ROUTE_ANCHOR,
  timeRoutePath,
  type TimeRouteGuide,
} from "@/lib/time-routes";

/**
 * 観光ページ(/sightseeing)に置く「所要時間」の短い答え。
 *
 * 美術館・博物館の順路の本体は /museums 側に置く方針なので、こちらには
 * 1文の答えと段ごとの要約だけを出して、部屋番号つきの順路へ送る。
 * 2026-10 の時点で「◯◯ 所要時間」の検索に出ているのはこちらのページだけで、
 * /museums 側はまだ検索に載っていない。ここを空にすると、いま5〜10位に
 * いるページに答えが無いままになるので、答えそのものはこちらにも置く。
 */
export default function TimeRouteDigest({
  guide,
  placeName,
}: {
  guide: TimeRouteGuide;
  placeName: string;
}) {
  return (
    <section
      id={TIME_ROUTE_ANCHOR}
      className="scroll-mt-24 space-y-4 rounded-2xl border border-border bg-muted/40 p-5"
    >
      <h2 className="text-xl font-semibold tracking-tight md:text-2xl">
        {placeName}の所要時間
      </h2>
      <p className="leading-relaxed">{guide.answer}</p>

      <dl className="space-y-3">
        {guide.routes.map((route) => (
          <div key={route.label} className="flex gap-3">
            <dt className="w-[5.5rem] shrink-0 text-sm font-semibold">
              {route.label}
            </dt>
            <dd className="text-sm leading-relaxed text-muted-foreground">
              {route.summary}
            </dd>
          </div>
        ))}
      </dl>

      <Link
        href={timeRoutePath(guide)}
        className="group inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
      >
        <span className="underline underline-offset-4">
          部屋番号つきの順路と、配分ごとに旅程へ入れるボタンは美術館ガイドへ
        </span>
        <ArrowRight
          className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5"
          aria-hidden
        />
      </Link>

      <p className="text-xs text-muted-foreground">
        {formatCheckedAt(guide.checkedAt)}に公式の館内図と案内で確認
      </p>
    </section>
  );
}
