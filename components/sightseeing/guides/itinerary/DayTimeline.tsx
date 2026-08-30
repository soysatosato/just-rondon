import GuideCallout from "@/components/guides/GuideCallout";
import type { Day, DayPart, Stop } from "./content";

/**
 * 1日ぶんの予定表。
 *
 * 以前は markdown の番号付きリストで、午前/昼/午後/夜という骨格が
 * 本文中の太字でしかなかった。計画に必要な所要時間と無料/有料も
 * 「（所要 1.5時間、**無料**）」のように文中に埋まっていて、
 * 現地でスクロールしながら拾える形ではなかった。
 *
 * 時間帯を左の帯にして、立ち寄り先を1件ずつのカードにする。
 * 所要時間と「無料」はバッジとして本文から独立させる。
 *
 * 分岐版(雨の日・子連れ・乗り継ぎ)も同じ形の1日を持つので、
 * この部品は itinerary 配下に置いたまま変異版からも使う。
 */
export default function DayTimeline({ day }: { day: Day }) {
  return (
    <div>
      {day.intro && (
        <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
          {day.intro}
        </p>
      )}

      <ol className="mt-4 space-y-4">
        {day.parts.map((part) => (
          <li key={part.part}>
            <PartBlock part={part} />
          </li>
        ))}
      </ol>

      {day.tips && day.tips.length > 0 && (
        <div className="mt-5 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-neutral-700 dark:bg-neutral-800/60">
          <p className="text-xs font-bold tracking-wide text-gray-600 dark:text-gray-400">
            実務メモ
          </p>
          <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm text-gray-700 marker:text-gray-400 dark:text-gray-300">
            {day.tips.map((t) => (
              <li key={t} className="leading-relaxed">
                {t}
              </li>
            ))}
          </ul>
        </div>
      )}

      {day.callout && <GuideCallout {...day.callout} />}
    </div>
  );
}

function PartBlock({ part }: { part: DayPart }) {
  return (
    <div className="flex gap-3 sm:gap-4">
      {/* 時間帯の帯。1日の骨格を左端で固定して、縦に追えるようにする。 */}
      <div className="flex w-12 shrink-0 flex-col items-center sm:w-16">
        <span className="rounded-full bg-emerald-600 px-2 py-1 text-center text-xs font-bold text-white">
          {part.part}
        </span>
        <span
          aria-hidden
          className="mt-1 w-px flex-1 bg-gray-200 dark:bg-neutral-700"
        />
      </div>

      <div className="min-w-0 flex-1 space-y-2 pb-2">
        {part.stops.map((s) => (
          <StopCard key={s.name} stop={s} />
        ))}

        {part.choice && (
          <div className="grid gap-3 sm:grid-cols-2">
            {part.choice.map((c) => (
              <div
                key={c.label}
                className="rounded-lg border border-gray-200 p-3 dark:border-neutral-700"
              >
                <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                  {c.label}
                </p>
                <ul className="mt-2 space-y-2">
                  {c.stops.map((s) => (
                    <li key={s.name}>
                      <StopCard stop={s} compact />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StopCard({ stop, compact }: { stop: Stop; compact?: boolean }) {
  return (
    <div
      className={
        compact
          ? ""
          : "rounded-lg border border-gray-200 bg-white p-3 dark:border-neutral-700 dark:bg-neutral-900"
      }
    >
      <p className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
          {stop.name}
        </span>
        {stop.free && (
          <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-xs font-bold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
            無料
          </span>
        )}
        {stop.duration && (
          <span className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs font-semibold text-gray-600 dark:bg-neutral-800 dark:text-gray-400">
            {stop.duration}
          </span>
        )}
        {stop.at && (
          <span className="font-mono text-xs text-gray-500 dark:text-gray-400">
            {stop.at}
          </span>
        )}
      </p>
      {stop.note && (
        <p className="mt-1 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
          {stop.note}
        </p>
      )}
    </div>
  );
}
