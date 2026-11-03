import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import JsonLd from "@/components/seo/JsonLd";
import AdSenseUnit from "@/components/ads/AdSenseUnit";
import { AD_SLOTS } from "@/lib/adsense";
import Breadcrumbs from "@/components/navigation/Breadcrumbs";
import { sightseeingBreadcrumbJsonLd } from "@/components/sightseeing/jsonld";
import { categoryLabel } from "@/components/sightseeing/categories";
import { attractionPagePath } from "@/lib/museum-attraction-pairs";
import { buildPageMetadata } from "@/lib/seo";
import {
  OPEN_DAY_PAGES,
  OPEN_DAY_SLUGS,
  openDayPath,
  splitByWeekday,
  weekdaysLabel,
  type OpenDayPage,
  type OpenDaySlug,
  type OpenDaySpot,
} from "@/lib/sightseeing/open-days";
import { fetchOpenDaySpots } from "@/utils/open-days";

/**
 * 曜日で探すページ。日曜と月曜の2本(理由は lib/sightseeing/open-days.ts)。
 *
 * 一覧は観光スポットの休みの曜日(closedWeekdays)から作るので、スポットを
 * 確かめて足すたびに増える。再生成はスポットのページと同じ1時間ごと。
 */
export const revalidate = 3600;
export const dynamicParams = false;

export function generateStaticParams() {
  return OPEN_DAY_SLUGS.map((day) => ({ day }));
}

function getPage(day: string): OpenDayPage | null {
  return (OPEN_DAY_SLUGS as string[]).includes(day)
    ? OPEN_DAY_PAGES[day as OpenDaySlug]
    : null;
}

function namesOf(spots: OpenDaySpot[], count: number): string {
  return spots
    .slice(0, count)
    .map((s) => s.name)
    .join("、");
}

function describe(page: OpenDayPage, closed: OpenDaySpot[], total: number) {
  const lead = `${page.short}に休む・見学できないロンドンの観光地(${namesOf(closed, 3)}など${closed.length}か所)と、${page.short}も開いている定番を、休みの曜日を公式で確かめた${total}か所から並べました。`;
  return page.slug === "sunday"
    ? `${lead}大きな店の日曜の営業は6時間までという決まりも。`
    : lead;
}

/** "2026年9月〜11月"。年をまたぐときは両方に年を付ける。 */
function checkedSpan(from: Date | null, to: Date | null): string | null {
  if (!from || !to) return null;
  const a = `${from.getFullYear()}年${from.getMonth() + 1}月`;
  if (from.getFullYear() !== to.getFullYear()) {
    return `${a}〜${to.getFullYear()}年${to.getMonth() + 1}月`;
  }
  return from.getMonth() === to.getMonth() ? a : `${a}〜${to.getMonth() + 1}月`;
}

export async function generateMetadata({
  params,
}: {
  params: { day: string };
}): Promise<Metadata> {
  const page = getPage(params.day);
  if (!page) return {};
  const { spots } = await fetchOpenDaySpots();
  const { closed } = splitByWeekday(spots, page.weekday);
  return buildPageMetadata({
    path: openDayPath(page.slug),
    title: page.title,
    description: describe(page, closed, spots.length),
  });
}

const linkClass = "text-link underline underline-offset-2 dark:text-blue-400";

function SpotItem({
  spot,
  detail,
}: {
  spot: OpenDaySpot;
  detail: string | null;
}) {
  return (
    <li className="py-3">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
        <Link
          href={attractionPagePath(spot.slug)}
          className="text-base font-semibold text-neutral-900 underline-offset-2 hover:underline dark:text-neutral-100"
        >
          {spot.name}
        </Link>
        <span className="text-xs text-neutral-500 dark:text-neutral-400">
          {categoryLabel(spot.category)}
        </span>
      </div>
      {detail && (
        <p className="mt-0.5 text-sm text-neutral-700 dark:text-neutral-300">{detail}</p>
      )}
      {spot.closedNote && (
        <p className="mt-0.5 text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
          {spot.closedNote}
        </p>
      )}
    </li>
  );
}

function SpotSection({
  id,
  title,
  lead,
  children,
}: {
  id: string;
  title: string;
  lead?: string;
  children: React.ReactNode;
}) {
  return (
    <section aria-labelledby={id} className="mt-10">
      <h2 id={id} className="text-xl font-bold md:text-2xl">
        {title}
      </h2>
      {lead && (
        <p className="mt-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
          {lead}
        </p>
      )}
      <ul className="mt-2 divide-y divide-neutral-200 dark:divide-neutral-800">
        {children}
      </ul>
    </section>
  );
}

const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6];

export default async function OpenDayPageView({
  params,
}: {
  params: { day: string };
}) {
  const page = getPage(params.day);
  if (!page) notFound();

  const { spots, checkedFrom, checkedTo, uncheckedCount } =
    await fetchOpenDaySpots();
  const { closed, onlyThisDay, staples, openCount } = splitByWeekday(
    spots,
    page.weekday,
  );
  const other = OPEN_DAY_PAGES[page.slug === "sunday" ? "monday" : "sunday"];
  const path = openDayPath(page.slug);
  const span = checkedSpan(checkedFrom, checkedTo);

  return (
    <div
      data-page-main
      className="mx-auto max-w-3xl pt-4 pb-10 text-neutral-900 dark:text-neutral-100 sm:px-4"
    >
      <JsonLd data={sightseeingBreadcrumbJsonLd([{ name: page.name, path }])} />

      <Breadcrumbs path="/sightseeing" current={page.name} />

      <header className="mt-6 space-y-3">
        <h1 className="text-2xl font-bold leading-tight md:text-4xl">{page.h1}</h1>
        <p className="text-base leading-relaxed text-neutral-700 dark:text-neutral-300">
          {`${page.short}に休む・見学できない所は${closed.length}か所あります(${namesOf(closed, 3)}など)。${namesOf(staples, 4)}は${page.short}も開いています。休みの曜日を公式サイトで確かめた${spots.length}か所から並べています。`}
        </p>
      </header>

      <SpotSection
        id="closed"
        title={`${page.short}に休む・見学できない所(${closed.length})`}
        lead="見られている順です。ほかに休む曜日があれば一緒に書いています。"
      >
        {closed.map((spot) => (
          <SpotItem
            key={spot.slug}
            spot={spot}
            detail={`休み: ${weekdaysLabel(spot.closedWeekdays)}`}
          />
        ))}
      </SpotSection>

      {onlyThisDay.length > 0 && (
        <SpotSection
          id="only"
          title={`${page.short}を含む数日だけ開く所(${onlyThisDay.length})`}
          lead={`週の半分以上を休み、${page.short}に開く所です。`}
        >
          {onlyThisDay.map((spot) => (
            <SpotItem
              key={spot.slug}
              spot={spot}
              detail={`行けるのは: ${weekdaysLabel(
                ALL_DAYS.filter((d) => !spot.closedWeekdays.includes(d)),
              )}`}
            />
          ))}
        </SpotSection>
      )}

      <AdSenseUnit slot={AD_SLOTS.inArticle} className="my-10" />

      <SpotSection
        id="open"
        title={`${page.short}も開いている定番`}
        lead={`${page.short}も開いている${openCount}か所のうち、必見とおすすめの所を見られている順に${staples.length}か所。時刻は代表的な開館時間です。`}
      >
        {staples.map((spot) => (
          <SpotItem
            key={spot.slug}
            spot={spot}
            detail={
              spot.closedWeekdays.length > 0
                ? `休み: ${weekdaysLabel(spot.closedWeekdays)}${spot.openingHours ? `　開館 ${spot.openingHours}` : ""}`
                : spot.openingHours
            }
          />
        ))}
      </SpotSection>
      <p className="mt-3 text-sm">
        ほかの{openCount - staples.length}か所は
        <Link href="/sightseeing/all" className={`mx-1 ${linkClass}`}>
          観光スポット一覧
        </Link>
        から。
      </p>

      <section aria-labelledby="notes" className="mt-10">
        <h2 id="notes" className="text-xl font-bold md:text-2xl">
          {page.short}に気をつけること
        </h2>
        <ul className="mt-3 space-y-3">
          {page.notes.map((note) => (
            <li
              key={note.title}
              className="rounded-xl border border-neutral-200 p-4 dark:border-neutral-700"
            >
              <p className="text-sm font-bold">{note.title}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
                {note.body}
              </p>
              {note.link && (
                <p className="mt-2 text-sm">
                  <Link href={note.link.href} className={linkClass}>
                    {note.link.label}
                  </Link>
                </p>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section
        aria-labelledby="about-list"
        className="mt-10 rounded-lg border border-neutral-200 bg-neutral-50 p-5 dark:border-neutral-700 dark:bg-neutral-900"
      >
        <h2
          id="about-list"
          className="text-sm font-semibold text-neutral-700 dark:text-neutral-300"
        >
          この一覧について
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
          {`休みの曜日を各スポットの公式サイトで確かめた${spots.length}か所${span ? `(${span}に確認)` : ""}から作っています。まだ確かめていない${uncheckedCount}か所は載せていません。季節で変わる休みや臨時の休みは各スポットの注記に書いていますが、出かける前には公式サイトでも確かめてください。旅行プランでは、日付を入れると、休みの日に入れた行き先に印が付きます。`}
        </p>
        {page.sources.length > 0 && (
          <ul className="mt-3 space-y-1.5 text-sm">
            {page.sources.map((source) => (
              <li key={source.url}>
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={linkClass}
                >
                  {source.label}
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>

      <nav aria-label="関連ページ" className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-sm">
        <Link href={openDayPath(other.slug)} className={linkClass}>
          {other.h1}
        </Link>
        <Link href="/shopping/markets" className={linkClass}>
          マーケットの曜日表
        </Link>
        <Link href="/plan" className={linkClass}>
          旅行プランを作る
        </Link>
      </nav>
    </div>
  );
}
