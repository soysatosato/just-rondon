import Link from "next/link";
import { chapterPath, type HistoryChapterMeta } from "./chapters";

/**
 * 章の一覧。番号を背骨にした縦の年表として組む。
 *
 * 以前は白いカードを10枚積んでいたが、章番号・期間・英題・題・要約・痕跡が
 * すべて似た大きさの文字で1枚に詰まっていて、どこから読めばいいのか分から
 * なかった(ユーザーの言う「カードが見にくい」)。直したのは3点。
 *
 * - 番号をカードの外に出し、左の溝に丸で立てる。線でつなぐと10枚が1本の
 *   時系列に見え、カード自身は題と要約だけを持てばよくなる。
 * - 題を text-lg まで上げ、要約の文字色を上げた。期間はセリフの数字にして
 *   本文と役割を分けている(/events の日付と同じ扱い)。
 * - 「今も残るもの」は独立した帯にする。ここがこのセクションの取り柄なので、
 *   要約の続きに見えてはいけない。
 */
export default function ChapterList({
  chapters,
}: {
  chapters: HistoryChapterMeta[];
}) {
  return (
    <ol className="relative space-y-3">
      {/* 番号の丸を貫く背骨。丸は不透明なので線の上に乗る。 */}
      <span
        aria-hidden
        className="absolute bottom-4 left-[1.125rem] top-4 w-px bg-amber-200 dark:bg-amber-900/60 sm:left-[1.375rem]"
      />

      {chapters.map((c) => (
        <li key={c.slug}>
          <Link
            href={chapterPath(c.slug)}
            className="group grid grid-cols-[2.25rem_1fr] gap-3 sm:grid-cols-[2.75rem_1fr] sm:gap-4"
          >
            <div className="relative flex justify-center pt-4">
              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-amber-300 bg-background font-serif text-sm font-bold tabular-nums text-amber-700 shadow-sm transition group-hover:border-amber-500 group-hover:bg-amber-500 group-hover:text-white dark:border-amber-800 dark:text-amber-400 dark:group-hover:bg-amber-600 dark:group-hover:text-white">
                {c.number}
              </span>
            </div>

            <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:border-amber-300 group-hover:shadow-lg group-hover:shadow-amber-900/5 dark:border-slate-800 dark:bg-slate-900/70 dark:group-hover:border-amber-800 sm:p-5">
              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                <span className="rounded-full bg-amber-50 px-2.5 py-0.5 font-serif text-[11px] font-semibold tabular-nums text-amber-800 dark:bg-amber-950/50 dark:text-amber-300">
                  {c.period}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">
                  {c.eyebrow}
                </span>
              </div>

              <h4 className="mt-2 text-base font-bold leading-snug tracking-tight transition-colors group-hover:text-amber-700 dark:group-hover:text-amber-400 sm:text-lg">
                {c.label}
              </h4>

              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                {c.blurb}
              </p>

              <p className="mt-3 rounded-lg bg-amber-50/70 px-3 py-2.5 text-xs leading-relaxed text-amber-950 dark:bg-amber-950/25 dark:text-amber-100/90">
                <span className="mr-1.5 font-bold text-amber-700 dark:text-amber-400">
                  今も残るもの
                </span>
                {c.hook}
              </p>
            </div>
          </Link>
        </li>
      ))}
    </ol>
  );
}
