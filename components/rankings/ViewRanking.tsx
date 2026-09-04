import Link from "next/link";

/**
 * 「よく見られている」を2軸で見せる棚。
 *
 * 一覧の棚はどれも編集側の都合(必見・無料・おすすめ順)で並んでいて、
 * 中身を足さない限り並びが変わらない。そこに読者側の軸を1枚入れて、
 * ハブの顔が毎週入れ替わるようにするのがこの棚の役目。
 *
 * 週間を左の広い側に置き、総合は右に細く添える。逆にすると、
 * 何ヶ月も動かないほうが主役になり、入れた意味が無くなる。
 *
 * DBには触らない。集計は呼び出し側(サーバー)で済ませ、ここは並べるだけ——
 * /musicals のようにクライアントコンポーネントの中から使う場所があるため。
 *
 * weekly が空のときは総合だけを1列で出す。日別の集計は運用開始から
 * 貯まるもので、始めた直後は「今週」に数件しか並ばない。件数の判断は
 * 呼び出し側(MIN_WEEKLY)で行い、ここは渡されたものをそのまま出す。
 */

export type RankedItem = {
  /** リストの key。slug など、その一覧の中で一意なもの。 */
  key: string;
  href: string;
  title: string;
  /** 英語名や作品名の副題。無ければ出さない。 */
  subtitle?: string | null;
  /** 週間側のサムネイル。総合側では使わない。 */
  image?: string | null;
};

export default function ViewRanking({
  title,
  description,
  weekly,
  allTime,
  weeklyLabel = "Weekly ・ 今週よく見られている",
  allTimeLabel = "All Time ・ 総合ランキング",
  accentClassName = "bg-red-500",
}: {
  title: string;
  description?: string;
  weekly: RankedItem[];
  allTime: RankedItem[];
  weeklyLabel?: string;
  allTimeLabel?: string;
  accentClassName?: string;
}) {
  const hasWeekly = weekly.length > 0;
  if (!hasWeekly && allTime.length === 0) return null;

  return (
    <div>
      <div className="max-w-3xl border-b border-foreground/15 pb-5">
        <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
          <span
            className={`h-3 w-0.5 shrink-0 rounded-full ${accentClassName}`}
          />
          Most Viewed
        </p>
        <h2 className="mt-2 text-xl font-bold tracking-tight sm:text-2xl">
          {title}
        </h2>
        {description && (
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        )}
      </div>

      <div
        className={`mt-8 grid gap-6 ${hasWeekly ? "lg:grid-cols-12" : ""}`}
      >
        {/* 週間。写真つきで、順位を大きく見せる。 */}
        {hasWeekly && (
          <div className="min-w-0 lg:col-span-7">
            <p className="mb-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
              <span className="inline-block h-2 w-2 shrink-0 rounded-full bg-red-500" />
              {weeklyLabel}
            </p>

            <ol className="divide-y divide-slate-200 overflow-hidden rounded-xl border border-slate-200 bg-white dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900/60">
              {weekly.map((item, i) => (
                <li key={item.key} className="min-w-0">
                  <Link
                    href={item.href}
                    className="group flex min-w-0 items-center gap-3 px-4 py-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  >
                    <span className="w-5 shrink-0 text-center text-lg font-black tabular-nums text-slate-300 dark:text-slate-700 sm:w-6">
                      {i + 1}
                    </span>
                    {item.image && (
                      <img
                        src={item.image}
                        alt=""
                        className="h-12 w-12 shrink-0 rounded-md object-cover"
                        loading="lazy"
                        decoding="async"
                      />
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block line-clamp-2 text-sm font-semibold leading-snug">
                        {item.title}
                      </span>
                      {item.subtitle && (
                        <span className="mt-0.5 block truncate text-[11px] text-muted-foreground">
                          {item.subtitle}
                        </span>
                      )}
                    </span>
                    <span className="hidden shrink-0 text-xs text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 sm:inline">
                      →
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* 総合。写真を出さず、順位と名前だけに絞る。 */}
        {allTime.length > 0 && (
          <div className={`min-w-0 ${hasWeekly ? "lg:col-span-5" : ""}`}>
            <p className="mb-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
              <span className="inline-block h-2 w-2 shrink-0 rounded-full bg-slate-400" />
              {allTimeLabel}
            </p>

            <ol className="divide-y divide-slate-200 overflow-hidden rounded-xl border border-slate-200 bg-white dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900/60">
              {allTime.map((item, i) => (
                <li key={item.key} className="min-w-0">
                  <Link
                    href={item.href}
                    className="group flex min-w-0 items-center gap-3 px-4 py-2.5 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  >
                    <span className="w-5 shrink-0 text-center text-base font-black tabular-nums text-slate-300 dark:text-slate-700">
                      {i + 1}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block line-clamp-2 text-sm font-semibold leading-snug">
                        {item.title}
                      </span>
                      {item.subtitle && (
                        <span className="mt-0.5 block truncate text-[11px] text-muted-foreground">
                          {item.subtitle}
                        </span>
                      )}
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}
