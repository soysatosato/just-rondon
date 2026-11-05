// app/(with-ads)/en/jobs/service-charges/survey/page.tsx
//
// サービスチャージ調査の英語版。日本食店で働く日本人以外のスタッフ
// (キッチンに多い)に答えてもらうためのもの。設問・保存する値・判定の論理は
// 日本語版と同じで、回答は同じ集計に入る。
export const dynamic = "force-dynamic";

import Link from "next/link";
import { Check } from "lucide-react";
import { noindexMetadata } from "@/lib/seo";
import {
  fetchServiceChargeOverview,
  fetchSurveyStore,
} from "@/utils/service-charge-data";
import SurveyForm from "@/components/jobs/survey/SurveyForm";
import HtmlLang from "@/components/jobs/case-story/HtmlLang";
import { CASE_STORY_BASE_EN } from "@/components/jobs/case-story/chapters";
import {
  SURVEY_PATH,
  isJobRole,
  surveyHref,
} from "@/components/jobs/survey/entry";

export const metadata = noindexMetadata("Service charge survey");

/** 日本語版の SURVEY_PROMISES と同じ約束。実装と食い違ってはいけない。 */
const PROMISES = [
  "Only about the workplace",
  "Just 3 required questions",
  "See the result before you send",
  "Past jobs and good places welcome",
];

type Props = {
  searchParams?: {
    store?: string;
    q?: string;
    more?: string;
    role?: string;
  };
};

export default async function SurveyPageEn({ searchParams }: Props) {
  const storeId =
    typeof searchParams?.store === "string" ? searchParams.store : undefined;
  const q = typeof searchParams?.q === "string" ? searchParams.q : undefined;
  const quick = searchParams?.more === "1";
  const roleParam = searchParams?.role;
  const role = quick && isJobRole(roleParam) ? roleParam : null;

  const [overview, initialStore] = await Promise.all([
    fetchServiceChargeOverview(),
    storeId ? fetchSurveyStore(storeId) : Promise.resolve(null),
  ]);
  const initialQuery = initialStore
    ? undefined
    : q?.trim().slice(0, 80) || undefined;

  return (
    <div data-page-main className="min-h-dvh bg-background text-foreground">
      <HtmlLang lang="en" />
      <div className="mx-auto max-w-2xl px-4 py-8 md:py-12">
        <div className="mb-6 flex items-center justify-between gap-4">
          <nav className="text-sm text-muted-foreground">
            <Link
              href={CASE_STORY_BASE_EN}
              className="transition hover:text-foreground"
            >
              Tribunal record
            </Link>
            <span className="mx-2 text-muted-foreground/50">/</span>
            <span className="text-foreground">Survey</span>
          </nav>
          <Link
            href={SURVEY_PATH}
            hrefLang="ja"
            className="rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground transition hover:text-foreground"
          >
            日本語
          </Link>
        </div>

        {quick ? (
          <header className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Short version · about 1 minute
            </p>
            <h1 className="text-2xl font-bold leading-tight tracking-tight md:text-3xl">
              Tell us about the other places you&apos;ve worked
            </h1>
            <p className="text-sm leading-relaxed text-muted-foreground">
              From the second restaurant on, we only ask the name, when you
              worked there, whether there&apos;s a service charge and how
              it&apos;s shared. You&apos;ll see the result for that place at the
              end.
            </p>
            <p className="text-xs text-muted-foreground">
              <Link
                href={surveyHref({ locale: "en" })}
                className="underline underline-offset-4 transition hover:text-foreground"
              >
                Answer the full version instead
              </Link>
            </p>
          </header>
        ) : (
          <header className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Anonymous survey · about 3 minutes
            </p>
            <h1 className="text-2xl font-bold leading-tight tracking-tight md:text-3xl">
              Have you worked at a Japanese restaurant in London?
            </h1>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Only the people who work there know how the service charge is
              really shared. Your answers are counted anonymously and{" "}
              <span className="font-medium text-foreground">
                the next person to work there can read them
              </span>
              . When you finish, you&apos;ll also see whether your workplace
              follows the law.
            </p>
            <ul className="flex flex-wrap gap-2 pt-1">
              {PROMISES.map((p) => (
                <li
                  key={p}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-xs text-foreground/80"
                >
                  <Check
                    aria-hidden
                    className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-500"
                  />
                  {p}
                </li>
              ))}
            </ul>
            <p className="text-xs leading-relaxed text-muted-foreground">
              The results and restaurant pages on this site are in Japanese.
              The survey and your result are in English.
            </p>
          </header>
        )}

        <div className="mt-8">
          <SurveyForm
            key={`${quick ? "quick" : "full"}-${initialStore?.id ?? initialQuery ?? "blank"}`}
            hourlyMedian={overview.hourly.median}
            responseCount={overview.totalResponses}
            storeCount={overview.totalStores}
            initialStore={initialStore}
            initialQuery={initialQuery}
            locale="en"
            quick={quick}
            initialJobRole={role}
          />
        </div>

        <p className="mt-10 text-xs leading-relaxed text-muted-foreground">
          We only record the restaurant and your answers. To withdraw an
          answer, contact us with the restaurant&apos;s name and roughly when
          you sent it.
        </p>
      </div>
    </div>
  );
}
