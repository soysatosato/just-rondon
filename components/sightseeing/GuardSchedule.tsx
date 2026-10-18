import { CalendarCheck } from "lucide-react";
import {
  GUARD_CALENDAR_URL,
  formatCheckedAt,
  type GuardDay,
  type GuardEntry,
  type GuardScheduleResult,
} from "@/lib/guard/schedule";

/**
 * 衛兵交代式ページの冒頭に出す「今日から7日間の実施予定」。
 *
 * 公式カレンダーが読めなかったときは表を出さず、公式へのリンクだけを
 * 出す(理由は lib/guard/schedule.ts)。確認した時刻は必ず添える——
 * 予定は当日に覆ることがあり、いつ時点の情報か分からない表は誤情報になる。
 */

const linkClass =
  "font-medium text-link underline underline-offset-2 hover:opacity-80 dark:text-blue-400";

function OfficialLink({ children }: { children: React.ReactNode }) {
  return (
    <a
      href={GUARD_CALENDAR_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={linkClass}
    >
      {children}
    </a>
  );
}

/**
 * 表の上に置く1行のまとめ。読者の問いは「どの日に行けば見られるか」なので、
 * 表を目で追わなくても答えが分かるようにする。
 */
function Summary({ days }: { days: GuardDay[] }) {
  const changes = days.flatMap((day) =>
    day.entries
      .filter((entry) => entry.kind === "change")
      .map((entry) => ({ label: day.label, time: entry.time })),
  );
  const hasUnpublished = days.some((day) => day.status === "unpublished");

  if (changes.length === 0) {
    return (
      <p className="mt-2 text-sm leading-relaxed">
        {hasUnpublished
          ? "公式に発表されている範囲では、この7日間に交代式の予定はありません。"
          : "この7日間に交代式の予定はありません。"}
      </p>
    );
  }

  const times = new Set(changes.map((c) => c.time));
  const sameTime = times.size === 1 ? changes[0].time : null;

  return (
    <p className="mt-2 text-sm leading-relaxed">
      交代式があるのは{" "}
      <span className="font-semibold">
        {changes
          .map((c) => (sameTime || !c.time ? c.label : `${c.label} ${c.time}`))
          .join("、")}
      </span>
      {sameTime ? `。いずれも${sameTime}開始です。` : "です。"}
    </p>
  );
}

/** 交代式の有無に関わる行。点検(inspection)や日曜の行進は交代式ではないので出さない。 */
function MainEntry({ entry }: { entry: GuardEntry }) {
  if (entry.kind === "change") {
    return (
      <div>
        <span className="font-semibold text-emerald-700 dark:text-emerald-400">
          実施{entry.time ? ` ${entry.time}` : ""}
        </span>
        {entry.band && (
          <span className="block text-xs text-muted-foreground">
            演奏: {entry.band}
          </span>
        )}
      </div>
    );
  }

  if (entry.kind === "cancelled") {
    return (
      <div>
        <span className="font-semibold text-red-600 dark:text-red-400">中止</span>
        <span className="block text-xs text-muted-foreground">
          公式表: {entry.typeEn}
        </span>
      </div>
    );
  }

  // 分類できなかった行。断定せず、公式表の原文をそのまま見せる。
  return (
    <div>
      <span className="font-semibold text-amber-700 dark:text-amber-400">
        要確認
      </span>
      <span className="block text-xs text-muted-foreground">
        公式表: {[entry.time, entry.typeEn].filter(Boolean).join(" ")}
      </span>
    </div>
  );
}

function DayCell({ day }: { day: GuardDay }) {
  if (day.status === "unpublished") {
    return (
      <div>
        <span className="text-muted-foreground">未発表</span>
        <span className="block text-xs text-muted-foreground">
          公式カレンダーにまだ載っていません
        </span>
      </div>
    );
  }

  const main = day.entries.filter(
    (entry) => entry.kind !== "inspection" && entry.kind !== "parade",
  );

  if (main.length === 0) {
    return <span className="text-muted-foreground">交代式なし</span>;
  }

  return (
    <div className="space-y-1.5">
      {main.map((entry, i) => (
        <MainEntry key={i} entry={entry} />
      ))}
    </div>
  );
}

export default function GuardSchedule({
  result,
}: {
  result: GuardScheduleResult;
}) {
  if (!result.ok) {
    return (
      <section
        aria-labelledby="guard-schedule"
        className="rounded-2xl border border-border bg-muted/40 p-4 sm:p-5"
      >
        <h2
          id="guard-schedule"
          className="flex items-center gap-2 text-lg font-semibold tracking-tight"
        >
          <CalendarCheck className="h-5 w-5 text-muted-foreground" aria-hidden />
          実施日の確認
        </h2>
        <p className="mt-2 text-sm leading-relaxed">
          交代式は毎日行われるわけではありません。行く日に実施があるかは、
          近衛師団(Household Division)の
          <OfficialLink>公式カレンダー</OfficialLink>
          で確認してください。開始は11:00です。
        </p>
      </section>
    );
  }

  const { days, checkedAt } = result;

  return (
    <section
      aria-labelledby="guard-schedule"
      className="rounded-2xl border border-border bg-muted/40 p-4 sm:p-5"
    >
      <h2
        id="guard-schedule"
        className="flex items-center gap-2 text-lg font-semibold tracking-tight"
      >
        <CalendarCheck className="h-5 w-5 text-muted-foreground" aria-hidden />
        今日から7日間の実施予定
      </h2>

      <Summary days={days} />

      <table className="mt-3 w-full text-sm">
        <thead className="sr-only">
          <tr>
            <th scope="col">日付</th>
            <th scope="col">交代式</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/60">
          {days.map((day) => (
            <tr key={day.date}>
              <th
                scope="row"
                className="w-36 whitespace-nowrap py-2.5 pr-3 text-left align-top font-medium"
              >
                {day.label}
                {day.isToday && (
                  <span className="ml-1.5 rounded-full bg-foreground px-1.5 py-0.5 text-xs font-semibold text-background">
                    今日
                  </span>
                )}
              </th>
              <td className="py-2.5 align-top">
                <DayCell day={day} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <ul className="mt-3 space-y-1.5 border-t border-border/60 pt-3 text-xs leading-relaxed text-muted-foreground">
        <li>
          {formatCheckedAt(checkedAt)}(ロンドン時間)に、近衛師団(Household
          Division)の<OfficialLink>公式カレンダー</OfficialLink>
          で確認した予定です。1時間ごとに読み直しています。
        </li>
        <li>
          悪天候や猛暑、国の式典などで、当日になって中止・縮小されることがあります。当日の中止はこの表にも公式カレンダーにも載らないことがあるので、出発前に公式の発表を確認してください。
        </li>
      </ul>
    </section>
  );
}
