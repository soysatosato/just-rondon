"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const PropertyMap = dynamic(() => import("./PropertyMap"), {
  ssr: false,
  loading: () => <Skeleton className="h-[calc(50vh+1.5rem)] w-full" />,
});

/**
 * 詳細ページの地図。画面に近づいてから Leaflet(gzip で約54KB)と地図の画像を読む。
 *
 * 以前はサーバーコンポーネントのページから next/dynamic で読んでいたため、
 * 地図の JS がページの最初の読み込みに入り、ページの下のほうにあって
 * 画面に出ていなくても、開いた瞬間に地図の画像まで取りに行っていた。
 * 検索から来る読者の大半は詳細ページにスマホで着地する。
 */
export default function LazyPropertyMap({ lat, lng }: { lat: number; lng: number }) {
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
      // 指で速くスクロールしても、着く前に読み終わるように少し手前から。
      { rootMargin: "400px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref}>
      {near ? (
        <PropertyMap lat={lat} lng={lng} />
      ) : (
        <Skeleton className="h-[calc(50vh+1.5rem)] w-full" />
      )}
    </div>
  );
}
