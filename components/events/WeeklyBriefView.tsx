import Link from "next/link";
import { format } from "date-fns";
import { CalendarRange, Search, History, CalendarCheck, CloudSun } from "lucide-react";
import type { Event, WeeklyBrief, WeeklyBriefItem } from "@prisma/client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  formatWeekRange,
  getIssueFreshness,
  getKindMeta,
  GROUP_META,
  GROUP_ORDER,
  type BriefGroup,
} from "@/lib/weekly";
import BriefItemCard from "@/components/events/BriefItemCard";
import BriefSectionNav from "@/components/events/BriefSectionNav";
import StapleEventList from "@/components/events/StapleEventList";
import WeekForecast from "@/components/events/WeekForecast";
import type { DailyForecast } from "@/lib/weather/forecast";

type BriefWithItems = WeeklyBrief & { items: WeeklyBriefItem[] };

const STAPLES_ANCHOR = "staples";

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
  const Title = asHeading ? "h1" : "h2";

  // 会期の日数。予報が会期を覆えているかの判定にだけ使う。
  // 両端を含めるので +1(月曜〜日曜なら7)。
  const weekLength =
    Math.round(
      (brief.weekEnd.getTime() - brief.weekStart.getTime()) / 86_400_000
    ) + 1;

  // 項目を「耳寄り / 注意 / 前提」の3グループに束ねる。
  const grouped = GROUP_ORDER.map((group) => ({
    group,
    meta: GROUP_META[group],
    items: brief.items.filter((item) => getKindMeta(item.kind).group === group),
  })).filter(({ items }) => items.length > 0);

  /*
   * 号の「主役」として大きく出す件数。
   *
   * 文字だけのカードが10枚以上続くと、どれがその週の目玉なのかが読者に
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

  const navSections = [
    ...grouped.map(({ meta, items }) => ({
      anchor: meta.anchor,
      label: meta.shortLabel,
      count: items.length,
      chipClass: meta.chipClass,
    })),
    ...(staples.length > 0
      ? [
          {
            anchor: STAPLES_ANCHOR,
            label: "定番",
            count: staples.length,
            chipClass:
              "border-border bg-muted text-muted-foreground dark:border-neutral-700 dark:text-gray-300",
          },
        ]
      : []),
  ];

  return (
    <div>
      {/* 号の顔。中央揃えだと本文との間で軸がぶれるので、全体を左揃えで通す。 */}
      <header className="mb-6">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Badge className="bg-primary text-primary-foreground hover:bg-primary">
            {freshness.label}
          </Badge>
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground dark:text-gray-400">
            <CalendarRange className="h-4 w-4" />
            {formatWeekRange(brief.weekStart, brief.weekEnd)}
          </span>
        </div>

        <Title className="text-2xl font-bold leading-tight tracking-tight sm:text-3xl md:text-4xl dark:text-white">
          {brief.title}
        </Title>

        {/* 見出しの直後に、その週の要点を1本の線で引き立てて置く。 */}
        <p className="mt-5 border-l-4 border-primary pl-4 text-[15px] font-semibold leading-relaxed sm:text-base dark:text-gray-100">
          {brief.headline}
        </p>

        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground dark:text-gray-400">
          {brief.summary}
        </p>

        {/* いつ時点の情報かを出さないと、ストライキや休館の記述は誤情報になりうる。 */}
        <p className="mt-4 inline-flex items-center gap-1.5 text-xs text-muted-foreground dark:text-gray-500">
          <Search className="h-3.5 w-3.5" />
          {format(brief.researchedAt, "yyyy年M月d日")}時点の調査
        </p>
      </header>

      {/* 過去号は情報が古い。読者が気づかず従うのを防ぐ。 */}
      {freshness.isPast && (
        <div className="mb-6 flex gap-3 rounded-xl border border-amber-600/30 bg-amber-600/5 p-4">
          <History className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <div className="text-sm text-amber-800 dark:text-amber-300">
            <p className="font-semibold">この号は{freshness.label}の情報です</p>
            <p className="mt-1 leading-relaxed">
              運行状況や開催情報は変わっている可能性があります。
              <Link
                href="/events"
                className="font-semibold underline underline-offset-2"
              >
                最新号
              </Link>
              を確認してください。
            </p>
          </div>
        </div>
      )}

      <BriefSectionNav sections={navSections} />

      {grouped.map(({ group, meta, items }) => {
        const GroupIcon = meta.icon;
        return (
          <section
            key={group}
            id={meta.anchor}
            // sticky なナビの下に見出しが潜り込まないよう余白を確保する。
            className="mb-10 scroll-mt-16"
          >
            <div className="mb-4 flex items-start gap-3">
              <span
                className={cn(
                  "mt-1 h-8 w-1 shrink-0 rounded-full",
                  meta.accentClass
                )}
                aria-hidden
              />
              <div className="min-w-0">
                <h2 className="flex items-center gap-2 text-lg font-bold sm:text-xl dark:text-white">
                  <GroupIcon className="h-4 w-4 shrink-0 opacity-70" />
                  {meta.heading}
                  <span className="text-sm font-normal tabular-nums text-muted-foreground">
                    {items.length}
                  </span>
                </h2>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground dark:text-gray-400">
                  {meta.note}
                </p>
              </div>
            </div>

            <div className="grid gap-4">
              {items.map((item, index) => (
                <BriefItemCard
                  key={item.id}
                  item={item}
                  featured={index < featuredCount(group, items.length)}
                />
              ))}
            </div>
          </section>
        );
      })}

      {forecast.length > 0 && (
        <section className="mb-10">
          <div className="mb-4 flex items-start gap-3">
            <span
              className="mt-1 h-8 w-1 shrink-0 rounded-full bg-muted-foreground/40"
              aria-hidden
            />
            <div className="min-w-0">
              <h2 className="flex items-center gap-2 text-lg font-bold sm:text-xl dark:text-white">
                <CloudSun className="h-4 w-4 shrink-0 opacity-70" />
                今週の天気
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground dark:text-gray-400">
                屋外の催しに行く日を決める前に、降水確率を見ておく。
              </p>
            </div>
          </div>

          <WeekForecast days={forecast} weekLength={weekLength} />
        </section>
      )}

      {staples.length > 0 && (
        <section id={STAPLES_ANCHOR} className="mb-10 scroll-mt-16">
          <div className="mb-4 flex items-start gap-3">
            <span
              className="mt-1 h-8 w-1 shrink-0 rounded-full bg-muted-foreground/40"
              aria-hidden
            />
            <div className="min-w-0">
              <h2 className="flex items-center gap-2 text-lg font-bold sm:text-xl dark:text-white">
                <CalendarCheck className="h-4 w-4 shrink-0 opacity-70" />
                今週開催中の定番
                <span className="text-sm font-normal tabular-nums text-muted-foreground">
                  {staples.length}
                </span>
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground dark:text-gray-400">
                毎年の恒例行事や会期の長い展覧会など、この週に開催中のもの。
              </p>
            </div>
          </div>

          <StapleEventList events={staples} />
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
