import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Map as MapIcon, ShoppingBasket } from "lucide-react";
import { isResizableImage } from "@/lib/wikimedia-image";
import { attractionPagePath } from "@/lib/museum-attraction-pairs";
import {
  areaGuidePath,
  getAreaMeta,
} from "@/components/sightseeing/areas/areas";
import { categoryLabel } from "@/components/sightseeing/categories";

/**
 * 「周辺で一緒に回れるスポット」と、その先の回遊。
 *
 * 1. 近くのスポット(直線2.5km以内。カテゴリーを問わない)。距離を出す。
 * 2. エリアの散歩ガイド(そのスポットが属する街区のもの)。
 * 3. 同じ区分のほかのスポット。以前は「同じカテゴリー」から日替わりで
 *    無作為に2件出していたが、読むたびに違うものが出るうえ、選ばれる理由が
 *    読者に説明できなかった。閲覧の多い順に固定で並べる。
 */

export type NearbySpot = {
  slug: string;
  name: string;
  image: string;
  distanceKm: number;
  durationText: string | null;
};

export type RelatedSpot = { slug: string; name: string };

/** 直線距離の表記。1km 未満は 100m 単位、それ以上は 0.1km 単位。 */
function formatDistance(km: number): string {
  if (km < 1) return `約${Math.max(100, Math.round(km * 10) * 100)}m`;
  return `約${km.toFixed(1)}km`;
}

export default function SpotNearby({
  id,
  name,
  nearby,
  area,
  isMarket,
  category,
  related,
}: {
  id: string;
  name: string;
  nearby: NearbySpot[];
  area: string | null;
  isMarket: boolean;
  category: string;
  related: RelatedSpot[];
}) {
  const areaMeta = area ? getAreaMeta(area) : null;
  if (nearby.length === 0 && !areaMeta && related.length === 0) return null;

  return (
    <section id={id} className="scroll-mt-24 space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold tracking-tight md:text-2xl">
          {name}の周辺で一緒に回れるスポット
        </h2>
        {nearby.length > 0 && (
          <p className="text-sm text-muted-foreground">
            歩いて回れる範囲のスポットです。距離は直線で測った目安で、
            実際に歩く道のりはこれより長くなります。
          </p>
        )}
      </div>

      {nearby.length > 0 && (
        <ul className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {nearby.map((spot) => (
            <li key={spot.slug}>
              <Link href={attractionPagePath(spot.slug)} className="group block">
                <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-border">
                  <Image
                    src={spot.image}
                    unoptimized={!isResizableImage(spot.image)}
                    alt=""
                    fill
                    sizes="(max-width: 768px) 45vw, 240px"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <p className="mt-2 text-sm font-medium leading-snug group-hover:underline">
                  {spot.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDistance(spot.distanceKm)}
                  {spot.durationText ? `・所要 ${spot.durationText}` : ""}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {(areaMeta || isMarket) && (
        <div className="grid gap-3 sm:grid-cols-2">
          {areaMeta && (
            <Link
              href={areaGuidePath(areaMeta.slug)}
              className="group flex items-start gap-3 rounded-2xl border border-border p-4 transition hover:bg-muted"
            >
              <MapIcon className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700 dark:text-emerald-400" aria-hidden />
              <div className="min-w-0">
                <p className="text-sm font-semibold group-hover:underline">
                  {areaMeta.label}を歩く
                </p>
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                  このあたりを歩いて回る順路のガイド
                  {areaMeta.walkTime ? `(目安 ${areaMeta.walkTime})` : ""}
                </p>
              </div>
            </Link>
          )}
          {isMarket && (
            <Link
              href="/shopping/markets"
              className="group flex items-start gap-3 rounded-2xl border border-border p-4 transition hover:bg-muted"
            >
              <ShoppingBasket className="mt-0.5 h-5 w-5 shrink-0 text-amber-700 dark:text-amber-400" aria-hidden />
              <div className="min-w-0">
                <p className="text-sm font-semibold group-hover:underline">
                  マーケットの曜日表
                </p>
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                  ロンドンの主なマーケットが、何曜日に開いているかの一覧
                </p>
              </div>
            </Link>
          )}
        </div>
      )}

      {related.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-base font-semibold tracking-tight">
            ほかの{categoryLabel(category)}のスポット
          </h3>
          <ul className="flex flex-wrap gap-2">
            {related.map((spot) => (
              <li key={spot.slug}>
                <Link
                  href={attractionPagePath(spot.slug)}
                  className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-sm transition hover:bg-muted"
                >
                  {spot.name}
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
