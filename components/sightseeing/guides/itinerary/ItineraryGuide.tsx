import Link from "next/link";
import JsonLd from "@/components/seo/JsonLd";
import AdSenseUnit from "@/components/ads/AdSenseUnit";
import { AD_SLOTS } from "@/lib/adsense";
import Breadcrumbs from "@/components/navigation/Breadcrumbs";
import { Card, CardContent } from "@/components/ui/card";
import GuideCallout from "@/components/guides/GuideCallout";
import GuideFaq from "@/components/guides/GuideFaq";
import GuideFreshness from "@/components/guides/GuideFreshness";
import GuideNotes from "@/components/guides/GuideNotes";
import GuideSectionNav from "@/components/guides/GuideSectionNav";
import GuideSources from "@/components/guides/GuideSources";
import { SITE_URL } from "@/lib/seo";
import { faqPageJsonLd } from "../../jsonld";
import GuideAttractionCards from "../GuideAttractionCards";
import {
  getTravelGuideMeta,
  travelGuideArticleJsonLd,
  travelGuideBreadcrumbJsonLd,
  travelGuidePath,
  travelGuides,
} from "../guides";
import {
  itineraryVariantPath,
  itineraryVariants,
  itineraryVariantsItemListJsonLd,
} from "../itinerary-variants";
import DayPicker from "./DayPicker";
import DayTimeline from "./DayTimeline";
import {
  assumptions,
  bookingCallout,
  bookings,
  dayFour,
  days,
  disclaimer,
  itineraryAttractionSlugs,
  itineraryFaq,
  itineraryMeta,
  itineraryRelatedLinks,
  itinerarySections,
  itinerarySources,
  otherPlans,
  skyGardenNote,
  tips,
} from "./content";

/**
 * ロンドンのモデルコース。
 *
 * TravelGuideLayout には載せていない。この記事は読み物ではなく
 * 現地で実行する予定表で、markdown の番号付きリストに流すと
 * 午前/昼/午後という骨格が本文中の太字にしかならない。
 * DayTimeline で時間帯を軸にし、所要時間と無料をバッジに出す。
 *
 * Day の JSON-LD(ItemList)は itineraryItemListJsonLd() が
 * `day-N` の id を検出して出していたが、こちらは記事データを
 * 持たないので、同じ形の ItemList をこの中で組み立てる。
 */
export default function ItineraryGuide() {
  const meta = getTravelGuideMeta(itineraryMeta.slug);
  const pageUrl = `${SITE_URL}${travelGuidePath(itineraryMeta.slug)}`;
  const relatedGuides = travelGuides.filter(
    (g) => g.slug !== itineraryMeta.slug
  );

  // Day の並びは 1,2,3,5 が days、4 は選択制なので別に持っている。
  const allDayNumbers = [...days.map((d) => d.n), dayFour.n].sort(
    (a, b) => a - b
  );

  const dayItemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": `${pageUrl}#itinerary`,
    name: itineraryMeta.title,
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    numberOfItems: allDayNumbers.length,
    itemListElement: allDayNumbers.map((n, i) => {
      const day = n === dayFour.n ? dayFour : days.find((d) => d.n === n)!;
      return {
        "@type": "ListItem",
        position: i + 1,
        name: `Day ${n}｜${day.title}`,
        url: `${pageUrl}#day-${n}`,
      };
    }),
  };

  return (
    <main className="mx-auto max-w-4xl px-1 py-10 text-gray-900 dark:text-gray-100 sm:px-4">
      <JsonLd data={travelGuideBreadcrumbJsonLd(itineraryMeta)} />
      <JsonLd data={travelGuideArticleJsonLd(itineraryMeta)} />
      <JsonLd data={faqPageJsonLd(itineraryFaq, pageUrl)} />
      <JsonLd data={dayItemList} />
      <JsonLd data={itineraryVariantsItemListJsonLd()} />

      <Breadcrumbs
        path="/sightseeing"
        trail={[]}
        current={meta?.label ?? itineraryMeta.title}
      />

      <header className="mt-6">
        <h1 className="text-2xl font-bold leading-tight md:text-4xl">
          {itineraryMeta.title}
        </h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          {itineraryMeta.engTitle}
        </p>
        <div className="mt-3">
          <GuideFreshness
            dataAsOf={itineraryMeta.dataAsOf}
            updatedAt={itineraryMeta.updatedAt}
          />
        </div>

        <p className="mt-6 text-base leading-relaxed text-gray-700 dark:text-gray-300">
          {itineraryMeta.summary}
        </p>

        <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-neutral-700 dark:bg-neutral-900">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            このコースの前提
          </p>
          <ul className="mt-2 space-y-1.5">
            {assumptions.map((a) => (
              <li
                key={a.text}
                className="flex flex-wrap gap-x-2 text-sm leading-relaxed text-gray-700 dark:text-gray-300"
              >
                <span aria-hidden className="text-gray-400">
                  ・
                </span>
                <span>
                  {a.text}
                  {a.href && (
                    <>
                      {" "}
                      <Link
                        href={a.href}
                        className="text-blue-600 underline underline-offset-2 dark:text-blue-400"
                      >
                        {a.label}
                      </Link>
                    </>
                  )}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
            {disclaimer}
          </p>
        </div>
      </header>

      <GuideSectionNav sections={itinerarySections} />

      <AdSenseUnit slot={AD_SLOTS.inArticle} className="my-10" />

      <div className="space-y-12">
        {/* --------------------------------------------- 1. 日数 */}
        <Section n={1} id="how-many-days">
          <DayPicker />
        </Section>

        {/* --------------------------------------------- 2. 予約 */}
        <Section n={2} id="booking-first">
          <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
            ロンドンの主要施設は日時指定の事前予約制が主流です。当日券がない、あるいは大幅に割高になるものが多いので、日程が決まったらまずここから押さえてください。
          </p>

          <ul className="mt-4 space-y-2">
            {bookings.map((b) => {
              const must = b.level === "必須";
              const none = b.level === "不要";
              return (
                <li
                  key={b.what}
                  className={`flex items-start gap-3 rounded-lg border p-3 ${
                    b.highlight
                      ? "border-2 border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30"
                      : "border-gray-200 dark:border-neutral-700"
                  }`}
                >
                  <span
                    className={`mt-0.5 shrink-0 rounded px-2 py-0.5 text-xs font-bold ${
                      must
                        ? "bg-red-600 text-white"
                        : none
                          ? "bg-gray-100 text-gray-500 dark:bg-neutral-800 dark:text-gray-400"
                          : "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
                    }`}
                  >
                    {b.level}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {b.what}
                    </span>
                    <span className="mt-0.5 block text-sm text-gray-600 dark:text-gray-400">
                      {b.when}
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>

          <p className="mt-4 rounded-lg bg-gray-100 px-4 py-3 text-sm leading-relaxed text-gray-900 dark:bg-neutral-800 dark:text-gray-100">
            {skyGardenNote}
          </p>

          <GuideCallout {...bookingCallout} />
        </Section>

        {/* --------------------------------------------- Day 1〜3 */}
        {days
          .filter((d) => d.n <= 3)
          .map((day) => (
            <DaySection key={day.n} n={day.n + 2} day={day} />
          ))}

        <AdSenseUnit slot={AD_SLOTS.inArticle} className="my-10" />

        {/* --------------------------------------------- Day 4（4択） */}
        <Section n={6} id="day-4">
          <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
            {dayFour.intro}
          </p>

          <ul className="mt-4 space-y-3">
            {dayFour.options.map((o) => (
              <li
                key={o.name}
                className={`rounded-xl border-2 p-4 sm:p-5 ${
                  o.best
                    ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30"
                    : "border-gray-200 dark:border-neutral-700"
                }`}
              >
                {o.best && (
                  <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                    コストパフォーマンスが最も高い
                  </p>
                )}
                <h3 className="mt-0.5 text-base font-bold text-gray-900 dark:text-gray-100">
                  {o.name}
                </h3>
                <dl className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm">
                  <div className="flex gap-1.5">
                    <dt className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                      所要
                    </dt>
                    <dd className="font-semibold text-gray-900 dark:text-gray-100">
                      {o.duration}
                    </dd>
                  </div>
                  <div className="flex gap-1.5">
                    <dt className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                      予約
                    </dt>
                    <dd className="font-semibold text-gray-900 dark:text-gray-100">
                      {o.booking}
                    </dd>
                  </div>
                </dl>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {o.access}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                  {o.body}
                </p>
              </li>
            ))}
          </ul>

          <GuideCallout {...dayFour.callout} />
        </Section>

        {/* --------------------------------------------- Day 5 */}
        {days
          .filter((d) => d.n === 5)
          .map((day) => (
            <DaySection key={day.n} n={7} day={day} />
          ))}

        {/* --------------------------------------------- 分岐版 */}
        <Section n={8} id="variants">
          <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
            雨が降った、子どもがいる、乗り継ぎで数時間しかない——このモデルコースをそのまま実行できない事情には、それぞれ別ページを用意しています。
          </p>

          <div className="mt-4 space-y-3">
            {itineraryVariants.map((v) => (
              <Link
                key={v.slug}
                href={itineraryVariantPath(v.slug)}
                className="block rounded-xl border border-gray-300 p-5 transition hover:border-emerald-400 dark:border-neutral-700 dark:hover:border-emerald-500"
              >
                <span className="block text-xs font-semibold text-emerald-600">
                  {v.eyebrow}
                </span>
                <span className="mt-1 block text-base font-bold text-gray-900 dark:text-gray-100">
                  {v.label}
                </span>
                <span className="mt-1 block text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                  {v.blurb}
                </span>
              </Link>
            ))}
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {otherPlans.map((p) => (
              <div
                key={p.title}
                className="rounded-lg border border-gray-200 p-4 dark:border-neutral-700"
              >
                <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                  {p.title}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                  {p.body}
                </p>
              </div>
            ))}
          </div>
        </Section>

        {/* --------------------------------------------- コツ */}
        <Section n={9} id="tips">
          <div className="grid gap-4 sm:grid-cols-2">
            {[tips.time, tips.weekday].map((t) => (
              <div
                key={t.title}
                className="rounded-lg border border-gray-200 p-4 dark:border-neutral-700"
              >
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {t.title}
                </p>
                <ul className="mt-2 space-y-1.5">
                  {t.items.map((i) => (
                    <li
                      key={i}
                      className="flex gap-2 text-sm leading-relaxed text-gray-700 dark:text-gray-300"
                    >
                      <span aria-hidden className="text-gray-400">
                        ・
                      </span>
                      {i}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-lg border border-gray-200 p-4 dark:border-neutral-700">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {tips.walking.title}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              {tips.walking.body}
            </p>
          </div>

          <GuideCallout {...tips.callout} />
        </Section>
      </div>

      <GuideAttractionCards slugs={itineraryAttractionSlugs} />

      <GuideFaq items={itineraryFaq} />
      <GuideSources
        sources={itinerarySources}
        dataAsOf={itineraryMeta.dataAsOf}
      />

      <section className="mt-12">
        <h2 className="text-lg font-semibold">ほかの旅行ガイド</h2>
        <div className="mt-4 space-y-3">
          {relatedGuides.map((g) => (
            <Link key={g.slug} href={travelGuidePath(g.slug)} className="block">
              <Card className="border-gray-300 bg-white shadow-sm transition hover:border-emerald-400 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:border-emerald-500">
                <CardContent className="p-5">
                  <span className="block text-xs font-semibold text-emerald-600">
                    {g.eyebrow}
                  </span>
                  <span className="mt-1 block text-base font-semibold">
                    {g.label}
                  </span>
                  <span className="mt-1 block text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                    {g.blurb}
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <div className="mt-6 space-y-2 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-neutral-700 dark:bg-neutral-900 sm:p-6">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          関連ページ
        </h2>
        <ul className="space-y-2 text-sm">
          {itineraryRelatedLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-blue-600 hover:opacity-80 dark:text-blue-400"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <AdSenseUnit slot={AD_SLOTS.articleBottom} className="mt-10" />
    </main>
  );
}

/** Day 1つぶんの節。見出しの形を Section とそろえる。 */
function DaySection({
  n,
  day,
}: {
  n: number;
  day: (typeof days)[number];
}) {
  return (
    <section id={`day-${day.n}`} className="scroll-mt-20">
      <h2 className="mb-1 flex items-baseline gap-2.5 text-xl font-bold text-gray-900 dark:text-gray-100">
        <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">
          {n}
        </span>
        Day {day.n}｜{day.title}
      </h2>
      <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
        {day.subtitle}
      </p>
      <DayTimeline day={day} />
    </section>
  );
}

/** 節の外枠。見出しの形をここに集約する。 */
function Section({
  n,
  id,
  children,
}: {
  n: number;
  id: string;
  children: React.ReactNode;
}) {
  const section = itinerarySections.find((s) => s.id === id);

  return (
    <section id={id} className="scroll-mt-20">
      <h2 className="mb-4 flex items-baseline gap-2.5 text-xl font-bold text-gray-900 dark:text-gray-100">
        <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">
          {n}
        </span>
        {section?.label}
      </h2>
      {children}
    </section>
  );
}
