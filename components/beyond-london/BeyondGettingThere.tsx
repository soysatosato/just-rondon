import Link from "next/link";
import MarkdownBody from "@/components/jobs/MarkdownBody";
import { BEYOND_FARE_BANDS } from "@/lib/beyond-london/rates";
import {
  beyondDestinations,
  type BeyondMeta,
} from "./destinations";
import type { GettingThere, OnArrival } from "./types";

/**
 * 「行き方」と「着いてから」。このセクションの中核。
 *
 * 以前はどちらも label/value の灰色の表だった。上の「要点」表、下の
 * 「宿と夜」表と体裁が同じで、1泊圏の記事では同じ見た目の表が4つ、
 * 最大21行ぶん続いていた。スマホでは1列に潰れるので、42行の
 * 同じものが流れることになる。読む手がかりが無い。
 *
 * 表をやめて、読者が実際に順に決めることの形に合わせた:
 * どの駅から乗るか → どれだけかかるか → いくらか → いつ買うか。
 *
 * Oyster は表から出して、行き方より前の警告ブロックにした。
 * ここは唯一「知らないと罰金になりうる」項目なのに、以前は
 * 文字色を赤くした表の7行目で、周りの6行と同じ重さに見えていた。
 * (/beyond-london ハブでも同じ扱いに格上げしてある)
 *
 * 説明文は MarkdownBody に通す。この型のフィールドは markdown で
 * 書かれている(湖水地方の「**ウィンダミアまでの切符**」、ペンザンスの
 * 「**土曜の夜だけは走りません**」)のに、以前は素の文字列として
 * 描いていたので ** が生のまま読者に出ていた。
 * 先頭の段落だけ上マージンを消して、1行の値でも詰めて見えるようにする。
 */

/** MarkdownBody の段落マージンを、1行の値向けに詰める。 */
const TIGHT = "[&>p:first-child]:mt-0 [&>p:last-child]:mb-0";

/** 所要バーの基準。ハブの一覧と同じ尺度にそろえる。 */
const MAX_MINUTES = Math.max(
  ...beyondDestinations.map((d) => d.journeyMinutes ?? 0)
);

export default function BeyondGettingThere({
  gettingThere,
  onArrival,
  meta,
}: {
  gettingThere: GettingThere;
  onArrival: OnArrival;
  meta: BeyondMeta | null;
}) {
  const fare = meta ? BEYOND_FARE_BANDS[meta.slug] : undefined;
  const minutes = meta?.journeyMinutes ?? 0;
  const barWidth = minutes ? Math.max(6, Math.round((minutes / MAX_MINUTES) * 100)) : 0;

  const notes: { label: string; value: string }[] = [
    { label: "運行会社", value: gettingThere.operator },
    { label: "本数", value: gettingThere.frequency },
    { label: "運賃の目安", value: gettingThere.fareGuide },
    { label: "いつ買うか", value: gettingThere.bookingAdvice },
  ];
  if (gettingThere.railcardNote) {
    notes.push({ label: "Railcard", value: gettingThere.railcardNote });
  }

  return (
    <section className="mb-8 space-y-4">
      {/*
        Oyster を最初に出す。行き方の詳細より前に来るのは、
        改札を通れてしまうために「使えた」と誤解したまま
        乗ってしまう事故が、この一点だけ性質が違うから。
      */}
      <div
        className={`rounded-lg border-l-4 px-4 py-3 ${
          gettingThere.oysterValid
            ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/25"
            : "border-red-500 bg-red-50 dark:bg-red-950/25"
        }`}
      >
        <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
          Oyster・タッチ決済は
          {gettingThere.oysterValid ? "使えます" : "使えません"}
        </p>
        <div
          className={`mt-1.5 text-sm leading-relaxed text-gray-700 dark:text-gray-300 ${TIGHT}`}
        >
          <MarkdownBody>{gettingThere.oysterNote}</MarkdownBody>
        </div>
        {!gettingThere.oysterValid && (
          <Link
            href="/sightseeing/transport/national-rail"
            className="mt-2 inline-block text-sm font-semibold text-blue-700 underline underline-offset-2 hover:opacity-80 dark:text-blue-400"
          >
            英国の鉄道切符の買い方 →
          </Link>
        )}
      </div>

      <div className="rounded-xl border border-gray-300 bg-white p-5 shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
        <h2 className="text-base font-bold">行き方</h2>

        {/* 駅 → 所要 → 運賃。読者が順に決めることの順に並べる。 */}
        <div className="mt-4 space-y-4">
          <div>
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400">
              ロンドン側の駅
            </p>
            <p className="mt-0.5 text-sm leading-relaxed text-gray-800 dark:text-gray-200">
              {gettingThere.fromStation}
            </p>
          </div>

          <div>
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400">
              所要（片道）
            </p>
            <p className="mt-0.5 text-sm leading-relaxed text-gray-800 dark:text-gray-200">
              {gettingThere.journeyTime}
            </p>
            {barWidth > 0 && (
              <span
                aria-hidden
                className="mt-1.5 block h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-neutral-800"
              >
                <span
                  className="block h-full rounded-full bg-teal-500/70"
                  style={{ width: `${barWidth}%` }}
                />
              </span>
            )}
          </div>

          {fare && (
            <div>
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400">
                片道の運賃帯
              </p>
              <p className="mt-1 flex flex-wrap items-baseline gap-x-2 text-sm">
                <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                  Advance {fare.advanceFrom}
                </span>
                <span aria-hidden className="text-gray-400">
                  →
                </span>
                <span className="font-semibold text-red-700 dark:text-red-400">
                  当日 {fare.onTheDay}
                </span>
              </p>
            </div>
          )}
        </div>

        <dl className="mt-5 space-y-3 border-t border-gray-200 pt-4 dark:border-neutral-700">
          {notes.map((n) => (
            <div key={n.label}>
              <dt className="text-xs font-bold text-gray-500 dark:text-gray-400">
                {n.label}
              </dt>
              <dd
                className={`mt-0.5 text-sm leading-relaxed text-gray-700 dark:text-gray-300 ${TIGHT}`}
              >
                <MarkdownBody>{n.value}</MarkdownBody>
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="rounded-xl border border-gray-300 bg-white p-5 shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
        <h2 className="text-base font-bold">着いてから</h2>

        <div
          className={`mt-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300 ${TIGHT}`}
        >
          <MarkdownBody>{onArrival.fromStationToCentre}</MarkdownBody>
        </div>

        {/*
          半日と1日は「どちらかを選ぶ」情報なので、並べて出す。
          表の行として上下に置くと、読者が自分の持ち時間の側だけを
          拾えない。
        */}
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg bg-gray-50 p-3 dark:bg-neutral-800/60">
            <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
              半日なら
            </p>
            <div
              className={`mt-1 text-sm leading-relaxed text-gray-700 dark:text-gray-300 ${TIGHT}`}
            >
              <MarkdownBody>{onArrival.halfDay}</MarkdownBody>
            </div>
          </div>
          {onArrival.fullDay && (
            <div className="rounded-lg bg-gray-50 p-3 dark:bg-neutral-800/60">
              <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                1日使うなら
              </p>
              <div
                className={`mt-1 text-sm leading-relaxed text-gray-700 dark:text-gray-300 ${TIGHT}`}
              >
                <MarkdownBody>{onArrival.fullDay}</MarkdownBody>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
