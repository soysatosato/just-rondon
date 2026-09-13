import Link from "next/link";
import JsonLd from "@/components/seo/JsonLd";
import AdSenseUnit from "@/components/ads/AdSenseUnit";
import { AD_SLOTS } from "@/lib/adsense";
import Breadcrumbs from "@/components/navigation/Breadcrumbs";
import { Card, CardContent } from "@/components/ui/card";
import MarkdownBody from "@/components/jobs/MarkdownBody";
import GuideFaq from "@/components/guides/GuideFaq";
import GuideFreshness from "@/components/guides/GuideFreshness";
import SalaryCalculator from "@/components/money/salary-calculator/SalaryCalculator";
import QuickTables from "@/components/money/salary-calculator/QuickTables";
import {
  SALARY_CALCULATOR_PATH,
  SALARY_FAQ,
  SALARY_SECTIONS,
} from "@/components/money/salary-calculator/content";
import { MONEY_BASE, MONEY_SECTION_NAME } from "@/components/money/guides/guides";
import { SITE_URL, buildPageMetadata } from "@/lib/seo";
import { SITE_PUBLISHER, breadcrumbJsonLd, faqPageJsonLd } from "@/lib/jsonld";
import { hubOgImage } from "@/lib/og-hubs";
import {
  CURRENT_TAX_YEAR,
  TAKE_HOME_AS_OF,
  TAKE_HOME_SOURCES,
  TAKE_HOME_UPDATED_AT,
} from "@/lib/money/take-home/tax-years";

const year = CURRENT_TAX_YEAR;
const PAGE_NAME = "手取り計算機";

/*
  検索語「イギリス 給料 手取り 計算」を先頭に寄せ、年度をタイトルに入れる。
  年度が入っていると、去年の数字のままのページと並んだときに選ばれる理由になる。
*/
const TITLE = `イギリスの給料 手取り計算機【${year.label}】年収・時給から計算`;
const DESCRIPTION = `年収・月給・時給を入れるだけで、イギリスの給料の手取りを計算します。${year.label}年度の所得税・National Insurance・職場年金・学生ローンに対応。スコットランドの税率、税コード（1257L・BR・0T）、日本円の目安も出します。`;

export const metadata = buildPageMetadata({
  path: SALARY_CALCULATOR_PATH,
  title: TITLE,
  ogTitle: `イギリスの手取り計算機（${year.label}年度）`,
  description: DESCRIPTION,
  keywords: [
    "イギリス 給料 手取り 計算",
    "イギリス 手取り 計算",
    "年収 ポンド 手取り",
    "ロンドン 給料 手取り",
    "UK take home pay calculator",
    "イギリス 所得税 計算",
    "National Insurance 計算",
    "tax code 1257L",
    "スコットランド 所得税",
  ],
  images: [hubOgImage("salary-calculator", year.id)],
});

function webApplicationJsonLd() {
  const url = `${SITE_URL}${SALARY_CALCULATOR_PATH}`;
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "@id": `${url}#app`,
    name: `イギリスの手取り計算機（${year.label}年度）`,
    alternateName: "UK Take-Home Pay Calculator",
    url,
    description: DESCRIPTION,
    inLanguage: "ja",
    applicationCategory: "FinanceApplication",
    operatingSystem: "Any",
    browserRequirements: "Requires JavaScript",
    isAccessibleForFree: true,
    offers: { "@type": "Offer", price: "0", priceCurrency: "GBP" },
    dateModified: TAKE_HOME_UPDATED_AT,
    publisher: SITE_PUBLISHER,
  };
}

const RELATED = [
  {
    href: "/jobs/minimum-wage",
    eyebrow: "Minimum Wage",
    label: "最低賃金と給与明細の見方",
    blurb: "時給が法律どおりか、明細の天引きが正しいかを確かめる手順。違反を見つけたときの相談先まで。",
  },
  {
    href: "/jobs/workplace-pension",
    eyebrow: "Workplace Pension",
    label: "職場年金（Nest）の仕組みと脱退方法",
    blurb: "明細の「Nest」は何か。1か月の脱退期間を過ぎると返金されない理由と、帰国前の判断の軸。",
  },
  {
    href: "/money/national-insurance-number",
    eyebrow: "NI Number",
    label: "National Insurance number を取る",
    blurb: "NIN がなくても働ける理由と、緊急税コードで多く引かれた税の還付の流れ。",
  },
  {
    href: "/money/sending-money-from-japan",
    eyebrow: "Remittance",
    label: "日本との送金の本当のコスト",
    blurb: "手取りを日本に送るなら、手数料より為替の上乗せ。受取額で比べる方法。",
  },
];

export default function SalaryCalculatorPage() {
  const pageUrl = `${SITE_URL}${SALARY_CALCULATOR_PATH}`;

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 text-gray-900 dark:text-gray-100">
      <JsonLd
        data={breadcrumbJsonLd({ name: MONEY_SECTION_NAME, path: MONEY_BASE }, [
          { name: PAGE_NAME, path: SALARY_CALCULATOR_PATH },
        ])}
      />
      <JsonLd data={webApplicationJsonLd()} />
      <JsonLd data={faqPageJsonLd(SALARY_FAQ, pageUrl)} />

      <Breadcrumbs path={MONEY_BASE} current={PAGE_NAME} />

      <header className="mt-6 max-w-3xl space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700 dark:text-emerald-400">
          UK Take-Home Pay Calculator · {year.label}
        </p>
        <h1 className="text-3xl font-bold leading-tight tracking-tight md:text-5xl">
          イギリスの手取り計算機
        </h1>
        <p className="text-base leading-relaxed text-gray-700 dark:text-gray-300">
          年収・月給・時給を入れると、{year.label}
          年度の所得税・National Insurance・職場年金・学生ローンを引いた手取りがすぐに出ます。
          英語の給与明細と1行ずつ照らし合わせられる形で、日本円の目安も添えています。
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <GuideFreshness dataAsOf={TAKE_HOME_AS_OF} updatedAt={TAKE_HOME_UPDATED_AT} />
          <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
            {year.label}年度（{year.startsOn.slice(0, 4)}年4月6日〜{year.endsOn.slice(0, 4)}年4月5日）の税率
          </span>
        </div>
      </header>

      <div className="mt-8">
        <SalaryCalculator />
      </div>

      <AdSenseUnit slot={AD_SLOTS.inArticle} className="my-12" />

      <QuickTables />

      <div className="mt-14 grid gap-8 lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-10">
        {/*
          仕組みの解説。計算機を使ったあとに「なぜこの額なのか」を確かめに来る
          読者が多いので、目次は横に固定して、読みたい項目へすぐ飛べるようにする。
        */}
        <nav aria-label="仕組みの解説の目次" className="lg:sticky lg:top-6 lg:self-start">
          <p className="text-xs font-semibold text-muted-foreground">仕組みの解説</p>
          <ul className="mt-2 flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:gap-0.5 lg:overflow-visible lg:border-l lg:pb-0">
            {SALARY_SECTIONS.map((section) => (
              <li key={section.id} className="shrink-0">
                <a
                  href={`#${section.id}`}
                  className="block whitespace-nowrap rounded-full border px-3 py-1.5 text-xs text-muted-foreground transition hover:text-foreground lg:-ml-px lg:rounded-none lg:border-0 lg:border-l-2 lg:border-transparent lg:px-3 lg:py-1.5 lg:text-sm lg:hover:border-foreground/40"
                >
                  {section.navLabel ?? section.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="space-y-6">
          {SALARY_SECTIONS.map((section) => (
            <Card
              key={section.id}
              id={section.id}
              className="scroll-mt-6 border-gray-300 bg-white shadow-sm dark:border-neutral-700 dark:bg-neutral-900"
            >
              <CardContent className="space-y-2 p-6">
                <h2 className="text-lg font-semibold md:text-xl">{section.title}</h2>
                <MarkdownBody>{section.body}</MarkdownBody>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <GuideFaq items={SALARY_FAQ} />

      <section className="mt-12 rounded-lg border border-gray-200 bg-gray-50 p-6 dark:border-neutral-700 dark:bg-neutral-900">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          税率と閾値の出典
        </h2>
        <ul className="mt-3 space-y-2 text-sm">
          {TAKE_HOME_SOURCES.map((source) => (
            <li key={source.url}>
              <a
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline underline-offset-2 hover:opacity-80 dark:text-blue-400"
              >
                {source.label}
              </a>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
          税率・閾値は毎年4月6日に改定されます。この計算機は{TAKE_HOME_AS_OF}
          時点で GOV.UK が公表している{year.label}年度の数字で計算しています。
        </p>
      </section>

      <p className="mt-6 rounded-lg border border-amber-200 bg-amber-50/70 p-4 text-xs leading-relaxed text-gray-700 dark:border-amber-900/60 dark:bg-amber-950/25 dark:text-gray-300">
        この計算機は、公表されている税率と閾値から手取りの目安を出すもので、税務上の助言ではありません。
        実際の控除額は、ほかの所得、税コードの調整、給与の支払い方、年金の制度によって変わります。
        正確な額は給与明細と HMRC の個人アカウントで確認してください。
      </p>

      <section className="mt-12">
        <h2 className="text-lg font-semibold">手取りとあわせて読むガイド</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {RELATED.map((item) => (
            <Link key={item.href} href={item.href} className="block">
              <Card className="h-full border-gray-300 bg-white shadow-sm transition hover:border-sky-400 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:border-sky-500">
                <CardContent className="p-5">
                  <span className="block text-xs font-semibold text-sky-600">{item.eyebrow}</span>
                  <span className="mt-1 block text-base font-semibold">{item.label}</span>
                  <span className="mt-1 block text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                    {item.blurb}
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
        <p className="mt-4 text-sm">
          <Link href={MONEY_BASE} className="text-blue-600 hover:opacity-80 dark:text-blue-400">
            お金・銀行ガイド トップへ
          </Link>
        </p>
      </section>

      <AdSenseUnit slot={AD_SLOTS.articleBottom} className="mt-10" />
    </main>
  );
}
