import { Card, CardContent } from "@/components/ui/card";
import type { GettingThere, OnArrival } from "./types";

/**
 * 「行き方」と「現地での回り方」。
 *
 * このセクションの中核なので、目次より前・本文より前に置く。
 * 読者が最初に知りたいのは「どうやって行くのか」で、
 * 街の魅力の説明はその後でいい。
 *
 * oysterValid だけ色を変えて強調しているのは、ここが唯一
 * 「知らないと罰金になりうる」項目だから。他の行と同じ見た目にすると
 * 読み飛ばされる。
 */
export default function BeyondGettingThere({
  gettingThere,
  onArrival,
}: {
  gettingThere: GettingThere;
  onArrival: OnArrival;
}) {
  const rows: { label: string; value: string }[] = [
    { label: "ロンドン側の駅", value: gettingThere.fromStation },
    { label: "運行会社", value: gettingThere.operator },
    { label: "所要時間（片道）", value: gettingThere.journeyTime },
    { label: "本数", value: gettingThere.frequency },
    { label: "運賃の目安", value: gettingThere.fareGuide },
    { label: "予約", value: gettingThere.bookingAdvice },
  ];

  return (
    <section className="mb-8 space-y-4">
      <Card className="border-gray-300 bg-white shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
        <CardContent className="p-0">
          <h2 className="border-b border-gray-300 bg-gray-100 px-4 py-2 text-sm font-semibold dark:border-neutral-700 dark:bg-neutral-800">
            行き方
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
                <dd className="text-sm leading-relaxed">{row.value}</dd>
              </div>
            ))}

            {/*
              Oyster の可否は、他の行と同じ見た目にすると読み飛ばされる。
              使えない場合は警告色にして、必ず目に入るようにする。
            */}
            <div className="grid grid-cols-1 gap-1 px-4 py-3 sm:grid-cols-[10rem_1fr] sm:gap-4">
              <dt className="text-xs font-semibold text-gray-500 dark:text-gray-400 sm:text-sm">
                Oyster・タッチ決済
              </dt>
              <dd className="text-sm leading-relaxed">
                <span
                  className={
                    gettingThere.oysterValid
                      ? "font-semibold text-emerald-700 dark:text-emerald-400"
                      : "font-semibold text-red-700 dark:text-red-400"
                  }
                >
                  {gettingThere.oysterValid ? "使えます" : "使えません"}
                </span>
                <span className="mt-1 block text-gray-700 dark:text-gray-300">
                  {gettingThere.oysterNote}
                </span>
              </dd>
            </div>

            {gettingThere.railcardNote && (
              <div className="grid grid-cols-1 gap-1 px-4 py-3 sm:grid-cols-[10rem_1fr] sm:gap-4">
                <dt className="text-xs font-semibold text-gray-500 dark:text-gray-400 sm:text-sm">
                  Railcard
                </dt>
                <dd className="text-sm leading-relaxed">
                  {gettingThere.railcardNote}
                </dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>

      <Card className="border-gray-300 bg-white shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
        <CardContent className="p-0">
          <h2 className="border-b border-gray-300 bg-gray-100 px-4 py-2 text-sm font-semibold dark:border-neutral-700 dark:bg-neutral-800">
            着いてから
          </h2>
          <dl className="divide-y divide-gray-200 dark:divide-neutral-700">
            <div className="grid grid-cols-1 gap-1 px-4 py-3 sm:grid-cols-[10rem_1fr] sm:gap-4">
              <dt className="text-xs font-semibold text-gray-500 dark:text-gray-400 sm:text-sm">
                駅から中心部へ
              </dt>
              <dd className="text-sm leading-relaxed">
                {onArrival.fromStationToCentre}
              </dd>
            </div>
            <div className="grid grid-cols-1 gap-1 px-4 py-3 sm:grid-cols-[10rem_1fr] sm:gap-4">
              <dt className="text-xs font-semibold text-gray-500 dark:text-gray-400 sm:text-sm">
                半日なら
              </dt>
              <dd className="text-sm leading-relaxed">{onArrival.halfDay}</dd>
            </div>
            {onArrival.fullDay && (
              <div className="grid grid-cols-1 gap-1 px-4 py-3 sm:grid-cols-[10rem_1fr] sm:gap-4">
                <dt className="text-xs font-semibold text-gray-500 dark:text-gray-400 sm:text-sm">
                  1日使うなら
                </dt>
                <dd className="text-sm leading-relaxed">{onArrival.fullDay}</dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>
    </section>
  );
}
