import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { buildPageMetadata } from "@/lib/seo";
import { londonDate } from "@/lib/publish-schedule";
import {
  allEventGuides,
  eventGuidePath,
  formatGuideDateRange,
  monthsFromNow,
  pickEdition,
  SPOT_GUIDES,
} from "@/lib/annual-events";
import Breadcrumbs from "@/components/navigation/Breadcrumbs";
import JsonLd from "@/components/seo/JsonLd";
import { breadcrumbListJsonLd } from "@/components/navigation/tree";

// 並びは「今日から近い順」で、日付が替わると入れ替わる。
export const revalidate = 60 * 60 * 24;

export const metadata = buildPageMetadata({
  path: "/events/guides",
  title: "ロンドンの年中行事ガイド｜チケット・見る場所・交通規制",
  description:
    "年越し花火、ボンファイア・ナイトの花火大会、元日のパレードなど、ロンドンの大きな年中行事に行くための実務をまとめました。チケットの買い方、見る場所、当日の流れ、閉まる駅と帰り方、服装と持ち物まで。",
  keywords: [
    "ロンドン 年中行事",
    "ロンドン イベント チケット",
    "ロンドン 花火",
    "ロンドン パレード",
  ],
});

type Entry = {
  key: string;
  title: string;
  href: string;
  month: number;
  timing: string;
  summary: string;
};

export default function EventGuidesPage() {
  const today = londonDate(new Date());
  const todayMonth = Number(today.slice(5, 7));

  const entries: Entry[] = [
    ...allEventGuides().map((guide) => {
      const { edition, upcoming } = pickEdition(guide, today);
      const first = edition.dates[0];
      return {
        key: guide.slug,
        title: guide.title,
        href: eventGuidePath(guide),
        month: guide.month,
        timing: upcoming
          ? `${edition.year}年${formatGuideDateRange(first.date, first.endDate)}`
          : guide.usualTiming,
        summary: guide.lead,
      };
    }),
    ...SPOT_GUIDES.map((spot) => ({
      key: spot.href,
      title: spot.title,
      href: spot.href,
      month: spot.month,
      timing: spot.usualTiming,
      summary: spot.summary,
    })),
  ].sort(
    (a, b) =>
      monthsFromNow(a.month, todayMonth) - monthsFromNow(b.month, todayMonth)
  );

  return (
    <div data-page-main className="mx-auto max-w-3xl sm:px-4 pt-4 pb-8 text-gray-900 dark:text-gray-100 sm:pb-10">
      <JsonLd data={breadcrumbListJsonLd({ path: "/events/guides" })} />

      <Breadcrumbs path="/events/guides" className="mb-6" />

      <header>
        <h1 className="text-2xl font-bold leading-tight md:text-4xl">
          ロンドンの年中行事ガイド
        </h1>
        <p className="mt-4 text-base leading-relaxed text-gray-700 dark:text-gray-300">
          毎年決まった時期に開かれる大きな行事に、行くための実務だけをまとめています。チケットは要るか、どこで見るか、何時に着けばいいか、どの駅が閉まるか、何を着ていくか。近い行事から順に並べています。
        </p>
      </header>

      <ul className="mt-8 space-y-3">
        {entries.map((entry) => (
          <li key={entry.key}>
            <Link
              href={entry.href}
              className="group block rounded-xl border border-gray-200 p-5 transition hover:border-emerald-400 dark:border-neutral-700"
            >
              <p className="text-xs font-semibold tabular-nums text-emerald-700 dark:text-emerald-400">
                {entry.timing}
              </p>
              <h2 className="mt-1 flex items-center gap-2 text-lg font-bold">
                {entry.title}
                <ArrowRight className="h-4 w-4 shrink-0 opacity-50 transition-transform group-hover:translate-x-0.5" />
              </h2>
              <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                {entry.summary}
              </p>
            </Link>
          </li>
        ))}
      </ul>

      <p className="mt-10 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
        ほかの行事の日程は
        <Link
          href="/events/calendar"
          className="mx-1 text-link underline underline-offset-2 dark:text-blue-400"
        >
          年間イベントカレンダー
        </Link>
        に、その週だけの催しやストライキは
        <Link
          href="/events"
          className="mx-1 text-link underline underline-offset-2 dark:text-blue-400"
        >
          今週のロンドン
        </Link>
        にまとめています。
      </p>
    </div>
  );
}
