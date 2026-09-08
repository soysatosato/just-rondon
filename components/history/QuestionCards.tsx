import Link from "next/link";
import { chapterPath, getChapterMeta } from "./chapters";

export type HistoryQuestion = {
  question: string;
  answer: string;
  slug: string;
};

/**
 * 「今日の疑問」から章に入る導線。
 *
 * 問いと答えを同じ大きさの灰色で重ねていたので、10枚とも同じ濃さの文字の板に
 * 見えていた。問いは白地に大きく、答えは琥珀の帯に落として、カード1枚の中で
 * 「問い→答え」の段差をつける。答えの帯がそのまま章への入口になる。
 */
export default function QuestionCards({
  questions,
}: {
  questions: HistoryQuestion[];
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {questions.map((q) => {
        const meta = getChapterMeta(q.slug);

        return (
          <Link
            key={q.slug}
            href={chapterPath(q.slug)}
            className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all duration-200 hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-lg hover:shadow-amber-900/5 dark:border-slate-800 dark:bg-slate-900/70 dark:hover:border-amber-800"
          >
            <div className="flex flex-1 flex-col p-4 sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <span
                  aria-hidden
                  className="font-serif text-3xl leading-none text-amber-500/40 dark:text-amber-500/30"
                >
                  ?
                </span>
                {meta && (
                  <span className="mt-1 shrink-0 text-[10px] font-bold tracking-wide text-slate-400 dark:text-slate-500">
                    第{meta.number}章
                  </span>
                )}
              </div>

              <p className="mt-2 text-[15px] font-bold leading-snug tracking-tight transition-colors group-hover:text-amber-700 dark:group-hover:text-amber-400">
                {q.question}
              </p>
            </div>

            <div className="border-t border-amber-100 bg-amber-50/70 px-4 py-3 dark:border-amber-950/60 dark:bg-amber-950/25 sm:px-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-700 dark:text-amber-400">
                Answer
              </p>
              <p className="mt-1 text-[13px] font-medium leading-relaxed text-amber-950 dark:text-amber-100/90">
                {q.answer}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
