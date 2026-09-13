import { formatGbp, formatPercent } from "@/lib/money/take-home/format";
import { hourlyGbp } from "@/lib/jobs/rates";
import { CURRENT_TAX_YEAR } from "@/lib/money/take-home/tax-years";
import { cn } from "@/lib/utils";
import ApplyConditionLink from "./ApplyConditionLink";
import { MATRIX_HOURS, hourlyMatrix, quickTableRows } from "./content";

/**
 * 年収別・時給別の早見表。サーバーで書き出す。
 *
 * 「年収£40,000 手取り」のように額で検索してきた人は、計算機を操作する前に
 * 答えの数字を探している。その数字を HTML に直接置いておけば、検索エンジンにも
 * JavaScript の読み込みを待たない読者にも届く。計算機のグラフに対する
 * 「表で読む版」の役も兼ねる。
 */
export default function QuickTables() {
  const rows = quickTableRows();
  const matrix = hourlyMatrix();
  const label = CURRENT_TAX_YEAR.label;

  return (
    <div className="space-y-12">
      <section aria-labelledby="quick-table-heading">
        <h2 id="quick-table-heading" className="text-xl font-bold tracking-tight md:text-2xl">
          年収別の手取り早見表（{label}年度）
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
          イングランド・ウェールズ・北アイルランド、税コード1257L、年金と学生ローンなしの場合。額面を押すと、その条件で計算機が開きます。
        </p>

        <div className="mt-4 overflow-x-auto rounded-2xl border bg-card">
          <table className="w-full min-w-[46rem] border-collapse text-sm">
            <thead>
              <tr className="border-b bg-muted/60 text-left text-xs text-muted-foreground">
                <th scope="col" className="px-4 py-3 font-semibold">額面（年）</th>
                <th scope="col" className="px-4 py-3 text-right font-semibold">手取り（年）</th>
                <th scope="col" className="px-4 py-3 text-right font-semibold text-foreground">手取り（月）</th>
                <th scope="col" className="px-4 py-3 text-right font-semibold">所得税（年）</th>
                <th scope="col" className="px-4 py-3 text-right font-semibold">NI（年）</th>
                <th scope="col" className="px-4 py-3 text-right font-semibold">限界税率</th>
                <th scope="col" className="px-4 py-3 text-right font-semibold">スコットランド（月）</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.gross}
                  className={cn(
                    "border-b last:border-b-0 transition-colors hover:bg-muted/40",
                    row.label && "bg-amber-50/60 dark:bg-amber-950/15",
                  )}
                >
                  <th scope="row" className="px-4 py-2.5 text-left font-medium">
                    <ApplyConditionLink
                      href={row.href}
                      label={`${formatGbp(row.gross, { pence: !Number.isInteger(row.gross) })}の条件で計算機を開く`}
                      className="tabular-nums text-blue-700 underline-offset-4 hover:underline dark:text-blue-400"
                    >
                      {formatGbp(row.gross, { pence: !Number.isInteger(row.gross) })}
                    </ApplyConditionLink>
                    {row.label && (
                      <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-900 dark:bg-amber-900/40 dark:text-amber-200">
                        {row.label}
                      </span>
                    )}
                  </th>
                  <td className="px-4 py-2.5 text-right tabular-nums">{formatGbp(row.takeHome)}</td>
                  <td className="px-4 py-2.5 text-right font-semibold tabular-nums">{formatGbp(row.monthly)}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-muted-foreground">{formatGbp(row.incomeTax)}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-muted-foreground">{formatGbp(row.nationalInsurance)}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-muted-foreground">{formatPercent(row.marginal, 0)}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums">{formatGbp(row.scotlandMonthly)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="hourly-matrix-heading">
        <h2 id="hourly-matrix-heading" className="text-xl font-bold tracking-tight md:text-2xl">
          時給と週の時間から見る、手取りの月額
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
          ワーキングホリデーやパートタイムで時給で働く人向け。イングランド等、年金なし、52週で計算しています。数字を押すとその条件で計算機が開きます。
        </p>

        <div className="mt-4 overflow-x-auto rounded-2xl border bg-card">
          <table className="w-full min-w-[36rem] border-collapse text-sm">
            <thead>
              <tr className="border-b bg-muted/60 text-xs text-muted-foreground">
                <th scope="col" className="px-4 py-3 text-left font-semibold">時給 ＼ 週の時間</th>
                {MATRIX_HOURS.map((hours) => (
                  <th key={hours} scope="col" className="px-4 py-3 text-right font-semibold tabular-nums">
                    {hours}時間
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matrix.map((row) => (
                <tr key={row.hourly} className="border-b last:border-b-0">
                  <th scope="row" className="whitespace-nowrap px-4 py-2.5 text-left font-medium tabular-nums">
                    {hourlyGbp(row.hourly)}
                    {row.isMinimumWage && (
                      <span className="ml-2 text-[11px] font-normal text-muted-foreground">最低賃金</span>
                    )}
                  </th>
                  {row.cells.map((cell) => (
                    <td key={cell.hours} className="px-1 py-1 text-right">
                      <ApplyConditionLink
                        href={cell.href}
                        label={`時給${hourlyGbp(row.hourly)}・週${cell.hours}時間の条件で計算機を開く`}
                        className="block rounded-lg px-3 py-1.5 tabular-nums transition hover:bg-muted"
                      >
                        {formatGbp(cell.monthly)}
                      </ApplyConditionLink>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
