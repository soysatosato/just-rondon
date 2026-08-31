"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Bus,
  CalendarClock,
  Clock,
  Footprints,
  Map as MapIcon,
  Route,
  TrainFront,
  Wallet,
  X,
} from "lucide-react";

import {
  dayDirectionsUrl,
  formatGbp,
  formatMinutes,
  legLabel,
  orderByProximity,
  type DayPlan,
  type LegKind,
} from "@/lib/sightseeing/plan";
import { MAX_DAYS } from "@/lib/sightseeing/plan";
import {
  moveToDay,
  moveWithinDay,
  removeFromPlan,
  reorderDay,
} from "./plan-store";

const LEG_ICONS: Record<LegKind, typeof Footprints> = {
  walk: Footprints,
  transit: TrainFront,
  daytrip: Bus,
};

/**
 * 1日ぶんのカード。
 *
 * 合計を上に置いているのは、この画面で読者が最初に確かめたいのが
 * 「この日は収まるか」だから。スポットの並びは、それが収まらないと
 * 分かってから直すもので、順序が逆だと1件ずつ足しては下までスクロール
 * することになる。
 */
export default function PlanDay({
  plan,
  dayCount,
}: {
  plan: DayPlan;
  /** プラン全体の日数。「◯日目へ移す」の選択肢を作るのに要る。 */
  dayCount: number;
}) {
  const spots = plan.rows.map((row) => row.spot);
  const totalMinutes = plan.stayMinutes + plan.travelMinutes;
  const directions = dayDirectionsUrl(spots);

  // 並べ替えても結果が変わらないなら、押しても何も起きないボタンになる。
  const proximityOrder = orderByProximity(spots).map((spot) => spot.slug);
  const canReorder =
    spots.length > 2 &&
    proximityOrder.some((slug, i) => slug !== spots[i].slug);

  return (
    <section className="overflow-hidden rounded-2xl border border-border">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-muted/40 px-4 py-3">
        <div className="flex items-baseline gap-3">
          <h2 className="text-lg font-bold tracking-tight">{plan.day}日目</h2>
          <span className="text-xs text-muted-foreground">
            {spots.length}ヶ所
          </span>
        </div>

        <dl className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
            <dt className="sr-only">滞在と移動の合計</dt>
            <dd className="font-semibold tabular-nums">
              {formatMinutes(totalMinutes)}
              <span className="ml-1 font-normal text-muted-foreground">
                (滞在{formatMinutes(plan.stayMinutes)} ＋ 移動
                {formatMinutes(plan.travelMinutes)})
              </span>
            </dd>
          </div>
          <div className="flex items-center gap-1.5">
            <Wallet className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
            <dt className="sr-only">大人1人の入場料の合計</dt>
            <dd className="font-semibold tabular-nums">
              {formatGbp(plan.totalGbp)}
            </dd>
          </div>
        </dl>
      </header>

      {(plan.unknownDurationCount > 0 || plan.unknownPriceCount > 0) && (
        <p className="border-b border-border bg-muted/20 px-4 py-2 text-[11px] text-muted-foreground">
          {[
            plan.unknownDurationCount > 0
              ? `所要時間の目安がない${plan.unknownDurationCount}ヶ所`
              : null,
            plan.unknownPriceCount > 0
              ? `料金の分からない${plan.unknownPriceCount}ヶ所`
              : null,
          ]
            .filter(Boolean)
            .join("と")}
          は合計に入っていません。実際はこれより増えます。
        </p>
      )}

      {plan.warnings.length > 0 && (
        <ul className="space-y-2 border-b border-border bg-amber-50 px-4 py-3 dark:bg-amber-950/30">
          {plan.warnings.map((warning) => (
            <li
              key={warning.kind}
              className="flex items-start gap-2 text-xs leading-relaxed text-amber-900 dark:text-amber-200"
            >
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
              <span>
                {warning.message}
                {warning.kind === "big-venues" && (
                  <>
                    {" "}
                    <Link
                      href="/sightseeing/itinerary"
                      className="underline underline-offset-2"
                    >
                      モデルコースの組み方
                    </Link>
                  </>
                )}
              </span>
            </li>
          ))}
        </ul>
      )}

      <ol className="divide-y divide-border">
        {plan.rows.map((row, index) => {
          const LegIcon = row.legFromPrevious
            ? LEG_ICONS[row.legFromPrevious.kind]
            : null;

          return (
            <li key={row.spot.slug}>
              {row.legFromPrevious && LegIcon && (
                <p className="flex items-center gap-2 border-b border-dashed border-border bg-muted/20 px-4 py-1.5 text-[11px] text-muted-foreground">
                  <LegIcon className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  {legLabel(row.legFromPrevious)}
                </p>
              )}

              <div className="flex gap-3 p-4">
                <span
                  className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white"
                  aria-hidden
                >
                  {index + 1}
                </span>

                <img
                  src={row.spot.image}
                  alt=""
                  className="hidden h-16 w-16 shrink-0 rounded-lg object-cover sm:block"
                  loading="lazy"
                  decoding="async"
                />

                <div className="min-w-0 flex-1 space-y-1.5">
                  <Link
                    href={`/sightseeing/${row.spot.slug}`}
                    className="block font-semibold leading-snug hover:text-indigo-600 hover:underline underline-offset-4 dark:hover:text-indigo-400"
                  >
                    {row.spot.name}
                  </Link>

                  <dl className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                    {row.spot.durationText && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 shrink-0" aria-hidden />
                        <dt className="sr-only">滞在時間の目安</dt>
                        <dd>{row.spot.durationText}</dd>
                      </div>
                    )}
                    {row.spot.priceAdult && (
                      <div className="flex items-center gap-1">
                        <Wallet className="h-3 w-3 shrink-0" aria-hidden />
                        <dt className="sr-only">大人料金</dt>
                        <dd>{row.spot.priceAdult}</dd>
                      </div>
                    )}
                    {row.spot.openingHours && (
                      <div className="flex min-w-0 items-center gap-1">
                        <CalendarClock className="h-3 w-3 shrink-0" aria-hidden />
                        <dt className="sr-only">開館時間</dt>
                        <dd className="truncate">{row.spot.openingHours}</dd>
                      </div>
                    )}
                  </dl>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <div className="flex items-center rounded-full border border-border">
                      <IconButton
                        label={`${row.spot.name}を前に動かす`}
                        disabled={index === 0}
                        onClick={() => moveWithinDay(row.spot.slug, -1)}
                      >
                        <ArrowUp className="h-3.5 w-3.5" aria-hidden />
                      </IconButton>
                      <IconButton
                        label={`${row.spot.name}を後ろに動かす`}
                        disabled={index === plan.rows.length - 1}
                        onClick={() => moveWithinDay(row.spot.slug, 1)}
                      >
                        <ArrowDown className="h-3.5 w-3.5" aria-hidden />
                      </IconButton>
                    </div>

                    <label className="sr-only" htmlFor={`day-${row.spot.slug}`}>
                      {row.spot.name}を移す日
                    </label>
                    <select
                      id={`day-${row.spot.slug}`}
                      value={plan.day}
                      onChange={(e) =>
                        moveToDay(row.spot.slug, Number(e.target.value))
                      }
                      className="rounded-full border border-border bg-background px-2.5 py-1 text-[11px]"
                    >
                      {Array.from({ length: dayCount }, (_, i) => i + 1).map(
                        (day) => (
                          <option key={day} value={day}>
                            {day}日目
                          </option>
                        ),
                      )}
                      {dayCount < MAX_DAYS && (
                        <option value={dayCount + 1}>
                          {dayCount + 1}日目を作る
                        </option>
                      )}
                    </select>

                    <button
                      type="button"
                      onClick={() => removeFromPlan(row.spot.slug)}
                      className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-[11px] text-muted-foreground transition hover:border-red-400 hover:text-red-600 dark:hover:text-red-400"
                    >
                      <X className="h-3 w-3" aria-hidden />
                      外す
                    </button>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ol>

      {(canReorder || directions) && (
        <footer className="flex flex-wrap gap-2 border-t border-border bg-muted/20 px-4 py-3">
          {canReorder && (
            <button
              type="button"
              onClick={() => reorderDay(plan.day, proximityOrder)}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium transition hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400"
            >
              <Route className="h-3.5 w-3.5" aria-hidden />
              近い順に並べ替える
            </button>
          )}
          {directions && (
            <a
              href={directions}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium transition hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400"
            >
              <MapIcon className="h-3.5 w-3.5" aria-hidden />
              この順路をGoogleマップで開く
            </a>
          )}
        </footer>
      )}
    </section>
  );
}

function IconButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="px-2 py-1 text-muted-foreground transition first:rounded-l-full last:rounded-r-full hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-30 dark:hover:text-indigo-400"
    >
      {children}
    </button>
  );
}
