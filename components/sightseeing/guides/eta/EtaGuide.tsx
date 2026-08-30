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
import EtaChecklist from "./EtaChecklist";
import EtaGlossary from "./EtaGlossary";
import {
  etaAfter,
  etaChecklistNotes,
  etaChecklistWhy,
  etaFacts,
  etaFaq,
  etaGlossaryCallout,
  etaLead,
  etaMeta,
  etaOfficial,
  etaQuestions,
  etaRejected,
  etaRelatedLinks,
  etaSections,
  etaSnags,
  etaSources,
  etaSteps,
  etaStepsCallout,
  etaStepsIntro,
  etaTransit,
  etaTrouble,
  etaTroubleCallout,
  etaVerdict,
} from "./content";

/**
 * ETA ガイド専用のレイアウト。
 *
 * ほかの7本の旅行ガイドが使う TravelGuideLayout には載せていない。
 * あれは markdown を同じ形のカード9枚に流す作りで、読み物には合うが、
 * この記事だけは性質が違う——10秒で終わる判定と、手を動かす6ステップと、
 * 詰まったときだけ引く対訳表が、すべて同じ見た目になってしまう。
 * 実際、主役であるはずの6ステップが本文中の ### 見出しとして
 * 一番目立たない位置に埋まっていた。
 *
 * 読み方の違いを形にする:
 *   判定(1〜2節) … 断定を大きく1行、条件は畳む
 *   手順(3〜5節) … 番号付きの独立カード。詰まる箇所から対処へ直接飛ばす
 *   参照(6〜7節) … 検索と開閉。上から読ませない
 *
 * SEO まわり(JSON-LD・パンくず・出典・鮮度・広告枠)は
 * TravelGuideLayout と同じ部品をそのまま使うこと。ここだけ独自にすると
 * 構造化データの差分に気づけなくなる。
 */
export default function EtaGuide() {
  const meta = getTravelGuideMeta(etaMeta.slug);
  const pageUrl = `${SITE_URL}${travelGuidePath(etaMeta.slug)}`;
  const relatedGuides = travelGuides.filter((g) => g.slug !== etaMeta.slug);

  return (
    <main className="mx-auto max-w-4xl px-1 py-10 text-gray-900 dark:text-gray-100 sm:px-4">
      <JsonLd data={travelGuideBreadcrumbJsonLd(etaMeta)} />
      <JsonLd data={travelGuideArticleJsonLd(etaMeta)} />
      <JsonLd data={faqPageJsonLd(etaFaq, pageUrl)} />

      <Breadcrumbs
        path="/sightseeing"
        trail={[]}
        current={meta?.label ?? etaMeta.title}
      />

      {/* ------------------------------------------------ ヒーロー */}
      <header className="mt-6">
        <h1 className="text-2xl font-bold leading-tight md:text-4xl">
          {etaMeta.title}
        </h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          {etaMeta.engTitle}
        </p>
        <div className="mt-3">
          <GuideFreshness
            dataAsOf={etaMeta.dataAsOf}
            updatedAt={etaMeta.updatedAt}
          />
        </div>

        {/*
          数字4つを本文より前に出す。「いくら・どのくらい・いつまで・いつまでに」は
          読者が検索窓に打ち込んだ内容そのもので、以前は本文を数千字ぶん
          読み進めないと拾えなかった。
        */}
        <dl className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-gray-200 bg-gray-200 dark:border-neutral-700 dark:bg-neutral-700 sm:grid-cols-4">
          {etaFacts.map((fact) => (
            <div
              key={fact.label}
              className="bg-white p-4 dark:bg-neutral-900"
            >
              <dt className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                {fact.label}
              </dt>
              <dd className="mt-1 text-lg font-bold leading-tight text-gray-900 dark:text-gray-100">
                {fact.value}
              </dd>
              <dd className="mt-1 text-xs leading-snug text-gray-500 dark:text-gray-400">
                {fact.note}
              </dd>
            </div>
          ))}
        </dl>

        <div className="mt-6">
          <MarkdownBody>{etaLead}</MarkdownBody>
        </div>

        {/* 躓きどころを入口にする。読者は自分が止まった箇所から入ってくる。 */}
        <ul className="mt-4 flex flex-wrap gap-2">
          {etaSnags.map((snag) => (
            <li key={snag.label}>
              <a
                href={snag.href}
                className="inline-flex items-center gap-1.5 rounded-full border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:border-emerald-400 hover:text-emerald-700 dark:border-neutral-700 dark:text-gray-300 dark:hover:border-emerald-500 dark:hover:text-emerald-400"
              >
                {snag.label}
                <span aria-hidden className="text-gray-400">
                  ↓
                </span>
              </a>
            </li>
          ))}
        </ul>

        <a
          href="https://www.gov.uk/eta"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
        >
          公式サイト gov.uk/eta で申請する
          <span aria-hidden>↗</span>
        </a>
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          検索結果に並ぶ代行サイトは公式ではありません。
          <a href="#official-only" className="underline underline-offset-2">
            見分け方
          </a>
        </p>
      </header>

      <GuideSectionNav sections={etaSections} />

      <AdSenseUnit slot={AD_SLOTS.inArticle} className="my-10" />

      <div className="space-y-12">
        {/* --------------------------------------------- 1. 必要か */}
        <Section n={1} id="who-needs">
          <div className="rounded-xl border-2 border-emerald-500 bg-emerald-50 p-5 dark:bg-emerald-950/30">
            <p className="text-xs font-bold tracking-wide text-emerald-700 dark:text-emerald-300">
              結論
            </p>
            <p className="mt-1 text-base font-bold leading-snug text-gray-900 dark:text-gray-100 sm:text-lg">
              {etaVerdict.headline}
            </p>
            <ul className="mt-3 space-y-1.5">
              {etaVerdict.conditions.map((c) => (
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
            <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
              {etaVerdict.scope}
            </p>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-gray-200 p-4 dark:border-neutral-700">
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                ETA が要らない人
              </p>
              <ul className="mt-3 space-y-3">
                {etaVerdict.exempt.map((e) => (
                  <li key={e.who} className="text-sm leading-snug">
                    <span className="block text-gray-700 dark:text-gray-300">
                      {e.who}
                    </span>
                    <span className="mt-0.5 block text-xs text-gray-500 dark:text-gray-400">
                      → {e.instead}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-lg border border-gray-200 p-4 dark:border-neutral-700">
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {etaVerdict.outOfScope.title}
              </p>
              <ul className="mt-3 space-y-1.5">
                {etaVerdict.outOfScope.items.map((i) => (
                  <li
                    key={i}
                    className="flex gap-2 text-sm text-gray-700 dark:text-gray-300"
                  >
                    <span aria-hidden className="text-gray-400">
                      ✕
                    </span>
                    {i}
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                {etaVerdict.outOfScope.body}
              </p>
              <Link
                href={etaVerdict.outOfScope.linkHref}
                className="mt-2 inline-block text-sm text-blue-600 underline underline-offset-2 dark:text-blue-400"
              >
                {etaVerdict.outOfScope.linkLabel}
              </Link>
            </div>
          </div>

          <GuideNotes items={etaVerdict.notes} />
          <GuideCallout {...etaVerdict.callout} />
        </Section>

        {/* --------------------------------------------- 2. 乗り継ぎ */}
        <Section n={2} id="transit">
          <p className="rounded-lg bg-gray-100 px-4 py-3 text-sm font-semibold leading-relaxed text-gray-900 dark:bg-neutral-800 dark:text-gray-100">
            {etaTransit.rule}
          </p>

          <ul className="mt-4 space-y-2">
            {etaTransit.cases.map((c) => (
              <li
                key={c.situation}
                className="flex items-start gap-3 rounded-lg border border-gray-200 p-3 dark:border-neutral-700"
              >
                <span
                  className={`mt-0.5 shrink-0 rounded px-2 py-0.5 text-xs font-bold ${
                    c.needed
                      ? "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300"
                      : "bg-gray-100 text-gray-600 dark:bg-neutral-800 dark:text-gray-400"
                  }`}
                >
                  {c.needed ? "必要" : "当面は不要"}
                </span>
                <span className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                  {c.situation}
                </span>
              </li>
            ))}
          </ul>

          <p className="mt-4 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
            {etaTransit.exemptionScope}
          </p>

          <GuideNotes items={etaTransit.notes} />
          <GuideCallout {...etaTransit.callout} />
        </Section>

        {/* --------------------------------------------- 3. 準備 */}
        <Section n={3} id="checklist">
          <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
            {etaChecklistWhy}
          </p>
          <div className="mt-5">
            <EtaChecklist />
          </div>
          <GuideNotes items={etaChecklistNotes} />
        </Section>

        <AdSenseUnit slot={AD_SLOTS.inArticle} className="my-10" />

        {/* --------------------------------------------- 4. 6ステップ */}
        <Section n={4} id="steps">
          <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
            {etaStepsIntro.body}
          </p>
          <p className="mt-3 rounded-lg border border-gray-200 px-4 py-3 text-sm dark:border-neutral-700">
            アプリ名は
            <strong className="font-semibold"> {etaStepsIntro.appName} </strong>
            、提供元は
            <strong className="font-semibold"> {etaStepsIntro.appPublisher} </strong>
            です。App Store / Google Play からダウンロードしてください。
          </p>

          {/*
            番号を大きく打って独立したカードにする。
            片手でスクロールしながら、いま何番目かを見失わないため。
          */}
          <ol className="mt-6 space-y-3">
            {etaSteps.map((step, i) => (
              <li
                key={step.title}
                className="flex gap-4 rounded-xl border border-gray-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900 sm:p-5"
              >
                <span
                  aria-hidden
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white"
                >
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-bold leading-snug text-gray-900 dark:text-gray-100">
                    {step.title}
                  </h3>
                  <p className="mt-1 font-mono text-xs text-gray-500 dark:text-gray-400">
                    画面：{step.screen}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                    {step.body}
                  </p>
                  {step.dos && (
                    <ul className="mt-3 space-y-1.5">
                      {step.dos.map((d) => (
                        <li
                          key={d}
                          className="flex gap-2 text-sm leading-relaxed text-gray-700 dark:text-gray-300"
                        >
                          <span aria-hidden className="text-gray-400">
                            ・
                          </span>
                          {d}
                        </li>
                      ))}
                    </ul>
                  )}
                  {step.link && (
                    <a
                      href={step.link.href}
                      className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-blue-600 underline underline-offset-2 dark:text-blue-400"
                    >
                      {step.link.label}
                      <span aria-hidden>↓</span>
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ol>

          <GuideCallout {...etaStepsCallout} />
        </Section>

        {/* --------------------------------------------- 5. 質問 */}
        <Section n={5} id="questions">
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            聞かれること
          </p>
          <ul className="mt-2 space-y-1.5">
            {etaQuestions.asked.map((q) => (
              <li
                key={q}
                className="flex gap-2 text-sm leading-relaxed text-gray-700 dark:text-gray-300"
              >
                <span aria-hidden className="text-gray-400">
                  ・
                </span>
                {q}
              </li>
            ))}
          </ul>

          <div className="mt-5 rounded-lg border border-gray-200 p-4 dark:border-neutral-700">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {etaQuestions.criminal.title}
            </h3>
            <MarkdownBody>{etaQuestions.criminal.body}</MarkdownBody>
          </div>

          <div className="mt-4 rounded-lg border border-gray-200 p-4 dark:border-neutral-700">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {etaQuestions.address.title}
            </h3>
            <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
              {etaQuestions.address.body}
            </p>
            <div className="mt-3 space-y-1 rounded bg-gray-50 p-3 dark:bg-neutral-800/60">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {etaQuestions.address.exampleJa}
              </p>
              <p className="font-mono text-sm font-medium text-gray-900 dark:text-gray-100">
                ↓ {etaQuestions.address.exampleEn}
              </p>
            </div>
          </div>

          <GuideNotes items={etaQuestions.notes} />
        </Section>

        {/* --------------------------------------------- 6. 対訳 */}
        <Section n={6} id="glossary">
          <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
            UK ETA アプリは英語のみで、日本語表示に切り替えられません。
            画面に出ている英語を検索して、このページを開いたまま進めてください。
          </p>
          <div className="mt-5">
            <EtaGlossary />
          </div>
          <GuideCallout {...etaGlossaryCallout} />
        </Section>

        {/* --------------------------------------------- 7. 対処 */}
        <Section n={7} id="trouble">
          <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
            止まる箇所は決まっています。自分の症状だけ開いてください。
          </p>

          {/*
            details/summary を使う。Accordion(Radix)は type="single" で
            1つしか開けないが、ここは「チップも読めないし写真も弾かれる」が
            同時に起きる。開いたまま次を開けるほうが実態に合う。
          */}
          <div className="mt-4 space-y-2">
            {etaTrouble.map((t) => (
              <details
                key={t.id}
                id={t.id}
                className="group scroll-mt-24 rounded-lg border border-gray-200 bg-white dark:border-neutral-700 dark:bg-neutral-900"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4 [&::-webkit-details-marker]:hidden">
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {t.symptom}
                    </span>
                    {t.cause && (
                      <span className="mt-0.5 block text-xs text-gray-500 dark:text-gray-400">
                        {t.cause}
                      </span>
                    )}
                  </span>
                  <span
                    aria-hidden
                    className="shrink-0 text-gray-400 transition group-open:rotate-180"
                  >
                    ▾
                  </span>
                </summary>
                <div className="border-t border-gray-200 px-4 py-4 dark:border-neutral-700">
                  <ol className="space-y-2">
                    {t.fixes.map((fix, i) => (
                      <li key={fix} className="flex gap-3 text-sm leading-relaxed">
                        <span
                          aria-hidden
                          className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-600 dark:bg-neutral-800 dark:text-gray-400"
                        >
                          {i + 1}
                        </span>
                        <span className="text-gray-700 dark:text-gray-300">
                          {fix}
                        </span>
                      </li>
                    ))}
                  </ol>
                  {t.note && (
                    <p className="mt-3 rounded bg-gray-50 p-3 text-sm leading-relaxed text-gray-600 dark:bg-neutral-800/60 dark:text-gray-400">
                      {t.note}
                    </p>
                  )}
                </div>
              </details>
            ))}
          </div>

          <GuideCallout {...etaTroubleCallout} />
        </Section>

        {/* --------------------------------------------- 8. 申請後 */}
        <Section n={8} id="after">
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            届くメール
          </p>
          <ul className="mt-2 space-y-2">
            {etaAfter.emails.map((e) => (
              <li
                key={e.what}
                className="flex items-baseline gap-3 rounded-lg border border-gray-200 px-4 py-3 dark:border-neutral-700"
              >
                <span className="shrink-0 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                  {e.when}
                </span>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {e.what}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            {etaAfter.emailNote}
          </p>

          <dl className="mt-6 grid gap-px overflow-hidden rounded-xl border border-gray-200 bg-gray-200 dark:border-neutral-700 dark:bg-neutral-700 sm:grid-cols-3">
            {etaAfter.validity.map((v) => (
              <div key={v.label} className="bg-white p-4 dark:bg-neutral-900">
                <dt className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                  {v.label}
                </dt>
                <dd className="mt-1 text-sm font-semibold leading-snug text-gray-900 dark:text-gray-100">
                  {v.value}
                </dd>
              </div>
            ))}
          </dl>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-gray-200 p-4 dark:border-neutral-700">
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                承認されたら
              </p>
              <ul className="mt-2 space-y-1.5">
                {etaAfter.approved.map((a) => (
                  <li
                    key={a}
                    className="flex gap-2 text-sm leading-relaxed text-gray-700 dark:text-gray-300"
                  >
                    <span aria-hidden className="text-gray-400">
                      ・
                    </span>
                    {a}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-lg border border-gray-200 p-4 dark:border-neutral-700">
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                入国時に持っていくもの
              </p>
              <ul className="mt-2 space-y-2">
                {etaAfter.bring.map((b) => (
                  <li key={b.item} className="text-sm leading-snug">
                    <span className="block text-gray-700 dark:text-gray-300">
                      {b.item}
                    </span>
                    {b.note && (
                      <span className="mt-0.5 block text-xs text-gray-500 dark:text-gray-400">
                        {b.note}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <GuideCallout {...etaAfter.callout} />

          <div className="mt-5 space-y-2">
            {etaAfter.nextLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="block rounded-lg border border-gray-200 p-4 transition hover:border-emerald-400 dark:border-neutral-700 dark:hover:border-emerald-500"
              >
                <span className="block text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {l.label}
                </span>
                <span className="mt-0.5 block text-xs leading-relaxed text-gray-500 dark:text-gray-400">
                  {l.blurb}
                </span>
              </Link>
            ))}
          </div>
        </Section>

        {/* --------------------------------------------- 9. 却下 */}
        <Section n={9} id="rejected">
          <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
            {etaRejected.first}
          </p>

          <p className="mt-5 text-sm font-semibold text-gray-900 dark:text-gray-100">
            よくある却下の理由
          </p>
          <ul className="mt-2 space-y-1.5">
            {etaRejected.reasons.map((r) => (
              <li
                key={r}
                className="flex gap-2 text-sm leading-relaxed text-gray-700 dark:text-gray-300"
              >
                <span aria-hidden className="text-gray-400">
                  ・
                </span>
                {r}
              </li>
            ))}
          </ul>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {etaRejected.options.map((o, i) => (
              <div
                key={o.title}
                className="rounded-lg border border-gray-200 p-4 dark:border-neutral-700"
              >
                <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                  選択肢 {i + 1}
                </p>
                <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {o.title}
                </p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {o.when}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                  {o.body}
                </p>
              </div>
            ))}
          </div>

          <GuideNotes items={etaRejected.notes} />
        </Section>

        {/* --------------------------------------------- 10. 公式 */}
        <Section n={10} id="official-only">
          <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
            {etaOfficial.warning}
          </p>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {etaOfficial.channels.map((c) => (
              <div
                key={c.label}
                className="rounded-lg border-2 border-emerald-500 p-4"
              >
                <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                  {c.label}
                </p>
                {c.href ? (
                  <a
                    href={c.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 block font-mono text-base font-bold text-blue-600 underline underline-offset-2 dark:text-blue-400"
                  >
                    {c.value}
                  </a>
                ) : (
                  <p className="mt-1 font-mono text-base font-bold text-gray-900 dark:text-gray-100">
                    {c.value}
                  </p>
                )}
                {c.note && (
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {c.note}
                  </p>
                )}
              </div>
            ))}
          </div>

          <p className="mt-5 text-sm font-semibold text-gray-900 dark:text-gray-100">
            代行サイトの見分け方
          </p>
          <ul className="mt-2 space-y-1.5">
            {etaOfficial.redFlags.map((f) => (
              <li
                key={f}
                className="flex gap-2 text-sm leading-relaxed text-gray-700 dark:text-gray-300"
              >
                <span aria-hidden className="text-red-500">
                  ✕
                </span>
                {f}
              </li>
            ))}
          </ul>

          <p className="mt-4 text-sm font-semibold text-gray-900 dark:text-gray-100">
            {etaOfficial.closing}
          </p>

          <GuideCallout {...etaOfficial.callout} />
        </Section>
      </div>

      <GuideFaq items={etaFaq} />
      <GuideSources sources={etaSources} dataAsOf={etaMeta.dataAsOf} />

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
          {etaRelatedLinks.map((link) => (
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

/** 節の外枠。見出しの形をここに集約して、10節で揺れないようにする。 */
function Section({
  n,
  id,
  children,
}: {
  n: number;
  id: string;
  children: React.ReactNode;
}) {
  const section = etaSections.find((s) => s.id === id);

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
