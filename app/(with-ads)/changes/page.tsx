import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { fetchChangeIssues } from "@/utils/actions/changes";
import { buildPageMetadata } from "@/lib/seo";
import { formatMonthJa, getChangeKindMeta } from "@/lib/changes";
import {
  formatScheduledDate,
  scheduledChangesBetween,
} from "@/lib/changes-schedule";
import { cn } from "@/lib/utils";
import ChangeIssueList from "@/components/changes/ChangeIssueList";
import Breadcrumbs from "@/components/navigation/Breadcrumbs";
import JsonLd from "@/components/seo/JsonLd";
import { breadcrumbListJsonLd } from "@/components/navigation/tree";

export const revalidate = 60 * 60;

export const metadata = buildPageMetadata({
  path: "/changes",
  title: "今月変わったロンドン｜運賃・入場料・光熱費・ビザの改定を毎月まとめ",
  description:
    "ロンドンの地下鉄・バス運賃、観光地の入場料、光熱費の上限、最低賃金、ビザの制度。改定と開業・閉館を毎月1本にまとめ、これから変わることの予定も一覧にしています。すべて出典つき。",
  keywords: [
    "ロンドン 運賃 改定",
    "ロンドン 値上げ",
    "イギリス 最低賃金",
    "イギリス 光熱費 上限",
    "イギリス ビザ 変更",
  ],
});

/** ハブの予定表に出す期間。1年より先は計画が変わりやすく、並べても使われない。 */
const SCHEDULE_MONTHS = 12;

export default async function ChangesHubPage() {
  const issues = await fetchChangeIssues(24);
  const [latest, ...older] = issues;

  const now = new Date();
  const today = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
  const horizon = new Date(today);
  horizon.setUTCMonth(horizon.getUTCMonth() + SCHEDULE_MONTHS);
  const upcoming = scheduledChangesBetween(today, horizon, now);

  return (
    <div data-page-main className="mx-auto max-w-3xl sm:px-4 py-8 sm:py-10">
      <JsonLd data={breadcrumbListJsonLd({ path: "/changes" })} />
      <Breadcrumbs path="/changes" className="mb-5" />

      <header className="mb-10">
        <div className="h-[3px] bg-foreground" />
        <p className="border-b border-foreground/20 py-2 font-serif text-[10px] font-semibold uppercase tracking-[0.28em] text-muted-foreground sm:text-[11px]">
          What Changed in London
        </p>
        <h1 className="pt-6 text-3xl font-bold leading-[1.15] tracking-tight sm:text-4xl dark:text-white">
          今月変わったロンドン
        </h1>
        <p className="mt-5 max-w-[42rem] text-sm leading-[2] text-muted-foreground dark:text-gray-400">
          地下鉄やバスの運賃、観光地の入場料、ガス・電気の料金上限、最低賃金、ビザの制度。
          ロンドンの数字は思っているより頻繁に変わります。その月に変わったことを毎月1本にまとめ、
          これから変わることが決まっているものは下の予定表に並べています。どの項目にも出典を付けています。
        </p>
      </header>

      {latest && (
        <section className="mb-12">
          <p className="font-serif text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Latest Issue
          </p>
          <Link
            href={`/changes/${latest.slug}`}
            className="group mt-2 block border-l-[3px] border-emerald-600 bg-emerald-600/[0.05] p-5 transition-colors hover:bg-emerald-600/[0.09]"
          >
            <span className="block text-xs font-bold tabular-nums text-emerald-800 dark:text-emerald-300">
              {formatMonthJa(latest.monthStart)}号・{latest._count.items}項目
            </span>
            <span className="mt-2 block text-xl font-bold leading-snug tracking-tight dark:text-white">
              {latest.title}
            </span>
            <span className="mt-3 block text-sm leading-relaxed text-muted-foreground dark:text-gray-300">
              {latest.headline}
            </span>
            <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold dark:text-white">
              この号を読む
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        </section>
      )}

      {upcoming.length > 0 && (
        <section className="mb-12" id="schedule">
          <div className="mb-2 border-t-2 border-foreground pt-3">
            <p className="font-serif text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              Coming Up
            </p>
            <h2 className="mt-1.5 text-lg font-bold tracking-tight sm:text-xl dark:text-white">
              これから変わること
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground dark:text-gray-400">
              今後{SCHEDULE_MONTHS}か月のうちに変わることが分かっているもの。「例年」は毎年この時期に改定される決まりのもので、金額はまだ発表されていません。
            </p>
          </div>

          <ul className="divide-y divide-border dark:divide-neutral-800">
            {upcoming.map((change) => {
              const kind = getChangeKindMeta(change.kind);
              return (
                <li key={change.id} className="grid gap-x-5 py-5 sm:grid-cols-[8.5rem_minmax(0,1fr)]">
                  <p className="text-sm font-bold tabular-nums dark:text-white">
                    {formatScheduledDate(change)}
                    {change.recurring && (
                      <span className="ml-2 rounded-sm border border-foreground/25 px-1 py-0.5 align-middle text-xs font-bold text-foreground/70 dark:text-gray-300">
                        例年
                      </span>
                    )}
                  </p>
                  <div className="mt-1 min-w-0 sm:mt-0">
                    <p
                      className={cn(
                        "inline-flex items-baseline gap-1.5 text-xs font-bold leading-none",
                        kind.textClass,
                      )}
                    >
                      <span
                        aria-hidden
                        className={cn("inline-block h-1.5 w-1.5 rounded-full", kind.dotClass)}
                      />
                      {kind.label}
                    </p>
                    <p className="mt-1.5 font-bold leading-snug dark:text-white">
                      {change.title}
                      {change.before && change.after && (
                        <span className="ml-2 whitespace-nowrap text-sm font-semibold tabular-nums text-muted-foreground dark:text-gray-400">
                          {change.before} → {change.after}
                        </span>
                      )}
                    </p>
                    {change.note && (
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground dark:text-gray-400">
                        {change.note}
                      </p>
                    )}
                    <Link
                      href={change.sitePath}
                      className="mt-2 inline-flex items-center gap-1 text-xs font-bold underline decoration-foreground/30 underline-offset-4 hover:decoration-foreground dark:text-gray-200"
                    >
                      詳しく
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <ChangeIssueList issues={older} />

      <p className="mt-10 border-t border-border pt-3 text-xs leading-relaxed text-muted-foreground dark:border-neutral-800 dark:text-gray-500">
        予定表の日付と金額は、交通・光熱費・ビザ・仕事の各ガイドが参照している数字と同じものです。
        ガイドの数字を改定に合わせて直すと、この予定表も同時に進みます。
        いまの値段の一覧は
        <Link href="/prices" className="mx-0.5 underline underline-offset-2 hover:text-foreground">
          ロンドンの物価
        </Link>
        にあります。
      </p>
    </div>
  );
}
