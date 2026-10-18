import {
  formatDuration,
  type ClockChange,
  type SunDay,
} from "@/lib/london-months/sun";

/** 日の出・日の入りの3点と、夏時間の切り替え。 */
export default function MonthSun({
  year,
  month,
  sunDays,
  clockChange,
}: {
  year: number;
  month: number;
  sunDays: SunDay[];
  clockChange: ClockChange | null;
}) {
  return (
    <div>
      <div className="overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-700">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-xs text-neutral-500 dark:bg-neutral-800/60 dark:text-neutral-400">
            <tr>
              <th className="px-3 py-2 text-left font-semibold">日付</th>
              <th className="px-3 py-2 text-left font-semibold">日の出</th>
              <th className="px-3 py-2 text-left font-semibold">日の入り</th>
              <th className="px-3 py-2 text-left font-semibold">昼の長さ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
            {sunDays.map((d) => (
              <tr key={d.day} className="tabular-nums">
                <td className="px-3 py-2 text-neutral-500 dark:text-neutral-400">
                  {month}月{d.day}日
                </td>
                <td className="px-3 py-2 font-medium text-neutral-900 dark:text-neutral-100">
                  {d.sunrise}
                </td>
                <td className="px-3 py-2 font-bold text-neutral-900 dark:text-neutral-100">
                  {d.sunset}
                </td>
                <td className="px-3 py-2 text-neutral-700 dark:text-neutral-300">
                  {formatDuration(d.daylightMinutes)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {clockChange && (
        <div className="mt-3 rounded-lg border border-amber-600/30 bg-amber-600/5 p-3.5 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
          <p className="font-semibold text-amber-700 dark:text-amber-400">
            {month}月{clockChange.day}日(日)に時計が変わります
          </p>
          <p className="mt-1">
            {clockChange.kind === "end"
              ? "午前2時に夏時間(BST)が終わり、時計を1時間戻します。日の入りは前の日より1時間早くなり、日本との時差は8時間から9時間に変わります。"
              : "午前1時に夏時間(BST)が始まり、時計を1時間進めます。日の入りは前の日より1時間遅くなり、日本との時差は9時間から8時間に変わります。この日は1時間短いので、朝の予定に注意してください。"}
          </p>
        </div>
      )}

      <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
        {year}年のロンドン中心部の時刻(現地時間)。天文計算による目安で、1〜2分の誤差があります。
      </p>
    </div>
  );
}
