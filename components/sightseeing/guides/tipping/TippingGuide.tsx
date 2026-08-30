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
  cardBrands,
  cash,
  cashless,
  dcc,
  doubleTip,
  headlines,
  payerScope,
  prices,
  removePhrase,
  removeWhen,
  terminalTip,
  tippingActCallout,
  tippingFaq,
  tippingLead,
  tippingMeta,
  tippingNotes,
  tippingRelatedLinks,
  tippingRule,
  tippingSections,
  tippingSources,
  tippingVsJapan,
  tipCases,
  vat,
  prices as pricesData,
} from "./content";

/**
 * チップと支払いのレイアウト。
 *
 * TravelGuideLayout には載せていない。この記事は読み物ではなく
 * 「その場でどうするか」の判定集で、読者はレジや伝票を前にして開く。
 * 8行の相場表・4行のブランド表・散文の DCC 解説という以前の形は、
 * その使われ方に合っていなかった。
 *
 * 節ごとに形が違う:
 *   tipping        … 場面ごとに 加算済み/不要/任意 のバッジで判定を返す
 *   service-charge … 実際に口に出す英語を最初に、大きく出す
 *   dcc            … 判断は二択で答えは常に同じ。規則1行＋端末の文字列
 *   cash           … 両替手段を評価順に並べる(表の行として並列にしない)
 */
export default function TippingGuide() {
  const meta = getTravelGuideMeta(tippingMeta.slug);
  const pageUrl = `${SITE_URL}${travelGuidePath(tippingMeta.slug)}`;
  const relatedGuides = travelGuides.filter((g) => g.slug !== tippingMeta.slug);

  return (
    <main className="mx-auto max-w-4xl px-1 py-10 text-gray-900 dark:text-gray-100 sm:px-4">
      <JsonLd data={travelGuideBreadcrumbJsonLd(tippingMeta)} />
      <JsonLd data={travelGuideArticleJsonLd(tippingMeta)} />
      <JsonLd data={faqPageJsonLd(tippingFaq, pageUrl)} />

      <Breadcrumbs
        path="/sightseeing"
        trail={[]}
        current={meta?.label ?? tippingMeta.title}
      />

      <header className="mt-6">
        <h1 className="text-2xl font-bold leading-tight md:text-4xl">
          {tippingMeta.title}
        </h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          {tippingMeta.engTitle}
        </p>
        <div className="mt-3">
          <GuideFreshness
            dataAsOf={tippingMeta.dataAsOf}
            updatedAt={tippingMeta.updatedAt}
          />
        </div>

        <p className="mt-6 text-base leading-relaxed text-gray-700 dark:text-gray-300">
          {tippingLead}
        </p>

        {/* 答えを冒頭で出し切る。ここで帰る読者がいてよい。 */}
        <ul className="mt-6 grid gap-3 sm:grid-cols-3">
          {headlines.map((h) => (
            <li
              key={h.head}
              className="rounded-xl border-2 border-emerald-500 bg-emerald-50 p-4 dark:bg-emerald-950/30"
            >
              <p className="text-sm font-bold leading-snug text-gray-900 dark:text-gray-100">
                {h.head}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                {h.body}
              </p>
            </li>
          ))}
        </ul>

        <p className="mt-4 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
          {payerScope.body}{" "}
          <Link
            href={payerScope.href}
            className="text-blue-600 underline underline-offset-2 dark:text-blue-400"
          >
            {payerScope.label}
          </Link>
        </p>
      </header>

      <GuideSectionNav sections={tippingSections} />

      <AdSenseUnit slot={AD_SLOTS.inArticle} className="my-10" />

      <div className="space-y-12">
        {/* --------------------------------------------- 1. チップ */}
        <Section n={1} id="tipping">
          <p className="rounded-lg bg-gray-100 px-4 py-3 text-sm font-semibold leading-relaxed text-gray-900 dark:bg-neutral-800 dark:text-gray-100">
            {tippingRule}
          </p>

          <ul className="mt-4 space-y-2">
            {tipCases.map((c) => (
              <li
                key={c.where}
                className="flex items-start gap-3 rounded-lg border border-gray-200 p-3 dark:border-neutral-700"
              >
                <span
                  className={`mt-0.5 shrink-0 rounded px-2 py-0.5 text-xs font-bold ${
                    c.verdict === "不要"
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                      : c.verdict === "加算済み"
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
                        : "bg-gray-100 text-gray-600 dark:bg-neutral-800 dark:text-gray-400"
                  }`}
                >
                  {c.verdict}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {c.where}
                  </span>
                  <span className="mt-0.5 block text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                    {c.detail}
                  </span>
                  {c.href && (
                    <Link
                      href={c.href}
                      className="mt-0.5 inline-block text-sm text-blue-600 underline underline-offset-2 dark:text-blue-400"
                    >
                      {c.hrefLabel}
                    </Link>
                  )}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-5 rounded-lg border border-gray-200 p-4 dark:border-neutral-700">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {tippingVsJapan.title}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              {tippingVsJapan.body}
            </p>
          </div>

          <GuideNotes items={tippingNotes} />
        </Section>

        {/* --------------------------------------------- 2. 外す */}
        <Section n={2} id="service-charge">
          <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
            伝票の service charge は、法的な支払い義務ではありません。
          </p>

          {/*
            このページで唯一「実際に口に出す」もの。
            以前は本文中の引用ブロックで、伝票を前にした読者が探せなかった。
          */}
          <div className="mt-4 rounded-xl border-2 border-emerald-500 bg-emerald-50 p-5 dark:bg-emerald-950/30">
            <p className="text-xs font-bold tracking-wide text-emerald-700 dark:text-emerald-300">
              こう言えば外してもらえます
            </p>
            <p className="mt-2 text-lg font-bold leading-snug text-gray-900 dark:text-gray-100 sm:text-xl">
              “{removePhrase.en}”
            </p>
            <p className="mt-1.5 text-sm text-gray-600 dark:text-gray-400">
              {removePhrase.ja}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              {removePhrase.note}
            </p>
          </div>

          <div className="mt-5 rounded-lg border border-gray-200 p-4 dark:border-neutral-700">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {removeWhen.title}
            </p>
            <ul className="mt-2 space-y-1.5">
              {removeWhen.items.map((i) => (
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
            <p className="mt-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              {removeWhen.reverse}
            </p>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {[terminalTip, doubleTip].map((t) => (
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

          <GuideCallout {...tippingActCallout} />
        </Section>

        <AdSenseUnit slot={AD_SLOTS.inArticle} className="my-10" />

        {/* --------------------------------------------- 3. カード */}
        <Section n={3} id="cards">
          <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
            {cashless.intro}
          </p>

          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {cardBrands.map((b) => {
              const bad = b.verdict === "×";
              const ok = b.verdict === "○";
              return (
                <li
                  key={b.brand}
                  className={`flex items-start gap-3 rounded-lg border-2 p-4 ${
                    bad
                      ? "border-red-400 bg-red-50 dark:border-red-800 dark:bg-red-950/30"
                      : "border-gray-200 dark:border-neutral-700"
                  }`}
                >
                  <span
                    aria-hidden
                    className={`text-xl font-bold leading-none ${
                      bad
                        ? "text-red-600 dark:text-red-400"
                        : ok
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-gray-400"
                    }`}
                  >
                    {b.verdict}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-bold text-gray-900 dark:text-gray-100">
                      {b.brand}
                    </span>
                    <span className="mt-0.5 block text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                      {b.detail}
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>

          <p className="mt-4 rounded-lg border-2 border-red-400 bg-red-50 px-4 py-3 text-sm font-semibold leading-relaxed text-red-800 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300">
            {cashless.jcbWarning}
          </p>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {[cashless.contactless, cashless.phone].map((t) => (
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

          <GuideNotes items={cashless.notes} />
        </Section>

        {/* --------------------------------------------- 4. DCC */}
        <Section n={4} id="dcc">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            決済端末やATMで、こう聞かれることがあります。
          </p>
          <p className="mt-2 rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-base font-semibold text-gray-900 dark:border-neutral-700 dark:bg-neutral-800 dark:text-gray-100">
            「{dcc.asked}」
          </p>

          <div className="mt-4 rounded-xl border-2 border-emerald-500 bg-emerald-50 p-5 dark:bg-emerald-950/30">
            <p className="text-xs font-bold tracking-wide text-emerald-700 dark:text-emerald-300">
              答えは常に同じ
            </p>
            <p className="mt-1 text-xl font-bold text-gray-900 dark:text-gray-100 sm:text-2xl">
              {dcc.rule}
            </p>

            {/* 端末に実際に出る文字列。これを探せば済む。 */}
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg bg-white p-4 dark:bg-neutral-900">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                  決済端末で押すもの
                </p>
                <ul className="mt-1.5 space-y-1">
                  {dcc.buttons.terminal.map((b) => (
                    <li
                      key={b}
                      className="font-mono text-sm font-bold text-gray-900 dark:text-gray-100"
                    >
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-lg bg-white p-4 dark:bg-neutral-900">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                  ATM で押すもの
                </p>
                <ul className="mt-1.5 space-y-1">
                  {dcc.buttons.atm.map((b) => (
                    <li
                      key={b}
                      className="font-mono text-sm font-bold text-gray-900 dark:text-gray-100"
                    >
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <p className="mt-3 text-sm text-gray-700 dark:text-gray-300">
              {dcc.noExplanation}
            </p>
          </div>

          <div className="mt-5 rounded-lg border border-gray-200 p-4 dark:border-neutral-700">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              なぜ損なのか
            </p>
            <p className="mt-1 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              {dcc.why}
            </p>
          </div>

          <GuideCallout {...dcc.callout} />
        </Section>

        {/* --------------------------------------------- 5. 現金 */}
        <Section n={5} id="cash">
          <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
            {cash.currency}
          </p>

          <div className="mt-4 rounded-xl border border-gray-200 p-5 dark:border-neutral-700">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
              持っていく現金
            </p>
            <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">
              {cash.amount}
            </p>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {cash.amountBody}
            </p>
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {cash.uses.map((u) => (
                <li
                  key={u}
                  className="rounded bg-gray-100 px-2.5 py-1 text-xs text-gray-700 dark:bg-neutral-800 dark:text-gray-300"
                >
                  {u}
                </li>
              ))}
            </ul>
          </div>

          <p className="mt-5 rounded-lg border-2 border-red-400 bg-red-50 px-4 py-3 text-sm font-bold text-red-800 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300">
            {cash.exchangeRule}
          </p>

          {/* 評価順。表の行として並列に置くと優劣が伝わらない。 */}
          <ul className="mt-4 space-y-2">
            {cash.exchange.map((e) => {
              const good = e.rank === "有力";
              return (
                <li
                  key={e.how}
                  className="flex items-start gap-3 rounded-lg border border-gray-200 p-3 dark:border-neutral-700"
                >
                  <span
                    className={`mt-0.5 shrink-0 rounded px-2 py-0.5 text-xs font-bold ${
                      good
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                        : "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300"
                    }`}
                  >
                    {e.rank}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {e.how}
                    </span>
                    <span className="mt-0.5 block text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                      {e.detail}
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-gray-200 p-4 dark:border-neutral-700">
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {cash.notes_banknotes.title}
              </p>
              <ul className="mt-2 space-y-1.5">
                {cash.notes_banknotes.items.map((i) => (
                  <li
                    key={i}
                    className="text-sm leading-relaxed text-gray-700 dark:text-gray-300"
                  >
                    {i}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-lg border border-gray-200 p-4 dark:border-neutral-700">
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {cash.noRate.title}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                {cash.noRate.body}
              </p>
            </div>
          </div>

          <GuideNotes items={cash.notes} />
        </Section>

        {/* --------------------------------------------- 6. 免税 */}
        <Section n={6} id="vat">
          <div className="rounded-xl border-2 border-red-400 bg-red-50 p-5 dark:border-red-800 dark:bg-red-950/30">
            <p className="flex flex-wrap items-baseline gap-3">
              <span className="rounded bg-red-600 px-2.5 py-1 text-sm font-bold text-white">
                {vat.verdict}
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {vat.when}
              </span>
            </p>
            <p className="mt-2 text-base font-bold leading-snug text-gray-900 dark:text-gray-100 sm:text-lg">
              {vat.headline}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              {vat.body}
            </p>
            <p className="mt-3 rounded-lg bg-white p-3 text-sm font-semibold leading-relaxed text-gray-900 dark:bg-neutral-900 dark:text-gray-100">
              {vat.warning}
            </p>
          </div>

          <p className="mt-4 rounded-lg border border-gray-200 p-4 text-sm leading-relaxed text-gray-700 dark:border-neutral-700 dark:text-gray-300">
            {vat.eu}
          </p>
        </Section>

        {/* --------------------------------------------- 7. 表示価格 */}
        <Section n={7} id="prices">
          <div className="rounded-lg border border-gray-200 p-4 dark:border-neutral-700">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {prices.vatIncluded.title}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              {prices.vatIncluded.body}
            </p>
          </div>

          <p className="mt-5 text-sm font-semibold text-gray-900 dark:text-gray-100">
            あとから乗るもの
          </p>
          <ul className="mt-2 divide-y divide-gray-200 rounded-lg border border-gray-200 dark:divide-neutral-800 dark:border-neutral-700">
            {pricesData.addOns.map((a) => (
              <li key={a.what} className="px-4 py-2.5">
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {a.what}
                </p>
                <p className="mt-0.5 text-sm text-gray-600 dark:text-gray-400">
                  {a.detail}
                </p>
              </li>
            ))}
          </ul>

          <div className="mt-4 rounded-lg border border-gray-200 p-4 dark:border-neutral-700">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {prices.sunday.title}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              {prices.sunday.body}
            </p>
          </div>
        </Section>
      </div>

      <GuideFaq items={tippingFaq} />
      <GuideSources sources={tippingSources} dataAsOf={tippingMeta.dataAsOf} />

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
          {tippingRelatedLinks.map((link) => (
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
  const section = tippingSections.find((s) => s.id === id);

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
