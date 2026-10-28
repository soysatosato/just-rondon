import Link from "next/link";

import { fetchAttractionsBySlugs } from "@/utils/actions/attractions";
import { responsiveImage } from "@/lib/wikimedia-image";
import { attractionPagePath } from "@/lib/museum-attraction-pairs";

/**
 * ガイド記事の末尾に出す「この記事で紹介したスポット」。
 *
 * モデルコース記事は本文でスポット名を挙げるだけで、各スポットの
 * 詳細ページへ渡す導線を持っていなかった。記事を読み終えた人が
 * 次に知りたいのは個々のスポットの料金と所要時間なので、そこへ繋ぐ。
 */
export default async function GuideAttractionCards({
  slugs,
  heading = "この記事で紹介したスポット",
}: {
  slugs: string[];
  heading?: string;
}) {
  const attractions = await fetchAttractionsBySlugs(slugs);
  if (attractions.length === 0) return null;

  return (
    <section className="mt-12">
      <h2 className="text-lg font-semibold">{heading}</h2>
      <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
        料金・所要時間・行き方は、それぞれの詳細ページにまとめています。
      </p>

      <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
        {attractions.map((spot) => (
          <Link
            key={spot.slug}
            href={attractionPagePath(spot.slug)}
            className="group block"
          >
            <div className="overflow-hidden rounded-lg shadow transition hover:shadow-md">
              <img
                {...responsiveImage(spot.image, "(min-width: 768px) 200px, 50vw")}
                alt={`${spot.name}｜ロンドン観光スポット`}
                className="h-32 w-full object-cover transition-transform group-hover:scale-105"
                loading="lazy"
                decoding="async"
                fetchPriority="low"
              />
            </div>
            <p className="mt-2 text-sm font-medium group-hover:underline">
              {spot.name}
            </p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {[
                spot.isFree ? "入場無料" : spot.priceAdult,
                spot.durationText ? `所要 ${spot.durationText}` : null,
              ]
                .filter(Boolean)
                .join("・")}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
