import { CalendarClock, Clock, Languages, Theater, Users } from "lucide-react";
import {
  ENGLISH_FORM_LABELS,
  formatMinAge,
  formatRuntime,
  isEnglishForm,
  type MusicalFacts,
} from "./facts";
import {
  formatPerformanceDate,
  formatPerformanceTime,
} from "./schedule-format";

/**
 * 作品ページ冒頭の要約。どこで・何時間・何歳から・英語はどうか・直近の公演。
 *
 * 観光スポットのページには冒頭に料金・所要時間の欄(AttractionFactBar)が
 * あるが、作品ページには無く、上演時間や劇場はあらすじ・登場人物・見どころの
 * 後ろ(スマホで4〜7画面目)にしか出ていなかった。「観るかどうか」を
 * 決めるのにも、上演時間や英語の比重は効く。
 *
 * あらすじを実用情報より先に読ませる構成(page.tsx)は変えない。ここは
 * 1行ずつの事実だけで、説明・但し書き・全日程は下の「観に行く前に」
 * 「直近の公演スケジュール」「劇場情報」に任せる。
 *
 * 未確認の項目は行ごと出さない(MusicalPracticalFacts と同じ方針)。
 */

type Fact = {
  icon: typeof Clock;
  label: string;
  value: string;
};

export default function MusicalFactBar({
  theatreName,
  nearestStation,
  facts,
  nextPerformance,
  hasSchedule,
}: {
  theatreName: string | null;
  nearestStation: string | null;
  facts: MusicalFacts;
  nextPerformance: { startsAt: Date; timeTba: boolean } | null;
  hasSchedule: boolean;
}) {
  const runtime = formatRuntime(facts.runtimeMinutes, facts.intervalMinutes);
  const minAge = formatMinAge(facts.minAgeGuidance);
  const form = isEnglishForm(facts.englishForm) ? facts.englishForm : null;

  const rows: Fact[] = [
    ...(theatreName
      ? [
          {
            icon: Theater,
            label: "劇場",
            value: nearestStation
              ? `${theatreName}（${nearestStation}）`
              : theatreName,
          },
        ]
      : []),
    ...(runtime ? [{ icon: Clock, label: "上演時間", value: runtime }] : []),
    ...(minAge ? [{ icon: Users, label: "年齢の目安", value: minAge }] : []),
    ...(form
      ? [{ icon: Languages, label: "英語", value: ENGLISH_FORM_LABELS[form] }]
      : []),
    // 日程は1時間ごとの再描画なので、当日の公演が既に始まっていることがある。
    // 「次の」ではなく「直近の」と書く。
    ...(nextPerformance
      ? [
          {
            icon: CalendarClock,
            label: "直近の公演",
            value: `${formatPerformanceDate(nextPerformance.startsAt)} ${
              nextPerformance.timeTba
                ? "時刻未定"
                : formatPerformanceTime(nextPerformance.startsAt)
            }`,
          },
        ]
      : []),
  ];

  if (rows.length === 0) return null;

  return (
    <section
      aria-label="観る前に知っておきたいこと"
      className="rounded-2xl border border-border bg-muted/40 p-4 sm:p-5"
    >
      <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
        {/* 各組は div > dt + dd に限る。アイコンは dt の中で左へ絶対配置。 */}
        {rows.map((f) => (
          <div key={f.label} className="relative min-w-0 pl-8">
            <dt className="text-xs font-medium text-muted-foreground">
              <f.icon
                className="absolute left-0 top-0.5 h-5 w-5 text-muted-foreground"
                aria-hidden
              />
              {f.label}
            </dt>
            <dd className="text-sm font-semibold leading-snug">{f.value}</dd>
          </div>
        ))}
      </dl>

      <p className="mt-4 flex flex-wrap gap-x-4 gap-y-1 border-t border-border/60 pt-3 text-xs text-muted-foreground">
        {(runtime || minAge || form) && (
          <a
            href="#before-you-go"
            className="font-medium text-link underline underline-offset-2 hover:opacity-80 dark:text-blue-400"
          >
            上演時間・英語の詳しい説明
          </a>
        )}
        {hasSchedule && (
          <a
            href="#musical-schedule"
            className="font-medium text-link underline underline-offset-2 hover:opacity-80 dark:text-blue-400"
          >
            公演日程をすべて見る
          </a>
        )}
        {theatreName && (
          <a
            href="#theatre-info"
            className="font-medium text-link underline underline-offset-2 hover:opacity-80 dark:text-blue-400"
          >
            劇場の場所
          </a>
        )}
      </p>
    </section>
  );
}
