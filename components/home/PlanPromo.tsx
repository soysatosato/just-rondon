"use client";

import Link from "next/link";
import { ArrowRight, Check, Plus } from "lucide-react";

import { togglePlan, usePlanCount, usePlanDay } from "@/components/attractions/plan/plan-store";

/**
 * トップページの旅行プラン導線。
 *
 * この道具はサイトの中心に据えたいものだが、トップページに一切出て
 * いなかった。到達経路は観光ハブを4セクション下までスクロールして
 * 見つかるカード1枚だけで、大半の読者は存在に気づかないまま帰っていた。
 *
 * 説明カードを置くのではなく、その場で押せるものを置いている。
 * 「旅程を組めます」と書かれるより、名所を2つ押して数字が動くほうが
 * 何ができるかは早く伝わる。押した内容はそのまま本物のプランに入るので、
 * /plan を開いた時点で既に組みかけの旅程がある。
 */

export type PromoSpot = {
  slug: string;
  name: string;
  image: string;
  priceAdult: string | null;
  durationText: string | null;
};

export default function PlanPromo({ spots }: { spots: PromoSpot[] }) {
  const count = usePlanCount();

  return (
    <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
      <div className="min-w-0 lg:col-span-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-indigo-600 dark:text-indigo-400">
          Trip Planner
        </p>
        <h2 className="mt-3 text-2xl font-bold leading-snug tracking-tight sm:text-3xl">
          行きたい場所を選ぶだけで、
          <br className="hidden sm:block" />
          旅程になる
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          掲載中の観光スポットから選ぶと、日別に並べて
          <strong className="font-semibold text-foreground">
            入場料の合計・滞在時間・スポット間の移動
          </strong>
          を出します。ロンドンの有料施設は£30前後が普通で、4ヶ所選べば
          £100を超えます。詰め込みすぎている日には警告が出るので、
          削る判断が現地ではなく出発前にできます。
        </p>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          ログインは要りません。順路は地図に出て、作ったプランはURL1本で
          同行者に送れます。
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link
            href="/plan"
            className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            {count > 0 ? `${count}ヶ所でプランを作る` : "旅行プランを作る"}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
          {count > 0 && (
            <span className="text-xs text-muted-foreground">
              選んだぶんは保存されています
            </span>
          )}
        </div>
      </div>

      <div className="min-w-0 lg:col-span-7">
        <p className="mb-3 text-xs font-semibold text-muted-foreground">
          気になるものを押してみてください。そのままプランに入ります。
        </p>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {spots.map((spot) => (
            <PromoTile key={spot.slug} spot={spot} />
          ))}
        </ul>
      </div>
    </div>
  );
}

/**
 * 1枚のタイル。押すと入り、もう一度押すと外れる。
 *
 * 購読しているのは自分の slug が何日目かという数値だけなので、
 * 1件押しても他のタイルは描き直されない。
 */
function PromoTile({ spot }: { spot: PromoSpot }) {
  const added = usePlanDay(spot.slug) > 0;

  const facts = [spot.durationText, spot.priceAdult]
    .filter(Boolean)
    .join(" ・ ");

  return (
    <li>
      <button
        type="button"
        onClick={() => togglePlan(spot.slug)}
        aria-pressed={added}
        aria-label={
          added ? `${spot.name}をプランから外す` : `${spot.name}をプランに追加`
        }
        className={`group relative block w-full overflow-hidden rounded-xl border text-left transition ${
          added
            ? "border-indigo-600 ring-2 ring-indigo-600/30"
            : "border-border hover:border-indigo-400"
        }`}
      >
        <span className="relative block aspect-[4/3] bg-muted">
          <img
            src={spot.image}
            alt=""
            aria-hidden
            className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
            loading="lazy"
            decoding="async"
          />
          <span
            className={`absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full transition ${
              added
                ? "bg-indigo-600 text-white"
                : "bg-background/85 text-foreground"
            }`}
            aria-hidden
          >
            {added ? (
              <Check className="h-4 w-4" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
          </span>
        </span>

        <span className="block p-2.5">
          <span className="block truncate text-xs font-bold leading-snug">
            {spot.name}
          </span>
          {facts && (
            <span className="mt-0.5 block truncate text-[10px] text-muted-foreground">
              {facts}
            </span>
          )}
        </span>
      </button>
    </li>
  );
}
