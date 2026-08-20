export const revalidate = 60 * 60;

import Link from "next/link";

import { fetchModernBritainEntries } from "@/utils/actions/contents";
import { buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/seo/JsonLd";
import {
  modernBritainHubBreadcrumbJsonLd,
  modernBritainHubCollectionJsonLd,
} from "@/components/modern-britain/jsonld";
import ModernBritainCard from "@/components/modern-britain/ModernBritainCard";
import AdSenseUnit from "@/components/ads/AdSenseUnit";
import { AD_SLOTS } from "@/lib/adsense";

export const metadata = buildPageMetadata({
  path: "/modern-britain",
  title: "英国のいまを論じる | 最新ニュースの背景を掘り下げる時事コラム",
  description:
    "最新の英国ニュースを出典付きで紹介し、その背景・原因・英国社会への影響、制度や歴史との関係まで掘り下げて論じます。要約では終わらない、いまのイギリスの読み解き。",
  keywords: [
    "イギリス ニュース 解説",
    "英国 時事",
    "イギリス 社会 問題",
    "英国 政治 経済 解説",
    "イギリス 制度",
  ],
});

export default async function ModernBritainHubPage() {
  const entries = await fetchModernBritainEntries();

  return (
    <main className="max-w-5xl mx-auto py-8 px-4 md:py-10">
      <JsonLd data={modernBritainHubBreadcrumbJsonLd()} />
      <JsonLd data={modernBritainHubCollectionJsonLd(entries)} />

      <header className="relative mb-10 overflow-hidden rounded-3xl border border-indigo-200 bg-gradient-to-br from-indigo-50 via-background to-cyan-50 px-6 py-10 dark:border-indigo-900/50 dark:from-indigo-950/25 dark:via-background dark:to-cyan-950/20 sm:px-10 sm:py-12">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-10 -top-16 h-56 w-56 rounded-full bg-indigo-400/20 blur-3xl dark:bg-indigo-500/10"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-20 left-[-10%] h-48 w-48 rounded-full bg-cyan-400/20 blur-3xl dark:bg-cyan-500/10"
        />

        <div className="relative">
          <span className="inline-block rounded-full bg-indigo-600 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white">
            Britain, Argued
          </span>
          <h1 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl">
            そのニュースは、
            <br className="sm:hidden" />
            <span className="text-indigo-600 dark:text-indigo-400">
              何を意味するのか
            </span>
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            最新の英国ニュースを出典付きで取り上げ、その背景と原因、英国社会への影響、
            制度や歴史とのつながりまで掘り下げます。要約では終わらせません。
          </p>
        </div>
      </header>

      {/* 読者に「これは要約ではなく論考だ」と最初に伝える。/events(予定表)との
          違いが分からないと、同じニュースを扱う2セクションに見えてしまうため。 */}
      <section className="mb-12 rounded-2xl border border-border bg-muted/40 p-5 sm:p-6">
        <h2 className="text-sm font-bold tracking-tight sm:text-base">
          このセクションの読み方
        </h2>
        <ul className="mt-3 space-y-2 text-sm leading-relaxed text-muted-foreground">
          <li>
            <span className="font-semibold text-foreground">出典を必ず示します。</span>{" "}
            事実と数字には報道機関や公的統計（ONS・各省庁・規制当局）への
            リンクを付け、いつ時点の数字かも明記します。
          </li>
          <li>
            <span className="font-semibold text-foreground">
              要約では終わりません。
            </span>{" "}
            何が起きたかは入口です。なぜ起きたか、英国社会に何をもたらすか、
            制度や歴史とどうつながるかまで掘り下げます。
          </li>
          <li>
            <span className="font-semibold text-foreground">
              書き手の見方を明示します。
            </span>{" "}
            中立を装った要約ではなく、賛否のある論点には立場を書きます。
            批判の対象は制度や意思決定であって、個人ではありません。
          </li>
        </ul>
        <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
          今週の予定（ストライキ・臨時休館・催し）を知りたい場合は{" "}
          <Link
            href="/events"
            className="font-semibold text-indigo-600 underline-offset-2 hover:underline dark:text-indigo-400"
          >
            今週のロンドン
          </Link>{" "}
          をご覧ください。こちらは「それが何を意味するのか」を扱います。
        </p>
      </section>

      <section className="mb-12">
        <div className="mb-5 flex items-baseline justify-between gap-4">
          <div>
            <span className="inline-block rounded-full bg-cyan-600 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white">
              Archive
            </span>
            <h2 className="mt-3 text-xl font-bold tracking-tight sm:text-2xl">
              これまでの論考
            </h2>
          </div>
          {entries.length > 0 && (
            <p className="shrink-0 text-xs text-muted-foreground">
              全{" "}
              <span className="font-bold text-foreground">
                {entries.length}
              </span>{" "}
              本
            </p>
          )}
        </div>

        {entries.length === 0 ? (
          <p className="text-muted-foreground">近日公開予定です。</p>
        ) : (
          <div className="grid max-w-full grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
            {entries.map((item, i) => (
              <ModernBritainCard key={item.id} item={item} index={i} />
            ))}
          </div>
        )}
      </section>

      <div className="mt-10">
        <AdSenseUnit slot={AD_SLOTS.listing} />
      </div>
    </main>
  );
}
