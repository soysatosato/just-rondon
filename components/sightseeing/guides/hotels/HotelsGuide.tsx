import Link from "next/link";
import JsonLd from "@/components/seo/JsonLd";
import AdSenseUnit from "@/components/ads/AdSenseUnit";
import { AD_SLOTS } from "@/lib/adsense";
import Breadcrumbs from "@/components/navigation/Breadcrumbs";
import { Card, CardContent } from "@/components/ui/card";
import MarkdownBody from "@/components/jobs/MarkdownBody";
import GuideCallout from "@/components/guides/GuideCallout";
import GuideFaq from "@/components/guides/GuideFaq";
import GuideFreshness from "@/components/guides/GuideFreshness";
import GuideNotes from "@/components/guides/GuideNotes";
import GuideSectionNav from "@/components/guides/GuideSectionNav";
import GuideSources from "@/components/guides/GuideSources";
import { SITE_URL } from "@/lib/seo";
import { faqPageJsonLd } from "../../jsonld";
import {
  getTravelGuideMeta,
  travelGuideArticleJsonLd,
  travelGuideBreadcrumbJsonLd,
  travelGuidePath,
  travelGuides,
} from "../guides";
import AreaChooser from "./AreaChooser";
import {
  areas,
  needLabel,
  type Area,
  airportAreas,
  areaGuideLink,
  areaNote,
  avoid,
  booking,
  gotchaNotes,
  gotchas,
  hotelsFaq,
  hotelsLead,
  hotelsMeta,
  hotelsRelatedLinks,
  hotelsSections,
  hotelsSources,
  hubPremierInn,
  levyCallout,
  lodgingTypes,
  longStay,
  principleNotes,
  principles,
  roomTypes,
} from "./content";

/**
 * 宿泊エリア選びのレイアウト。
 *
 * TravelGuideLayout(markdown を同じ形のカードに流す)には載せていない。
 * この記事は読み物ではなく「13エリアから1つ選ぶ」ための道具で、
 * 均一なカードに流すと比較ができない。
 *
 * 節ごとに形が違う:
 *   areas   … 目的で絞り、詳細は開いたものだけ読む(AreaChooser)
 *   gotchas … double/twin の取り違えは予約後に直せないので前に出す
 *   avoid   … 後悔しやすい型を並べる
 *
 * SEO まわり(JSON-LD・パンくず・出典・鮮度・広告枠)は
 * TravelGuideLayout と同じ部品をそのまま使うこと。
 */
export default function HotelsGuide() {
  const meta = getTravelGuideMeta(hotelsMeta.slug);
  const pageUrl = `${SITE_URL}${travelGuidePath(hotelsMeta.slug)}`;
  const relatedGuides = travelGuides.filter((g) => g.slug !== hotelsMeta.slug);

  return (
    <main className="mx-auto max-w-4xl px-1 py-10 text-gray-900 dark:text-gray-100 sm:px-4">
      <JsonLd data={travelGuideBreadcrumbJsonLd(hotelsMeta)} />
      <JsonLd data={travelGuideArticleJsonLd(hotelsMeta)} />
      <JsonLd data={faqPageJsonLd(hotelsFaq, pageUrl)} />

      <Breadcrumbs
        path="/sightseeing"
        trail={[]}
        current={meta?.label ?? hotelsMeta.title}
      />

      <header className="mt-6">
        <h1 className="text-2xl font-bold leading-tight md:text-4xl">
          {hotelsMeta.title}
        </h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          {hotelsMeta.engTitle}
        </p>
        <div className="mt-3">
          <GuideFreshness
            dataAsOf={hotelsMeta.dataAsOf}
            updatedAt={hotelsMeta.updatedAt}
          />
        </div>
        <div className="mt-6">
          <MarkdownBody>{hotelsLead}</MarkdownBody>
        </div>
        <a
          href="#areas"
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
        >
          目的からエリアを選ぶ
          <span aria-hidden>↓</span>
        </a>
      </header>

      <GuideSectionNav sections={hotelsSections} />

      <AdSenseUnit slot={AD_SLOTS.inArticle} className="my-10" />

      <div className="space-y-12">
        {/* --------------------------------------------- 1. 3原則 */}
        <Section n={1} id="principles">
          <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
            細かいエリア論に入る前に、これだけ守れば大きく外しません。
          </p>

          <ol className="mt-4 space-y-3">
            {principles.map((p) => (
              <li
                key={p.n}
                className="flex gap-4 rounded-xl border border-gray-200 p-4 dark:border-neutral-700 sm:p-5"
              >
                <span
                  aria-hidden
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white"
                >
                  {p.n}
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
                    {p.title}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                    {p.body}
                  </p>
                  {p.link && (
                    <Link
                      href={p.link.href}
                      className="mt-1 inline-block text-sm text-blue-600 underline underline-offset-2 dark:text-blue-400"
                    >
                      {p.link.label}
                    </Link>
                  )}

                  {/* 原則2の中身。空港とエリアの対応は表より並べたほうが早い。 */}
                  {p.n === 2 && (
                    <ul className="mt-3 space-y-2">
                      {airportAreas.map((a) => (
                        <li
                          key={a.airport}
                          className="rounded-lg bg-gray-50 p-3 dark:bg-neutral-800/60"
                        >
                          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                            {a.airport}
                          </p>
                          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                            {a.line}
                          </p>
                          <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                            {a.areas}
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </li>
            ))}
          </ol>

          <GuideNotes items={principleNotes} />
        </Section>

        {/* --------------------------------------------- 2. エリア */}
        <Section n={2} id="areas">
          {/*
            カードはサーバーで描画して node として渡す。AreaChooser の中で
            MarkdownBody を呼ぶと react-markdown がクライアントバンドルに
            載り、初回読み込みが 50kB ほど増えるため。
          */}
          <AreaChooser
            cards={areas.map((area) => ({
              id: area.id,
              needs: area.needs,
              node: <AreaCard key={area.id} area={area} />,
            }))}
          />

          <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
            {areaNote}
          </p>

          <Link
            href={areaGuideLink.href}
            className="mt-4 block rounded-lg border border-gray-300 p-4 transition hover:border-emerald-400 dark:border-neutral-700 dark:hover:border-emerald-500"
          >
            <span className="block text-sm font-semibold text-gray-900 dark:text-gray-100">
              {areaGuideLink.label}
            </span>
            <span className="mt-0.5 block text-xs leading-relaxed text-gray-500 dark:text-gray-400">
              {areaGuideLink.blurb}
            </span>
          </Link>
        </Section>

        <AdSenseUnit slot={AD_SLOTS.inArticle} className="my-10" />

        {/* --------------------------------------------- 3. 宿のタイプ */}
        <Section n={3} id="types">
          <ul className="grid gap-3 sm:grid-cols-2">
            {lodgingTypes.map((t) => (
              <li
                key={t.type}
                className={`rounded-lg border p-4 ${
                  t.recommended
                    ? "border-emerald-400 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-950/30"
                    : "border-gray-200 dark:border-neutral-700"
                }`}
              >
                <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                  {t.type}
                </p>
                <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                  {t.examples}
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                  {t.who}
                </p>
              </li>
            ))}
          </ul>

          <div className="mt-5 rounded-xl border border-gray-200 p-5 dark:border-neutral-700">
            <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
              {hubPremierInn.title}
            </h3>
            <MarkdownBody>{hubPremierInn.body}</MarkdownBody>
          </div>

          <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-neutral-700 dark:bg-neutral-900">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {longStay.title}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              {longStay.body}
            </p>
            <ul className="mt-3 space-y-1.5 text-sm">
              {longStay.links.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-blue-600 underline underline-offset-2 dark:text-blue-400"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <GuideCallout {...levyCallout} />
        </Section>

        {/* --------------------------------------------- 4. 予約前に */}
        <Section n={4} id="gotchas">
          {/*
            部屋タイプの取り違えは予約後に直せない。
            以前は15節中13番目、エリアを決めたあとの位置にあった。
          */}
          <div className="rounded-xl border-2 border-red-400 bg-red-50 p-5 dark:border-red-800 dark:bg-red-950/30">
            <p className="text-xs font-bold tracking-wide text-red-700 dark:text-red-300">
              まずここ
            </p>
            <p className="mt-1 text-base font-bold text-gray-900 dark:text-gray-100">
              「double」はベッド1台です
            </p>
            <ul className="mt-3 space-y-2">
              {roomTypes.map((r) => (
                <li
                  key={r.en}
                  className="rounded-lg bg-white p-3 dark:bg-neutral-900"
                >
                  <p className="font-mono text-sm font-bold text-gray-900 dark:text-gray-100">
                    {r.en}
                  </p>
                  <p
                    className={`mt-0.5 text-sm ${
                      r.warn
                        ? "font-semibold text-red-700 dark:text-red-300"
                        : "text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {r.ja}
                  </p>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              友人同士や親子で「ベッドは別々がいい」という場合、twin は意識して探さないと見つかりません。
            </p>
          </div>

          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {gotchas.map((g) => (
              <li
                key={g.head}
                className="rounded-lg border border-gray-200 p-4 dark:border-neutral-700"
              >
                <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                  {g.head}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                  {g.body}
                </p>
                {g.link && (
                  <Link
                    href={g.link.href}
                    className="mt-1.5 inline-block text-sm text-blue-600 underline underline-offset-2 dark:text-blue-400"
                  >
                    {g.link.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>

          <GuideNotes items={gotchaNotes} />
        </Section>

        {/* --------------------------------------------- 5. 予約 */}
        <Section n={5} id="booking">
          <div className="rounded-xl border border-gray-200 p-5 dark:border-neutral-700">
            <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
              {booking.timing.title}
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              {booking.timing.body}
            </p>
            <p className="mt-3 text-sm font-semibold text-gray-900 dark:text-gray-100">
              高騰するので避けたい時期
            </p>
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {booking.timing.avoid.map((a) => (
                <li
                  key={a}
                  className="rounded bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700 dark:bg-red-950/40 dark:text-red-300"
                >
                  {a}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {booking.items.map((i) => (
              <div
                key={i.title}
                className="rounded-lg border border-gray-200 p-4 dark:border-neutral-700"
              >
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {i.title}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                  {i.body}
                </p>
              </div>
            ))}
          </div>
        </Section>

        {/* --------------------------------------------- 6. 避ける */}
        <Section n={6} id="avoid">
          <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
            実際に後悔しやすいパターンです。
          </p>
          <ul className="mt-4 space-y-2">
            {avoid.map((a) => (
              <li
                key={a.head}
                className="flex gap-3 rounded-lg border border-gray-200 p-4 dark:border-neutral-700"
              >
                <span
                  aria-hidden
                  className="mt-0.5 shrink-0 text-red-500"
                >
                  ✕
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-bold text-gray-900 dark:text-gray-100">
                    {a.head}
                  </span>
                  <span className="mt-0.5 block text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                    {a.body}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </Section>
      </div>

      <GuideFaq items={hotelsFaq} />
      <GuideSources sources={hotelsSources} dataAsOf={hotelsMeta.dataAsOf} />

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
          {hotelsRelatedLinks.map((link) => (
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
  const section = hotelsSections.find((s) => s.id === id);

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

/**
 * エリア1件のカード。
 *
 * 詳細を details にしているのは、閉じていても本文が DOM に残るから。
 * state で出し分けると、記事の実体であるエリア解説がプリレンダー結果に
 * 一切出ず、JS 無効でも読めなくなる。
 */
function AreaCard({ area }: { area: Area }) {
  return (
    <div
      id={area.id}
      className="scroll-mt-20 rounded-xl border border-gray-200 bg-white dark:border-neutral-700 dark:bg-neutral-900"
    >
      <div className="p-4 sm:p-5">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
            {area.name}
          </h3>
          <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-600 dark:bg-neutral-800 dark:text-gray-400">
            {area.price}
            {area.priceNote && `・${area.priceNote}`}
          </span>
          {area.tier === "other" && (
            <span className="text-xs text-gray-400 dark:text-gray-500">
              候補として
            </span>
          )}
        </div>
        <p className="mt-0.5 text-sm text-emerald-700 dark:text-emerald-400">
          {area.tagline}
        </p>

        {area.needs.length > 0 && (
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {area.needs.map((n) => (
              <li
                key={n}
                className="rounded bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
              >
                {needLabel(n)}
              </li>
            ))}
          </ul>
        )}

        <dl className="mt-3 space-y-1.5 text-sm">
          <div className="flex gap-3">
            <dt className="w-16 shrink-0 text-xs font-semibold text-gray-500 dark:text-gray-400">
              最寄駅
            </dt>
            <dd className="text-gray-700 dark:text-gray-300">{area.stations}</dd>
          </div>
          <div className="flex gap-3">
            <dt className="w-16 shrink-0 text-xs font-semibold text-gray-500 dark:text-gray-400">
              向く人
            </dt>
            <dd className="text-gray-700 dark:text-gray-300">{area.goodFor}</dd>
          </div>
          <div className="flex gap-3">
            <dt className="w-16 shrink-0 text-xs font-semibold text-gray-500 dark:text-gray-400">
              注意点
            </dt>
            <dd className="text-gray-700 dark:text-gray-300">{area.caution}</dd>
          </div>
        </dl>
      </div>

      {area.body && (
        <details className="group border-t border-gray-200 dark:border-neutral-700">
          <summary className="flex cursor-pointer list-none items-center gap-1 px-4 py-3 text-sm font-medium text-blue-600 dark:text-blue-400 sm:px-5 [&::-webkit-details-marker]:hidden">
            <span className="underline underline-offset-2 group-open:no-underline">
              詳しく読む
            </span>
            <span aria-hidden className="transition group-open:rotate-180">
              ▾
            </span>
          </summary>
          <div className="px-4 pb-4 sm:px-5">
            <MarkdownBody>{area.body}</MarkdownBody>
            {area.tips && area.tips.length > 0 && (
              <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-gray-700 marker:text-gray-400 dark:text-gray-300">
                {area.tips.map((t) => (
                  <li key={t} className="leading-relaxed">
                    {t}
                  </li>
                ))}
              </ul>
            )}
            {area.callout && <GuideCallout {...area.callout} />}
          </div>
        </details>
      )}
    </div>
  );
}
