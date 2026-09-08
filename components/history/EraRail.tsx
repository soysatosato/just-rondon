import Link from "next/link";
import {
  HISTORY_ERA_ORDER,
  HISTORY_ERA_LABELS,
  eraAnchor,
  eraChapterRange,
  eraRange,
} from "./chapters";

/**
 * 題字の中に敷く「2000年の見取り図」。
 *
 * 通史のハブに来た読者がまず知りたいのは章の題ではなく、どこからどこまでの
 * 話なのか。時代を4つに束ねた帯を題字の中に置いて、全体の幅を先に見せる。
 * そのまま下の章立てへのアンカーになるので、目次を二重に持たなくて済む。
 *
 * 年は eraRange が各章の period から組み立てる。ここに直書きしない。
 *
 * 幅は章数に比例させていない。年数に比例させると近代が針のように細くなり、
 * 章数に比例させると「時代の長さ」と誤読される。4つ等幅にして、年の幅は
 * 数字で読ませる。
 */
export default function EraRail() {
  return (
    <nav
      aria-label="時代から選ぶ"
      className="mt-9 grid grid-cols-2 gap-2 border-t border-white/15 pt-6 sm:grid-cols-4 sm:gap-3"
    >
      {HISTORY_ERA_ORDER.map((era, i) => (
        <Link
          key={era}
          href={`#${eraAnchor(era)}`}
          className="group rounded-xl border border-white/10 bg-white/[0.04] p-3 transition hover:border-amber-400/50 hover:bg-white/10"
        >
          {/* 古い時代ほど濃く。左から右へ現在に向かって薄れていく。 */}
          <span
            aria-hidden
            className="block h-1 w-full rounded-full bg-amber-400"
            style={{ opacity: 1 - i * 0.18 }}
          />
          <span className="mt-3 block font-serif text-[11px] tabular-nums text-white/45">
            {eraRange(era)}
          </span>
          <span className="mt-1 block text-[13px] font-bold leading-snug text-white">
            {HISTORY_ERA_LABELS[era]}
          </span>
          <span className="mt-1.5 block text-[10px] font-bold tracking-wide text-amber-300/85">
            {eraChapterRange(era)}
          </span>
        </Link>
      ))}
    </nav>
  );
}
