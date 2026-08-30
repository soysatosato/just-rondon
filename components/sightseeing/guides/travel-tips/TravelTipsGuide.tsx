import Link from "next/link";
import JsonLd from "@/components/seo/JsonLd";
import AdSenseUnit from "@/components/ads/AdSenseUnit";
import { AD_SLOTS } from "@/lib/adsense";
import Breadcrumbs from "@/components/navigation/Breadcrumbs";
import { Card, CardContent } from "@/components/ui/card";
import MarkdownBody from "@/components/jobs/MarkdownBody";
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
import MonthPicker from "./MonthPicker";
import {
  beforeYouFly,
  calendar,
  connectivity,
  daylightNotes,
  health,
  manners,
  money,
  outdatedFacts,
  power,
  questionIndex,
  safety,
  travelTipsFaq,
  travelTipsLead,
  travelTipsMeta,
  travelTipsRelatedLinks,
  travelTipsSections,
  travelTipsSources,
  weatherRules,
} from "./content";

/**
 * 実用情報ページ専用のレイアウト。
 *
 * TravelGuideLayout(markdown を同じ形のカードに流す)には載せていない。
 * この記事は通読される読み物ではなく、単発の質問に答える「引く」ページで、
 * 均一なカードに流すと質問への答えが本文の奥に沈む。実際、このページで
 * 最も引かれる「変圧器は要るか」の判定は、規格表の下の ### の中にあった。
 *
 * 節ごとに形を変えている:
 *   power   … 判定を先に大きく出し、根拠(100-240V)を手元で確かめさせる
 *   weather … 12ヶ月の表をやめ、月を選んで1件返す
 *   safety  … 緊急連絡先を本文から出して独立させる
 *   money   … 本体は tipping-and-payment にあるので要約カードだけ
 *
 * SEO まわり(JSON-LD・パンくず・出典・鮮度・広告枠)は
 * TravelGuideLayout と同じ部品をそのまま使うこと。
 */
export default function TravelTipsGuide() {
  const meta = getTravelGuideMeta(travelTipsMeta.slug);
  const pageUrl = `${SITE_URL}${travelGuidePath(travelTipsMeta.slug)}`;
  const relatedGuides = travelGuides.filter(
    (g) => g.slug !== travelTipsMeta.slug
  );

  return (
    <main className="mx-auto max-w-4xl px-1 py-10 text-gray-900 dark:text-gray-100 sm:px-4">
      <JsonLd data={travelGuideBreadcrumbJsonLd(travelTipsMeta)} />
      <JsonLd data={travelGuideArticleJsonLd(travelTipsMeta)} />
      <JsonLd data={faqPageJsonLd(travelTipsFaq, pageUrl)} />

      <Breadcrumbs
        path="/sightseeing"
        trail={[]}
        current={meta?.label ?? travelTipsMeta.title}
      />

      {/* ------------------------------------------------ ヒーロー */}
      <header className="mt-6">
        <h1 className="text-2xl font-bold leading-tight md:text-4xl">
          {travelTipsMeta.title}
        </h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          {travelTipsMeta.engTitle}
        </p>
        <div className="mt-3">
          <GuideFreshness
            dataAsOf={travelTipsMeta.dataAsOf}
            updatedAt={travelTipsMeta.updatedAt}
          />
        </div>

        <p className="mt-6 text-base leading-relaxed text-gray-700 dark:text-gray-300">
          {travelTipsLead}
        </p>

        {/*
          「あなたの持っている情報は古い」の3枚。
          この記事の存在理由そのものなので、本文の箇条書きから格上げした。
        */}
        <ul className="mt-5 grid gap-3 sm:grid-cols-3">
          {outdatedFacts.map((f) => (
            <li
              key={f.wrong}
              className="rounded-xl border border-gray-200 p-4 dark:border-neutral-700"
            >
              <p className="text-xs text-gray-400 line-through dark:text-gray-500">
                {f.wrong}
              </p>
              <p className="mt-1 text-sm font-bold text-gray-900 dark:text-gray-100">
                {f.right}
              </p>
              <p className="mt-1.5 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                {f.detail}
              </p>
            </li>
          ))}
        </ul>

        {/*
          入口は節名ではなく質問の形にする。
          このページを開く人は通読しに来ていない。
        */}
        <div className="mt-8 rounded-xl border border-gray-200 bg-gray-50 p-5 dark:border-neutral-700 dark:bg-neutral-900">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            探しているのはどれですか
          </p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {questionIndex.map((q) => (
              <li key={q.q}>
                <a
                  href={q.href}
                  className="inline-block rounded-full border border-gray-300 bg-white px-3.5 py-1.5 text-sm font-medium text-gray-700 transition hover:border-emerald-400 hover:text-emerald-700 dark:border-neutral-700 dark:bg-neutral-800 dark:text-gray-300 dark:hover:border-emerald-500 dark:hover:text-emerald-400"
                >
                  {q.q}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </header>

      <GuideSectionNav sections={travelTipsSections} />

      <AdSenseUnit slot={AD_SLOTS.inArticle} className="my-10" />

      <div className="space-y-12">
        {/* --------------------------------------------- 1. 出発前 */}
        <Section n={1} id="before">
          <div className="rounded-xl border-2 border-emerald-500 bg-emerald-50 p-5 dark:bg-emerald-950/30">
            <div className="flex flex-wrap items-baseline gap-3">
              <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
                {beforeYouFly.eta.title}
              </h3>
              <span className="rounded bg-emerald-600 px-2 py-0.5 text-xs font-bold text-white">
                {beforeYouFly.eta.verdict}
              </span>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              {beforeYouFly.eta.body}
            </p>

            <dl className="mt-4 grid gap-x-6 gap-y-2 sm:grid-cols-2">
              {beforeYouFly.eta.facts.map((f) => (
                <div key={f.label} className="flex gap-3 text-sm">
                  <dt className="w-20 shrink-0 text-xs font-semibold text-gray-500 dark:text-gray-400">
                    {f.label}
                  </dt>
                  <dd className="font-medium text-gray-900 dark:text-gray-100">
                    {f.value}
                  </dd>
                </div>
              ))}
            </dl>

            <p className="mt-4 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              {beforeYouFly.eta.warning}
            </p>

            <Link
              href={beforeYouFly.eta.link.href}
              className="mt-4 block rounded-lg border border-emerald-300 bg-white p-4 transition hover:border-emerald-500 dark:border-emerald-800 dark:bg-neutral-900"
            >
              <span className="block text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                {beforeYouFly.eta.link.label}
              </span>
              <span className="mt-0.5 block text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                {beforeYouFly.eta.link.blurb}
              </span>
            </Link>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {beforeYouFly.others.map((o) => (
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
        </Section>

        {/* --------------------------------------------- 2. 電源 */}
        <Section n={2} id="power">
          <div className="grid gap-4 sm:grid-cols-2">
            {power.verdicts.map((v) => {
              const required = v.verdict === "必須";
              return (
                <div
                  key={v.item}
                  className={`rounded-xl border-2 p-5 ${
                    required
                      ? "border-red-400 bg-red-50 dark:border-red-800 dark:bg-red-950/30"
                      : "border-gray-300 dark:border-neutral-700"
                  }`}
                >
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {v.item}
                  </p>
                  <p
                    className={`mt-1 text-2xl font-bold ${
                      required
                        ? "text-red-600 dark:text-red-400"
                        : "text-gray-900 dark:text-gray-100"
                    }`}
                  >
                    {v.verdict}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                    {v.body}
                  </p>
                </div>
              );
            })}
          </div>

          {/* 判定の根拠を、読者が手元の充電器で確かめられる形に。 */}
          <div className="mt-5 rounded-xl border border-gray-200 p-5 dark:border-neutral-700">
            <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
              {power.rule.title}
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg bg-emerald-50 p-4 dark:bg-emerald-950/30">
                <p className="font-mono text-sm font-bold text-emerald-800 dark:text-emerald-300">
                  {power.rule.ok}
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                  {power.rule.okBody}
                </p>
              </div>
              <div className="rounded-lg bg-red-50 p-4 dark:bg-red-950/30">
                <p className="font-mono text-sm font-bold text-red-800 dark:text-red-300">
                  {power.rule.ng}
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                  {power.rule.ngBody}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-xl border-2 border-red-400 bg-red-50 p-5 dark:border-red-800 dark:bg-red-950/30">
            <p className="text-sm font-bold text-red-800 dark:text-red-300">
              {power.danger.title}
            </p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {power.danger.items.map((i) => (
                <li
                  key={i}
                  className="rounded bg-white px-2.5 py-1 text-sm font-medium text-red-700 dark:bg-neutral-900 dark:text-red-300"
                >
                  {i}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              {power.danger.body}
            </p>
          </div>

          <div className="mt-5 overflow-hidden rounded-lg border border-gray-200 dark:border-neutral-700">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-neutral-800">
                  <th className="px-3 py-2 text-left font-semibold"> </th>
                  <th className="px-3 py-2 text-left font-semibold">英国</th>
                  <th className="px-3 py-2 text-left font-semibold">日本</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-neutral-700">
                {power.spec.map((s) => (
                  <tr key={s.label}>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">
                      {s.label}
                    </th>
                    <td className="px-3 py-2 font-medium">{s.uk}</td>
                    <td className="px-3 py-2 text-gray-600 dark:text-gray-400">
                      {s.jp}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <GuideNotes items={power.notes} />
        </Section>

        {/* --------------------------------------------- 3. 服装 */}
        <Section n={3} id="weather">
          <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
            行く月を選んでください。
          </p>
          <div className="mt-4">
            <MonthPicker />
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {weatherRules.map((r) => (
              <div
                key={r.title}
                className="rounded-lg border border-gray-200 p-4 dark:border-neutral-700"
              >
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {r.title}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                  {r.body}
                </p>
              </div>
            ))}
          </div>

          <GuideNotes items={daylightNotes} />
        </Section>

        <AdSenseUnit slot={AD_SLOTS.inArticle} className="my-10" />

        {/* --------------------------------------------- 4. 通信 */}
        <Section n={4} id="connectivity">
          <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
            {connectivity.intro}
          </p>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {connectivity.options.map((o) => (
              <div
                key={o.name}
                className={`rounded-xl border-2 p-4 ${
                  o.best
                    ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30"
                    : "border-gray-200 dark:border-neutral-700"
                }`}
              >
                {o.best && (
                  <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                    短期旅行ならこれ
                  </p>
                )}
                <p className="mt-0.5 text-base font-bold text-gray-900 dark:text-gray-100">
                  {o.name}
                </p>
                <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                  {o.examples}
                </p>
                <ul className="mt-3 space-y-1.5">
                  {o.pros.map((p) => (
                    <li
                      key={p}
                      className="flex gap-2 text-sm leading-snug text-gray-700 dark:text-gray-300"
                    >
                      <span aria-hidden className="text-emerald-600 dark:text-emerald-400">
                        ✓
                      </span>
                      {p}
                    </li>
                  ))}
                  {o.cons.map((c) => (
                    <li
                      key={c}
                      className="flex gap-2 text-sm leading-snug text-gray-500 dark:text-gray-400"
                    >
                      <span aria-hidden>−</span>
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-lg border border-gray-200 p-4 dark:border-neutral-700">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {connectivity.wifi.title}
            </p>
            <ul className="mt-2 space-y-1.5">
              {connectivity.wifi.items.map((i) => (
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

          <GuideNotes items={connectivity.notes} />
        </Section>

        {/* --------------------------------------------- 5. 医療 */}
        <Section n={5} id="health">
          <div className="rounded-xl border-2 border-red-400 bg-red-50 p-5 dark:border-red-800 dark:bg-red-950/30">
            <p className="text-xs font-bold tracking-wide text-red-700 dark:text-red-300">
              もっとも誤解が多い項目
            </p>
            <p className="mt-1 text-base font-bold leading-snug text-gray-900 dark:text-gray-100 sm:text-lg">
              {health.headline}
            </p>
            <MarkdownBody>{health.body}</MarkdownBody>
          </div>

          <p className="mt-6 text-sm font-semibold text-gray-900 dark:text-gray-100">
            症状別の対応
          </p>
          <ul className="mt-2 space-y-2">
            {health.triage.map((t) => (
              <li
                key={t.when}
                className="rounded-lg border border-gray-200 p-4 dark:border-neutral-700"
              >
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                  {t.when}
                </p>
                <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {t.what}
                </p>
                {t.detail && (
                  <p className="mt-0.5 text-xs text-gray-600 dark:text-gray-400">
                    {t.detail}
                  </p>
                )}
              </li>
            ))}
          </ul>

          <div className="mt-5 rounded-lg border border-gray-200 p-4 dark:border-neutral-700">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {health.medication.title}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              {health.medication.body}
            </p>
          </div>

          <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-neutral-700 dark:bg-neutral-900">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {health.longStay.title}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              {health.longStay.body}
            </p>
            <ul className="mt-3 space-y-1.5 text-sm">
              {health.longStay.links.map((l) => (
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
        </Section>

        {/* --------------------------------------------- 6. 治安 */}
        <Section n={6} id="safety">
          <p className="text-base font-bold leading-snug text-gray-900 dark:text-gray-100">
            {safety.headline}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
            {safety.body}
          </p>

          {/*
            緊急連絡先は本文に混ぜない。
            要るときに記事を読ませる場所ではないので、独立させて上に出す。
          */}
          <div className="mt-5 rounded-xl border-2 border-red-400 bg-red-50 p-5 dark:border-red-800 dark:bg-red-950/30">
            <p className="text-xs font-bold tracking-wide text-red-700 dark:text-red-300">
              緊急連絡先
            </p>
            <ul className="mt-3 grid gap-2 sm:grid-cols-3">
              {safety.emergency.map((e) => (
                <li
                  key={e.number}
                  className="rounded-lg bg-white p-3 dark:bg-neutral-900"
                >
                  <a
                    href={`tel:${e.number}`}
                    className={`block text-2xl font-bold ${
                      e.urgent
                        ? "text-red-600 dark:text-red-400"
                        : "text-gray-900 dark:text-gray-100"
                    }`}
                  >
                    {e.number}
                  </a>
                  <span className="mt-0.5 block text-xs leading-snug text-gray-600 dark:text-gray-400">
                    {e.use}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-sm text-gray-700 dark:text-gray-300">
              <strong className="font-semibold">{safety.embassy.label}</strong>：
              {safety.embassy.body}
              <a
                href={safety.embassy.href}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-1 text-blue-600 underline underline-offset-2 dark:text-blue-400"
              >
                大使館のサイト
              </a>
            </p>
          </div>

          <p className="mt-6 text-sm font-semibold text-gray-900 dark:text-gray-100">
            やること6つ
          </p>
          <ol className="mt-2 space-y-2">
            {safety.actions.map((a, i) => (
              <li
                key={a.do}
                className="flex gap-3 rounded-lg border border-gray-200 p-3 dark:border-neutral-700"
              >
                <span
                  aria-hidden
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-600 dark:bg-neutral-800 dark:text-gray-400"
                >
                  {i + 1}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {a.do}
                  </span>
                  {a.why && (
                    <span className="mt-0.5 block text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                      {a.why}
                    </span>
                  )}
                </span>
              </li>
            ))}
          </ol>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-gray-200 p-4 dark:border-neutral-700">
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                スリが多発する場所
              </p>
              <ul className="mt-2 flex flex-wrap gap-1.5">
                {safety.hotspots.map((h) => (
                  <li
                    key={h}
                    className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-700 dark:bg-neutral-800 dark:text-gray-300"
                  >
                    {h}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-lg border border-gray-200 p-4 dark:border-neutral-700">
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {safety.taxi.title}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                {safety.taxi.body}
              </p>
            </div>
          </div>

          <GuideNotes items={safety.notes} />
        </Section>

        {/* --------------------------------------------- 7. お金 */}
        <Section n={7} id="money">
          <ul className="grid gap-3 sm:grid-cols-2">
            {money.points.map((p) => (
              <li
                key={p.head}
                className="rounded-lg border border-gray-200 p-4 dark:border-neutral-700"
              >
                <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                  {p.head}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                  {p.body}
                </p>
              </li>
            ))}
          </ul>

          <Link
            href={money.link.href}
            className="mt-4 block rounded-lg border border-gray-300 p-4 transition hover:border-emerald-400 dark:border-neutral-700 dark:hover:border-emerald-500"
          >
            <span className="block text-sm font-semibold text-gray-900 dark:text-gray-100">
              {money.link.label}
            </span>
            <span className="mt-0.5 block text-xs leading-relaxed text-gray-500 dark:text-gray-400">
              {money.link.blurb}
            </span>
          </Link>
        </Section>

        {/* --------------------------------------------- 8. 休業日 */}
        <Section n={8} id="calendar">
          <div className="rounded-xl border-2 border-red-400 bg-red-50 p-5 dark:border-red-800 dark:bg-red-950/30">
            <p className="text-xs font-bold tracking-wide text-red-700 dark:text-red-300">
              {calendar.christmas.date}
            </p>
            <p className="mt-1 text-base font-bold text-gray-900 dark:text-gray-100 sm:text-lg">
              {calendar.christmas.headline}
            </p>
            <ul className="mt-3 space-y-1.5">
              {calendar.christmas.closures.map((c) => (
                <li
                  key={c.what}
                  className="flex items-baseline justify-between gap-3 rounded bg-white px-3 py-2 text-sm dark:bg-neutral-900"
                >
                  <span className="text-gray-700 dark:text-gray-300">
                    {c.what}
                  </span>
                  <span className="shrink-0 font-bold text-red-600 dark:text-red-400">
                    {c.state}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              {calendar.christmas.body}
            </p>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {calendar.others.map((o) => (
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
        </Section>

        {/* --------------------------------------------- 9. 作法 */}
        <Section n={9} id="manners">
          <ul className="grid gap-3 sm:grid-cols-2">
            {manners.map((m) => (
              <li
                key={m.head}
                className="rounded-lg border border-gray-200 p-4 dark:border-neutral-700"
              >
                <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                  {m.head}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                  {m.body}
                </p>
                {m.link && (
                  <Link
                    href={m.link.href}
                    className="mt-1.5 inline-block text-sm text-blue-600 underline underline-offset-2 dark:text-blue-400"
                  >
                    {m.link.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </Section>
      </div>

      <GuideFaq items={travelTipsFaq} />
      <GuideSources
        sources={travelTipsSources}
        dataAsOf={travelTipsMeta.dataAsOf}
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
          {travelTipsRelatedLinks.map((link) => (
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

/** 節の外枠。見出しの形をここに集約して、9節で揺れないようにする。 */
function Section({
  n,
  id,
  children,
}: {
  n: number;
  id: string;
  children: React.ReactNode;
}) {
  const section = travelTipsSections.find((s) => s.id === id);

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
