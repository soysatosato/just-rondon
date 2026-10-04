import { BANK_HOLIDAY_SOURCE, type MonthDay } from "@/lib/london-months/holidays";

const WEEKDAY = ["日", "月", "火", "水", "木", "金", "土"];

function formatDate(date: string): string {
  const [y, m, d] = date.split("-").map(Number);
  const dow = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return `${m}月${d}日(${WEEKDAY[dow]})`;
}

/** 祝日と、祝日ではないが店・交通に影響する日。 */
export default function MonthHolidays({
  days,
  bankHolidaysAvailable,
}: {
  days: MonthDay[];
  bankHolidaysAvailable: boolean;
}) {
  const hasBankHoliday = days.some((d) => d.kind === "bank");

  return (
    <div>
      {!bankHolidaysAvailable ? (
        <p className="mb-3 text-sm text-gray-700 dark:text-gray-300">
          祝日の情報をいま取得できません。
          <a
            href={BANK_HOLIDAY_SOURCE.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mx-1 text-blue-600 underline underline-offset-2 dark:text-blue-400"
          >
            GOV.UK
          </a>
          で確かめてください。
        </p>
      ) : (
        !hasBankHoliday && (
          <p className="mb-3 text-sm text-gray-700 dark:text-gray-300">
            この月にバンク・ホリデー(法定の祝日)はありません。
            {days.length === 0 && "店や交通はふだんどおりです。"}
          </p>
        )
      )}

      {days.length > 0 && (
        <ul className="space-y-3">
          {days.map((d) => (
            <li
              key={`${d.date}-${d.englishTitle}`}
              className="rounded-xl border border-gray-200 p-4 dark:border-neutral-700"
            >
              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                <span className="text-sm font-bold tabular-nums text-gray-900 dark:text-gray-100">
                  {formatDate(d.date)}
                </span>
                <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                  {d.title}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                    d.kind === "bank"
                      ? "bg-red-600/10 text-red-700 dark:text-red-400"
                      : "bg-gray-100 text-gray-600 dark:bg-neutral-800 dark:text-gray-400"
                  }`}
                >
                  {d.kind === "bank"
                    ? d.substitute
                      ? "祝日(振替)"
                      : "祝日"
                    : "祝日ではない"}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                {d.englishTitle}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                {d.note}
              </p>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
        祝日はイングランドのもの(gov.uk の公表データ)。スコットランドと北アイルランドは一部が異なります。
      </p>
    </div>
  );
}
