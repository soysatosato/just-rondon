import Link from "next/link";
import type { ComponentType } from "react";
import { History, CalendarCheck } from "lucide-react";
import type { Event, WeeklyBrief, WeeklyBriefItem } from "@prisma/client";

import { cn } from "@/lib/utils";
import {
  buildDaySlots,
  getIssueFreshness,
  getKindMeta,
  isEndingThisWeek,
  GROUP_META,
  GROUP_ORDER,
  type BriefGroup,
} from "@/lib/weekly";
import BriefEntry from "@/components/events/BriefEntry";
import BriefMasthead from "@/components/events/BriefMasthead";
import BriefSectionNav from "@/components/events/BriefSectionNav";
import StapleEventList from "@/components/events/StapleEventList";
import WeekTimeline from "@/components/events/WeekTimeline";
import type { DailyForecast } from "@/lib/weather/forecast";

type BriefWithItems = WeeklyBrief & { items: WeeklyBriefItem[] };

const STAPLES_ANCHOR = "staples";

/**
 * セクションの見出し。太罫 → 欧文 → 和文の見出し → 一言、の順で組む。
 * 号の中の大きな節目なので、項目の細罫より太い罫で始める。
 */
function SectionHeading({
  eng,
  heading,
  note,
  count,
  accentClass,
  icon: Icon,
}: {
  eng: string;
  heading: string;
  note: string;
  count: number;
  accentClass: string;
  icon: ComponentType<{ className?: string }>;
}) {
  return (
    <div className="mb-2">
      <div className={cn("h-[3px] w-full", accentClass)} />
      <div className="flex items-start justify-between gap-4 pt-3">
        <div className="min-w-0">
          <p className="font-serif text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            {eng}
          </p>
          <h2 className="mt-1.5 flex items-center gap-2 text-xl font-bold tracking-tight sm:text-2xl dark:text-white">
            <Icon className="h-4 w-4 shrink-0 opacity-60" />
            {heading}
          </h2>
          <p className="mt-2 max-w-xl text-xs leading-relaxed text-muted-foreground dark:text-gray-400">
            {note}
          </p>
        </div>
        <span className="shrink-0 font-serif text-3xl leading-none tabular-nums text-muted-foreground/40 sm:text-4xl">
          {count}
        </span>
      </div>
    </div>
  );
}

export default function WeeklyBriefView({
  brief,
  staples,
  /**
   * 会期と重なる日の天気予報。過去号や取得失敗時は空配列を渡す
   * ——このコンポーネントは中身の有無だけを見て出し分ける。
   */
  forecast = [],
  /** h1 として出すか(=そのページの主役か)。 */
  asHeading = true,
  now = new Date(),
}: {
  brief: BriefWithItems;
  staples: Event[];
  forecast?: DailyForecast[];
  asHeading?: boolean;
  now?: Date;
}) {
  const freshness = getIssueFreshness(brief.weekStart, now);

  // 項目を「耳寄り / 注意 / 前提」の3グループに束ねる。
  const grouped = GROUP_ORDER.map((group) => ({
    group,
    meta: GROUP_META[group],
    items: brief.items.filter((item) => getKindMeta(item.kind).group === group),
  })).filter(({ items }) => items.length > 0);

  /*
   * 号を通した番号を振る。
   *
   * セクションごとに 01 から振り直すと、同じ号の中に 01 が3つ現れて、
   * 「いま何番目を読んでいるか」の目印にならない。表示順(グループ順→
   * displayOrder)でそのまま通しにする。
   */
  const numberByItemId = new Map<string, number>();
  let running = 0;
  for (const { items } of grouped) {
    for (const item of items) numberByItemId.set(item.id, ++running);
  }

  /*
   * 号の「主役」として大きく出す件数。
   *
   * 同じ大きさの項目が10以上続くと、どれがその週の目玉なのかが読者に
   * 伝わらない。耳寄り情報の先頭1件を大きくして、号の顔を作る。
   *
   * 主役の選定は displayOrder の先頭、という編集上の約束にしている。
   * headline との語句一致や本文の長さから機械的に推測する案も試したが、
   * 既存4号で当たり外れが割れた(w35 は displayOrder の先頭がテート・モダンの
   * 閉幕展で、headline が主役と呼んでいるカーニバルは3番目にある)。
   * 推測を重ねるより、号を書くときに主役を先頭へ置く運用のほうが確実なので、
   * 表示側は並びをそのまま信頼する。既存号で並びが実態と合っていないものは
   * displayOrder を入れ替えて直す。
   *
   * 主役にするのは「耳寄り情報」だけ。支障情報は severity で既に強調されて
   * いるうえ、運休を号の顔にすると「また来たい」と思わせる面が消える。
   * 件数が少ない号で全部が主役になると強弱が付かないので、5件以上ある号に
   * 限って適用する。
   */
  const FEATURED_MIN_ITEMS = 5;
  const featuredCount = (group: BriefGroup, itemCount: number) =>
    group === "opportunity" && itemCount >= FEATURED_MIN_ITEMS ? 1 : 0;

  // 日別タイムライン。項目が無い号では列だけ並んでも意味が無いので出さない。
  const daySlots =
    brief.items.length > 0
      ? buildDaySlots(brief.weekStart, brief.weekEnd, brief.items)
      : [];

  /*
   * タイムラインの各日から飛ぶ先を決める。
   *
   * 項目は種類別に並んでいるので、ある日に始まるものは一覧の各所に散る。
   * その日の先頭の1件にだけ id を振り、そこへ着地させる。id が重複すると
   * ブラウザは最初の1つしか拾わないため、割り当ては必ず一意にする。
   *
   * 表示順(グループ順→displayOrder)で最初に現れたものを代表にしたいので、
   * grouped と同じ順序で舐める。
   */
  const anchorByItemId = new Map<string, string>();
  const claimedDates = new Set<string>();
  const slotDates = new Set(daySlots.map((s) => s.date));
  const utcDate = (d: Date) =>
    `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;

  for (const { items } of grouped) {
    for (const item of items) {
      if (item.timing === "announced") continue;

      /*
       * 件数の数え方(buildDaySlots)と同じ規則で日付を拾う。開始日だけを
       * 見ていると、会期が数ヶ月前に始まって今週で閉じる展示に飛び先が
       * 無くなる。w33 は「8/16 に 3件」と出るのに、3件とも開始は3〜7月で、
       * 開始日だけでは着地点がひとつも作れなかった。
       */
      for (const d of [item.startDate, item.endDate]) {
        if (!d) continue;
        const date = utcDate(d);
        if (!slotDates.has(date) || claimedDates.has(date)) continue;
        claimedDates.add(date);
        anchorByItemId.set(item.id, date);
        break; // 1項目が2日ぶんの着地点を兼ねると、片方が飛べなくなる。
      }
    }
  }

  const navSections = [
    ...grouped.map(({ meta, items }) => ({
      anchor: meta.anchor,
      label: meta.shortLabel,
      count: items.length,
      dotClass: meta.accentClass,
    })),
    ...(staples.length > 0
      ? [
          {
            anchor: STAPLES_ANCHOR,
            label: "定番",
            count: staples.length,
            dotClass: "bg-muted-foreground/50",
          },
        ]
      : []),
  ];

  return (
    <div>
      <BriefMasthead
        title={brief.title}
        slug={brief.slug}
        weekStart={brief.weekStart}
        weekEnd={brief.weekEnd}
        headline={brief.headline}
        summary={brief.summary}
        researchedAt={brief.researchedAt}
        freshness={freshness}
        asHeading={asHeading}
      />

      {/* 過去号は情報が古い。読者が気づかず従うのを防ぐ。 */}
      {freshness.isPast && (
        <div className="mb-8 flex gap-3 border-l-[3px] border-amber-500 bg-amber-500/[0.06] py-4 pl-4 pr-4">
          <History className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <div className="text-sm text-amber-800 dark:text-amber-300">
            <p className="font-bold">この号は{freshness.label}の情報です</p>
            <p className="mt-1 leading-relaxed">
              運行状況や開催情報は変わっている可能性があります。
              <Link
                href="/events"
                className="font-bold underline underline-offset-4"
              >
                最新号
              </Link>
              を確認してください。
            </p>
          </div>
        </div>
      )}

      <BriefSectionNav sections={navSections} />

      {/*
       * 曜日の並びは一覧より前に置く。読者はまず「土曜は何があるか」を
       * 知りたいことが多く、種類別の並びからはそれが読めない。
       * 天気を同じ列に重ねているので、行く日を決める前に傘の要否も分かる。
       */}
      <WeekTimeline
        slots={daySlots}
        forecast={forecast}
        linkableDates={claimedDates}
      />

      {grouped.map(({ group, meta, items }) => (
        <section
          key={group}
          id={meta.anchor}
          // sticky なナビの下に見出しが潜り込まないよう余白を確保する。
          className="mb-12 scroll-mt-16"
        >
          <SectionHeading
            eng={meta.eng}
            heading={meta.heading}
            note={meta.note}
            count={items.length}
            accentClass={meta.accentClass}
            icon={meta.icon}
          />

          <div className="divide-y divide-border dark:divide-neutral-800">
            {items.map((item, index) => (
              <BriefEntry
                key={item.id}
                item={item}
                index={numberByItemId.get(item.id) ?? index + 1}
                featured={index < featuredCount(group, items.length)}
                endingThisWeek={isEndingThisWeek(
                  item,
                  brief.weekStart,
                  brief.weekEnd
                )}
                anchorDate={anchorByItemId.get(item.id)}
              />
            ))}
          </div>
        </section>
      ))}

      {staples.length > 0 && (
        <section id={STAPLES_ANCHOR} className="mb-12 scroll-mt-16">
          <SectionHeading
            eng="Also Running"
            heading="今週開催中の定番"
            note="毎年の恒例行事や会期の長い展覧会など、この週に開催中のもの。"
            count={staples.length}
            accentClass="bg-muted-foreground/40"
            icon={CalendarCheck}
          />
          <div className="mt-4">
            <StapleEventList events={staples} />
          </div>
        </section>
      )}

      {brief.items.length === 0 && staples.length === 0 && (
        <p className="py-10 text-center text-sm text-muted-foreground dark:text-gray-400">
          この週に特筆すべき情報はありませんでした。
        </p>
      )}
    </div>
  );
}
