import Link from "next/link";
import type { AreaGuideWalk } from "./types";
import type { AreaSpot } from "@/utils/areas";

/**
 * 回遊ルート。エリアガイドの中核。
 *
 * 縦線で繋いだ順路として出す。スポット一覧(カードの格子)と
 * 視覚的に別物にしておかないと、「順番に歩くもの」であることが
 * 読者に伝わらない——それが伝わらないなら、このセクションは
 * スポット一覧の劣化版でしかなくなる。
 *
 * DB にあるステップはスポット詳細へリンクし、無いもの(マーケットや
 * 通りの名前)はただのテキストとして出す。リンクの有無で読者に
 * 「詳細ページがあるか」が伝わる。
 */
export default function AreaWalkRoute({
  walk,
  spots,
}: {
  walk: AreaGuideWalk;
  spots: Map<string, AreaSpot>;
}) {
  return (
    <section id="walk-route" className="mb-10 scroll-mt-24">
      <div className="rounded-lg border border-emerald-200 bg-emerald-50/60 p-4 dark:border-emerald-900 dark:bg-emerald-950/30 sm:p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {walk.title}
          </h2>
          <span className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white">
            所要 {walk.duration}
          </span>
        </div>

        <p className="mt-2 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
          {walk.intro}
        </p>

        <ol className="mt-6 space-y-0">
          {walk.steps.map((step, i) => {
            const spot = step.attractionSlug
              ? spots.get(step.attractionSlug)
              : undefined;
            const isLast = i === walk.steps.length - 1;

            return (
              <li key={`${step.title}-${i}`} className="relative flex gap-4">
                {/* 番号と、次のステップへ繋ぐ縦線 */}
                <div className="flex flex-col items-center">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">
                    {i + 1}
                  </span>
                  {!isLast && (
                    <span
                      aria-hidden
                      className="mt-1 w-px flex-1 bg-emerald-300 dark:bg-emerald-800"
                    />
                  )}
                </div>

                <div className={isLast ? "pb-0" : "pb-6"}>
                  {spot ? (
                    <Link
                      href={`/sightseeing/${spot.slug}`}
                      className="text-base font-semibold text-blue-700 hover:opacity-80 dark:text-blue-400"
                    >
                      {step.title}
                    </Link>
                  ) : (
                    <span className="text-base font-semibold text-gray-900 dark:text-gray-100">
                      {step.title}
                    </span>
                  )}

                  {spot?.durationText && (
                    <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                      滞在 {spot.durationText}
                    </span>
                  )}

                  <p className="mt-1 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                    {step.body}
                  </p>

                  {step.walkToNext && (
                    <p className="mt-2 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                      ↓ {step.walkToNext}
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
