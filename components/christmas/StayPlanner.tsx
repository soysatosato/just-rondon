"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CalendarRange, Check, Clock3, Link2, TriangleAlert, X } from "lucide-react";
import { useUrlState, type UrlStateCodec } from "@/hooks/use-url-state";
import type { ResolvedItem } from "@/lib/christmas";
import type { SpecialDay } from "@/lib/christmas/days";
import { KIND_LABELS, KIND_ORDER } from "@/lib/christmas/kinds";
import { daysBetween, formatDay } from "@/lib/christmas/season";
import {
  MAX_STAY_DAYS,
  evaluateStay,
  isValidStay,
  type ItemStay,
  type StayRange,
} from "@/lib/christmas/stay";
import type { VenueClosure } from "@/lib/christmas/types";
import { cn } from "@/lib/utils";

/**
 * 滞在日を入れると、その日程で開いている灯り・マーケット・リンク・催しと、
 * 休む館、交通が止まる日を出す。
 *
 * 日程は URL(?from=&to=)に持たせる。同行者に送れば同じ結果が開く。
 * サーバーは日程を知らずに描く(use-url-state の方針)ので、最初の描画は
 * 入力欄だけで、結果は URL を読んだあとに出る。
 */

const codec: UrlStateCodec<StayRange | null> = {
  keys: ["from", "to"],
  parse: (params) => {
    const from = params.get("from");
    const to = params.get("to");
    if (!from || !to) return null;
    const range = { from, to };
    return isValidStay(range) ? range : null;
  },
  serialize: (state) =>
    state ? { from: state.from, to: state.to } : { from: null, to: null },
};

export type StayPayload = {
  year: number;
  items: ResolvedItem[];
  closures: VenueClosure[];
  specialDays: SpecialDay[];
  bankHolidays: { date: string; title: string; substitute: boolean }[];
};

function presets(year: number): { label: string; range: StayRange }[] {
  return [
    { label: "11月下旬", range: { from: `${year}-11-21`, to: `${year}-11-27` } },
    { label: "12月中旬", range: { from: `${year}-12-12`, to: `${year}-12-18` } },
    { label: "クリスマス週", range: { from: `${year}-12-21`, to: `${year}-12-27` } },
    { label: "年末年始", range: { from: `${year}-12-27`, to: `${year + 1}-01-03` } },
  ];
}

function StayRow({ stay, tone }: { stay: ItemStay; tone: "ok" | "partial" | "no" | "tbd" }) {
  return (
    <li className="flex items-start justify-between gap-3 py-2">
      <Link
        href={stay.item.href}
        className="min-w-0 text-sm font-medium text-neutral-900 underline-offset-2 hover:underline dark:text-neutral-100"
      >
        {stay.item.title}
      </Link>
      <span
        className={cn(
          "shrink-0 text-right text-xs font-semibold tabular-nums",
          tone === "ok" && "text-emerald-700 dark:text-emerald-400",
          tone === "partial" && "text-amber-800 dark:text-amber-300",
          tone === "no" && "text-neutral-500 dark:text-neutral-400",
          tone === "tbd" && "text-amber-800 dark:text-amber-300",
        )}
      >
        {stay.detail}
      </span>
    </li>
  );
}

function Group({
  title,
  icon: Icon,
  stays,
  tone,
}: {
  title: string;
  icon: typeof Check;
  stays: ItemStay[];
  tone: "ok" | "partial" | "no" | "tbd";
}) {
  if (stays.length === 0) return null;
  return (
    <div>
      <h3 className="flex items-center gap-1.5 text-sm font-bold text-neutral-900 dark:text-neutral-100">
        <Icon className="h-4 w-4" aria-hidden="true" />
        {title}({stays.length})
      </h3>
      {KIND_ORDER.map((kind) => {
        const rows = stays.filter((s) => s.item.kind === kind);
        if (rows.length === 0) return null;
        return (
          <div key={kind} className="mt-2">
            <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
              {KIND_LABELS[kind]}
            </p>
            <ul className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {rows.map((stay) => (
                <StayRow key={stay.item.slug} stay={stay} tone={tone} />
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

export default function StayPlanner({ payload }: { payload: StayPayload }) {
  const [range, setRange] = useUrlState(codec);
  // 入力途中の値。from だけ入れた状態でも欄を消さないよう、URL とは別に持つ。
  const [draft, setDraft] = useState<{ from: string; to: string }>({ from: "", to: "" });
  const [copied, setCopied] = useState(false);

  const from = draft.from || range?.from || "";
  const to = draft.to || range?.to || "";

  const result = useMemo(
    () => (range ? evaluateStay(range, payload) : null),
    [range, payload],
  );

  function update(next: { from: string; to: string }) {
    setDraft(next);
    setCopied(false);
    const candidate = { from: next.from, to: next.to };
    setRange(next.from && next.to && isValidStay(candidate) ? candidate : null);
  }

  const invalid =
    !!from && !!to && !isValidStay({ from, to });

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="rounded-2xl border border-emerald-200 bg-white shadow-sm dark:border-emerald-900/60 dark:bg-neutral-900">
      <div className="border-b border-emerald-100 bg-emerald-50/70 p-4 dark:border-emerald-900/50 dark:bg-emerald-950/30 sm:p-5">
        <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <label className="block text-sm font-semibold text-neutral-800 dark:text-neutral-200">
            着く日
            <input
              type="date"
              value={from}
              min={`${payload.year}-10-01`}
              max={`${payload.year + 1}-01-31`}
              onChange={(e) => update({ from: e.target.value, to })}
              className="mt-1 block h-11 w-full rounded-lg border border-neutral-300 bg-white px-3 text-base text-neutral-900 dark:border-neutral-600 dark:bg-neutral-950 dark:text-neutral-100"
            />
          </label>
          <label className="block text-sm font-semibold text-neutral-800 dark:text-neutral-200">
            発つ日
            <input
              type="date"
              value={to}
              min={from || `${payload.year}-10-01`}
              max={`${payload.year + 1}-01-31`}
              onChange={(e) => update({ from, to: e.target.value })}
              className="mt-1 block h-11 w-full rounded-lg border border-neutral-300 bg-white px-3 text-base text-neutral-900 dark:border-neutral-600 dark:bg-neutral-950 dark:text-neutral-100"
            />
          </label>
          {range && (
            <button
              type="button"
              onClick={() => update({ from: "", to: "" })}
              className="inline-flex h-11 items-center justify-center gap-1 rounded-lg px-3 text-sm font-medium text-neutral-600 hover:bg-white/70 dark:text-neutral-300 dark:hover:bg-neutral-800"
            >
              <X className="h-4 w-4" aria-hidden="true" />
              消す
            </button>
          )}
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">よくある日程:</span>
          {presets(payload.year).map((preset) => {
            const active = range?.from === preset.range.from && range?.to === preset.range.to;
            return (
              <button
                key={preset.label}
                type="button"
                aria-pressed={active}
                onClick={() => update(preset.range)}
                className={cn(
                  "inline-flex h-9 items-center rounded-full px-3 text-sm font-medium ring-1 transition",
                  active
                    ? "bg-emerald-700 text-white ring-emerald-700"
                    : "bg-white text-neutral-800 ring-neutral-300 hover:ring-emerald-500 dark:bg-neutral-950 dark:text-neutral-200 dark:ring-neutral-600",
                )}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
        {invalid && (
          <p role="alert" className="mt-2 text-sm font-medium text-red-700 dark:text-red-400">
            発つ日は着く日と同じか後ろの日にしてください({MAX_STAY_DAYS}日までの日程を調べられます)。
          </p>
        )}
      </div>

      <div className="p-4 sm:p-5" aria-live="polite">
        {!result ? (
          <p className="flex items-start gap-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
            <CalendarRange className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            着く日と発つ日を入れると、その日程で開いている灯り・マーケット・リンク・催しと、休む美術館、交通が止まる日が出ます。
          </p>
        ) : (
          <div className="space-y-6">
            <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              {formatDay(range!.from)}〜{formatDay(range!.to)}の{daysBetween(range!.from, range!.to) + 1}日間
            </p>

            {(result.specialDays.length > 0 ||
              result.bankHolidays.length > 0 ||
              result.closures.length > 0 ||
              result.longTerm.length > 0) && (
              <div className="rounded-xl border border-red-200 bg-red-50/70 p-4 dark:border-red-900/60 dark:bg-red-950/20">
                <h3 className="flex items-center gap-1.5 text-sm font-bold text-red-900 dark:text-red-200">
                  <TriangleAlert className="h-4 w-4" aria-hidden="true" />
                  この日程で気をつける日
                </h3>
                <ul className="mt-2 space-y-1.5 text-sm leading-relaxed text-neutral-800 dark:text-neutral-200">
                  {result.specialDays.map(({ date, day }) => (
                    <li key={date}>
                      <span className="font-semibold">{formatDay(date)} {day.name}</span>: {day.headline}
                    </li>
                  ))}
                  {result.bankHolidays
                    .filter((b) => b.substitute)
                    .map((b) => (
                      <li key={b.date}>
                        <span className="font-semibold">{formatDay(b.date)} 振替休日</span>
                        : 銀行と役所は休み。鉄道は工事で運休・バス代行になる区間がある
                      </li>
                    ))}
                  {result.closures.map(({ dates, names }) => (
                    <li key={dates.join()}>
                      <span className="font-semibold">{dates.map(formatDay).join("・")}は休み</span>: {names.join("、")}
                    </li>
                  ))}
                  {result.longTerm.length > 0 && (
                    <li>
                      <span className="font-semibold">長期休館中</span>: {result.longTerm.join("、")}
                    </li>
                  )}
                </ul>
                <p className="mt-2 text-xs text-neutral-600 dark:text-neutral-400">
                  1日ずつの案内は下の「12月24日〜1月1日」の節に、館ごとの営業は
                  <Link href="/events/christmas/christmas-day#hours" className="mx-1 text-link underline underline-offset-2">
                    年末年始の営業の早見表
                  </Link>
                  にあります。
                </p>
              </div>
            )}

            <Group title="滞在中ずっと開いている" icon={Check} stays={result.allDays} tone="ok" />
            <Group title="一部の日だけ開いている" icon={Clock3} stays={result.someDays} tone="partial" />
            <Group title="この日程では見られない" icon={X} stays={result.noDays} tone="no" />
            <Group title="日程がまだ発表されていない" icon={CalendarRange} stays={result.unannounced} tone="tbd" />

            <div className="flex flex-wrap items-center gap-3 border-t border-neutral-200 pt-4 dark:border-neutral-800">
              <button
                type="button"
                onClick={copyLink}
                className="inline-flex h-11 items-center gap-1.5 rounded-full bg-emerald-700 px-5 text-sm font-semibold text-white transition hover:bg-emerald-800"
              >
                <Link2 className="h-4 w-4" aria-hidden="true" />
                {copied ? "リンクをコピーしました" : "この日程のリンクをコピー"}
              </button>
              <p className="text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
                リンクを同行者に送ると、同じ日程の結果が開きます。
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
