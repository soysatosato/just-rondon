import {
  BEYOND_LOCAL_TRANSPORT_LABELS,
  BEYOND_THEME_LABELS,
  type BeyondMeta,
  type BeyondTimeFit,
} from "./destinations";
import type { BeyondVerdict as VerdictData } from "./types";

/**
 * 「そもそも自分はここに行くべきか」を、行き方より先に出す。
 *
 * 以前ここには atAGlance の灰色の表があり、6行のうち3行前後を
 * すぐ下の「行き方」と「見どころ」が繰り返していた。同じ体裁の表が
 * 続けて2つ並ぶので、読者は同じ内容を二度読まされていた。
 *
 * 事実(所要・運賃・Oyster・入場料)は下の表と見どころが持つ。
 * ここは判断だけを持つ。だから表ではなく、行き先カードから
 * 続いてきたバッジ列と、3つの短い断定で組む。
 *
 * バッジがハブのカードと同じ3つ(時間・現地の足・テーマ)なのは、
 * ハブから来た読者が「さっき見た行き先で合っている」を
 * 一目で確認できるようにするため。
 */

const TIME_FIT_LABELS: Record<BeyondTimeFit, string> = {
  halfDay: "半日で行ける",
  fullDay: "1日で行ける",
  overnight: "1泊向き",
};

export default function BeyondVerdict({
  verdict,
  meta,
  county,
}: {
  verdict: VerdictData;
  meta: BeyondMeta | null;
  county: string;
}) {
  const rows: { label: string; value: string; accent?: boolean }[] = [
    { label: "滞在の目安", value: verdict.stayLength },
    { label: "外しやすい一点", value: verdict.watchOut, accent: true },
    { label: "向いている人", value: verdict.suitedTo },
  ];

  return (
    <section className="mb-8">
      <ul className="flex flex-wrap gap-1.5">
        <li className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600 dark:bg-neutral-800 dark:text-gray-400">
          {county}
        </li>
        {(meta?.timeFit ?? []).map((t) => (
          <li
            key={t}
            className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
          >
            {TIME_FIT_LABELS[t]}
          </li>
        ))}
        {meta?.localTransport && (
          <li className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600 dark:bg-neutral-800 dark:text-gray-400">
            {BEYOND_LOCAL_TRANSPORT_LABELS[meta.localTransport]}
          </li>
        )}
        {(meta?.themes ?? []).map((t) => (
          <li
            key={t}
            className="rounded-full border border-gray-200 px-2.5 py-1 text-xs text-gray-500 dark:border-neutral-700 dark:text-gray-400"
          >
            {BEYOND_THEME_LABELS[t]}
          </li>
        ))}
      </ul>

      <dl className="mt-4 space-y-3">
        {rows.map((row) => (
          <div
            key={row.label}
            className={`rounded-lg border-l-4 py-2 pl-4 ${
              row.accent
                ? "border-amber-500 bg-amber-50/60 dark:bg-amber-950/20"
                : "border-gray-200 dark:border-neutral-700"
            }`}
          >
            <dt className="text-xs font-bold text-gray-500 dark:text-gray-400">
              {row.label}
            </dt>
            <dd className="mt-0.5 text-sm leading-relaxed text-gray-800 dark:text-gray-200">
              {row.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
