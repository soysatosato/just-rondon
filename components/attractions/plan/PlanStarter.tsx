"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ArrowRight, CalendarRange, MapPin, Wallet } from "lucide-react";

import { buildDayPlan, formatGbp, type PlanSpot } from "@/lib/plan";
import { PLAN_TEMPLATES, templateEntries, type PlanTemplate } from "@/lib/plan/templates";
import { replacePlan } from "./plan-store";

/**
 * プランが空のときに出す出発点。
 *
 * 以前ここには破線の箱があり、「まだスポットが入っていません」と
 * 書いてあった。行き先が決まっている人には十分だが、この道具を
 * 最初に開く人の大半は決まっていない。「選んでください」と言われても
 * 144件の中から4件を選ぶ判断がそもそもできず、そこで離脱する。
 *
 * 完成したプランを渡してから引き算させるほうが早い。ひな形を読み込めば
 * 合計も移動も警告も一度に出るので、この道具が何をするものかが
 * 説明ではなく結果で伝わる。
 *
 * 日数・ヶ所数・合計金額はひな形に書かず、その場でDBの値から計算する。
 * 定義に「£108」と書くと、値上げのたびに嘘になる。
 */
export default function PlanStarter({ spots }: { spots: PlanSpot[] }) {
  const bySlug = useMemo(
    () => new Map(spots.map((spot) => [spot.slug, spot])),
    [spots],
  );

  const cards = useMemo(
    () =>
      PLAN_TEMPLATES.map((template) => {
        const days = template.days.map((slugs, i) =>
          buildDayPlan(
            i + 1,
            slugs
              .map((slug) => bySlug.get(slug))
              .filter((spot): spot is PlanSpot => Boolean(spot)),
          ),
        );
        return {
          template,
          dayCount: days.length,
          spotCount: days.reduce((sum, day) => sum + day.rows.length, 0),
          totalGbp: days.reduce((sum, day) => sum + day.totalGbp, 0),
        };
      }),
    [bySlug],
  );

  const load = (template: PlanTemplate) => {
    replacePlan(templateEntries(template));
    // 読み込んだ結果は上に出る。押した位置に留まると何も起きなかったように見える。
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <h2 className="text-lg font-bold tracking-tight">
          ひな形から始める
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          押すとその場でプランができます。あとから足す・外す・日を移すのは
          全部できるので、まず1つ読み込んで、要らないものを外していくのが
          いちばん早い方法です。
        </p>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2">
        {cards.map(({ template, dayCount, spotCount, totalGbp }) => (
          <li key={template.id}>
            <button
              type="button"
              onClick={() => load(template)}
              className="group flex h-full w-full flex-col gap-3 rounded-2xl border border-border bg-card p-4 text-left transition hover:-translate-y-0.5 hover:border-indigo-400 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-indigo-600 dark:text-indigo-400">
                    {template.span}
                  </p>
                  <p className="mt-1 text-base font-bold leading-snug">
                    {template.label}
                  </p>
                </div>
                <ArrowRight
                  className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-indigo-600 dark:group-hover:text-indigo-400"
                  aria-hidden
                />
              </div>

              <p className="text-xs leading-relaxed text-muted-foreground">
                {template.blurb}
              </p>

              <dl className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-border pt-3 text-[11px]">
                <div className="flex items-center gap-1.5">
                  <CalendarRange
                    className="h-3.5 w-3.5 text-muted-foreground"
                    aria-hidden
                  />
                  <dt className="sr-only">日数</dt>
                  <dd className="font-semibold tabular-nums">{dayCount}日</dd>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin
                    className="h-3.5 w-3.5 text-muted-foreground"
                    aria-hidden
                  />
                  <dt className="sr-only">スポット数</dt>
                  <dd className="font-semibold tabular-nums">{spotCount}ヶ所</dd>
                </div>
                <div className="flex items-center gap-1.5">
                  <Wallet
                    className="h-3.5 w-3.5 text-muted-foreground"
                    aria-hidden
                  />
                  <dt className="sr-only">入場料の合計（大人1人）</dt>
                  <dd className="font-semibold tabular-nums">
                    {formatGbp(totalGbp)}
                  </dd>
                </div>
              </dl>
            </button>
          </li>
        ))}
      </ul>

      <p className="text-xs leading-relaxed text-muted-foreground">
        行き先が決まっているなら、下の検索から直接足せます。
        <Link
          href="/sightseeing/all"
          className="underline underline-offset-2 hover:text-foreground"
        >
          観光スポット一覧
        </Link>
        や各スポットのページにある「旅行プランに追加」からも入ります。
        どこへ行くか自体を決めかねているなら、
        <Link
          href="/sightseeing/itinerary"
          className="underline underline-offset-2 hover:text-foreground"
        >
          モデルコース
        </Link>
        を読んでから戻ってくると早いです。
      </p>
    </div>
  );
}
