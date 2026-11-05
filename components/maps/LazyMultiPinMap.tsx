"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import type { MapPin } from "./MultiPinMap";

export type { MapPin };

const MultiPinMap = dynamic(() => import("./MultiPinMap"), {
  ssr: false,
  loading: () => <Skeleton className="h-[42vh] min-h-[260px] w-full rounded-xl" />,
});

/**
 * 画面に近づいてから Leaflet と地図の画像を読む(LazyPropertyMap と同じ考え方)。
 * 地図はページの中ほどにあり、着地した直後には要らない。
 */
export default function LazyMultiPinMap(props: {
  pins: MapPin[];
  color?: string;
  heightClass?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!("IntersectionObserver" in window)) {
      setNear(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setNear(true);
          observer.disconnect();
        }
      },
      { rootMargin: "400px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  if (props.pins.length === 0) return null;

  return (
    <div ref={ref}>
      {near ? (
        <MultiPinMap {...props} />
      ) : (
        <Skeleton className={`${props.heightClass ?? "h-[42vh] min-h-[260px]"} w-full rounded-xl`} />
      )}
    </div>
  );
}
