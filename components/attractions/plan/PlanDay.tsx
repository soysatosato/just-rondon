"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  DoorClosed,
  Eraser,
  Map as MapIcon,
  Plus,
  Route,
  Wallet,
} from "lucide-react";

import {
  DAY_BUDGET_MINUTES,
  dayDirectionsUrl,
  formatClock,
  formatGbp,
  formatMinutes,
  orderByProximity,
  type DayPlan,
} from "@/lib/plan";
import { formatPlanDate } from "@/lib/plan/dates";
import { dayColor } from "./day-colors";
import PlanDayRow from "./PlanDayRow";
import type { DragState, DropTarget } from "./drag";
import { reorderDay, swapDays } from "./plan-store";

/**
 * 1日ぶんのカード。
 *
 * 見出しに終了時刻と帯を置いた。この画面で読者が最初に確かめたいのは
 * 「この日は収まるか」で、それに答えるのは合計の長さではなく
 * 「9:00に出て18:40に終わる」という時刻と、9時間の枠をどこまで
 * 使ったかの帯のほう。帯は滞在と移動を分けて積んである——移動が
 * 3割を占めている日は、並べ替えるだけで1ヶ所ぶんの時間が浮く。
 *
 * 地図はこのカードから外した。日ごとに1枚ずつ置くと、日をまたいで
 * 見比べることが構造的にできない。「この日を地図で」を押すと、
 * 上(狭い画面)または右(広い画面)の1枚がこの日に寄る。
 */
export default function PlanDay({
  plan,
  dayCount,
  date,
  focused,
  onFocus,
  onAdd,
  onClear,
  drag,
  drop,
  onDragStart,
  onDragEnd,
  onDropTarget,
}: {
  plan: DayPlan;
  /** プラン全体の日数。「◯日目へ移す」の選択肢と、日の入れ替えに要る。 */
  dayCount: number;
  /** 出発日が決まっているときのその日の日付。未設定なら null。 */
  date: Date | null;
  /** 地図がこの日に寄っているか。 */
  focused: boolean;
  onFocus: () => void;
  onAdd: () => void;
  onClear: () => void;
  drag: DragState;
  drop: DropTarget;
  onDragStart: (state: NonNullable<DragState>) => void;
  onDragEnd: () => void;
  onDropTarget: (target: DropTarget) => void;
}) {
  const spots = plan.rows.map((row) => row.spot);
  const totalMinutes = plan.stayMinutes + plan.travelMinutes;
  const directions = dayDirectionsUrl(spots);
  const color = dayColor(plan.day);

  // 並べ替えても結果が変わらないなら、押しても何も起きないボタンになる。
  const proximityOrder = orderByProximity(spots).map((spot) => spot.slug);
  const canReorder =
    spots.length > 2 && proximityOrder.some((slug, i) => slug !== spots[i].slug);

  /*
   * 帯の目盛り。9時間の枠に収まっているうちは枠いっぱいを100%とし、
   * はみ出した日はその日の長さを100%に取り直す。枠のほうを固定して
   * 越えたぶんを切り捨てると、11時間の日と9時間半の日が同じ満杯に見える。
   */
  const scale = Math.max(DAY_BUDGET_MINUTES, totalMinutes);
  const stayWidth = (plan.stayMinutes / scale) * 100;
  const travelWidth = (plan.travelMinutes / scale) * 100;
  const overBudget = totalMinutes > DAY_BUDGET_MINUTES;

  return (
    <section
      id={`plan-day-${plan.day}`}
      // 貼りついた要約の裏に見出しが隠れないよう、飛び先を下げておく。
      className={`scroll-mt-36 overflow-hidden rounded-2xl border bg-card transition print:break-inside-avoid print:rounded-none ${
        focused ? "border-foreground/30 shadow-sm" : "border-border"
      }`}
    >
      <header
        className="border-b border-border bg-muted/40 px-4 py-3"
        style={{ boxShadow: `inset 0 3px 0 0 ${color}` }}
        onDragOver={(e) => {
          if (!drag) return;
          e.preventDefault();
          // 見出しに落としたら、その日の先頭に入れる。
          onDropTarget({ day: plan.day, index: 0 });
        }}
      >
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
          <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
            <h2 className="text-lg font-bold tracking-tight">{plan.day}日目</h2>
            {date && (
              <span
                className="rounded-full px-2.5 py-0.5 text-xs font-semibold text-white"
                style={{ backgroundColor: color }}
              >
                {formatPlanDate(date)}
              </span>
            )}
            <span className="text-xs text-muted-foreground">
              {spots.length}ヶ所
            </span>
          </div>

          {/* 日そのものを動かす操作。中身を1件ずつ移し替えずに順番を変える。 */}
          <div className="flex items-center gap-1 print:hidden">
            <DayAction
              label={`${plan.day}日目を前の日と入れ替える`}
              disabled={plan.day === 1}
              onClick={() => swapDays(plan.day, plan.day - 1)}
            >
              <ChevronUp className="h-3.5 w-3.5" aria-hidden />
            </DayAction>
            <DayAction
              label={`${plan.day}日目を次の日と入れ替える`}
              disabled={plan.day === dayCount}
              onClick={() => swapDays(plan.day, plan.day + 1)}
            >
              <ChevronDown className="h-3.5 w-3.5" aria-hidden />
            </DayAction>
            <DayAction
              label={`${plan.day}日目のスポットを全部外す`}
              disabled={false}
              onClick={onClear}
            >
              <Eraser className="h-3.5 w-3.5" aria-hidden />
            </DayAction>
          </div>
        </div>

        <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
          <p className="font-bold tabular-nums">
            {formatClock(plan.startMinutes)}
            <span className="mx-1 font-normal text-muted-foreground">→</span>
            <span className={overBudget ? "text-red-600 dark:text-red-400" : ""}>
              {formatClock(plan.endMinutes)}
            </span>
          </p>
          <p className="tabular-nums text-muted-foreground">
            滞在{formatMinutes(plan.stayMinutes)} ＋ 移動
            {formatMinutes(plan.travelMinutes)}
          </p>
          <p className="flex items-center gap-1 font-semibold tabular-nums">
            <Wallet className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
            {formatGbp(plan.totalGbp)}
          </p>
        </div>

        {/*
          滞在と移動を積んだ帯。9時間の目盛りを立てておくと、越えている
          日は目盛りの右へ帯がはみ出す形になり、どれくらい越えたかが
          長さで読める。
        */}
        <div
          className="relative mt-2 h-1.5 w-full overflow-hidden rounded-full bg-border print:hidden"
          aria-hidden
        >
          <div className="flex h-full">
            <span
              className="h-full"
              style={{ width: `${stayWidth}%`, backgroundColor: color }}
            />
            <span
              className="h-full opacity-40"
              style={{ width: `${travelWidth}%`, backgroundColor: color }}
            />
          </div>
          {overBudget && (
            <span
              className="absolute inset-y-0 w-px bg-red-600"
              style={{ left: `${(DAY_BUDGET_MINUTES / scale) * 100}%` }}
            />
          )}
        </div>
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
            "その先の時刻もそのぶん遅くなります。滞在時間は各スポットの時計の欄から入れられます。"}
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

      <ol className="divide-y divide-border">
        {plan.rows.map((row, index) => (
          <PlanDayRow
            key={row.spot.slug}
            row={row}
            index={index}
            lastIndex={plan.rows.length - 1}
            day={plan.day}
            dayCount={dayCount}
            // 手前に滞在時間の分からないスポットがあれば、ここから先の
            // 時刻は「これより遅くなる」側にしかずれない。断りを付けて出す。
            clockUncertain={plan.rows
              .slice(0, index)
              .some((earlier) => earlier.stayMinutes === null)}
            drag={drag}
            onDragStart={() =>
              onDragStart({ slug: row.spot.slug, day: plan.day, index })
            }
            onDragEnd={onDragEnd}
            onDragOverRow={(position) =>
              onDropTarget({
                day: plan.day,
                index: position === "before" ? index : index + 1,
              })
            }
            dropBefore={drop?.day === plan.day && drop.index === index}
            dropAfter={
              drop?.day === plan.day &&
              index === plan.rows.length - 1 &&
              drop.index === plan.rows.length
            }
          />
        ))}
      </ol>

      <footer
        className="flex flex-wrap gap-2 border-t border-border bg-muted/20 px-4 py-3 print:hidden"
        onDragOver={(e) => {
          if (!drag) return;
          e.preventDefault();
          onDropTarget({ day: plan.day, index: plan.rows.length });
        }}
      >
        {/*
          追加をこの日の中にも置く。上の共通の追加からでも日は選べるが、
          「3日目が薄い」と気づいた位置から選び直させると、行き先を
          もう一度指定する手数が要る。ここから開けば行き先はこの日で入る。
        */}
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex items-center gap-1.5 rounded-full border border-indigo-300 bg-background px-3 py-1.5 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-50 dark:border-indigo-800 dark:text-indigo-300 dark:hover:bg-indigo-950/40"
        >
          <Plus className="h-3.5 w-3.5" aria-hidden />
          この日に追加
        </button>
        <button
          type="button"
          onClick={onFocus}
          aria-pressed={focused}
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
            focused
              ? "border-foreground bg-foreground text-background"
              : "border-border bg-background hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400"
          }`}
        >
          <MapIcon className="h-3.5 w-3.5" aria-hidden />
          {focused ? "地図に表示中" : "この日を地図で"}
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

function DayAction({
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
      title={label}
      className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition hover:border-indigo-400 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-30 dark:hover:text-indigo-400"
    >
      {children}
    </button>
  );
}
