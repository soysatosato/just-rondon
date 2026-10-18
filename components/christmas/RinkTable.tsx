import Link from "next/link";
import { formatRange, type ResolvedItem } from "@/lib/christmas";

/**
 * スケートリンクの比較表。会期・12月25日・料金・最寄り駅を横に並べる。
 * マーケット比較の表(MarketTable)と同じ組み方で、スマホでは表だけを
 * 横にスクロールさせる。
 */
export default function RinkTable({ rinks }: { rinks: ResolvedItem[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-sky-200 dark:border-sky-900/60">
      <table className="w-full min-w-[42rem] text-left text-sm">
        <thead className="bg-sky-50 text-xs text-sky-900 dark:bg-sky-950/40 dark:text-sky-200">
          <tr>
            <th scope="col" className="px-3 py-2 font-semibold">リンク</th>
            <th scope="col" className="px-3 py-2 font-semibold">会期</th>
            <th scope="col" className="px-3 py-2 font-semibold">12月25日</th>
            <th scope="col" className="px-3 py-2 font-semibold">料金</th>
            <th scope="col" className="px-3 py-2 font-semibold">最寄り駅</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
          {rinks.map((rink) => (
            <tr key={rink.slug} className="align-top">
              <th scope="row" className="px-3 py-2.5 font-medium">
                <Link href={rink.href} className="text-link underline-offset-2 hover:underline">
                  {rink.shortTitle}
                </Link>
              </th>
              <td className="px-3 py-2.5 tabular-nums">
                {rink.edition ? formatRange(rink.edition) : `未発表(${rink.usualTiming})`}
              </td>
              <td className="px-3 py-2.5">
                {rink.edition?.christmasDay === "closed"
                  ? "休み"
                  : rink.edition?.christmasDay === "open"
                    ? "営業"
                    : "—"}
              </td>
              <td className="px-3 py-2.5 leading-relaxed">{rink.edition?.price ?? rink.entry}</td>
              <td className="px-3 py-2.5">{rink.station}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
