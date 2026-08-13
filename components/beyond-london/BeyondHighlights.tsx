import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import MarkdownBody from "@/components/jobs/MarkdownBody";
import type { BeyondHighlight } from "./types";

/**
 * 現地の見どころ。
 *
 * ロンドン市内のスポットと違い DB を持たないので、記事側のデータを
 * そのまま描く。地図リンクを必ず出しているのは、ロンドン外は
 * 「駅からどっちに歩くか」が分からないと動けないため
 * (市内なら地下鉄の出口表示で足りるが、地方の駅にはそれがない)。
 */
export default function BeyondHighlights({
  highlights,
}: {
  highlights: BeyondHighlight[];
}) {
  if (highlights.length === 0) return null;

  return (
    <section className="mt-8 space-y-4">
      <h2 className="text-lg font-semibold">現地の見どころ</h2>
      <div className="space-y-4">
        {highlights.map((spot) => (
          <Card
            key={spot.name}
            className="border-gray-300 bg-white shadow-sm dark:border-neutral-700 dark:bg-neutral-900"
          >
            <CardContent className="space-y-2 p-4 sm:p-5">
              <div>
                <h3 className="text-base font-semibold">{spot.name}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {spot.engName}
                </p>
              </div>

              <MarkdownBody>{spot.body}</MarkdownBody>

              <dl className="grid grid-cols-1 gap-1 rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm dark:border-neutral-700 dark:bg-neutral-800/60 sm:grid-cols-[6rem_1fr] sm:gap-x-3">
                <dt className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                  入場料
                </dt>
                <dd className="leading-relaxed">
                  <MarkdownBody>{spot.admission}</MarkdownBody>
                </dd>
              </dl>

              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    spot.mapQuery
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:opacity-80 dark:text-blue-400"
                >
                  地図で見る
                </a>
                {spot.internalLink && (
                  <Link
                    href={spot.internalLink.href}
                    className="text-blue-600 hover:opacity-80 dark:text-blue-400"
                  >
                    {spot.internalLink.label}
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
