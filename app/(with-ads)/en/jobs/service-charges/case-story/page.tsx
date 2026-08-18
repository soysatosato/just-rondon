import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Disclaimer from "@/components/jobs/case-story/Disclaimer";
import HtmlLang from "@/components/jobs/case-story/HtmlLang";
import LocaleSwitch from "@/components/jobs/case-story/LocaleSwitch";
import {
  CASE_STORY_BASE,
  CASE_STORY_BASE_EN,
  SERVICE_CHARGES_PATH,
  SITE_URL,
  chapterPath,
  getChapters,
} from "@/components/jobs/case-story/chapters";
import { buildPageMetadata } from "@/lib/seo";

const TITLE = "I took my employer to a tribunal over an unpaid service charge";
const DESCRIPTION =
  "A record of claiming the service charge I was never paid while working in a London restaurant — from Acas Early Conciliation through the Employment Tribunal judgment to High Court enforcement. The calculation the tribunal accepted is published in full.";

export const metadata = buildPageMetadata({
  path: CASE_STORY_BASE_EN,
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "unpaid service charge UK",
    "Employment Tribunal experience",
    "Acas Early Conciliation",
    "employment problem advice UK",
    "claiming unpaid tips",
    "Tipping Act 2023",
  ],
  type: "article",
  locale: "en",
  siteName: "Just Rondon",
  languages: { ja: CASE_STORY_BASE, en: CASE_STORY_BASE_EN },
});

const timeline = [
  {
    phase: "How it started",
    text: "A 12.5% service charge was added to every bill, while what came back to staff was roughly £1 on top of the hourly rate. There was no explanation of the allocation rule, written or verbal.",
  },
  {
    phase: "Around raising the issue",
    text: "It became known internally that I was considering going to Acas. A contract dealing with the service charge was then drawn up with a solicitor involved. It conflicted with what I had understood, I did not sign, and my employment ended afterwards.",
  },
  {
    phase: "Acas Early Conciliation",
    text: "The certificate was issued about six weeks after notification. No settlement was reached.",
  },
  {
    phase: "Filing the ET1",
    text: "Filed about ten days after the certificate. It was sent to the respondent around three weeks later, starting their 28-day response period.",
  },
  {
    phase: "Evidence",
    text: "Eight indexed items, all drawn from the company's own business records. About two months later the respondent said the links had expired and they could not access them. I re-sent, while stating in writing that this did not constitute fresh service.",
  },
  {
    phase: "Before the hearing",
    text: "A notice arrived staying the claim because the respondent had entered liquidation — withdrawn two days later as having been sent in error. The same correspondence directed me to set out the basis of my figure within seven days.",
  },
  {
    phase: "Judgment",
    text: "The respondent filed no response and did not attend. I attended the online hearing in person with an interpreter, and £4,007.55 (gross) was ordered under Rule 22.",
  },
  {
    phase: "Enforcement",
    text: "Nothing was paid by the deadline. The judgment was transferred to a High Court writ and an enforcement agent attended. The respondent said they had applied to set the judgment aside and asked for enforcement to stop; the court dismissed that application on 6 August 2026. It ended in an agreement to pay £1,000 every two weeks.",
  },
];

export default function CaseStoryIndexPageEn() {
  const chapters = getChapters("en");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: TITLE,
    description: DESCRIPTION,
    inLanguage: "en",
    mainEntityOfPage: `${SITE_URL}${CASE_STORY_BASE_EN}`,
    publisher: {
      "@type": "Organization",
      name: "Just Rondon",
      url: SITE_URL,
    },
    hasPart: chapters.map((c) => ({
      "@type": "Article",
      name: c.label,
      description: c.blurb,
      url: `${SITE_URL}${chapterPath(c.slug, "en")}`,
    })),
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: "Service charges",
        item: `${SITE_URL}${SERVICE_CHARGES_PATH}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: TITLE,
        item: `${SITE_URL}${CASE_STORY_BASE_EN}`,
      },
    ],
  };

  const storyChapters = chapters.filter((c) => c.kind === "story");
  const toolChapters = chapters.filter((c) => c.kind === "tool");

  return (
    <main className="mx-auto max-w-4xl py-10 text-gray-900 dark:text-gray-100">
      <HtmlLang lang="en" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mb-6 flex items-center justify-between gap-4">
        <nav className="text-xs text-gray-500 dark:text-gray-400">
          <Link href={SERVICE_CHARGES_PATH} className="hover:underline">
            Service charges
          </Link>
        </nav>
        <LocaleSwitch path={CASE_STORY_BASE_EN} locale="en" />
      </div>

      <header className="space-y-4">
        <h1 className="text-2xl font-bold leading-tight md:text-4xl">
          {TITLE}
        </h1>
        <p className="text-base leading-relaxed text-gray-700 dark:text-gray-300">
          This is a record of the service charge I was never paid while working
          at Tenshi, a London restaurant operated by Tenshi61 LTD. It runs in
          order from first contacting Acas, through the Employment Tribunal
          judgment, to actually recovering the money.
        </p>
        <p className="text-base leading-relaxed text-gray-700 dark:text-gray-300">
          The aim was not to write a story, but to put it in a form that lets{" "}
          <strong className="font-semibold">
            someone in the same position produce their own numbers
          </strong>
          . The calculation the tribunal actually accepted is published here in
          full.
        </p>
      </header>

      <Separator className="my-6" />

      {/* 結論を先に */}
      <section className="rounded-lg border border-gray-300 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-900 p-6">
        <h2 className="text-lg font-semibold">The outcome, up front</h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <dt className="text-xs text-gray-500 dark:text-gray-400">
              Awarded
            </dt>
            <dd className="mt-1 text-2xl font-bold">£4,007.55</dd>
            <dd className="text-xs text-gray-500 dark:text-gray-400">
              Gross, as unpaid wages
            </dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500 dark:text-gray-400">
              My own outlay
            </dt>
            <dd className="mt-1 text-2xl font-bold">£80</dd>
            <dd className="text-xs text-gray-500 dark:text-gray-400">
              Advancing the writ fee. No solicitor
            </dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500 dark:text-gray-400">
              Respondent
            </dt>
            <dd className="mt-1 text-2xl font-bold">No response</dd>
            <dd className="text-xs text-gray-500 dark:text-gray-400">
              Judgment under Rule 22
            </dd>
          </div>
        </dl>
        <p className="mt-5 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
          Acas and the tribunal were both free, and I was not charged for the
          interpreter. I did not instruct a solicitor and attended the hearing in
          person. The financial barrier was close to nil. What it cost was time
          and effort.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-amber-800 dark:text-amber-300">
          The respondent said they had applied to the court to set this judgment
          aside. However, no copy of any such application reached me or the High
          Court Enforcement Officer handling enforcement. The stay of enforcement
          they sought was dismissed by the court on 6 August 2026, on the basis
          that there was no evidence any set-aside application had actually been
          made.
        </p>
      </section>

      {/* 経過 */}
      <section className="mt-10">
        <h2 className="text-lg font-semibold">How it unfolded</h2>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Written to convey the order of events and the gaps between them.
        </p>
        <ol className="mt-5 space-y-4 border-l-2 border-gray-200 dark:border-neutral-700 pl-5">
          {timeline.map((t) => (
            <li key={t.phase} className="relative">
              <span className="absolute -left-[26px] top-1.5 h-2.5 w-2.5 rounded-full bg-blue-600 dark:bg-blue-400" />
              <h3 className="text-sm font-semibold">{t.phase}</h3>
              <p className="mt-1 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                {t.text}
              </p>
            </li>
          ))}
        </ol>
      </section>

      {/* 経過の章 */}
      <section className="mt-12">
        <h2 className="text-lg font-semibold">The record</h2>
        <div className="mt-4 space-y-3">
          {storyChapters.map((c) => (
            <Link
              key={c.slug}
              href={chapterPath(c.slug, "en")}
              className="block"
            >
              <Card className="bg-white dark:bg-neutral-900 border-gray-300 dark:border-neutral-700 shadow-sm transition hover:border-blue-400 dark:hover:border-blue-500">
                <CardContent className="flex gap-4 p-5">
                  <span className="mt-0.5 shrink-0 text-sm font-semibold tabular-nums text-blue-600 dark:text-blue-400">
                    {String(chapters.indexOf(c) + 1).padStart(2, "0")}
                  </span>
                  <span>
                    <span className="block text-base font-semibold">
                      {c.label}
                    </span>
                    <span className="mt-1 block text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                      {c.blurb}
                    </span>
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* 実用の章 */}
      <section className="mt-10">
        <h2 className="text-lg font-semibold">Use it on your own case</h2>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          You can start here without reading the account first.
        </p>
        <div className="mt-4 space-y-3">
          {toolChapters.map((c) => (
            <Link
              key={c.slug}
              href={chapterPath(c.slug, "en")}
              className="block"
            >
              <Card className="border-blue-200 dark:border-blue-900/60 bg-blue-50/60 dark:bg-blue-950/20 shadow-sm transition hover:border-blue-400 dark:hover:border-blue-500">
                <CardContent className="flex gap-4 p-5">
                  <span className="mt-0.5 shrink-0 text-sm font-semibold tabular-nums text-blue-600 dark:text-blue-400">
                    {String(chapters.indexOf(c) + 1).padStart(2, "0")}
                  </span>
                  <span>
                    <span className="block text-base font-semibold">
                      {c.label}
                    </span>
                    <span className="mt-1 block text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                      {c.blurb}
                    </span>
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* 関連 */}
      <div className="mt-12 rounded-lg border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-900 p-6 space-y-3">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Related pages
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          These are currently available in Japanese only.
        </p>
        <ul className="space-y-2 text-sm">
          <li>
            <Link
              href={SERVICE_CHARGES_PATH}
              hrefLang="ja"
              className="text-blue-600 dark:text-blue-400 hover:opacity-80"
            >
              UK service charge guide — the Tipping Act 2023 and workers&apos;
              rights
            </Link>
          </li>
          <li>
            <Link
              href="/jobs/service-charges/dashboard"
              hrefLang="ja"
              className="text-blue-600 dark:text-blue-400 hover:opacity-80"
            >
              London service charge survey (original research)
            </Link>
          </li>
        </ul>
      </div>

      <Disclaimer locale="en" />
    </main>
  );
}
