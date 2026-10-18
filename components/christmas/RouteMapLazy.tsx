"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * 順路の地図はブラウザでだけ描く(Leaflet は window を読む)。
 * 読み込みまでは同じ高さの枠を置いて、ページが跳ねないようにする。
 */
const RouteMapLazy = dynamic(() => import("./RouteMap"), {
  ssr: false,
  loading: () => <Skeleton className="h-[320px] w-full" />,
});

export default RouteMapLazy;
