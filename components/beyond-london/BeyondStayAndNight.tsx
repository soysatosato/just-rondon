import { Card, CardContent } from "@/components/ui/card";
import MarkdownBody from "@/components/jobs/MarkdownBody";
import type { StayAndNight } from "./types";

/**
 * 「宿と夜」。週末1泊圏の記事だけに出る。
 *
 * 行き方(BeyondGettingThere)のすぐ下に置く。1泊する行き先では
 * 「どう行くか」の次に来る判断が「どこに泊まって、夜どうするか」で、
 * 見どころより先に決まるため。
 *
 * levyNote だけ色を変えているのは、宿泊税が「予約時の表示価格に
 * 含まれないことがある」お金の話だから。他の行と同じ見た目にすると
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
    <section className="mb-8">
      <Card className="border-gray-300 bg-white shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
        <CardContent className="p-0">
          <h2 className="border-b border-gray-300 bg-gray-100 px-4 py-2 text-sm font-semibold dark:border-neutral-700 dark:bg-neutral-800">
            宿と夜
          </h2>
          <dl className="divide-y divide-gray-200 dark:divide-neutral-700">
            {rows.map((row) => (
              <div
                key={row.label}
                className="grid grid-cols-1 gap-1 px-4 py-3 sm:grid-cols-[10rem_1fr] sm:gap-4"
              >
                <dt className="text-xs font-semibold text-gray-500 dark:text-gray-400 sm:text-sm">
                  {row.label}
                </dt>
                <dd className="text-sm leading-relaxed">
                  <MarkdownBody>{row.value}</MarkdownBody>
                </dd>
              </div>
            ))}

            {data.levyNote && (
              <div className="grid grid-cols-1 gap-1 px-4 py-3 sm:grid-cols-[10rem_1fr] sm:gap-4">
                <dt className="text-xs font-semibold text-gray-500 dark:text-gray-400 sm:text-sm">
                  宿泊税
                </dt>
                <dd className="text-sm leading-relaxed text-amber-800 dark:text-amber-300">
                  <MarkdownBody>{data.levyNote}</MarkdownBody>
                </dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>
    </section>
  );
}
