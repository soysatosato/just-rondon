"use client";

import { useMemo, useState } from "react";
import { Check, Clock, Plus, Search, TrainFront, Wallet } from "lucide-react";

import { Input } from "@/components/ui/input";
import { categoryLabel } from "@/components/sightseeing/categories";
import { getAreaMeta } from "@/components/sightseeing/areas/areas";
import type { PlanSpot } from "@/lib/sightseeing/plan";
import { addToPlan, removeFromPlan, usePlanDay } from "./plan-store";

/**
 * プラン画面の中でスポットを足す検索欄。
 *
 * 一覧ページへ行って戻ってくる導線もあるが、日を分けたあとに
 * 「2日目がもう1ヶ所ほしい」と気づく組み方をされる。そのたびに
 * 画面を離れると、どの日が薄いのかを覚えていられない。
 *
 * 絞り込みは名前・英名・エリア・種類・最寄駅を対象にする。
 * 「Bond Street」「サウスバンク」「博物館」のどれで打っても
 * 引っかかるほうが、正式名称を思い出せない人に優しい。
 */
const RESULT_LIMIT = 12;

type Indexed = PlanSpot & { haystack: string };

export default function PlanSpotPicker({ spots }: { spots: PlanSpot[] }) {
  const [query, setQuery] = useState("");

  const indexed = useMemo<Indexed[]>(
    () =>
      spots.map((spot) => ({
        ...spot,
        haystack: [
          spot.name,
          spot.engName,
          spot.nearestStation,
          categoryLabel(spot.category),
          spot.area ? getAreaMeta(spot.area)?.label : null,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase(),
      })),
    [spots],
  );

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    // 検索していないうちは、おすすめ度の高いものを候補として出す。
    // 空欄に「入力してください」とだけ出ていても、何を打てばよいかの
    // 手がかりがない。
    const pool = q
      ? indexed.filter((spot) => spot.haystack.includes(q))
      : indexed;
    return [...pool]
      .sort(
        (a, b) =>
          (b.recommendLevel ?? 0) - (a.recommendLevel ?? 0) ||
          a.name.localeCompare(b.name, "ja"),
      )
      .slice(0, RESULT_LIMIT);
  }, [indexed, query]);

  const matched = query.trim()
    ? indexed.filter((spot) => spot.haystack.includes(query.trim().toLowerCase()))
        .length
    : indexed.length;

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="スポット名・エリア・駅名で探す"
          aria-label="プランに追加するスポットを探す"
          className="pl-9"
        />
      </div>

      {results.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
          「{query}」に当てはまるスポットがありません。
        </p>
      ) : (
        <>
          <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border">
            {results.map((spot) => (
              <PickerRow key={spot.slug} spot={spot} />
            ))}
          </ul>
          {matched > results.length && (
            <p className="text-xs text-muted-foreground">
              ほかに{matched - results.length}件あります。絞り込んでください。
            </p>
          )}
        </>
      )}
    </div>
  );
}

function PickerRow({ spot }: { spot: PlanSpot }) {
  const day = usePlanDay(spot.slug);
  const added = day > 0;

  const facts = [
    spot.durationText,
    spot.priceAdult,
    spot.nearestStation,
  ].filter(Boolean) as string[];

  return (
    <li className="flex items-center gap-3 bg-background p-3">
      <img
        src={spot.image}
        alt=""
        className="h-12 w-12 shrink-0 rounded-lg object-cover"
        loading="lazy"
        decoding="async"
      />

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{spot.name}</p>
        {facts.length > 0 && (
          <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground">
            {spot.durationText && (
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3 w-3 shrink-0" aria-hidden />
                {spot.durationText}
              </span>
            )}
            {spot.priceAdult && (
              <span className="inline-flex items-center gap-1">
                <Wallet className="h-3 w-3 shrink-0" aria-hidden />
                {spot.priceAdult}
              </span>
            )}
            {spot.nearestStation && (
              <span className="inline-flex min-w-0 items-center gap-1">
                <TrainFront className="h-3 w-3 shrink-0" aria-hidden />
                <span className="truncate">{spot.nearestStation}</span>
              </span>
            )}
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={() => (added ? removeFromPlan(spot.slug) : addToPlan(spot.slug))}
        aria-pressed={added}
        aria-label={
          added ? `${spot.name}をプランから外す` : `${spot.name}をプランに追加`
        }
        className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
          added
            ? "border-indigo-600 bg-indigo-600 text-white hover:bg-indigo-700"
            : "border-border hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400"
        }`}
      >
        {added ? (
          <>
            <Check className="h-3.5 w-3.5" aria-hidden />
            {day}日目
          </>
        ) : (
          <>
            <Plus className="h-3.5 w-3.5" aria-hidden />
            追加
          </>
        )}
      </button>
    </li>
  );
}
