import { Card, CardContent } from "@/components/ui/card";
import MarkdownBody from "@/components/jobs/MarkdownBody";
import type { BreakEven } from "./types";

/**
 * 損益分岐。BritRail Pass のような「買うべきか」記事の中核。
 *
 * verdict を最も目立たせる。この手の記事は結論を探して読まれるので、
 * 本文を読まずにここだけ見た人でも判断できる状態にする。
 * 「元が取れないケース」を同じ強さで並べているのは、
 * 買わせる方向にだけ結論を出すと記事の信頼が落ちるため。
 */
export default function BeyondBreakEven({ data }: { data: BreakEven }) {
  return (
    <section className="mb-8">
      <Card className="border-gray-300 bg-white shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
        <CardContent className="space-y-4 p-4 sm:p-6">
          <div>
            <h2 className="text-lg font-semibold">結論：元が取れる条件</h2>
            <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              <MarkdownBody>{data.premise}</MarkdownBody>
            </div>
          </div>

          <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-950/30">
            <MarkdownBody>{data.verdict}</MarkdownBody>
          </div>

          <div>
            <p className="text-xs font-bold tracking-wide text-gray-600 dark:text-gray-400">
              元が取れないケース
            </p>
            <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm text-gray-700 marker:text-gray-400 dark:text-gray-300">
              {data.whenNotWorth.map((item) => (
                <li key={item} className="leading-relaxed">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
