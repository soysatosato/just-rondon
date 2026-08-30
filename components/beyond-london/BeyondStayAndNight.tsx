import MarkdownBody from "@/components/jobs/MarkdownBody";
import type { StayAndNight } from "./types";

/**
 * 「宿と夜」。週末1泊圏の記事だけに出る。
 *
 * 行き方のすぐ下に置く。1泊する行き先では「どう行くか」の次に来る
 * 判断が「どこに泊まって、夜どうするか」で、見どころより先に決まる。
 *
 * 灰色の label/value 表をやめたのは、上の「行き方」と体裁が同じ
 * だったから。1泊圏の記事では、要点・行き方・着いてから・宿と夜で
 * 同型の表が4つ続いていた。
 *
 * levyNote だけ枠を変えているのは、宿泊税が「予約時の表示価格に
 * 含まれないことがある」お金の話だから。他と同じ見た目にすると
 * 読み飛ばされて、現地で予定外の支払いになる。
 */
export default function BeyondStayAndNight({ data }: { data: StayAndNight }) {
  const rows: { label: string; value: string }[] = [
    { label: "どこに泊まるか", value: data.whereToStay },
    { label: "宿の相場", value: data.priceBand },
    { label: "夜にできること", value: data.atNight },
    { label: "翌日の帰り方", value: data.gettingBack },
  ];

  return (
    <section className="mb-8 rounded-xl border border-gray-300 bg-white p-5 shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
      <h2 className="text-base font-bold">宿と夜</h2>

      <dl className="mt-4 grid gap-4 sm:grid-cols-2">
        {rows.map((row) => (
          <div key={row.label}>
            <dt className="text-xs font-bold text-gray-500 dark:text-gray-400">
              {row.label}
            </dt>
            <dd className="mt-0.5 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              <MarkdownBody>{row.value}</MarkdownBody>
            </dd>
          </div>
        ))}
      </dl>

      {data.levyNote && (
        <div className="mt-4 rounded-lg border-l-4 border-amber-500 bg-amber-50 px-4 py-3 dark:bg-amber-950/25">
          <p className="text-xs font-bold text-gray-600 dark:text-gray-400">
            宿泊税
          </p>
          <div className="mt-1 text-sm leading-relaxed text-gray-800 dark:text-gray-200">
            <MarkdownBody>{data.levyNote}</MarkdownBody>
          </div>
        </div>
      )}
    </section>
  );
}
