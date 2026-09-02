"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Clock, Plus, Search, TrainFront, Wallet, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { CATEGORY_ORDER, categoryLabel } from "@/components/sightseeing/categories";
import { areaGuides, getAreaMeta } from "@/components/sightseeing/areas/areas";
import { MAX_DAYS, MAX_SPOTS, type PlanSpot } from "@/lib/plan";
import { addToPlan, removeFromPlan, usePlanCount, usePlanDay } from "./plan-store";

/**
 * プランにスポットを足す欄。
 *
 * 検索だけだった。名前を知っている人には最短だが、この道具を開く人の
 * 多くは「2日目のサウスバンクをもう1ヶ所埋めたい」という状態で来る。
 * 打つべき固有名詞が出てこないので、当てはまるものがあるかどうかを
 * 確かめるために別ページへ調べに行くことになり、戻ってくる頃には
 * どの日が薄かったかを忘れている。
 *
 * そこで絞り込みを付けた。エリアと種類はどちらも「行き先が決まる前に
 * 決まっているほう」で、旅程を組む人はたいてい先にこちらを持っている。
 *
 * 絞り込みの選択肢は渡されたスポットから作る。定義表を直接並べると、
 * 1件も該当しない区分が押せる形で出てしまい、押した先が空になる。
 */
const PAGE_SIZE = 12;

type Indexed = PlanSpot & { haystack: string };

export default function PlanSpotPicker({
  spots,
  day,
  dayCount,
}: {
  spots: PlanSpot[];
  /** 追加先の日。省略すると最終日に入る。 */
  day?: number;
  /**
   * プラン全体の日数。渡すと「◯日目に追加」の選択欄が出る。
   * 日のカードの中に置くときは日が自明なので渡さない。
   */
  dayCount?: number;
}) {
  const [query, setQuery] = useState("");
  const [area, setArea] = useState<string | null>(null);
  const [category, setCategory] = useState<string | null>(null);
  const [freeOnly, setFreeOnly] = useState(false);
  const [limit, setLimit] = useState(PAGE_SIZE);
  const [targetDay, setTargetDay] = useState(day ?? 1);
  const planCount = usePlanCount();
  const full = planCount >= MAX_SPOTS;

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

  /** 実際に1件以上あるエリアだけ。並びはエリアガイドの順に合わせる。 */
  const areaOptions = useMemo(() => {
    const present = new Set(
      spots.map((spot) => spot.area).filter(Boolean) as string[],
    );
    return areaGuides
      .filter((meta) => present.has(meta.slug))
      .map((meta) => ({ value: meta.slug, label: meta.label }));
  }, [spots]);

  /** 同じく、1件以上ある種類だけ。並びは一覧ページの章立てと同じ。 */
  const categoryOptions = useMemo(() => {
    const present = [...new Set(spots.map((spot) => spot.category))];
    return present
      .sort((a, b) => {
        const ai = CATEGORY_ORDER.indexOf(a);
        const bi = CATEGORY_ORDER.indexOf(b);
        return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
      })
      .map((slug) => ({ value: slug, label: categoryLabel(slug) }));
  }, [spots]);

  const matched = useMemo(() => {
    const q = query.trim().toLowerCase();
    return indexed
      .filter((spot) => (q ? spot.haystack.includes(q) : true))
      .filter((spot) => (area ? spot.area === area : true))
      .filter((spot) => (category ? spot.category === category : true))
      .filter((spot) => (freeOnly ? spot.isFree : true))
      .sort(
        (a, b) =>
          (b.recommendLevel ?? 0) - (a.recommendLevel ?? 0) ||
          a.name.localeCompare(b.name, "ja"),
      );
  }, [indexed, query, area, category, freeOnly]);

  // 絞り込みを変えたら先頭に戻す。7ページ目を開いたまま条件を変えると、
  // 結果が12件しかない絞り込みでも「もっと見る」を押した状態が残る。
  useEffect(() => {
    setLimit(PAGE_SIZE);
  }, [query, area, category, freeOnly]);

  const hasFilter = Boolean(query.trim() || area || category || freeOnly);
  const results = matched.slice(0, limit);
  const showDayPicker = dayCount !== undefined;
  const addDay = showDayPicker ? targetDay : day;

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

      {/*
        絞り込みは横に並べ、狭い画面では横スクロールにする。畳んで
        「絞り込む」の裏に隠すと、名前が出てこない人にとっての
        唯一の入口が、押してみるまで存在の分からないものになる。
      */}
      <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1 sm:flex-wrap sm:overflow-x-visible">
        <FilterChip active={!area} onClick={() => setArea(null)}>
          全エリア
        </FilterChip>
        {areaOptions.map((option) => (
          <FilterChip
            key={option.value}
            active={area === option.value}
            onClick={() => setArea(area === option.value ? null : option.value)}
          >
            {option.label}
          </FilterChip>
        ))}
      </div>

      <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1 sm:flex-wrap sm:overflow-x-visible">
        <FilterChip active={!category && !freeOnly} onClick={() => {
          setCategory(null);
          setFreeOnly(false);
        }}>
          すべて
        </FilterChip>
        <FilterChip active={freeOnly} onClick={() => setFreeOnly((on) => !on)}>
          無料
        </FilterChip>
        {categoryOptions.map((option) => (
          <FilterChip
            key={option.value}
            active={category === option.value}
            onClick={() =>
              setCategory(category === option.value ? null : option.value)
            }
          >
            {option.label}
          </FilterChip>
        ))}
      </div>

      {showDayPicker && (
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <label htmlFor="plan-picker-day" className="text-muted-foreground">
            追加先
          </label>
          <select
            id="plan-picker-day"
            value={targetDay}
            onChange={(e) => setTargetDay(Number(e.target.value))}
            className="rounded-full border border-border bg-background px-3 py-1.5 font-semibold"
          >
            {Array.from({ length: dayCount }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {n}日目に追加
              </option>
            ))}
            {dayCount < MAX_DAYS && (
              <option value={dayCount + 1}>{dayCount + 1}日目を作って追加</option>
            )}
          </select>
        </div>
      )}

      {full && (
        <p className="rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
          上限の{MAX_SPOTS}ヶ所に達しています。足すには、どれかを外してください。
        </p>
      )}

      {results.length === 0 ? (
        <div className="space-y-3 rounded-xl border border-dashed border-border px-4 py-6 text-center">
          <p className="text-sm text-muted-foreground">
            この条件に当てはまるスポットがありません。
          </p>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setArea(null);
              setCategory(null);
              setFreeOnly(false);
            }}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold transition hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400"
          >
            <X className="h-3.5 w-3.5" aria-hidden />
            絞り込みを外す
          </button>
        </div>
      ) : (
        <>
          <p className="text-xs text-muted-foreground">
            {hasFilter ? `${matched.length}件` : `掲載中の${matched.length}件`}
            のうち{results.length}件を表示しています。
          </p>
          <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border">
            {results.map((spot) => (
              <PickerRow key={spot.slug} spot={spot} day={addDay} full={full} />
            ))}
          </ul>
          {matched.length > results.length && (
            <button
              type="button"
              onClick={() => setLimit((n) => n + PAGE_SIZE)}
              className="w-full rounded-full border border-border bg-background px-4 py-2 text-xs font-semibold transition hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400"
            >
              あと{matched.length - results.length}件を見る
            </button>
          )}
        </>
      )}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`shrink-0 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
        active
          ? "border-indigo-600 bg-indigo-600 text-white"
          : "border-border bg-background text-muted-foreground hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400"
      }`}
    >
      {children}
    </button>
  );
}

function PickerRow({
  spot,
  day,
  full,
}: {
  spot: PlanSpot;
  /** 追加先の日。undefined なら最終日。 */
  day?: number;
  /** プランが上限に達しているか。押せないことを先に見せる。 */
  full: boolean;
}) {
  const addedDay = usePlanDay(spot.slug);
  const added = addedDay > 0;

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
        onClick={() =>
          added ? removeFromPlan(spot.slug) : addToPlan(spot.slug, day)
        }
        disabled={!added && full}
        aria-pressed={added}
        aria-label={
          added ? `${spot.name}をプランから外す` : `${spot.name}をプランに追加`
        }
        className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${
          added
            ? "border-indigo-600 bg-indigo-600 text-white hover:bg-indigo-700"
            : "border-border hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400"
        }`}
      >
        {added ? (
          <>
            <Check className="h-3.5 w-3.5" aria-hidden />
            {addedDay}日目
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
