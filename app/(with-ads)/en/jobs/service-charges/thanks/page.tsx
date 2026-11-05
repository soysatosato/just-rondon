// app/(with-ads)/en/jobs/service-charges/thanks/page.tsx
//
// 英語版アンケートの送信後の画面。日本語版(/jobs/service-charges/thanks)と
// 同じ組み立てで、店舗ページ(日本語)へのリンクは日本語であることを断って出す。
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import ShareActions, {
  EN_SHARE_LABELS,
} from "@/components/money/salary-calculator/ShareActions";
import HtmlLang from "@/components/jobs/case-story/HtmlLang";
import { CASE_STORY_BASE_EN } from "@/components/jobs/case-story/chapters";
import {
  SURVEY_PATH_EN,
  isJobRole,
  surveyHref,
} from "@/components/jobs/survey/entry";
import { fetchStorePage } from "@/utils/service-charge-data";
import { storePath } from "@/lib/jobs/store-slug";
import { noindexMetadata } from "@/lib/seo";

export const metadata = noindexMetadata("Thank you");

type Props = {
  searchParams?: {
    store?: string;
    role?: string;
  };
};

/** 英語の集計ページは無いので、共有先はアンケートそのもの。 */
const SHARE_TEXT =
  "Worked at a Japanese restaurant in London? Check whether the service charge is shared the way the law requires. Anonymous, about 3 minutes.";

const NEXT_STEPS: {
  title: string;
  body: string;
  href?: string;
  linkLabel?: string;
  external?: boolean;
}[] = [
  {
    title: "Gather all your payslips",
    body: "If you still work there, save what you have as PDFs or photos. You can claim after leaving, but it's safest to keep the records yourself.",
  },
  {
    title: "Ask to see the tipping policy",
    body: "Just ask for the written rules on how tips are shared. Employers must put them in writing and make them available, so a refusal is itself on the record.",
    href: "https://www.acas.org.uk/tips-and-service-charges",
    linkLabel: "Read the Acas guide",
    external: true,
  },
  {
    title: "Request the tip records for the past 3 years",
    body: "Workers have the right to see the tip records for the past 3 years, and employers must keep them that long. Once you know the total, you can work out your share.",
  },
  {
    title: "Work out what you're owed",
    body: "The calculation an Employment Tribunal actually accepted is published in full, with the figures. All you need are the sales records, rotas and payslips.",
    href: "/en/jobs/service-charges/case-story/check-your-service-charge",
    linkLabel: "See the calculation",
  },
  {
    title: "Check the time limits and contact Acas",
    body: "A claim about unpaid tips must be made within 12 months; a claim that the policy or records weren't provided within 6 months (3 months if the failure was on or before 30 September 2026). Before going to a tribunal you normally have to go through Acas Early Conciliation. It's free, and your employer isn't contacted.",
    href: "https://www.acas.org.uk/tips-and-service-charges",
    linkLabel: "Talk to Acas",
    external: true,
  },
];

export default async function ThanksPageEn({ searchParams }: Props) {
  const storePage =
    typeof searchParams?.store === "string"
      ? await fetchStorePage(searchParams.store)
      : null;
  const store = storePage?.store;
  const roleParam = searchParams?.role;
  const role = isJobRole(roleParam) ? roleParam : null;

  return (
    <div data-page-main className="min-h-dvh bg-background text-foreground">
      <HtmlLang lang="en" />
      <div className="mx-auto max-w-2xl px-4 py-10 md:py-16">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="h-8 w-8 shrink-0 text-emerald-700 dark:text-emerald-500" />
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            Thank you for answering
          </h1>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          Your answers are counted anonymously under the restaurant&apos;s
          name, so the next person to work there can read them. Comments are
          checked by the editor before they appear.
        </p>

        {store && (
          <Link
            href={storePath(store.slug)}
            hrefLang="ja"
            className="group mt-6 flex items-center justify-between gap-4 rounded-xl border border-border p-4 transition hover:border-foreground/40 hover:bg-muted/40"
          >
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">
                Your answer has been added
              </p>
              <p className="mt-0.5 truncate font-semibold text-foreground">
                {store.storeName || "(Unknown restaurant)"}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {store.responseCount === 1
                  ? "1 answer for this restaurant so far"
                  : `${store.responseCount} answers for this restaurant so far`}
              </p>
            </div>
            <span className="shrink-0 text-sm font-medium text-foreground underline-offset-4 group-hover:underline">
              Restaurant page (Japanese) →
            </span>
          </Link>
        )}

        <section className="mt-10">
          <h2 className="text-lg font-bold tracking-tight">
            If you have doubts about your workplace, go in this order
          </h2>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            You don&apos;t need to start a dispute. Begin at the top, with
            collecting records.
          </p>

          <ol className="mt-5 space-y-3">
            {NEXT_STEPS.map((step, i) => (
              <li
                key={step.title}
                className="flex gap-3 rounded-xl border border-border p-5"
              >
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold tabular-nums text-muted-foreground">
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <p className="font-semibold text-foreground">{step.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {step.body}
                  </p>
                  {step.href &&
                    (step.external ? (
                      <a
                        href={step.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-block text-sm font-medium text-foreground underline underline-offset-4 hover:opacity-80"
                      >
                        {step.linkLabel} ↗
                      </a>
                    ) : (
                      <Link
                        href={step.href}
                        className="mt-2 inline-block text-sm font-medium text-foreground underline underline-offset-4 hover:opacity-80"
                      >
                        {step.linkLabel} →
                      </Link>
                    ))}
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-10 grid gap-3 sm:grid-cols-2">
          <div className="flex flex-col rounded-xl border border-border p-5">
            <p className="font-semibold text-foreground">
              Worked at other restaurants too?
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              From the second place on, it&apos;s a short version: just the
              name, when, and how the service charge is shared. Past jobs help
              just as much.
            </p>
            <Button asChild variant="outline" className="mt-4 self-start">
              <Link href={surveyHref({ more: true, role, locale: "en" })}>
                Answer about another restaurant
              </Link>
            </Button>
          </div>

          <div className="flex flex-col rounded-xl border border-border p-5">
            <p className="font-semibold text-foreground">
              Tell a coworker
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              The more answers each restaurant has, the easier it is to tell
              one person&apos;s experience from how the place is run.
            </p>
            <div className="mt-4">
              <ShareActions
                path={SURVEY_PATH_EN}
                shareText={SHARE_TEXT}
                title="Service charge survey"
                copyLabel="Copy link"
                labels={EN_SHARE_LABELS}
                targets={["whatsapp", "x"]}
              />
            </div>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              If you send it to people at the same restaurant, wait a few days
              so it&apos;s harder to guess who answered.
            </p>
          </div>
        </section>

        <div className="mt-10">
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link href={CASE_STORY_BASE_EN}>
              Read the tribunal record
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
