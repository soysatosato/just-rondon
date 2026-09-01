"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Bus,
  CalendarClock,
  Clock,
  DoorClosed,
  Footprints,
  Map as MapIcon,
  MapPin,
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
} from "@/lib/plan";
import { MAX_DAYS } from "@/lib/plan";
import { formatPlanDate } from "@/lib/plan/dates";
import PlanStayEditor from "./PlanStayEditor";
import {
  moveToDay,
  moveWithinDay,
  removeFromPlan,
  reorderDay,
} from "./plan-store";

/**
 * 地図は leaflet が window を触るのでサーバーでは描けない。
 * ここで分けておくと、地図を開かない読者には bundle も届かない。
 */
const PlanDayMap = dynamic(() => import("./PlanDayMap"), {
  ssr: false,
  loading: () => (
    <div className="h-[260px] w-full animate-pulse bg-muted sm:h-[320px]" />
  ),
});

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
 *
 * 地図は最初の3日ぶんだけ開いた状態で出す。順路が一筆書きなのか行ったり
 * 来たりなのかは「徒歩12分」を4つ並べても読み取れず、地図でしか分からない
 * ので、畳んで出すとこの道具でいちばん効く情報を自分から隠すことになる。
 * 一方で上限の10日ぶんを一度に開くとタイルの取得が10面ぶん走る。
 * 3日も見れば地図が何を示すかは伝わるので、そこで足切りしている。
 */
const OPEN_MAP_UNTIL_DAY = 3;
export default function PlanDay({
  plan,
  dayCount,
  date,
}: {
  plan: DayPlan;
  /** プラン全体の日数。「◯日目へ移す」の選択肢を作るのに要る。 */
  dayCount: number;
  /** 出発日が決まっているときのその日の日付。未設定なら null。 */
  date: Date | null;
}) {
  const [showMap, setShowMap] = useState(plan.day <= OPEN_MAP_UNTIL_DAY);

  const spots = plan.rows.map((row) => row.spot);
  const totalMinutes = plan.stayMinutes + plan.travelMinutes;
  const directions = dayDirectionsUrl(spots);

  // 並べ替えても結果が変わらないなら、押しても何も起きないボタンになる。
  const proximityOrder = orderByProximity(spots).map((spot) => spot.slug);
  const canReorder =
    spots.length > 2 &&
    proximityOrder.some((slug, i) => slug !== spots[i].slug);

  return (
    <section className="overflow-hidden rounded-2xl border border-border print:break-inside-avoid print:rounded-none">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-muted/40 px-4 py-3">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h2 className="text-lg font-bold tracking-tight">{plan.day}日目</h2>
          {date && (
            <span className="rounded-full bg-indigo-600/10 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300">
              {formatPlanDate(date)}
            </span>
          )}
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
          {plan.unknownDurationCount > 0 &&
            "滞在時間は各スポットの時計の欄から入れられます。"}
        </p>
      )}

      {plan.warnings.length > 0 && (
        <ul className="divide-y divide-border border-b border-border">
          {plan.warnings.map((warning) => {
            // 休館日だけ色を分ける。詰め込みすぎは現地で削れるが、
            // 閉まっている日に行くのは出発前にしか直せない。
            const isClosed = warning.kind === "closed";
            const Icon = isClosed ? DoorClosed : AlertTriangle;
            return (
              <li
                key={warning.kind}
                className={`flex items-start gap-2 px-4 py-3 text-xs leading-relaxed ${
                  isClosed
                    ? "bg-red-50 text-red-900 dark:bg-red-950/30 dark:text-red-200"
                    : "bg-amber-50 text-amber-900 dark:bg-amber-950/30 dark:text-amber-200"
                }`}
              >
                <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
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
            );
          })}
        </ul>
      )}

      {/* 地図。印刷では出さない——タイルは読み込みに繋がりが要る。 */}
      {showMap && spots.length > 0 && (
        <div className="border-b border-border print:hidden">
          <PlanDayMap spots={spots} />
        </div>
      )}

      <ol className="divide-y divide-border">
        {plan.rows.map((row, index) => {
          const LegIcon = row.legFromPrevious
            ? LEG_ICONS[row.legFromPrevious.kind]
            : null;

          return (
            <li key={row.spot.slug} className="print:break-inside-avoid">
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
                  className="hidden h-16 w-16 shrink-0 rounded-lg object-cover sm:block print:hidden"
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

                  {row.closedOn && (
                    <p className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-semibold text-red-800 dark:bg-red-950/50 dark:text-red-200">
                      <DoorClosed className="h-3 w-3 shrink-0" aria-hidden />
                      この日は休み（{row.closedOn}休）
                    </p>
                  )}

                  <dl className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                    {/*
                      掲載値の無いスポットでも出す。42件が滞在時間を持って
                      おらず、そこが合計から落ちたままなのがこの道具の
                      いちばん大きな穴だった。入口が無いと埋めようがない。
                    */}
                    <div>
                      <dt className="sr-only">滞在時間</dt>
                      <dd>
                        <PlanStayEditor row={row} />
                      </dd>
                    </div>
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
                        <dd className="truncate print:whitespace-normal">
                          {row.spot.openingHours}
                        </dd>
                      </div>
                    )}
                  </dl>

                  {/*
                    住所は画面では隠し、印刷にだけ出す。現地で紙を見る人には
                    いちばん要る一行だが、画面では1行増えるだけで、
                    タップすれば詳細ページに全部載っている。
                  */}
                  {row.spot.address && row.spot.address !== "-" && (
                    <p className="hidden items-start gap-1 text-[11px] text-muted-foreground print:flex">
                      <MapPin className="mt-0.5 h-3 w-3 shrink-0" aria-hidden />
                      {row.spot.address}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-2 pt-1 print:hidden">
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

      <footer className="flex flex-wrap gap-2 border-t border-border bg-muted/20 px-4 py-3 print:hidden">
        <button
          type="button"
          onClick={() => setShowMap((open) => !open)}
          aria-expanded={showMap}
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium transition hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400"
        >
          <MapIcon className="h-3.5 w-3.5" aria-hidden />
          {showMap ? "地図を閉じる" : "地図を見る"}
        </button>
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
