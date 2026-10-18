import Link from "next/link";
import {
  formatFullDate,
  LAST_CHECKED,
  tableChristmasDay,
  tableRange,
  type ChristmasMarket,
} from "./data";

/**
 * クリスマスマーケットの比較表。会期・12月25日・入場・最寄り駅を横に並べる。
 *
 * 行見出しはページ内の各マーケットの節(#slug)へ飛ぶ。本体が観光スポットの
 * ページにあるもの(ウィンター・ワンダーランド)はそちらへ送る。
 *
 * スマートフォンでは表だけを横にスクロールさせ、ページ自体は横に広げない。
 */
export default function MarketTable({
  markets,
  year,
}: {
  markets: ChristmasMarket[];
  year: number;
}) {
  return (
    <section aria-labelledby="market-table" className="mt-8">
      <h2 id="market-table" className="text-lg font-bold">
        {year}年の会期と比較
      </h2>
      <div className="mt-3 overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-700">
        <table className="w-full min-w-[40rem] text-left text-sm">
          <thead className="bg-neutral-50 text-xs text-neutral-600 dark:bg-neutral-800/60 dark:text-neutral-400">
            <tr>
              <th scope="col" className="px-3 py-2 font-semibold">
                マーケット
              </th>
              <th scope="col" className="px-3 py-2 font-semibold">
                {year}年の会期
              </th>
              <th scope="col" className="px-3 py-2 font-semibold">
                12月25日
              </th>
              <th scope="col" className="px-3 py-2 font-semibold">
                入場
              </th>
              <th scope="col" className="px-3 py-2 font-semibold">
                最寄り駅
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
            {markets.map((m) => (
              <tr key={m.slug} className="align-top">
                <th scope="row" className="px-3 py-2 font-medium">
                  {m.spotSlug ? (
                    <Link
                      href={`/sightseeing/${m.spotSlug}`}
                      className="text-blue-700 underline-offset-2 hover:underline dark:text-blue-400"
                    >
                      {m.shortTitle}
                    </Link>
                  ) : (
                    <a
                      href={`#${m.slug}`}
                      className="text-blue-700 underline-offset-2 hover:underline dark:text-blue-400"
                    >
                      {m.shortTitle}
                    </a>
                  )}
                </th>
                <td className="px-3 py-2 tabular-nums">{tableRange(m, year)}</td>
                <td className="px-3 py-2">{tableChristmasDay(m, year)}</td>
                <td className="px-3 py-2">{m.entry}</td>
                <td className="px-3 py-2">{m.station}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
        会期は主催者の公式発表を確かめたものだけを載せています({formatFullDate(LAST_CHECKED)}時点)。
        「未発表」は発表がまだ無いもの、12月25日の「—」は公式の案内に記載が無いものです。
        出典は各マーケットの節にあります。
      </p>
    </section>
  );
}
