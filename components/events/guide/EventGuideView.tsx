import Link from "next/link";
import { CalendarCheck2 } from "lucide-react";

import { SITE_URL } from "@/lib/seo";
import { eventMonthPath } from "@/lib/events";
import {
  eventGuidePath,
  formatGuideDate,
  formatGuideDateRange,
  pickEdition,
  type EventGuide,
  type GlanceItem,
  type GuideEdition,
  type GuideItem,
  type GuideSource,
} from "@/lib/annual-events";
import { eventGuideTitle } from "@/lib/annual-events/seo";
import { SIGHTSEEING_PUBLISHER } from "@/components/sightseeing/jsonld";
import AdSenseUnit from "@/components/ads/AdSenseUnit";
import { AD_SLOTS } from "@/lib/adsense";
import MonthSection from "@/components/events/month/MonthSection";
import GuideSectionNav from "@/components/guides/GuideSectionNav";
import Breadcrumbs from "@/components/navigation/Breadcrumbs";
import JsonLd from "@/components/seo/JsonLd";
import { breadcrumbListJsonLd } from "@/components/navigation/tree";
import { cn } from "@/lib/utils";

/**
 * 年中行事ガイド(/events/<slug>)の本体。
 *
 * 節の並びは全ガイドで固定する。読者は「チケットは要るか → いつ何時に
 * どこへ行くか → どう帰るか → 何を着るか」の順に答えを探すので、
 * 行事ごとに並びを変えない。会場の選び方と「行かない人へ」は
 * 要らない行事もあるので、中身があるときだけ出す。
 */
export default function EventGuideView({
  guide,
  today,
}: {
  guide: EventGuide;
  /** ロンドンの日付("YYYY-MM-DD")。 */
  today: string;
}) {
  const { edition, upcoming } = pickEdition(guide, today);
  const earlier = guide.editions.filter((e) => e.year < edition.year);
  const previous = earlier[earlier.length - 1];
  const path = eventGuidePath(guide);

  const sections = [
    { id: "schedule", navLabel: "日程" },
    { id: "tickets", navLabel: "チケット" },
    ...(guide.places ? [{ id: "places", navLabel: guide.places.navLabel }] : []),
    { id: "timeline", navLabel: "当日の流れ" },
    { id: "transport", navLabel: "交通" },
    { id: "wear", navLabel: "服装・持ち物" },
    { id: "mistakes", navLabel: "よくある失敗" },
    ...(guide.nonAttendees
      ? [{ id: "others", navLabel: guide.nonAttendees.navLabel }]
      : []),
  ];
  const n = (id: string) => sections.findIndex((s) => s.id === id) + 1;

  const glance: GlanceItem[] = [
    scheduleGlance(guide, edition, upcoming),
    ...(edition.glance ?? []),
    ...guide.facts,
  ];

  const links = dedupeByHref([
    ...guide.links,
    { href: eventMonthPath(guide.month), label: `${guide.month}月のロンドン` },
    { href: "/events/guides", label: "年中行事ガイドの一覧" },
    { href: "/events/calendar", label: "年間イベントカレンダー" },
  ]);
  const sources = dedupeByHref([...edition.sources, ...guide.sources].map(
    (s) => ({ ...s, href: s.url })
  ));

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${SITE_URL}${path}#article`,
    headline: eventGuideTitle(guide, today),
    description: guide.description,
    inLanguage: "ja",
    mainEntityOfPage: `${SITE_URL}${path}`,
    dateModified: `${edition.checkedAt}T12:00:00Z`,
    author: SIGHTSEEING_PUBLISHER,
    publisher: SIGHTSEEING_PUBLISHER,
  };

  return (
    <div data-page-main className="mx-auto max-w-3xl sm:px-4 pt-4 pb-8 text-gray-900 dark:text-gray-100 sm:pb-10">
      <JsonLd
        data={breadcrumbListJsonLd({
          path: "/events/guides",
          current: guide.title,
          currentHref: path,
        })}
      />
      <JsonLd data={articleJsonLd} />

      <Breadcrumbs path="/events/guides" current={guide.title} className="mb-6" />

      <header>
        <p className="text-xs font-semibold tracking-wide text-emerald-700 dark:text-emerald-400">
          年中行事ガイド
        </p>
        <h1 className="mt-1 text-2xl font-bold leading-tight md:text-4xl">
          {guide.title}
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {guide.engName}
        </p>

        <p
          className={
            upcoming
              ? "mt-3 inline-block rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
              : "mt-3 inline-block rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
          }
        >
          {upcoming
            ? `${edition.year}年の日程で表示しています`
            : `${edition.year}年の日程です(次回は未発表)`}
        </p>

        <p className="mt-5 text-base leading-relaxed text-gray-700 dark:text-gray-300">
          {guide.lead}
        </p>

        <dl className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {glance.map((item) => (
            <div
              key={item.label}
              className="rounded-lg border border-gray-200 bg-white p-3.5 dark:border-neutral-700 dark:bg-neutral-900"
            >
              <dt className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                {item.label}
              </dt>
              <dd className="mt-1 text-base font-bold leading-snug tabular-nums text-gray-900 dark:text-gray-100">
                {item.value}
              </dd>
              {item.sub && (
                <dd className="mt-0.5 text-xs leading-snug text-gray-500 dark:text-gray-400">
                  {item.sub}
                </dd>
              )}
            </div>
          ))}
        </dl>
      </header>

      <div className="mt-10">
        <GuideSectionNav sections={sections} />

        <MonthSection
          n={n("schedule")}
          id="schedule"
          title={`${edition.year}年の日程`}
        >
          {!upcoming && (
            <p className="mb-4 rounded-lg border border-amber-600/30 bg-amber-600/5 p-3.5 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              {edition.year}
              年の開催は終わりました。次回の日程はまだ発表されていないか、このページにまだ載せていません。例年は{guide.usualTiming}です。
            </p>
          )}
          <EditionBlock edition={edition} />
          {previous && (
            <details className="mt-4 rounded-lg border border-gray-200 p-4 dark:border-neutral-700">
              <summary className="cursor-pointer text-sm font-semibold text-gray-700 dark:text-gray-300">
                前回({previous.year}年)の記録
              </summary>
              <div className="mt-3">
                <EditionBlock edition={previous} />
              </div>
            </details>
          )}
        </MonthSection>

        <MonthSection n={n("tickets")} id="tickets" title="チケット">
          <Summary>{guide.tickets.summary}</Summary>
          <ItemList items={guide.tickets.items} className="mt-4" />
        </MonthSection>

        {guide.places && (
          <MonthSection n={n("places")} id="places" title={guide.places.title}>
            {guide.places.intro && (
              <p className="mb-4 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                {guide.places.intro}
              </p>
            )}
            <ul className="space-y-3">
              {guide.places.items.map((place) => (
                <li
                  key={place.name}
                  className="rounded-xl border border-gray-200 p-4 dark:border-neutral-700"
                >
                  <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                    {place.name}
                  </p>
                  {place.meta && (
                    <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                      {place.meta}
                    </p>
                  )}
                  <p className="mt-2 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                    {place.body}
                  </p>
                  {place.href && (
                    <Link
                      href={place.href}
                      className="mt-2 inline-block text-xs font-semibold text-blue-600 underline underline-offset-2 dark:text-blue-400"
                    >
                      {place.name}の観光ガイドへ
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </MonthSection>
        )}

        <MonthSection n={n("timeline")} id="timeline" title="当日の流れ">
          <ol className="relative space-y-4 border-l-2 border-emerald-500/40 pl-5">
            {guide.timeline.map((step) => (
              <li key={step.time} className="relative">
                <span className="absolute -left-[27px] top-1 h-3 w-3 rounded-full border-2 border-emerald-500 bg-white dark:bg-neutral-950" />
                <p className="text-sm font-bold tabular-nums text-emerald-700 dark:text-emerald-400">
                  {step.time}
                </p>
                <p className="mt-0.5 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
          <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
            時刻は目安です。その年の時刻は「{edition.year}年の日程」を見てください。
          </p>
        </MonthSection>

        <AdSenseUnit slot={AD_SLOTS.inArticle} className="my-10" />

        <MonthSection n={n("transport")} id="transport" title="交通">
          <ItemList items={guide.transport} />
        </MonthSection>

        <MonthSection n={n("wear")} id="wear" title="服装・持ち物">
          <Summary>{guide.wear.summary}</Summary>
          <ItemList items={guide.wear.items} className="mt-4" />
          {guide.wear.banned.length > 0 && (
            <div className="mt-4 rounded-lg bg-gray-50 p-4 dark:bg-neutral-800/60">
              <p className="text-xs font-bold tracking-wide text-gray-600 dark:text-gray-400">
                持ち込めないもの
              </p>
              <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm text-gray-700 marker:text-gray-400 dark:text-gray-300">
                {guide.wear.banned.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                主催者がはっきり示しているものだけを挙げています。ほかの品は、チケットの規約で確かめてください。
              </p>
            </div>
          )}
        </MonthSection>

        <MonthSection n={n("mistakes")} id="mistakes" title="よくある失敗">
          <ItemList items={guide.mistakes} />
        </MonthSection>

        {guide.nonAttendees && (
          <MonthSection n={n("others")} id="others" title={guide.nonAttendees.title}>
            <ItemList items={guide.nonAttendees.items} />
          </MonthSection>
        )}
      </div>

      <section className="mt-12">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          あわせて読む
        </h2>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="block rounded-lg border border-gray-200 px-4 py-3 text-sm font-medium text-gray-900 transition hover:border-emerald-400 dark:border-neutral-700 dark:text-gray-100"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12 rounded-lg border border-gray-200 bg-gray-50 p-6 dark:border-neutral-700 dark:bg-neutral-900">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          参考・公式情報
        </h2>
        <ul className="mt-3 space-y-2 text-sm">
          {sources.map((source) => (
            <li key={source.href}>
              <a
                href={source.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline underline-offset-2 hover:opacity-80 dark:text-blue-400"
              >
                {source.label}
              </a>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
          {formatGuideDate(edition.checkedAt, true)}
          に公式の情報で確かめた内容です。日程・値段・持ち込みの規則は年によって変わるので、出かける前に公式サイトで確かめてください。
        </p>
      </section>
    </div>
  );
}

/** 「ひと目で」の先頭の枠。複数の会場・日に分かれる行事は最初の日を出す。 */
function scheduleGlance(
  guide: EventGuide,
  edition: GuideEdition,
  upcoming: boolean
): GlanceItem {
  const first = edition.dates[0];
  if (!upcoming) {
    return { label: "日程", value: "未発表", sub: `例年は${guide.usualTiming}` };
  }
  return {
    label: "日程",
    value: `${edition.year}年${formatGuideDateRange(first.date, first.endDate)}`,
    sub:
      edition.dates.length > 1
        ? `会場によって違う(${edition.dates.length}か所)`
        : first.time,
  };
}

function EditionBlock({ edition }: { edition: GuideEdition }) {
  return (
    <>
      <ul className="space-y-2">
        {edition.dates.map((d) => (
          <li
            key={`${d.label ?? ""}${d.date}`}
            className="flex gap-3 rounded-lg border border-gray-200 p-3.5 dark:border-neutral-700"
          >
            <CalendarCheck2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700 dark:text-emerald-400" />
            <div className="min-w-0">
              <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                {d.label && <span className="mr-2">{d.label}</span>}
                <span className="tabular-nums">
                  {formatGuideDateRange(d.date, d.endDate)}
                </span>
              </p>
              {d.time && (
                <p className="mt-0.5 text-sm text-gray-700 dark:text-gray-300">
                  {d.time}
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>
      {edition.notes.length > 0 && (
        <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-gray-700 marker:text-gray-400 dark:text-gray-300">
          {edition.notes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      )}
      <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
        {formatGuideDate(edition.checkedAt, true)}に確認(
        {edition.sources.map((s, i) => (
          <span key={s.url}>
            {i > 0 && "、"}
            <a
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:opacity-80"
            >
              {sourceShortLabel(s)}
            </a>
          </span>
        ))}
        )
      </p>
    </>
  );
}

/** 出典の短い名前。「Mayor of London – …」の「–」より前。 */
function sourceShortLabel(source: GuideSource): string {
  return source.label.split(" – ")[0];
}

function Summary({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-xl border-2 border-emerald-500 bg-emerald-50 p-4 text-sm font-medium leading-relaxed text-gray-900 dark:bg-emerald-950/30 dark:text-gray-100">
      {children}
    </p>
  );
}

function ItemList({
  items,
  className,
}: {
  items: GuideItem[];
  className?: string;
}) {
  return (
    <ul className={cn("space-y-3", className)}>
      {items.map((item) => (
        <li
          key={item.title}
          className="rounded-xl border border-gray-200 p-4 dark:border-neutral-700"
        >
          <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
            {item.title}
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
            {item.body}
          </p>
        </li>
      ))}
    </ul>
  );
}

function dedupeByHref<T extends { href: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.href)) return false;
    seen.add(item.href);
    return true;
  });
}
