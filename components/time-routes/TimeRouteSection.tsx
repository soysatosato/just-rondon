import Link from "next/link";
import { Clock, ExternalLink, Lightbulb, MapPin } from "lucide-react";

import {
  formatCheckedAt,
  TIME_ROUTE_ANCHOR,
  type TimeRoute,
  type TimeRouteGuide,
} from "@/lib/time-routes";
import TimeRoutePlanButton from "./TimeRoutePlanButton";
import TimeRouteTabs from "./TimeRouteTabs";

/**
 * 「◯◯の所要時間と回り方」。持ち時間ごとの順路を、タブで切り替えて見せる。
 *
 * 置き場所は、美術館・博物館なら /museums 側、それ以外は /sightseeing 側
 * (運営者の方針)。美術館の観光ページには TimeRouteDigest の短い答えだけを出す。
 *
 * 2つのページで見た目の作法が違う(美術館側は英字の小見出し付き、
 * 観光側は本文と同じ見出し)ので variant で合わせる。中身は同じ。
 *
 * 本文はプレーンテキストで描く(lib/time-routes はマークダウンを使わない)。
 */
export default function TimeRouteSection({
  guide,
  placeName,
  variant,
}: {
  guide: TimeRouteGuide;
  placeName: string;
  variant: "museum" | "sightseeing";
}) {
  const heading = `${placeName}の所要時間と回り方`;

  return (
    <section
      id={TIME_ROUTE_ANCHOR}
      className={
        variant === "museum"
          ? "mx-auto max-w-4xl scroll-mt-24 px-4 py-10"
          : "scroll-mt-24"
      }
    >
      <div className="mb-5">
        {variant === "museum" && (
          <span className="inline-block rounded-full bg-indigo-600 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white">
            Time
          </span>
        )}
        <h2
          className={
            variant === "museum"
              ? "mt-3 text-2xl font-bold tracking-tight"
              : "text-xl font-semibold tracking-tight md:text-2xl"
          }
        >
          {heading}
        </h2>
        {/* 「◯◯ 所要時間」で来た人への答え。見出しのすぐ下に置く。 */}
        <p className="mt-3 text-base leading-relaxed">{guide.answer}</p>
      </div>

      <div className="mb-6 rounded-xl border border-border bg-muted/40 p-4">
        <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-muted-foreground marker:text-muted-foreground/60">
          {guide.notes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
        {guide.map && (
          <a
            href={guide.map.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-indigo-600 underline underline-offset-4 hover:text-indigo-700 dark:text-indigo-400"
          >
            {guide.map.label}
            <ExternalLink className="h-3.5 w-3.5" aria-hidden />
          </a>
        )}
      </div>

      <TimeRouteTabs
        labels={guide.routes.map((route) => route.label)}
        panels={guide.routes.map((route) => (
          <RoutePanel
            key={route.label}
            route={route}
            slug={guide.attractionSlug}
            placeName={placeName}
          />
        ))}
      />

      <p className="mt-6 text-xs leading-relaxed text-muted-foreground">
        {formatCheckedAt(guide.checkedAt)}
        に公式の館内図と案内で確かめた内容です。展示替え・作品の貸し出し・改装で部屋や順路は変わるので、当日は館内の案内も見てください(
        {guide.sources.map((source, i) => (
          <span key={source.url}>
            {i > 0 && "、"}
            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:opacity-80"
            >
              {source.label}
            </a>
          </span>
        ))}
        )。
      </p>
    </section>
  );
}

function RoutePanel({
  route,
  slug,
  placeName,
}: {
  route: TimeRoute;
  slug: string;
  placeName: string;
}) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold tracking-tight">
          {route.label}で回るなら
        </h3>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          {route.summary}
        </p>
      </div>

      <ol className="space-y-3">
        {route.stops.map((stop, i) => (
          <li
            key={`${stop.title}-${stop.where}`}
            className="flex gap-3 rounded-xl border border-border bg-card p-4"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">
              {i + 1}
            </span>
            <div className="min-w-0 space-y-1.5">
              <p className="font-semibold leading-snug tracking-tight">
                {stop.href ? (
                  <Link
                    href={stop.href}
                    // 押せる範囲を上下に広げる(見た目の行の高さは -my で据え置き)。
                    // 1行のリンクは高さ18pxで、基準の24pxに届いていなかった。
                    className="-my-1 inline-block py-1 underline decoration-indigo-300 underline-offset-4 hover:text-indigo-600 dark:decoration-indigo-700 dark:hover:text-indigo-400"
                  >
                    {stop.title}
                  </Link>
                ) : (
                  stop.title
                )}
              </p>
              <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-indigo-700 dark:text-indigo-400">
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  {stop.where}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  {stop.minutes}分
                </span>
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {stop.note}
              </p>
            </div>
          </li>
        ))}
      </ol>

      {route.tip && (
        <p className="flex gap-2 rounded-xl bg-emerald-50 p-4 text-sm leading-relaxed text-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200">
          <Lightbulb className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <span>{route.tip}</span>
        </p>
      )}

      <p className="text-xs text-muted-foreground">
        各地点の分数は見る時間の目安で、合計に館内の移動を足すと
        {route.label}になります。
      </p>

      <TimeRoutePlanButton
        slug={slug}
        name={placeName}
        label={route.label}
        minutes={route.minutes}
      />
    </div>
  );
}
