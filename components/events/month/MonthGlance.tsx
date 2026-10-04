import type { LondonMonthClimate } from "@/lib/london-months/climate";
import type { ClockChange, SunDay } from "@/lib/london-months/sun";
import type { MonthDay } from "@/lib/london-months/holidays";

/**
 * 冒頭の「ひと目で」欄。
 *
 * この月に行くかどうかを決める段階の読者は、本文を読む前に
 * 「寒いか・雨か・何時に暗くなるか・祝日に当たるか」の4つで足切りする。
 * 各節に散らばる数字のうち、その判断に要るものだけを先に並べる。
 */
export default function MonthGlance({
  month,
  climate,
  tokyoMonth,
  sunDays,
  clockChange,
  hoursBehind,
  bankHolidays,
}: {
  month: number;
  climate: LondonMonthClimate;
  tokyoMonth: number;
  sunDays: SunDay[];
  clockChange: ClockChange | null;
  /** 月初の日本との時差。切り替えのある月は月末と違う。 */
  hoursBehind: number;
  bankHolidays: MonthDay[];
}) {
  const first = sunDays[0];
  const last = sunDays[sunDays.length - 1];

  const timeDifference = clockChange
    ? {
        value: `${hoursBehind}→${clockChange.kind === "end" ? 9 : 8}時間`,
        sub: `${month}月${clockChange.day}日から${clockChange.kind === "end" ? "冬時間" : "夏時間"}`,
      }
    : { value: `${hoursBehind}時間`, sub: "日本より遅れ" };

  const items = [
    {
      label: "気温",
      value: `${Math.round(climate.maxTemp)}℃ / ${Math.round(climate.minTemp)}℃`,
      sub: `最高 / 最低。東京の${tokyoMonth}月ごろ`,
    },
    {
      label: "雨の日",
      value: `月${Math.round(climate.rainDays)}日`,
      sub: `1mm以上。降水量${Math.round(climate.rainfallMm)}mm`,
    },
    {
      label: "日の入り",
      value: `${first.sunset}→${last.sunset}`,
      sub: `${month}月1日→${last.day}日`,
    },
    { label: "日本との時差", ...timeDifference },
    {
      label: "祝日",
      value: bankHolidays.length > 0 ? `${bankHolidays.length}日` : "なし",
      sub:
        bankHolidays.length > 0
          ? bankHolidays
              .map((d) => `${Number(d.date.slice(8))}日 ${d.title}`)
              .join("、")
          : "バンク・ホリデーのない月",
    },
  ];

  return (
    <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-gray-200 bg-gray-200 dark:border-neutral-700 dark:bg-neutral-700 sm:grid-cols-3 lg:grid-cols-5">
      {items.map((item) => (
        <div
          key={item.label}
          // 5枚を2列・3列・5列で割り切れるよう、最後の1枚(祝日)の幅で埋める。
          className="bg-white p-3.5 dark:bg-neutral-900 last:col-span-2 lg:last:col-span-1"
        >
          <dt className="text-xs font-semibold text-gray-500 dark:text-gray-400">
            {item.label}
          </dt>
          <dd className="mt-1 text-lg font-bold tabular-nums text-gray-900 dark:text-gray-100">
            {item.value}
          </dd>
          <dd className="mt-0.5 text-xs leading-snug text-gray-500 dark:text-gray-400">
            {item.sub}
          </dd>
        </div>
      ))}
    </dl>
  );
}
