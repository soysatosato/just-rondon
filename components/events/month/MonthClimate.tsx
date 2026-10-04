import type {
  LondonMonthClimate,
  MonthClimate as TokyoClimate,
} from "@/lib/london-months/climate";

/**
 * 平年値の6項目と、東京の物差し。
 *
 * 東京は2つ出す。同じ月(「東京の11月より寒い」)と、気温の近い月
 * (「東京の12月ごろ」)。前者は比べる基準、後者は服を選ぶ基準で、
 * 読者はどちらでも考えるため。
 */
export default function MonthClimate({
  month,
  climate,
  tokyoSameMonth,
  tokyoMonth,
  tokyoEquivalent,
}: {
  month: number;
  climate: LondonMonthClimate;
  tokyoSameMonth: TokyoClimate;
  tokyoMonth: number;
  tokyoEquivalent: TokyoClimate;
}) {
  const stats = [
    { label: "最高気温", value: `${Math.round(climate.maxTemp)}℃` },
    { label: "最低気温", value: `${Math.round(climate.minTemp)}℃` },
    { label: "雨の日(1mm以上)", value: `${Math.round(climate.rainDays)}日` },
    { label: "降水量", value: `${Math.round(climate.rainfallMm)}mm` },
    { label: "日照時間", value: `${Math.round(climate.sunshineHours)}時間` },
    { label: "霜の降りる日", value: `${Math.round(climate.frostDays)}日` },
  ];

  const tokyoRows = [
    { label: `東京の${month}月`, climate: tokyoSameMonth },
    ...(tokyoMonth === month
      ? []
      : [{ label: `東京の${tokyoMonth}月(気温が近い)`, climate: tokyoEquivalent }]),
  ];

  return (
    <div>
      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {stats.map((s) => (
          <li
            key={s.label}
            className="rounded-lg border border-gray-200 p-3 dark:border-neutral-700"
          >
            <p className="text-xs text-gray-500 dark:text-gray-400">{s.label}</p>
            <p className="mt-0.5 text-lg font-bold tabular-nums text-gray-900 dark:text-gray-100">
              {s.value}
            </p>
          </li>
        ))}
      </ul>

      <div className="mt-3 rounded-lg bg-gray-50 p-3 text-sm dark:bg-neutral-800/60">
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
          東京と比べると
        </p>
        <ul className="mt-1.5 space-y-1">
          {tokyoRows.map((row) => (
            <li
              key={row.label}
              className="flex flex-wrap gap-x-3 text-gray-700 dark:text-gray-300"
            >
              <span className="font-medium">{row.label}</span>
              <span className="tabular-nums">
                最高{Math.round(row.climate.maxTemp)}℃・最低
                {Math.round(row.climate.minTemp)}℃・降水量
                {Math.round(row.climate.rainfallMm)}mm・日照
                {Math.round(row.climate.sunshineHours)}時間
              </span>
            </li>
          ))}
        </ul>
      </div>

      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
        1991〜2020年の平年値(ロンドンは Met Office の Heathrow 観測所、東京は気象庁)。
        その年の実際の天気は、出発の1週間前から予報で確かめてください。
      </p>
    </div>
  );
}
