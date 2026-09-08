import Link from "next/link";
import { chapterPath } from "./chapters";
import { HISTORY_WALK, chapterByNumber } from "./walk";

/**
 * 「1日で2000年を歩く」順路。
 *
 * このセクションの取り柄は歩けることなのに、ハブでは章が並ぶだけで、
 * それが一度も見えていなかった。東から西へ4地点、受け持つ章つきで並べる。
 * 濃い面にしているのは、白いカードが続く流れをここで一度切って、
 * 「読む」から「歩く」へ変わったことを見せるため。
 *
 * 地点は walk.ts が持つ。各章の whereToStand に実在するものだけ。
 */
export default function WalkStrip() {
  return (
    <div className="overflow-hidden rounded-3xl bg-slate-950 text-white">
      <div className="px-5 py-7 sm:px-8 sm:py-9">
        <p className="flex items-center gap-2.5 text-[10px] font-bold uppercase tracking-[0.24em] text-amber-300">
          <span className="h-3 w-0.5 shrink-0 rounded-full bg-amber-500" />
          Walk the timeline
        </p>
        <h2
          id="walk"
          className="mt-3 text-xl font-bold tracking-tight sm:text-2xl"
        >
          1日で2000年を歩く
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/65">
          Tower Hill から西へ。徒歩と地下鉄で1日に収まる4地点で、ローマの城壁から議会が王に勝った現場までを東から順に辿れます。
        </p>

        <ol className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {HISTORY_WALK.map((stop, i) => (
            <li
              key={stop.mapQuery}
              className="relative rounded-2xl border border-white/10 bg-white/[0.04] p-4"
            >
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 font-serif text-[11px] font-bold tabular-nums text-slate-950">
                  {i + 1}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/45">
                  {stop.station}
                </span>
              </div>

              <p className="mt-2.5 text-[15px] font-bold leading-snug">
                {stop.place}
              </p>
              <p className="mt-0.5 text-[10px] uppercase tracking-wide text-white/35">
                {stop.engPlace}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-white/65">
                {stop.see}
              </p>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {stop.chapters.map((n) => {
                  const chapter = chapterByNumber(n);
                  if (!chapter) return null;

                  return (
                    <Link
                      key={n}
                      href={chapterPath(chapter.slug)}
                      className="rounded-full border border-amber-400/30 bg-amber-400/10 px-2.5 py-1 text-[10px] font-bold text-amber-200 transition hover:border-amber-400/70 hover:bg-amber-400/20"
                    >
                      第{n}章
                    </Link>
                  );
                })}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
