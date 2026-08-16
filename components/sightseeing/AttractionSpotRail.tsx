import Link from "next/link";
import Image from "next/image";

/**
 * 関連スポットの横並びカード。
 *
 * 「近くで一緒に回れる」と「同じカテゴリー」で同じ見た目のグリッドを
 * 2回書いていたので、1つにまとめた。違うのは見出しと、カード下に出す
 * 補助テキスト(近隣枠だけ距離と所要時間を出す)だけ。
 */
export type RailSpot = {
  slug: string;
  name: string;
  image: string;
  distanceKm?: number;
  durationText?: string | null;
};

export default function AttractionSpotRail({
  heading,
  description,
  spots,
}: {
  heading: string;
  description?: string;
  spots: RailSpot[];
}) {
  if (spots.length === 0) return null;

  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold tracking-tight md:text-2xl">
          {heading}
        </h2>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {spots.map((spot) => (
          <Link
            key={spot.slug}
            href={`/sightseeing/${spot.slug}`}
            className="group block"
          >
            <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-border">
              <Image
                src={spot.image}
                alt={`${spot.name}｜ロンドン観光スポット`}
                fill
                sizes="(max-width: 768px) 45vw, 240px"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
            </div>
            <p className="mt-2 text-sm font-medium leading-snug group-hover:underline">
              {spot.name}
            </p>
            {spot.distanceKm !== undefined && (
              <p className="text-xs text-muted-foreground">
                約{spot.distanceKm.toFixed(1)}km
                {spot.durationText ? `・所要 ${spot.durationText}` : ""}
              </p>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}
