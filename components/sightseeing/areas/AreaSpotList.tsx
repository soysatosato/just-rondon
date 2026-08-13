import Link from "next/link";
import Image from "next/image";
import type { AreaSpot } from "@/utils/areas";

/**
 * エリア内のスポット一覧。
 *
 * 回遊ルート(AreaWalkRoute)がルートに乗せた「歩く順番」に対して、
 * こちらは「このエリアにある全部」。ルートに入らなかったスポットも
 * ここには出るので、読者が自分でルートを組み替えられる。
 *
 * ★(mustSee)を先頭に並べるのは utils/areas.ts の getAreaSpots の責務。
 * ここでは並べ替えない。
 */
export default function AreaSpotList({
  spots,
  areaLabel,
}: {
  spots: AreaSpot[];
  areaLabel: string;
}) {
  if (spots.length === 0) return null;

  return (
    <section id="spots" className="mt-12 scroll-mt-24">
      <h2 className="text-lg font-semibold">
        {areaLabel}のスポット一覧
        <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
          {spots.length}件
        </span>
      </h2>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {spots.map((spot) => (
          <Link
            key={spot.slug}
            href={`/sightseeing/${spot.slug}`}
            className="group flex gap-3 rounded-lg border border-gray-300 bg-white p-3 transition hover:border-emerald-400 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:border-emerald-500"
          >
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md">
              <Image
                src={spot.image}
                alt={spot.name}
                fill
                sizes="80px"
                className="object-cover"
              />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-start gap-1.5">
                {spot.mustSee && (
                  <span className="mt-0.5 shrink-0 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-800 dark:bg-amber-900/50 dark:text-amber-300">
                    必見
                  </span>
                )}
                <h3 className="text-sm font-semibold leading-snug text-gray-900 dark:text-gray-100">
                  {spot.name}
                </h3>
              </div>

              {spot.tagline && (
                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                  {spot.tagline}
                </p>
              )}

              {/*
                料金と所要時間。null は行ごと出さない。
                「情報なし」と書くより、その行が無いほうが読みやすい。
              */}
              <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-gray-500 dark:text-gray-400">
                {spot.isFree ? (
                  <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                    無料
                  </span>
                ) : (
                  spot.priceAdult && <span>{spot.priceAdult}</span>
                )}
                {spot.durationText && <span>所要 {spot.durationText}</span>}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
