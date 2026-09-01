import Link from "next/link";
import JsonLd from "@/components/seo/JsonLd";
import AdSenseUnit from "@/components/ads/AdSenseUnit";
import { AD_SLOTS } from "@/lib/adsense";
import Breadcrumbs from "@/components/navigation/Breadcrumbs";
import GuideFaq from "@/components/guides/GuideFaq";
import GuideFreshness from "@/components/guides/GuideFreshness";
import GuideSectionNav from "@/components/guides/GuideSectionNav";
import GuideSources from "@/components/guides/GuideSources";
import { SITE_URL } from "@/lib/seo";
import { fetchLondonPassAttractions } from "@/utils/actions/attractions";
import { CATEGORY_SECTIONS, categoryLabel } from "../../categories";
import { gbp } from "@/lib/sightseeing/budget";
import { faqPageJsonLd } from "../../jsonld";
import {
  getTravelGuideMeta,
  travelGuideArticleJsonLd,
  travelGuideBreadcrumbJsonLd,
  travelGuidePath,
  travelGuides,
} from "../guides";
import {
  breakEven,
  conditions,
  covered,
  freeSection,
  goldenPassNote,
  notIncluded,
  passComparison,
  passesFaq,
  passesMeta,
  passesRelatedLinks,
  passesSections,
  passesSources,
  skipIf,
  traps,
  verdictBody,
  verdictHeadline,
} from "./content";

/**
 * 観光パスのレイアウト。
 *
 * TravelGuideLayout には載せていない。理由は budget と同じで、この記事の
 * 中身は文章ではなく判定表だから。markdown に流すと分岐点の表が
 * GFMテーブルになり、スマホで横スクロールが必要な数字の壁になる。
 *
 * 構造で主張させている箇所が2つある:
 * 1. 冒頭。結論(元が取れる条件は3つ)を読む前に出す。パスを買うかどうかは
 *    記事を読み終える前に決まる読者が多い。
 * 2. 分岐点の積み上げ。パス代を超えた行から色を変える。「3つ回っても
 *    届かない」という記事の中心的な事実を、表を読まずに見て取れるようにする。
 */
export default async function PassesGuide() {
  const meta = getTravelGuideMeta(passesMeta.slug);
  const pageUrl = `${SITE_URL}${travelGuidePath(passesMeta.slug)}`;
  const relatedGuides = travelGuides.filter((g) => g.slug !== passesMeta.slug);
  /** 1日券を基準に色を切り替える。いちばん多く検討されるのがこれ。 */
  const oneDayPrice = breakEven.verdicts[0].price;

  /*
    対象施設。区分ごとにまとめる。並びは CATEGORY_SECTIONS(初訪問者の
    関心順)にそろえ、そこに無い区分は末尾へ回す。件数順にすると
    エンタメが先頭に来て、この一覧が娯楽施設の羅列に見える。
  */
  const passSpots = await fetchLondonPassAttractions();
  const order = CATEGORY_SECTIONS.map((c) => c.slug);
  const grouped = [...new Set(passSpots.map((s) => s.category))]
    .sort((a, b) => {
      const ia = order.indexOf(a);
      const ib = order.indexOf(b);
      return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
    })
    .map((category) => ({
      category,
      label: categoryLabel(category),
      spots: passSpots.filter((s) => s.category === category),
    }));

  return (
    <main className="mx-auto max-w-4xl px-1 py-10 text-gray-900 dark:text-gray-100 sm:px-4">
      <JsonLd data={travelGuideBreadcrumbJsonLd(passesMeta)} />
      <JsonLd data={travelGuideArticleJsonLd(passesMeta)} />
      <JsonLd data={faqPageJsonLd(passesFaq, pageUrl)} />

      <Breadcrumbs
        path="/sightseeing"
        trail={[]}
        current={meta?.label ?? passesMeta.title}
      />

      <header className="mt-6">
        <h1 className="text-2xl font-bold leading-tight md:text-4xl">
          {passesMeta.title}
        </h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          {passesMeta.engTitle}
        </p>
        <div className="mt-3">
          <GuideFreshness
            dataAsOf={passesMeta.dataAsOf}
            updatedAt={passesMeta.updatedAt}
          />
        </div>

        {/* 結論を先に出す。買うかどうかは記事を読み終える前に決まる。 */}
        <div className="mt-6 rounded-xl border-2 border-emerald-500 bg-emerald-50 p-5 dark:bg-emerald-950/30">
          <p className="text-xs font-bold tracking-wide text-emerald-700 dark:text-emerald-300">
            結論
          </p>
          <p className="mt-1.5 text-lg font-bold leading-snug text-gray-900 dark:text-gray-100">
            {verdictHeadline}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
            {verdictBody}
          </p>
        </div>

        <ul className="mt-5 grid gap-3 sm:grid-cols-3">
          {conditions.map((c, i) => (
            <li
              key={c.id}
              className="rounded-xl border border-gray-200 p-4 dark:border-neutral-700"
            >
              <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                条件 {i + 1}
              </p>
              <p className="mt-1 text-sm font-bold text-gray-900 dark:text-gray-100">
                {c.label}
              </p>
              <p className="mt-1.5 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                {c.body}
              </p>
            </li>
          ))}
        </ul>

        <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-neutral-700 dark:bg-neutral-900">
          <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
            こういう旅程なら買わないでください
          </p>
          <ul className="mt-2 grid gap-1.5 text-xs leading-relaxed text-gray-600 dark:text-gray-400 sm:grid-cols-2">
            {skipIf.map((s) => (
              <li key={s} className="flex gap-2">
                <span aria-hidden className="text-gray-400">
                  ×
                </span>
                {s}
              </li>
            ))}
          </ul>
        </div>
      </header>

      <GuideSectionNav sections={passesSections} />

      <AdSenseUnit slot={AD_SLOTS.inArticle} className="my-10" />

      <div className="space-y-12">
        {/* --------------------------------------------- 1. 無料の館 */}
        <Section n={1} id="free">
          <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
            {freeSection.intro}
          </p>

          <ul className="mt-4 flex flex-wrap gap-2">
            {freeSection.free.map((f) => (
              <li
                key={f}
                className="rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
              >
                {f}
              </li>
            ))}
          </ul>

          <p className="mt-3 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
            {freeSection.note}
          </p>

          <p className="mt-4 text-base font-bold text-gray-900 dark:text-gray-100">
            {freeSection.effect}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
            {freeSection.conclusion}
          </p>

          <CrossLink
            href="/sightseeing/free"
            label="ロンドンの無料スポット"
            blurb="入場無料の館と、無料で見られる景色をまとめています。"
          />
        </Section>

        {/* --------------------------------------------- 2. 損益分岐 */}
        <Section n={2} id="break-even">
          <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
            {breakEven.intro}
          </p>

          {/*
            積み上げ。パス代を超えた行から色が変わる。
            表を読まなくても「3つでは届かない」が見て取れることが要件。
          */}
          <ol className="mt-5 space-y-1.5">
            {breakEven.rows.map((r) => {
              const cleared = r.cumulative > oneDayPrice;
              return (
                <li
                  key={r.name}
                  className={`flex flex-wrap items-baseline gap-x-3 gap-y-1 rounded-lg border p-3 ${
                    cleared
                      ? "border-emerald-400 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-950/30"
                      : "border-gray-200 dark:border-neutral-700"
                  }`}
                >
                  <span className="w-5 shrink-0 font-mono text-xs text-gray-400">
                    {r.nth}
                  </span>
                  <span className="flex-1 text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {r.name}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {r.where}
                  </span>
                  <span className="font-mono text-xs text-gray-500 dark:text-gray-400">
                    {gbp(r.price)}
                  </span>
                  <span className="w-20 shrink-0 text-right font-mono text-sm font-bold text-gray-900 dark:text-gray-100">
                    {gbp(r.cumulative)}
                  </span>
                </li>
              );
            })}
          </ol>
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            右端が累計。緑は1日券 {gbp(oneDayPrice)} を超えた行です。
          </p>

          <div className="mt-5 rounded-xl border-2 border-emerald-500 bg-emerald-50 p-5 dark:bg-emerald-950/30">
            <p className="text-sm font-bold leading-relaxed text-gray-900 dark:text-gray-100">
              {breakEven.killer}
            </p>
          </div>

          <ul className="mt-5 grid gap-3 sm:grid-cols-3">
            {breakEven.verdicts.map((v) => (
              <li
                key={v.days}
                className="rounded-xl border border-gray-200 p-4 dark:border-neutral-700"
              >
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400">
                  {v.days}日券 {gbp(v.price)}
                </p>
                <p className="mt-1 text-xl font-bold text-gray-900 dark:text-gray-100">
                  有料 {v.nth}か所目
                </p>
                <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                  累計 {v.total !== null ? gbp(v.total) : "—"} でようやく超過
                </p>
              </li>
            ))}
          </ul>

          <p className="mt-4 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
            {breakEven.priceNote}
          </p>

          <div className="mt-4 rounded-lg border border-gray-300 p-4 dark:border-neutral-700">
            <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
              パス側に有利な補正
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              {breakEven.busCredit}
            </p>
          </div>

          <CrossLink
            href="/sightseeing/budget"
            label="ロンドン旅行の予算（7日間）"
            blurb="入場料を含む現地費用の全体像。宿・食・交通まで積算しています。"
          />
        </Section>

        {/* --------------------------------------------- 3. 対象一覧 */}
        <Section n={3} id="covered">
          <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
            {covered.intro}
          </p>

          <p className="mt-3 rounded-lg border border-gray-200 bg-gray-50 p-4 text-xs leading-relaxed text-gray-600 dark:border-neutral-700 dark:bg-neutral-900 dark:text-gray-400">
            {covered.caveat}
          </p>

          <div className="mt-5 space-y-5">
            {grouped.map((g) => (
              <div key={g.category}>
                <h3 className="flex items-baseline gap-2 text-sm font-bold text-gray-900 dark:text-gray-100">
                  {g.label}
                  <span className="font-mono text-xs font-normal text-gray-400">
                    {g.spots.length}
                  </span>
                </h3>
                <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
                  {g.spots.map((spot) => (
                    <li key={spot.slug}>
                      <Link
                        href={`/sightseeing/${spot.slug}`}
                        className="block rounded-lg border border-gray-200 p-3 text-sm transition hover:border-emerald-400 dark:border-neutral-700 dark:hover:border-emerald-500"
                      >
                        <span className="font-semibold text-gray-900 dark:text-gray-100">
                          {spot.name}
                        </span>
                        {spot.londonPassNote && (
                          <span className="mt-1 block text-xs leading-relaxed text-gray-500 dark:text-gray-400">
                            {spot.londonPassNote}
                          </span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* 読者は必ず「大英博物館は？」と探す。無いことの説明を置く。 */}
          <div className="mt-5 rounded-lg border border-gray-300 p-4 dark:border-neutral-700">
            <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
              無料の館をここに入れていない理由
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              {covered.freeMuseumNote}
            </p>
          </div>

          <p className="mt-3 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
            {covered.updatedNote}
          </p>
        </Section>

        {/* --------------------------------------------- 4. 対象外 */}
        <Section n={4} id="not-included">
          <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
            {notIncluded.intro}
          </p>

          <ul className="mt-4 space-y-2">
            {notIncluded.rows.map((r) => (
              <li
                key={r.name}
                className="rounded-lg border border-gray-200 p-4 dark:border-neutral-700"
              >
                <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                  {r.name}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                  {r.note}
                </p>
              </li>
            ))}
          </ul>

          <p className="mt-4 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
            {notIncluded.conclusion}
          </p>
        </Section>

        {/* --------------------------------------------- 5. 比較 */}
        <Section n={5} id="compare">
          <ul className="space-y-3">
            {passComparison.map((p) => (
              <li
                key={p.id}
                className={`rounded-xl border p-5 ${
                  p.recommended
                    ? "border-emerald-400 dark:border-emerald-700"
                    : "border-gray-200 dark:border-neutral-700"
                }`}
              >
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                    {p.name}
                  </p>
                  <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-600 dark:bg-neutral-800 dark:text-gray-400">
                    {p.axis}
                  </span>
                </div>

                <p className="mt-2 font-mono text-sm font-semibold text-gray-800 dark:text-gray-200">
                  {p.priceLine}
                </p>
                <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                  {p.childLine}
                </p>

                <dl className="mt-3 space-y-1.5 text-xs leading-relaxed">
                  <div className="flex gap-2">
                    <dt className="shrink-0 font-semibold text-emerald-700 dark:text-emerald-400">
                      向く人
                    </dt>
                    <dd className="text-gray-700 dark:text-gray-300">
                      {p.fitsWho}
                    </dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="shrink-0 font-semibold text-gray-500 dark:text-gray-400">
                      注意
                    </dt>
                    <dd className="text-gray-600 dark:text-gray-400">
                      {p.caution}
                    </dd>
                  </div>
                </dl>
              </li>
            ))}
          </ul>

          <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-neutral-700 dark:bg-neutral-900">
            <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
              {goldenPassNote.name}
            </p>
            <p className="mt-1.5 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
              {goldenPassNote.body}
            </p>
          </div>
        </Section>

        {/* --------------------------------------------- 6. 読み方 */}
        <Section n={6} id="traps">
          <ul className="space-y-3">
            {traps.map((t) => (
              <li
                key={t.id}
                className="rounded-lg border border-gray-200 p-4 dark:border-neutral-700"
              >
                <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                  {t.title}
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                  {t.body}
                </p>
              </li>
            ))}
          </ul>
        </Section>
      </div>

      <GuideFaq items={passesFaq} />

      <GuideSources sources={passesSources} dataAsOf={passesMeta.dataAsOf} />

      <section className="mt-12">
        <h2 className="text-lg font-semibold">ほかの旅行ガイド</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {relatedGuides.map((g) => (
            <CrossLink
              key={g.slug}
              href={travelGuidePath(g.slug)}
              label={g.label}
              blurb={g.blurb}
            />
          ))}
        </div>
      </section>

      <div className="mt-6 space-y-2 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-neutral-700 dark:bg-neutral-900 sm:p-6">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          関連ページ
        </h2>
        <ul className="space-y-2 text-sm">
          {passesRelatedLinks.map((link) => (
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

/** 他ガイドへ送るカード。budget と同じ形にそろえる。 */
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
  const section = passesSections.find((s) => s.id === id);

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
