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
import {
  getTravelGuideMeta,
  travelGuideArticleJsonLd,
  travelGuideBreadcrumbJsonLd,
  travelGuidePath,
  travelGuides,
} from "../guides";
import {
  assistPhrase,
  assistance,
  attractions,
  bus,
  checkNotes,
  discounts,
  hotelsToilets,
  howToCheck,
  modes,
  planning,
  principle,
  scope,
  stepFreeFaq,
  stepFreeLead,
  stepFreeMeta,
  stepFreeRelatedLinks,
  stepFreeSections,
  stepFreeSources,
  symbolNone,
  symbols,
  taxi,
} from "./content";

/**
 * バリアフリーのロンドン。
 *
 * このサイトで1人あたりの失敗コストが最も高いページ。読み違えると
 * エレベーターの無い駅で降りられなくなるので、「読ませる」のではなく
 * 「間違えようがない形で見せる」ことを優先している。
 *
 * TravelGuideLayout には載せていない。あれに流すと、この記事の主張
 * そのもの(乗り物によって落差が極端)が横スクロールする6行の表になり、
 * 最初に頭へ入れるべき一枚がいちばん読みにくくなる。
 *
 * 節ごとに形が違う:
 *   modes        … 判定バッジで「使えるもの/使えないもの」を上から見せる
 *   how-to-check … 青と白抜きの記号を、表の行ではなく記号として対比させる
 *   assistance   … 駅員に言う一文を最初に、大きく出す
 *   attractions  … 回りやすい/難しいを左右に並べて対にする
 */
export default function StepFreeGuide() {
  const meta = getTravelGuideMeta(stepFreeMeta.slug);
  const pageUrl = `${SITE_URL}${travelGuidePath(stepFreeMeta.slug)}`;
  const relatedGuides = travelGuides.filter((g) => g.slug !== stepFreeMeta.slug);

  return (
    <main className="mx-auto max-w-4xl px-1 py-10 text-gray-900 dark:text-gray-100 sm:px-4">
      <JsonLd data={travelGuideBreadcrumbJsonLd(stepFreeMeta)} />
      <JsonLd data={travelGuideArticleJsonLd(stepFreeMeta)} />
      <JsonLd data={faqPageJsonLd(stepFreeFaq, pageUrl)} />

      <Breadcrumbs
        path="/sightseeing"
        trail={[]}
        current={meta?.label ?? stepFreeMeta.title}
      />

      <header className="mt-6">
        <h1 className="text-2xl font-bold leading-tight md:text-4xl">
          {stepFreeMeta.title}
        </h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          {stepFreeMeta.engTitle}
        </p>
        <div className="mt-3">
          <GuideFreshness
            dataAsOf={stepFreeMeta.dataAsOf}
            updatedAt={stepFreeMeta.updatedAt}
          />
        </div>

        <p className="mt-6 text-base leading-relaxed text-gray-700 dark:text-gray-300">
          {stepFreeLead}
        </p>

        <div className="mt-6 rounded-xl border-2 border-emerald-500 bg-emerald-50 p-5 dark:bg-emerald-950/30">
          <p className="text-xs font-bold tracking-wide text-emerald-700 dark:text-emerald-300">
            この記事の結論
          </p>
          <p className="mt-1 text-base font-bold leading-snug text-gray-900 dark:text-gray-100 sm:text-lg">
            {principle.headline}
          </p>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
          {scope.body}{" "}
          <Link
            href={scope.href}
            className="text-blue-600 underline underline-offset-2 dark:text-blue-400"
          >
            {scope.label}
          </Link>
        </p>
      </header>

      <GuideSectionNav sections={stepFreeSections} />

      <AdSenseUnit slot={AD_SLOTS.inArticle} className="my-10" />

      <div className="space-y-12">
        {/* --------------------------------------------- 1. 乗り物 */}
        <Section n={1} id="modes">
          {/*
            この記事で最初に頭に入れてほしい一枚。
            以前は横スクロールしないと右端の判定が読めない6行の表だった。
          */}
          <ul className="space-y-2">
            {modes.map((m) => {
              const ok = m.verdict === "段差なし";
              const bad = m.verdict === "期待しない";
              return (
                <li
                  key={m.name}
                  className={`flex items-start gap-3 rounded-lg border-2 p-3 ${
                    bad
                      ? "border-red-400 bg-red-50 dark:border-red-800 dark:bg-red-950/30"
                      : ok
                        ? "border-emerald-400 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-950/25"
                        : "border-gray-200 dark:border-neutral-700"
                  }`}
                >
                  <span
                    className={`mt-0.5 shrink-0 rounded px-2 py-0.5 text-xs font-bold ${
                      bad
                        ? "bg-red-600 text-white"
                        : ok
                          ? "bg-emerald-600 text-white"
                          : "bg-gray-200 text-gray-700 dark:bg-neutral-700 dark:text-gray-300"
                    }`}
                  >
                    {m.verdict}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-bold text-gray-900 dark:text-gray-100">
                      {m.name}
                    </span>
                    <span className="mt-0.5 block text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                      {m.detail}
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>

          <div className="mt-5 rounded-lg border border-gray-200 p-4 dark:border-neutral-700">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {principle.why.title}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              {principle.why.body}
            </p>
          </div>

          <p className="mt-4 rounded-lg border-2 border-red-400 bg-red-50 px-4 py-3 text-sm font-semibold leading-relaxed text-red-800 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300">
            {principle.warning}
          </p>

          <GuideCallout {...principle.callout} />
        </Section>

        {/* --------------------------------------------- 2. 調べ方 */}
        <Section n={2} id="how-to-check">
          <ol className="space-y-3">
            {howToCheck.map((h) => (
              <li
                key={h.n}
                className="flex gap-4 rounded-xl border border-gray-200 p-4 dark:border-neutral-700 sm:p-5"
              >
                <span
                  aria-hidden
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white"
                >
                  {h.n}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span className="text-base font-bold text-gray-900 dark:text-gray-100">
                      {h.title}
                    </span>
                    {h.badge && (
                      <span className="rounded bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                        {h.badge}
                      </span>
                    )}
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                    {h.body}
                  </p>
                  {h.points.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {h.points.map((p) => (
                        <li
                          key={p}
                          className="flex gap-2 text-sm leading-relaxed text-gray-700 dark:text-gray-300"
                        >
                          <span aria-hidden className="text-gray-400">
                            ・
                          </span>
                          {p}
                        </li>
                      ))}
                    </ul>
                  )}

                  {/*
                    青と白抜きの違い。記事自身が「この2種類の区別が重要」と
                    言っている核心なので、表の行ではなく記号として対比させる。
                  */}
                  {h.n === 2 && (
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      {symbols.map((s) => (
                        <div
                          key={s.mark}
                          className={`rounded-lg border-2 p-4 ${
                            s.filled
                              ? "border-blue-500 bg-blue-50 dark:border-blue-700 dark:bg-blue-950/30"
                              : "border-gray-400 dark:border-neutral-500"
                          }`}
                        >
                          <span
                            aria-hidden
                            className={`flex h-9 w-9 items-center justify-center rounded-full text-lg font-bold ${
                              s.filled
                                ? "bg-blue-600 text-white"
                                : "border-2 border-gray-500 text-gray-600 dark:text-gray-300"
                            }`}
                          >
                            ♿
                          </span>
                          <p className="mt-2 text-sm font-bold text-gray-900 dark:text-gray-100">
                            {s.mark}
                          </p>
                          <p className="mt-1 text-sm font-semibold text-gray-800 dark:text-gray-200">
                            {s.means}
                          </p>
                          <p className="mt-1 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                            {s.detail}
                          </p>
                        </div>
                      ))}
                      <p className="text-xs text-gray-500 dark:text-gray-400 sm:col-span-2">
                        {symbolNone}
                      </p>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ol>

          <GuideNotes items={checkNotes} />
        </Section>

        {/* --------------------------------------------- 3. 介助 */}
        <Section n={3} id="assistance">
          <p className="text-base font-bold leading-snug text-gray-900 dark:text-gray-100">
            {assistance.headline}
          </p>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            これを <strong className="font-mono font-semibold">{assistance.name}</strong> と呼びます。
          </p>

          {/* 実際に口に出す一文。以前は本文中の引用ブロックだった。 */}
          <div className="mt-4 rounded-xl border-2 border-emerald-500 bg-emerald-50 p-5 dark:bg-emerald-950/30">
            <p className="text-xs font-bold tracking-wide text-emerald-700 dark:text-emerald-300">
              駅員にこう言えば通じます
            </p>
            <p className="mt-2 text-lg font-bold leading-snug text-gray-900 dark:text-gray-100 sm:text-xl">
              “{assistPhrase.en}”
            </p>
            <p className="mt-1.5 text-sm text-gray-600 dark:text-gray-400">
              {assistPhrase.ja}
            </p>
          </div>

          <ol className="mt-5 space-y-2">
            {assistance.steps.map((s, i) => (
              <li
                key={s}
                className="flex gap-3 rounded-lg border border-gray-200 p-3 dark:border-neutral-700"
              >
                <span
                  aria-hidden
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-600 dark:bg-neutral-800 dark:text-gray-400"
                >
                  {i + 1}
                </span>
                <span className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                  {s}
                </span>
              </li>
            ))}
          </ol>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {[assistance.nationalRail, assistance.bus].map((t) => (
              <div
                key={t.title}
                className="rounded-lg border border-gray-200 p-4 dark:border-neutral-700"
              >
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {t.title}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                  {t.body}
                </p>
              </div>
            ))}
          </div>

          <GuideCallout {...assistance.callout} />
        </Section>

        <AdSenseUnit slot={AD_SLOTS.inArticle} className="my-10" />

        {/* --------------------------------------------- 4. バス */}
        <Section n={4} id="bus">
          <p className="text-base font-bold leading-snug text-gray-900 dark:text-gray-100">
            {bus.headline}
          </p>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-gray-200 p-4 dark:border-neutral-700">
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                何ができるか
              </p>
              <ul className="mt-2 space-y-1.5">
                {bus.can.map((c) => (
                  <li
                    key={c}
                    className="flex gap-2 text-sm leading-relaxed text-gray-700 dark:text-gray-300"
                  >
                    <span aria-hidden className="text-emerald-600 dark:text-emerald-400">
                      ✓
                    </span>
                    {c}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-lg border border-gray-200 p-4 dark:border-neutral-700">
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                乗り方
              </p>
              <ol className="mt-2 space-y-1.5">
                {bus.howTo.map((h, i) => (
                  <li
                    key={h}
                    className="flex gap-2 text-sm leading-relaxed text-gray-700 dark:text-gray-300"
                  >
                    <span aria-hidden className="shrink-0 font-bold text-gray-400">
                      {i + 1}
                    </span>
                    {h}
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <ul className="mt-4 grid gap-2 sm:grid-cols-3">
            {bus.fares.map((f) => (
              <li
                key={f.label}
                className="rounded-lg border border-gray-200 p-4 dark:border-neutral-700"
              >
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                  {f.label}
                </p>
                <p className="mt-1 text-base font-bold text-gray-900 dark:text-gray-100">
                  {f.value}
                </p>
              </li>
            ))}
          </ul>

          <p className="mt-4 rounded-lg bg-gray-100 px-4 py-3 text-sm leading-relaxed text-gray-900 dark:bg-neutral-800 dark:text-gray-100">
            {bus.hopperPoint}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
            {bus.capPoint}
          </p>

          <GuideNotes items={bus.notes} />
        </Section>

        {/* --------------------------------------------- 5. タクシー */}
        <Section n={5} id="taxi">
          <div className="rounded-xl border-2 border-emerald-500 bg-emerald-50 p-5 dark:bg-emerald-950/30">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              {taxi.blackCab.title}
            </p>
            <p className="mt-1 text-lg font-bold text-gray-900 dark:text-gray-100">
              {taxi.blackCab.verdict}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              {taxi.blackCab.body}
            </p>
            <ul className="mt-3 space-y-1.5">
              {taxi.blackCab.points.map((p) => (
                <li
                  key={p}
                  className="flex gap-2 text-sm leading-relaxed text-gray-700 dark:text-gray-300"
                >
                  <span aria-hidden className="text-emerald-600 dark:text-emerald-400">
                    ✓
                  </span>
                  {p}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {taxi.others.map((o) => (
              <div
                key={o.title}
                className="rounded-lg border border-gray-200 p-4 dark:border-neutral-700"
              >
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {o.title}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                  {o.body}
                </p>
              </div>
            ))}
          </div>

          <GuideNotes items={taxi.notes} />
        </Section>

        {/* --------------------------------------------- 6. 観光地 */}
        <Section n={6} id="attractions">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border-2 border-emerald-400 p-4 dark:border-emerald-700">
              <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
                {attractions.easy.title}
              </p>
              <ul className="mt-3 space-y-2.5">
                {attractions.easy.items.map((i) => (
                  <li key={i.name} className="text-sm leading-snug">
                    <span className="block font-semibold text-gray-900 dark:text-gray-100">
                      {i.name}
                    </span>
                    <span className="mt-0.5 block text-xs text-gray-600 dark:text-gray-400">
                      {i.detail}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                {attractions.easy.note}
              </p>
            </div>

            <div className="rounded-xl border-2 border-red-400 p-4 dark:border-red-800">
              <p className="text-sm font-bold text-red-700 dark:text-red-400">
                {attractions.hard.title}
              </p>
              <ul className="mt-3 space-y-2.5">
                {attractions.hard.items.map((i) => (
                  <li key={i.name} className="text-sm leading-snug">
                    <span className="block font-semibold text-gray-900 dark:text-gray-100">
                      {i.name}
                    </span>
                    <span className="mt-0.5 block text-xs text-gray-600 dark:text-gray-400">
                      {i.detail}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {[attractions.callAhead, attractions.theatre].map((t) => (
              <div
                key={t.title}
                className="rounded-lg border border-gray-200 p-4 dark:border-neutral-700"
              >
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {t.title}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                  {t.body}
                </p>
              </div>
            ))}
          </div>

          <GuideCallout {...attractions.callout} />
        </Section>

        {/* --------------------------------------------- 7. 宿・トイレ */}
        <Section n={7} id="hotels-toilets">
          <div className="rounded-xl border border-gray-200 p-5 dark:border-neutral-700">
            <p className="text-base font-bold text-gray-900 dark:text-gray-100">
              {hotelsToilets.hotel.title}
            </p>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {hotelsToilets.hotel.intro}
            </p>
            <ul className="mt-3 space-y-1.5">
              {hotelsToilets.hotel.checks.map((c) => (
                <li
                  key={c}
                  className="flex gap-2 text-sm leading-relaxed text-gray-700 dark:text-gray-300"
                >
                  <span aria-hidden className="text-gray-400">
                    □
                  </span>
                  {c}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              {hotelsToilets.hotel.tip}
            </p>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-gray-200 p-4 dark:border-neutral-700">
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {hotelsToilets.toilet.title}
              </p>
              <ul className="mt-2 space-y-1.5">
                {hotelsToilets.toilet.items.map((i) => (
                  <li
                    key={i}
                    className="text-sm leading-relaxed text-gray-700 dark:text-gray-300"
                  >
                    {i}
                  </li>
                ))}
              </ul>
              <p className="mt-2 rounded bg-gray-50 p-3 text-sm leading-relaxed text-gray-700 dark:bg-neutral-800/60 dark:text-gray-300">
                {hotelsToilets.toilet.radar}
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 p-4 dark:border-neutral-700">
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {hotelsToilets.changingPlaces.title}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                {hotelsToilets.changingPlaces.body}
              </p>
            </div>
          </div>

          <GuideNotes items={hotelsToilets.notes} />
        </Section>

        {/* --------------------------------------------- 8. 割引 */}
        <Section n={8} id="discounts">
          <div className="rounded-xl border-2 border-emerald-500 bg-emerald-50 p-5 dark:bg-emerald-950/30">
            <p className="text-base font-bold text-gray-900 dark:text-gray-100">
              {discounts.carer.title}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              {discounts.carer.body}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              {discounts.carer.proof}
            </p>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {[discounts.transport, discounts.pavement].map((d) => (
              <div
                key={d.title}
                className="rounded-lg border border-gray-200 p-4 dark:border-neutral-700"
              >
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {d.title}
                </p>
                <ul className="mt-2 space-y-1.5">
                  {d.items.map((i) => (
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
        </Section>

        {/* --------------------------------------------- 9. 旅程 */}
        <Section n={9} id="planning">
          <ol className="space-y-2">
            {planning.rules.map((r, i) => (
              <li
                key={r.head}
                className="flex gap-3 rounded-lg border border-gray-200 p-4 dark:border-neutral-700"
              >
                <span
                  aria-hidden
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white"
                >
                  {i + 1}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-bold text-gray-900 dark:text-gray-100">
                    {r.head}
                  </span>
                  <span className="mt-0.5 block text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                    {r.body}
                  </span>
                </span>
              </li>
            ))}
          </ol>

          <div className="mt-5 rounded-xl border border-gray-200 p-5 dark:border-neutral-700">
            <p className="text-base font-bold text-gray-900 dark:text-gray-100">
              {planning.model.title}
            </p>
            <ol className="mt-3 space-y-2">
              {planning.model.steps.map((s) => (
                <li
                  key={s.when}
                  className="flex items-baseline gap-3 rounded-lg bg-gray-50 px-3 py-2 dark:bg-neutral-800/60"
                >
                  <span className="w-10 shrink-0 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                    {s.when}
                  </span>
                  <span className="min-w-0">
                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {s.what}
                    </span>
                    {s.note && (
                      <span className="mt-0.5 block text-xs text-gray-600 dark:text-gray-400">
                        {s.note}
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ol>
            <p className="mt-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              {planning.model.why}
            </p>
          </div>

          <GuideCallout {...planning.callout} />
        </Section>
      </div>

      <GuideFaq items={stepFreeFaq} />
      <GuideSources sources={stepFreeSources} dataAsOf={stepFreeMeta.dataAsOf} />

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
          {stepFreeRelatedLinks.map((link) => (
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
  const section = stepFreeSections.find((s) => s.id === id);

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
