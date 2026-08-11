"use client";

import dynamic from "next/dynamic";

import { Skeleton } from "@/components/ui/skeleton";
import type { MappableArtwork } from "@/components/museums/BanksyMapComponent";

/**
 * Leaflet は window に触るので ssr:false が要る。ただし ssr:false は
 * サーバーコンポーネントからは指定できないため、本文をサーバー描画したまま
 * 地図だけをクライアントに逃がすための境界としてこの薄い層を挟んでいる。
 */
const BanksyMapComponent = dynamic(
  () => import("@/components/museums/BanksyMapComponent"),
  {
    ssr: false,
    loading: () => <Skeleton className="h-full w-full" />,
  },
);

export default function BanksyMap({
  artworks,
}: {
  artworks: MappableArtwork[];
}) {
  return <BanksyMapComponent artworks={artworks} />;
}
