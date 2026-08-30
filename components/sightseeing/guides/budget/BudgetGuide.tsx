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
import BudgetModels from "./BudgetModels";
import {
  TRIP_NIGHTS,
  admissions,
  budgetFaq,
  budgetMeta,
  budgetNotes,
  budgetRelatedLinks,
  budgetSections,
  budgetSources,
  costShares,
  cuts,
  doNotCut,
  excluded,
  extras,
  food,
  lodging,
  structureConclusion,
  tierCaveat,
  tiers,
  transport,
} from "./content";

/**
 * 旅行予算のレイアウト。
 *
 * TravelGuideLayout には載せていない。あれに流すと本文が GFM テーブル
 * 9枚になり、MarkdownBody の min-w-[32rem] でスマホでは9回とも
 * 横スクロールになる。数字を読ませる記事としては最悪の形だった。
 *
 * さらに、記事の主張は「項目ごとに重みがまるで違う(宿が6割)」なのに、
 * 4項目が同じ大きさの同じ表で並んでいて、構造が主張と矛盾していた。
 * structure セクションで割合を棒の長さにして、主張を目に見せる。
 *
 * 金額は lib/sightseeing/budget.ts / lib/transport/rates.ts /
 * lib/food/prices.ts から引く。ここにも content.ts にもべた書きしない。
 */
export default function BudgetGuide() {
  const meta = getTravelGuideMeta(budgetMeta.slug);
  const pageUrl = `${SITE_URL}${travelGuidePath(budgetMeta.slug)}`;
  const relatedGuides = travelGuides.filter((g) => g.slug !== budgetMeta.slug);

  return (
    <main className="mx-auto max-w-4xl px-1 py-10 text-gray-900 dark:text-gray-100 sm:px-4">
      <JsonLd data={travelGuideBreadcrumbJsonLd(budgetMeta)} />
      <JsonLd data={travelGuideArticleJsonLd(budgetMeta)} />
      <JsonLd data={faqPageJsonLd(budgetFaq, pageUrl)} />

      <Breadcrumbs
        path="/sightseeing"
        trail={[]}
        current={meta?.label ?? budgetMeta.title}
      />

      <header className="mt-6">
        <h1 className="text-2xl font-bold leading-tight md:text-4xl">
          {budgetMeta.title}
        </h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          {budgetMeta.engTitle}
        </p>
        <div className="mt-3">
          <GuideFreshness
            dataAsOf={budgetMeta.dataAsOf}
            updatedAt={budgetMeta.updatedAt}
          />
        </div>

        <p className="mt-6 text-base leading-relaxed text-gray-700 dark:text-gray-300">
          「1日いくら」を宿・食・交通・入場の4つに割って積み上げるのが、いちばん外しません。
          合計だけ眺めても、どこを削れば効くのかが見えないからです。
        </p>

        {/* 3帯の答えを先に出す。サーバー描画なので検索にもここが出る。 */}
        <ul className="mt-6 grid gap-3 sm:grid-cols-3">
          {tiers.map((t) => (
            <li
              key={t.id}
              className="rounded-xl border border-gray-200 p-4 dark:border-neutral-700"
            >
              <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                {t.label}
              </p>
              <p className="mt-1 text-xl font-bold text-gray-900 dark:text-gray-100">
                {t.total}
              </p>
              <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                1日あたり約 {t.perDay}
              </p>
              <p className="mt-1.5 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                {t.blurb}
              </p>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
          1人あたり・{TRIP_NIGHTS}泊ぶんの現地費用。いずれも各項目の下限を積んだ最低ラインです。
        </p>

        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {excluded.map((e) => (
            <li
              key={e.what}
              className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-neutral-700 dark:bg-neutral-900"
            >
              <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                {e.what}は含めていません
              </p>
              <p className="mt-1 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                {e.why}
              </p>
            </li>
          ))}
        </ul>
      </header>

      <GuideSectionNav sections={budgetSections} />

      <AdSenseUnit slot={AD_SLOTS.inArticle} className="my-10" />

      <div className="space-y-12">
        {/* --------------------------------------------- 1. 構造 */}
        <Section n={1} id="structure">
          <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
            ロンドンの旅行費用は、項目ごとに「動かせる幅」がまるで違います。
          </p>

          {/*
            割合を棒の長さにする。「宿が6割」は記事の中心的な主張なのに、
            以前は4項目が同じ大きさの表の行として並んでいた。
          */}
          <ul className="mt-5 space-y-3">
            {costShares.map((c) => (
              <li
                key={c.id}
                className="rounded-lg border border-gray-200 p-4 dark:border-neutral-700"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <a
                    href={c.href}
                    className="text-sm font-bold text-gray-900 hover:underline dark:text-gray-100"
                  >
                    {c.label}
                  </a>
                  <span className="font-mono text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {c.min}〜{c.max}%
                  </span>
                </div>
                <div
                  className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-neutral-800"
                  role="img"
                  aria-label={`総額に占める割合 ${c.min}〜${c.max}パーセント`}
                >
                  <div
                    className={`h-full rounded-full ${
                      c.flex === "非常に大きい"
                        ? "bg-emerald-500"
                        : c.flex === "大きい"
                          ? "bg-emerald-400"
                          : "bg-gray-400 dark:bg-neutral-600"
                    }`}
                    style={{ width: `${c.max}%` }}
                  />
                </div>
                <p className="mt-2 flex flex-wrap items-baseline gap-x-2 text-xs">
                  <span className="font-semibold text-gray-500 dark:text-gray-400">
                    動かせる幅：{c.flex}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400">
                    {c.note}
                  </span>
                </p>
              </li>
            ))}
          </ul>

          <div className="mt-5 rounded-xl border-2 border-emerald-500 bg-emerald-50 p-5 dark:bg-emerald-950/30">
            <p className="text-xs font-bold tracking-wide text-emerald-700 dark:text-emerald-300">
              手を付ける順番
            </p>
            <p className="mt-1 flex flex-wrap items-center gap-2 text-lg font-bold text-gray-900 dark:text-gray-100">
              {structureConclusion.order.map((o, i) => (
                <span key={o} className="flex items-center gap-2">
                  {i > 0 && (
                    <span aria-hidden className="text-emerald-600">
                      →
                    </span>
                  )}
                  {o}
                </span>
              ))}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              {structureConclusion.body}
            </p>
          </div>

          <GuideNotes items={structureConclusion.notes} />
        </Section>

        {/* --------------------------------------------- 2. 宿 */}
        <Section n={2} id="lodging">
          <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
            {lodging.intro}
          </p>

          <ul className="mt-4 space-y-2">
            {lodging.rows.map((r) => (
              <li
                key={r.label}
                className="rounded-lg border border-gray-200 p-4 dark:border-neutral-700"
              >
                <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                  {r.label}
                </p>
                <p className="mt-1.5 flex flex-wrap gap-x-5 gap-y-1 font-mono text-sm">
                  <span className="text-gray-700 dark:text-gray-300">
                    1泊 {r.perNight}
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                    {TRIP_NIGHTS}泊 {r.total}
                  </span>
                </p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {r.note}
                </p>
              </li>
            ))}
          </ul>

          <p className="mt-4 rounded-lg bg-gray-100 px-4 py-3 text-sm leading-relaxed text-gray-900 dark:bg-neutral-800 dark:text-gray-100">
            {lodging.perRoom}
          </p>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-gray-200 p-4 dark:border-neutral-700">
              <p className="text-sm font-semibold text-red-700 dark:text-red-400">
                高くなる時期
              </p>
              <ul className="mt-2 space-y-1.5">
                {lodging.seasons.high.map((s) => (
                  <li
                    key={s}
                    className="text-sm leading-snug text-gray-700 dark:text-gray-300"
                  >
                    {s}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-lg border border-gray-200 p-4 dark:border-neutral-700">
              <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                安くなる時期
              </p>
              <ul className="mt-2 space-y-1.5">
                {lodging.seasons.low.map((s) => (
                  <li
                    key={s}
                    className="text-sm leading-snug text-gray-700 dark:text-gray-300"
                  >
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-4 rounded-lg border border-gray-200 p-4 dark:border-neutral-700">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {lodging.zone.title}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              {lodging.zone.body}
            </p>
          </div>

          <CrossLink {...lodging.link} />
          <GuideNotes items={lodging.notes} />
        </Section>

        {/* --------------------------------------------- 3. 食 */}
        <Section n={3} id="food">
          <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
            {food.intro}
          </p>

          <ul className="mt-4 grid gap-3 sm:grid-cols-3">
            {food.bands.map((b) => (
              <li
                key={b.label}
                className="rounded-lg border border-gray-200 p-4 dark:border-neutral-700"
              >
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400">
                  {b.label}
                </p>
                <p className="mt-1 text-xl font-bold text-gray-900 dark:text-gray-100">
                  {b.perDay}
                  <span className="text-xs font-normal text-gray-500">
                    {" "}
                    / 日
                  </span>
                </p>
                <p className="mt-0.5 font-mono text-xs text-gray-500 dark:text-gray-400">
                  {TRIP_NIGHTS}日 {b.total}
                </p>
                <p className="mt-1.5 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                  {b.note}
                </p>
              </li>
            ))}
          </ul>

          <div className="mt-5 rounded-xl border border-gray-200 p-5 dark:border-neutral-700">
            <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
              {food.mealDeal.title}
            </h3>
            <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
              {food.mealDeal.body}
            </p>
            <ul className="mt-3 divide-y divide-gray-200 dark:divide-neutral-800">
              {food.mealDeal.rows.map((r) => (
                <li
                  key={r.shop}
                  className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-2 text-sm"
                >
                  <span className="text-gray-700 dark:text-gray-300">
                    {r.shop}
                  </span>
                  <span className="font-mono text-gray-900 dark:text-gray-100">
                    {r.standard}
                    <span className="ml-2 text-emerald-700 dark:text-emerald-400">
                      会員 {r.member}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-3 rounded-lg bg-emerald-50 px-4 py-3 text-sm font-semibold leading-relaxed text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">
              {food.mealDeal.effect}
            </p>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-gray-200 p-4 dark:border-neutral-700">
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                外食の単価感
              </p>
              <ul className="mt-2 divide-y divide-gray-200 dark:divide-neutral-800">
                {food.eatingOut.map((e) => (
                  <li
                    key={e.what}
                    className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5 py-1.5 text-sm"
                  >
                    <span className="text-gray-700 dark:text-gray-300">
                      {e.what}
                    </span>
                    <span className="font-mono font-semibold text-gray-900 dark:text-gray-100">
                      {e.price}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-lg border border-gray-200 p-4 dark:border-neutral-700">
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {food.water.title}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                {food.water.body}
              </p>
            </div>
          </div>

          <CrossLink {...food.link} />
          <GuideNotes items={food.notes} />
        </Section>

        <AdSenseUnit slot={AD_SLOTS.inArticle} className="my-10" />

        {/* --------------------------------------------- 4. 交通 */}
        <Section n={4} id="transport">
          <div className="rounded-xl border-2 border-emerald-500 bg-emerald-50 p-5 dark:bg-emerald-950/30">
            <p className="text-base font-bold leading-snug text-gray-900 dark:text-gray-100">
              {transport.headline}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              {transport.intro}
            </p>
            <ul className="mt-4 space-y-2">
              {transport.caps.map((c) => (
                <li
                  key={c.zone}
                  className={`flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 rounded-lg px-4 py-3 ${
                    c.main
                      ? "bg-white dark:bg-neutral-900"
                      : "bg-white/60 dark:bg-neutral-900/50"
                  }`}
                >
                  <span
                    className={`text-sm ${
                      c.main
                        ? "font-bold text-gray-900 dark:text-gray-100"
                        : "text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    {c.zone}
                  </span>
                  <span className="font-mono text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      1日 {c.daily}
                    </span>
                    <span
                      className={`ml-3 font-bold ${
                        c.main
                          ? "text-emerald-700 dark:text-emerald-400"
                          : "text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      週 {c.weekly}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-sm font-semibold leading-relaxed text-gray-900 dark:text-gray-100">
              {transport.capConclusion}
            </p>
          </div>

          <div className="mt-5 rounded-lg border border-gray-200 p-4 dark:border-neutral-700">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {transport.noTickets.title}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              {transport.noTickets.body}
            </p>
            <p className="mt-2 rounded bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 dark:bg-red-950/40 dark:text-red-300">
              {transport.noTickets.warning}
            </p>
          </div>

          <div className="mt-4 rounded-lg border border-gray-200 p-4 dark:border-neutral-700">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {transport.airport.title}
            </p>
            <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
              {transport.airport.body}
            </p>
            <ul className="mt-3 divide-y divide-gray-200 dark:divide-neutral-800">
              {transport.airport.rows.map((r) => (
                <li
                  key={r.how}
                  className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 py-2 text-sm"
                >
                  <span
                    className={
                      r.cheap
                        ? "font-semibold text-emerald-700 dark:text-emerald-400"
                        : "text-gray-700 dark:text-gray-300"
                    }
                  >
                    {r.how}
                  </span>
                  <span className="font-mono font-semibold text-gray-900 dark:text-gray-100">
                    {r.price}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              {transport.airport.conclusion}
            </p>
          </div>

          <div className="mt-4 rounded-xl border border-gray-200 p-5 dark:border-neutral-700">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
              {transport.total.label}
            </p>
            <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">
              約 {transport.total.value}
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
              {transport.total.body}
            </p>
          </div>

          <CrossLink {...transport.link} />
        </Section>

        {/* --------------------------------------------- 5. 入場料 */}
        <Section n={5} id="admissions">
          <div className="rounded-xl border-2 border-emerald-500 bg-emerald-50 p-5 dark:bg-emerald-950/30">
            <p className="text-base font-bold leading-snug text-gray-900 dark:text-gray-100">
              {admissions.headline}
            </p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {admissions.free.map((f) => (
                <li
                  key={f}
                  className="rounded bg-white px-2.5 py-1 text-sm font-medium text-gray-900 dark:bg-neutral-900 dark:text-gray-100"
                >
                  {f}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
              {admissions.freeNote}
            </p>
            <p className="mt-3 text-sm font-bold text-emerald-800 dark:text-emerald-300">
              {admissions.freeEffect}
            </p>
          </div>

          <div className="mt-5 rounded-lg border border-gray-200 p-4 dark:border-neutral-700">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              有料の主要施設（大人1名）
            </p>
            <ul className="mt-2 divide-y divide-gray-200 dark:divide-neutral-800">
              {admissions.paid.map((p) => (
                <li
                  key={p.name}
                  className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 py-2 text-sm"
                >
                  <span className="text-gray-700 dark:text-gray-300">
                    {p.name}
                  </span>
                  <span className="font-mono font-semibold text-gray-900 dark:text-gray-100">
                    {p.price}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              {admissions.paidNote}
            </p>
          </div>

          <p className="mt-4 rounded-lg bg-gray-100 px-4 py-3 text-sm leading-relaxed text-gray-900 dark:bg-neutral-800 dark:text-gray-100">
            {admissions.planning}
          </p>

          <GuideNotes items={admissions.notes} />
        </Section>

        {/* --------------------------------------------- 6. その他 */}
        <Section n={6} id="extras">
          <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
            {extras.intro}
          </p>

          <ul className="mt-4 divide-y divide-gray-200 rounded-lg border border-gray-200 dark:divide-neutral-800 dark:border-neutral-700">
            {extras.rows.map((r) => (
              <li
                key={r.what}
                className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 px-4 py-2.5 text-sm"
              >
                <span className="text-gray-700 dark:text-gray-300">
                  {r.what}
                </span>
                <span className="font-mono font-semibold text-gray-900 dark:text-gray-100">
                  {r.price}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-gray-200 p-4 dark:border-neutral-700">
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                忘れやすいもの
              </p>
              <ul className="mt-2 space-y-2">
                {extras.forgotten.map((f) => (
                  <li key={f.what} className="text-sm leading-snug">
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {f.what}
                    </span>
                    <span className="mt-0.5 block text-xs text-gray-600 dark:text-gray-400">
                      {f.detail}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-lg border border-gray-200 p-4 dark:border-neutral-700">
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {extras.noVat.title}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                {extras.noVat.body}
              </p>
            </div>
          </div>

          <GuideCallout {...extras.insuranceCallout} />
        </Section>

        {/* --------------------------------------------- 7. 積算 */}
        <Section n={7} id="models">
          <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
            ここまでの数字を実際に足してみます。すべて1人あたり・{TRIP_NIGHTS}泊・航空券を除く現地費用です。
          </p>
          <div className="mt-4">
            <BudgetModels />
          </div>
          <p className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700 dark:border-neutral-700 dark:bg-neutral-900 dark:text-gray-300">
            {tierCaveat}
          </p>
          <GuideNotes items={budgetNotes} />
        </Section>

        {/* --------------------------------------------- 8. 削る */}
        <Section n={8} id="cutting">
          <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
            効く順に並べます。数字は{TRIP_NIGHTS}泊ぶんの目安です。
          </p>

          <ol className="mt-4 space-y-2">
            {cuts.map((c, i) => (
              <li
                key={c.what}
                className="flex gap-3 rounded-lg border border-gray-200 p-4 dark:border-neutral-700"
              >
                <span
                  aria-hidden
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white"
                >
                  {i + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5">
                    <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                      {c.what}
                    </span>
                    <span className="shrink-0 font-mono text-sm font-bold text-emerald-700 dark:text-emerald-400">
                      −{c.saves}
                    </span>
                  </span>
                  <span className="mt-0.5 block text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                    {c.why}
                  </span>
                </span>
              </li>
            ))}
          </ol>

          <div className="mt-5 rounded-xl border-2 border-red-400 bg-red-50 p-5 dark:border-red-800 dark:bg-red-950/30">
            <p className="text-sm font-bold text-red-800 dark:text-red-300">
              逆に、削らないほうがいいもの
            </p>
            <ul className="mt-3 space-y-2">
              {doNotCut.map((d) => (
                <li
                  key={d.what}
                  className="rounded-lg bg-white p-3 text-sm dark:bg-neutral-900"
                >
                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                    {d.what}
                  </span>
                  <span className="mt-0.5 block text-xs text-gray-600 dark:text-gray-400">
                    {d.why}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </Section>
      </div>

      <GuideFaq items={budgetFaq} />
      <GuideSources sources={budgetSources} dataAsOf={budgetMeta.dataAsOf} />

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
          {budgetRelatedLinks.map((link) => (
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

/** 他ガイドへ送るカード。予算記事は各節の末尾で必ず1本ぶら下げる。 */
function CrossLink({
  href,
  label,
  blurb,
}: {
  href: string;
  label: string;
  blurb: string;
}) {
  return (
    <Link
      href={href}
      className="mt-4 block rounded-lg border border-gray-300 p-4 transition hover:border-emerald-400 dark:border-neutral-700 dark:hover:border-emerald-500"
    >
      <span className="block text-sm font-semibold text-gray-900 dark:text-gray-100">
        {label}
      </span>
      <span className="mt-0.5 block text-xs leading-relaxed text-gray-500 dark:text-gray-400">
        {blurb}
      </span>
    </Link>
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
  const section = budgetSections.find((s) => s.id === id);

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
