"use client";

import { Check, Link2, Plus, Printer, Trash2 } from "lucide-react";

import {
  DAY_BUDGET_MINUTES,
  formatClock,
  formatGbp,
  formatMinutes,
  type DayPlan,
} from "@/lib/plan";
import { dayColor } from "./day-colors";

/**
 * 画面の上に貼りつく旅程の要約。
 *
 * 以前、合計は本文の先頭に1度だけ置いてあった。3日ぶんのカードを開くと
 * 縦に数千pxになるので、5日目を直している最中に合計を見るには上まで
 * 戻るしかない。この道具の答えが「合計」なのに、直している間だけ
 * それが見えないという配分になっていた。
 *
 * 日程チップを並べているのは、同じ理由で移動のため。「3日目が薄い」と
 * 気づいたときの移動手段が、これまではスクロールだけだった。
 * チップにはその日の埋まり具合を帯で出してある——数字を4つ並べるより、
 * 帯が4本並んでいるほうが「2日目だけ突き出ている」が速く読める。
 *
 * 印刷では消す。紙には貼りつく場所も押す先も無い。
 */
export default function PlanSummaryBar({
  days,
  spotCount,
  totalGbp,
  totalMinutes,
  unknownPriceCount,
  focusDay,
  onSelectDay,
  onAdd,
  onShare,
  onPrint,
  onClear,
  shareCopied,
}: {
  days: DayPlan[];
  spotCount: number;
  totalGbp: number;
  totalMinutes: number;
  unknownPriceCount: number;
  /** いま選ばれている日。地図と連動する。null は全日程。 */
  focusDay: number | null;
  onSelectDay: (day: number | null) => void;
  onAdd: () => void;
  onShare: () => void;
  onPrint: () => void;
  onClear: () => void;
  shareCopied: boolean;
}) {
  return (
    <div className="sticky top-0 z-30 -mx-4 mb-5 border-b border-border bg-background/95 px-4 py-2.5 backdrop-blur supports-[backdrop-filter]:bg-background/80 print:hidden">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
        <dl className="flex flex-wrap items-baseline gap-x-5 gap-y-1">
          <Figure label="日数" value={`${days.length}日`} />
          <Figure label="スポット" value={`${spotCount}ヶ所`} />
          <Figure
            label="入場料"
            value={formatGbp(totalGbp)}
            note={unknownPriceCount > 0 ? `${unknownPriceCount}ヶ所不明` : undefined}
          />
          <Figure label="滞在＋移動" value={formatMinutes(totalMinutes)} />
        </dl>

        <div className="ml-auto flex items-center gap-1.5">
          <button
            type="button"
            onClick={onAdd}
            className="inline-flex items-center gap-1.5 rounded-full bg-indigo-600 px-3.5 py-2 text-xs font-bold text-white transition hover:bg-indigo-700"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden />
            スポットを追加
          </button>
          <IconAction label={shareCopied ? "コピーしました" : "共有リンクを作る"} onClick={onShare}>
            {shareCopied ? (
              <Check className="h-4 w-4 text-indigo-600 dark:text-indigo-400" aria-hidden />
            ) : (
              <Link2 className="h-4 w-4" aria-hidden />
            )}
          </IconAction>
          <IconAction label="印刷する" onClick={onPrint} className="hidden sm:inline-flex">
            <Printer className="h-4 w-4" aria-hidden />
          </IconAction>
          <IconAction label="プランをすべて消す" onClick={onClear} danger>
            <Trash2 className="h-4 w-4" aria-hidden />
          </IconAction>
        </div>
      </div>

      {/*
        日程チップ。狭い画面では横に流す。畳んで隠さないのは、これが
        「いまどの日を見ているか」の唯一の目印を兼ねているため。
      */}
      <div className="-mx-1 mt-2 flex gap-1.5 overflow-x-auto px-1 pb-0.5">
        <button
          type="button"
          onClick={() => onSelectDay(null)}
          aria-pressed={focusDay === null}
          className={`shrink-0 rounded-full border px-3 py-1.5 text-[11px] font-bold transition ${
            focusDay === null
              ? "border-foreground bg-foreground text-background"
              : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
          }`}
        >
          全日程
        </button>
        {days.map((day) => (
          <DayChip
            key={day.day}
            day={day}
            active={focusDay === day.day}
            onClick={() => onSelectDay(day.day)}
          />
        ))}
      </div>
    </div>
  );
}

function Figure({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note?: string;
}) {
  return (
    <div className="flex items-baseline gap-1.5">
      <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </dt>
      <dd className="text-base font-bold tabular-nums leading-none">
        {value}
        {note && (
          <span className="ml-1 text-[10px] font-normal text-muted-foreground">
            ({note})
          </span>
        )}
      </dd>
    </div>
  );
}

function IconAction({
  label,
  onClick,
  children,
  danger,
  className = "",
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
  danger?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background transition ${
        danger
          ? "text-red-600 hover:border-red-400 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
          : "text-muted-foreground hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400"
      } ${className}`}
    >
      {children}
    </button>
  );
}

/**
 * 1日ぶんのチップ。帯は9時間の予算をどこまで使ったか。
 *
 * 予算を越えた日は帯を赤で出し、100%で止める。伸ばし続けると
 * 「どれくらい越えているか」は分かるが、隣の日と長さが比べられなくなる。
 * 越えた量は終了時刻(20:40)のほうが具体的に伝わるので、そちらに任せる。
 */
function DayChip({
  day,
  active,
  onClick,
}: {
  day: DayPlan;
  active: boolean;
  onClick: () => void;
}) {
  const used = day.stayMinutes + day.travelMinutes;
  const over = used > DAY_BUDGET_MINUTES;
  const ratio = Math.min(1, used / DAY_BUDGET_MINUTES);
  const color = dayColor(day.day);
  const hasAlert = day.warnings.length > 0;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`shrink-0 rounded-xl border px-2.5 py-1.5 text-left transition ${
        active
          ? "border-foreground bg-muted"
          : "border-border hover:border-foreground/40 hover:bg-muted/50"
      }`}
    >
      <span className="flex items-center gap-1.5 whitespace-nowrap text-[11px] font-bold leading-none">
        <span
          className="h-2 w-2 shrink-0 rounded-full"
          style={{ backgroundColor: color }}
          aria-hidden
        />
        {day.day}日目
        <span className="font-normal tabular-nums text-muted-foreground">
          {formatClock(day.endMinutes)}
        </span>
        {hasAlert && (
          <span
            className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500"
            aria-label="警告あり"
          />
        )}
      </span>
      <span
        className="mt-1.5 block h-1 w-full overflow-hidden rounded-full bg-border"
        aria-hidden
      >
        <span
          className="block h-full rounded-full"
          style={{
            width: `${Math.max(4, ratio * 100)}%`,
            backgroundColor: over ? "#dc2626" : color,
          }}
        />
      </span>
    </button>
  );
}
