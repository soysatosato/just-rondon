import Link from "next/link";
import { TriangleAlert } from "lucide-react";
import type { WeeklyBrief, WeeklyBriefItem } from "@prisma/client";

import { Button } from "@/components/ui/button";
import {
  formatWeekRange,
  getIssueFreshness,
  getKindMeta,
  isEndingThisWeek,
} from "@/lib/weekly";
import { londonDate } from "@/lib/publish-schedule";

type BriefWithItems = WeeklyBrief & { items: WeeklyBriefItem[] };

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

/** DB の日付は UTC 0時でそろっている(lib/weekly.ts)。UTC のまま読む。 */
function day(d: Date): string {
  return `${d.getUTCDate()}日(${WEEKDAYS[d.getUTCDay()]})`;
}

function sameDay(a: Date, b: Date): boolean {
  return a.getTime() === b.getTime();
}

/**
 * トップの「今週のロンドン」。号の項目を3〜4件と、旅程に響く支障を1件出す。
 *
 * 以前は号の見出し文(headline)の1段落と、深刻度 high の支障だけを出して
 * いた。13項目ある号でも、トップで読めるのは見出し文に入った3つだけで、
 * medium の運休(週末のディストリクト線・サークル線など)は出なかった。
 * また「今週」の語が3回(英字の小見出し・題・ボタン)、期間が2回
 * (題の「(10/19〜10/25)」と日付の行)出ていた。題は期間つきで DB に
 * 入っているので使わず、見出しと期間をここで1回ずつ組む。
 *
 * 項目の選び方:
 *   1. 号の先頭の「耳寄り」(号を書いた人が主役に据えたもの)は必ず入れる。
 *   2. 残りは号の並び(書いた人が付けた順)のまま、今週始まるもの・今週で
 *      終わるものを先に取る。会期の途中にあるだけのものは後回しにする。
 *   3. 選んだものを日付の順に並べる。
 * 無料を優先する案も試したが、w43 では号の2番目と3番目(フレディ・マーキュリーの
 * 衣装とダッド展。見出し文が挙げた2つ)が落ち、無料の催しに入れ替わった。
 * 支障は今週号・来週号のときだけ出す。ストライキや運休は数日で覆るので、
 * 過去の号の支障を出すと誤情報になる。過去の号は項目も出さず、見出し文だけにする。
 */
export default function WeeklyCard({
  brief,
  now,
}: {
  brief: BriefWithItems;
  now: Date;
}) {
  const freshness = getIssueFreshness(brief.weekStart, now);
  const isThisWeek = freshness.weeksAgo === 0;
  const isCurrent = freshness.weeksAgo <= 0;
  const { weekStart, weekEnd } = brief;

  const inWeek = (d: Date | null): d is Date =>
    !!d && d.getTime() >= weekStart.getTime() && d.getTime() <= weekEnd.getTime();

  // 影響大(high)を先に。影響小(low)は迂回の要らない情報なので出さない。
  const severityRank = (item: WeeklyBriefItem) => (item.severity === "high" ? 0 : 1);
  const alerts = isCurrent
    ? brief.items
        .filter(
          (item) =>
            getKindMeta(item.kind).group === "alert" &&
            (item.severity === "high" || item.severity === "medium"),
        )
        .sort((a, b) => severityRank(a) - severityRank(b))
    : [];
  const alert = alerts[0] ?? null;

  const opportunities = brief.items.filter(
    (item) => getKindMeta(item.kind).group === "opportunity",
  );
  const startsThisWeek = (item: WeeklyBriefItem) =>
    item.timing !== "announced" && inWeek(item.startDate);
  const endsThisWeek = (item: WeeklyBriefItem) =>
    isEndingThisWeek(item, weekStart, weekEnd);
  const timely = (item: WeeklyBriefItem) => startsThisWeek(item) || endsThisWeek(item);

  const limit = alert ? 3 : 4;
  const [lead, ...rest] = opportunities;
  const picked =
    isCurrent && lead
      ? [
          lead,
          ...[...rest.filter(timely), ...rest.filter((item) => !timely(item))].slice(
            0,
            limit - 1,
          ),
        ]
      : [];

  const keyDate = (item: WeeklyBriefItem) =>
    (startsThisWeek(item) ? item.startDate : endsThisWeek(item) ? item.endDate : item.startDate) ??
    weekStart;
  const items = [...picked].sort((a, b) => keyDate(a).getTime() - keyDate(b).getTime());

  const when = (item: WeeklyBriefItem): string => {
    const { startDate: start, endDate: end } = item;
    if (start && end && sameDay(start, end)) return day(start);
    if (startsThisWeek(item) && start) return `${day(start)}〜`;
    if (endsThisWeek(item) && end) return `${day(end)}まで`;
    if (start && end) return `${start.getUTCMonth() + 1}/${start.getUTCDate()}〜${end.getUTCMonth() + 1}/${end.getUTCDate()}`;
    return "今週";
  };

  const alertWhen = (item: WeeklyBriefItem): string | null => {
    const { startDate: start, endDate: end } = item;
    if (!start) return null;
    if (!end || sameDay(start, end)) return day(start);
    return `${start.getUTCDate()}〜${day(end)}`;
  };

  const [, researchedMonth, researchedDay] = londonDate(brief.researchedAt)
    .split("-")
    .map(Number);

  return (
    <div className="flex h-full flex-col rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <h2 className="text-2xl font-bold leading-snug tracking-tight sm:text-3xl">
          {isThisWeek ? "今週のロンドン" : "ロンドン週報"}
        </h2>
        {!isThisWeek && (
          <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-bold">
            {freshness.label}の号
          </span>
        )}
      </div>
      <p className="mt-2 text-xs font-semibold text-muted-foreground">
        {formatWeekRange(weekStart, weekEnd)} · {researchedMonth}/{researchedDay} 調査
      </p>

      {alert && (
        <Link
          href="/events"
          className="mt-5 flex min-w-0 items-start gap-3 rounded-xl bg-red-50/80 p-3.5 transition-colors hover:bg-red-100/70 dark:bg-red-950/30 dark:hover:bg-red-950/50"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-600/10">
            <TriangleAlert className="h-4 w-4 text-red-600" aria-hidden />
          </span>
          <span className="min-w-0 flex-1">
            <span className="text-xs font-bold text-red-700 dark:text-red-400">
              注意{alertWhen(alert) ? ` · ${alertWhen(alert)}` : ""}
            </span>
            <span className="mt-0.5 block line-clamp-3 text-sm font-semibold leading-snug">
              {alert.title}
            </span>
          </span>
        </Link>
      )}

      {items.length > 0 ? (
        <ul className="mt-4 divide-y divide-border">
          {items.map((item) => (
            <li key={item.id} className="py-3">
              <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
                <span className="font-bold text-sky-700 dark:text-sky-400">
                  {when(item)}
                </span>
                <span className="text-muted-foreground">
                  {getKindMeta(item.kind).label}
                </span>
                {item.isFree && (
                  <span className="rounded bg-emerald-50 px-1.5 py-0.5 font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                    無料
                  </span>
                )}
              </p>
              <p className="mt-1 line-clamp-3 text-sm font-semibold leading-snug">
                {item.title}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          {brief.headline}
        </p>
      )}

      <div className="mt-6 pt-2 sm:mt-auto">
        <Button asChild size="lg" className="bg-sky-700 text-white hover:bg-sky-800">
          <Link href="/events">
            {isThisWeek
              ? `今週号の${brief.items.length}件をすべて見る`
              : freshness.isPast
                ? "最新号を読む"
                : `${freshness.label}の号を読む`}{" "}
            →
          </Link>
        </Button>
      </div>
    </div>
  );
}
