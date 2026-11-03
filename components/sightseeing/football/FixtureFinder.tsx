"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CalendarRange, Check, Link2, MoveHorizontal, X } from "lucide-react";
import { useUrlState, type UrlStateCodec } from "@/hooks/use-url-state";
import type { FixtureView } from "@/lib/football/fixtures";
import { cn } from "@/lib/utils";

/**
 * 旅行の日付を入れると、その日程でロンドンで観られるプレミアリーグの
 * ホーム試合を出す。日付を入れていないときは、残りの試合を月ごとに全部出す
 * (サーバーの HTML にも全試合が載るので、検索にも出る)。
 *
 * 未確定の試合は同じ週末の金〜月(平日の節は火〜木)のどこかへ動くので、
 * 日程との重なり方で3つに分ける。
 *   観られる       動きうる範囲がまるごと日程の中
 *   外れうる       今の日付は日程の中だが、動くと外へ出うる
 *   入りうる       今の日付は日程の外だが、動くと中へ入りうる
 *
 * 日程は URL(?from=&to=)に持たせる。同行者に送れば同じ結果が開く
 * (クリスマス特集の StayPlanner と同じ作り)。
 */

type Range = { from: string; to: string };

/** 調べられる日程の長さ。月単位の候補(31日)より長く、1シーズン分より短く。 */
const MAX_RANGE_DAYS = 92;

function isRealDate(iso: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return false;
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d, 12));
  return date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
}

function daysBetween(from: string, to: string): number {
  return Math.round((Date.parse(to) - Date.parse(from)) / 86_400_000);
}

function isValidRange(range: Range): boolean {
  return (
    isRealDate(range.from) &&
    isRealDate(range.to) &&
    range.from <= range.to &&
    daysBetween(range.from, range.to) < MAX_RANGE_DAYS
  );
}

const codec: UrlStateCodec<Range | null> = {
  keys: ["from", "to"],
  parse: (params) => {
    const from = params.get("from");
    const to = params.get("to");
    if (!from || !to) return null;
    return isValidRange({ from, to }) ? { from, to } : null;
  },
  serialize: (state) =>
    state ? { from: state.from, to: state.to } : { from: null, to: null },
};

const WEEKDAY_JA = ["日", "月", "火", "水", "木", "金", "土"];

/** "2026-11-14" → "11月14日(土)" */
function formatDay(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const dow = new Date(Date.UTC(y, m - 1, d, 12)).getUTCDay();
  return `${m}月${d}日(${WEEKDAY_JA[dow]})`;
}

function addDays(iso: string, days: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + days, 12)).toISOString().slice(0, 10);
}

/** "2026-11" → その月の初日と末日。 */
function monthRange(month: string): Range {
  const [y, m] = month.split("-").map(Number);
  const last = new Date(Date.UTC(y, m, 0, 12)).getUTCDate();
  return { from: `${month}-01`, to: `${month}-${String(last).padStart(2, "0")}` };
}

function formatMonth(month: string): string {
  const [y, m] = month.split("-").map(Number);
  return `${y}年${m}月`;
}

const DIFFICULTY_CLASS: Record<FixtureView["difficulty"], string> = {
  "very-hard": "text-red-700 dark:text-red-400",
  hard: "text-amber-800 dark:text-amber-300",
  moderate: "text-emerald-700 dark:text-emerald-400",
  easy: "text-emerald-700 dark:text-emerald-400",
};

/** 土曜 14:45〜17:15 は英国で生中継できない(3pm blackout)。 */
function isBlackout(f: FixtureView): boolean {
  const dow = new Date(`${f.date}T12:00:00Z`).getUTCDay();
  return f.status === "confirmed" && !f.tv && dow === 6 && f.kickoff === "15:00";
}

function FixtureRow({ fixture: f }: { fixture: FixtureView }) {
  const provisional = f.status === "provisional";
  return (
    <li className="py-3">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <p className="text-sm font-semibold tabular-nums text-neutral-900 dark:text-neutral-100">
          {f.dateLabel}
          <span className="ml-2">
            {f.kickoff}
            {provisional && (
              <span className="ml-0.5 text-xs font-normal text-neutral-500 dark:text-neutral-400">
                (仮)
              </span>
            )}
          </span>
          <span className="ml-2 text-xs font-normal text-neutral-500 dark:text-neutral-400">
            日本時間 {f.jst}
          </span>
        </p>
        <span
          className={cn(
            "shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold",
            provisional
              ? "bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-200"
              : "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-200",
          )}
        >
          {provisional ? "日時は未確定" : "日時確定"}
        </span>
      </div>

      <p className="mt-1 text-base font-bold text-neutral-900 dark:text-neutral-100">
        {f.homeName}
        <span className="mx-1.5 text-sm font-normal text-neutral-500 dark:text-neutral-400">
          対
        </span>
        {f.awayName}
        {f.derby === "north-london" && (
          <Link
            href="/sightseeing/football/north-london-derby"
            className="ml-2 align-middle text-xs font-semibold text-link underline underline-offset-2"
          >
            ノース・ロンドン・ダービー
          </Link>
        )}
        {f.derby === "london" && (
          <span className="ml-2 align-middle text-xs font-semibold text-neutral-600 dark:text-neutral-400">
            ロンドン・ダービー
          </span>
        )}
      </p>

      <p className="mt-1 text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
        {f.stadium}
        <span aria-hidden="true"> ・ </span>
        チケット:
        <span className={cn("ml-0.5 font-semibold", DIFFICULTY_CLASS[f.difficulty])}>
          {f.difficultyLabel}
        </span>
        {f.tv && (
          <>
            <span aria-hidden="true"> ・ </span>英国で生中継({f.tv})
          </>
        )}
        {isBlackout(f) && (
          <>
            <span aria-hidden="true"> ・ </span>英国では生中継なし
          </>
        )}
      </p>

      {provisional && f.windowLabel && (
        <p className="mt-1 text-xs leading-relaxed text-amber-900 dark:text-amber-200">
          {f.windowLabel}のどこかに動く可能性があります。
          {f.confirmsIn && `${f.confirmsIn}に確定する予定です。`}
        </p>
      )}
      {f.note && (
        <p className="mt-1 text-xs leading-relaxed text-amber-900 dark:text-amber-200">
          {f.note}
        </p>
      )}
    </li>
  );
}

function EmptyWeekendRow({ saturday }: { saturday: string }) {
  const sunday = addDays(saturday, 1);
  return (
    <li className="py-2.5 text-xs text-neutral-500 dark:text-neutral-400">
      {formatDay(saturday)}〜{formatDay(sunday).replace(/^\d+月/, "")}の週末:
      ロンドンでのプレミアリーグの試合なし
    </li>
  );
}

/** 月ごとの一覧。試合の無い週末も日付の位置に挟む。 */
function MonthList({
  fixtures,
  emptyWeekends,
}: {
  fixtures: FixtureView[];
  emptyWeekends: string[];
}) {
  const months = Array.from(
    new Set([...fixtures.map((f) => f.month), ...emptyWeekends.map((s) => s.slice(0, 7))]),
  ).sort();

  return (
    <div className="space-y-8">
      {months.map((month) => {
        const rows = [
          ...fixtures
            .filter((f) => f.month === month)
            .map((f) => ({ key: f.id, date: f.date, fixture: f })),
          ...emptyWeekends
            .filter((s) => s.startsWith(month))
            .map((s) => ({ key: `empty-${s}`, date: s, fixture: null })),
        ].sort((a, b) => a.date.localeCompare(b.date));
        const count = rows.filter((r) => r.fixture).length;
        return (
          <section key={month} aria-labelledby={`month-${month}`}>
            <h3
              id={`month-${month}`}
              className="flex items-baseline gap-2 border-b border-neutral-300 pb-1.5 text-base font-bold text-neutral-900 dark:border-neutral-700 dark:text-neutral-100"
            >
              {formatMonth(month)}
              <span className="text-xs font-normal text-neutral-500 dark:text-neutral-400">
                {count}試合
              </span>
            </h3>
            <ul className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {rows.map((r) =>
                r.fixture ? (
                  <FixtureRow key={r.key} fixture={r.fixture} />
                ) : (
                  <EmptyWeekendRow key={r.key} saturday={r.date} />
                ),
              )}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

function TripGroup({
  title,
  icon: Icon,
  fixtures,
}: {
  title: string;
  icon: typeof Check;
  fixtures: FixtureView[];
}) {
  if (fixtures.length === 0) return null;
  return (
    <div>
      <h3 className="flex items-center gap-1.5 text-sm font-bold text-neutral-900 dark:text-neutral-100">
        <Icon className="h-4 w-4" aria-hidden="true" />
        {title}({fixtures.length})
      </h3>
      <ul className="divide-y divide-neutral-200 dark:divide-neutral-800">
        {fixtures.map((f) => (
          <FixtureRow key={f.id} fixture={f} />
        ))}
      </ul>
    </div>
  );
}

export default function FixtureFinder({
  fixtures,
  emptyWeekends,
}: {
  fixtures: FixtureView[];
  emptyWeekends: string[];
}) {
  const [range, setRange] = useUrlState(codec);
  // 入力途中の値。片方だけ入れた状態でも欄を消さないよう、URL とは別に持つ。
  const [draft, setDraft] = useState<Range>({ from: "", to: "" });
  const [copied, setCopied] = useState(false);

  const from = draft.from || range?.from || "";
  const to = draft.to || range?.to || "";
  const firstDate = fixtures[0]?.date ?? "";
  const lastDate = fixtures[fixtures.length - 1]?.date ?? "";
  const months = Array.from(new Set(fixtures.map((f) => f.month)));

  const trip = useMemo(() => {
    if (!range) return null;
    const inside = (d: string) => d >= range.from && d <= range.to;
    const overlaps = fixtures.filter(
      (f) => f.window.from <= range.to && f.window.to >= range.from,
    );
    return {
      sure: overlaps.filter(
        (f) => f.window.from >= range.from && f.window.to <= range.to,
      ),
      mayLeave: overlaps.filter(
        (f) => inside(f.date) && !(f.window.from >= range.from && f.window.to <= range.to),
      ),
      mayEnter: overlaps.filter((f) => !inside(f.date)),
      emptyWeekends: emptyWeekends.filter(
        (s) => s >= addDays(range.from, -1) && s <= range.to,
      ),
      afterSeason: !!lastDate && range.from > lastDate,
    };
  }, [range, fixtures, emptyWeekends, lastDate]);

  function update(next: Range) {
    setDraft(next);
    setCopied(false);
    setRange(next.from && next.to && isValidRange(next) ? next : null);
  }

  const invalid = !!from && !!to && !isValidRange({ from, to });

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-emerald-200 bg-white shadow-sm dark:border-emerald-900/60 dark:bg-neutral-900">
        <div className="border-b border-emerald-100 bg-emerald-50/70 p-4 dark:border-emerald-900/50 dark:bg-emerald-950/30 sm:p-5">
          <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
            <label className="block text-sm font-semibold text-neutral-800 dark:text-neutral-200">
              ロンドンに着く日
              <input
                type="date"
                value={from}
                min={firstDate}
                onChange={(e) => update({ from: e.target.value, to })}
                className="mt-1 block h-11 w-full rounded-lg border border-neutral-300 bg-white px-3 text-base text-neutral-900 dark:border-neutral-600 dark:bg-neutral-950 dark:text-neutral-100"
              />
            </label>
            <label className="block text-sm font-semibold text-neutral-800 dark:text-neutral-200">
              ロンドンを発つ日
              <input
                type="date"
                value={to}
                min={from || firstDate}
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
            <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">
              月で見る:
            </span>
            {months.map((month) => {
              const preset = monthRange(month);
              const active = range?.from === preset.from && range?.to === preset.to;
              return (
                <button
                  key={month}
                  type="button"
                  aria-pressed={active}
                  onClick={() => update(preset)}
                  className={cn(
                    "inline-flex h-9 items-center rounded-full px-3 text-sm font-medium ring-1 transition",
                    active
                      ? "bg-emerald-700 text-white ring-emerald-700"
                      : "bg-white text-neutral-800 ring-neutral-300 hover:ring-emerald-500 dark:bg-neutral-950 dark:text-neutral-200 dark:ring-neutral-600",
                  )}
                >
                  {Number(month.slice(5))}月
                </button>
              );
            })}
          </div>
          {invalid && (
            <p role="alert" className="mt-2 text-sm font-medium text-red-700 dark:text-red-400">
              発つ日は着く日と同じか後ろの日にしてください({MAX_RANGE_DAYS}日までの日程を調べられます)。
            </p>
          )}
        </div>

        <div className="p-4 sm:p-5" aria-live="polite">
          {!trip || !range ? (
            <p className="flex items-start gap-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
              <CalendarRange className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              着く日と発つ日を入れると、その日程でロンドンで観られる試合と、日時が動くと日程から外れうる試合を分けて出します。
            </p>
          ) : (
            <div className="space-y-6">
              <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                {formatDay(range.from)}〜{formatDay(range.to)}の
                {daysBetween(range.from, range.to) + 1}日間
              </p>

              {trip.sure.length + trip.mayLeave.length + trip.mayEnter.length === 0 && (
                <p className="text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
                  {trip.afterSeason ? (
                    <>
                      {`シーズンは${formatDay(lastDate)}の最終節で終わり、6〜7月はプレミアリーグの試合がありません。夏なら`}
                      <Link
                        href="/sightseeing/football/stadium-tours"
                        className="mx-1 text-link underline underline-offset-2"
                      >
                        スタジアムツアー
                      </Link>
                      でスタジアムの中に入れます。
                    </>
                  ) : (
                    "この日程には、ロンドンでのプレミアリーグのホーム試合がありません。"
                  )}
                </p>
              )}

              <TripGroup title="この日程で観られる試合" icon={Check} fixtures={trip.sure} />
              <TripGroup
                title="日時が動くと、日程から外れうる試合"
                icon={MoveHorizontal}
                fixtures={trip.mayLeave}
              />
              <TripGroup
                title="日時が動けば、日程に入りうる試合"
                icon={MoveHorizontal}
                fixtures={trip.mayEnter}
              />

              {trip.emptyWeekends.length > 0 && (
                <p className="text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
                  {trip.emptyWeekends
                    .map((s) => `${formatDay(s)}〜${formatDay(addDays(s, 1)).replace(/^\d+月/, "")}`)
                    .join("、")}
                  の週末は、ロンドンでのプレミアリーグの試合がありません。
                </p>
              )}

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

      {!range && (
        <div>
          <h2 className="mb-4 text-xl font-bold text-neutral-900 dark:text-neutral-100 md:text-2xl">
            残りの試合({fixtures.length}試合)
          </h2>
          <MonthList fixtures={fixtures} emptyWeekends={emptyWeekends} />
        </div>
      )}
    </div>
  );
}
