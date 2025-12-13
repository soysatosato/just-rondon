"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function CardCarousel({ children }: { children: React.ReactNode }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: "start" });

  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const [current, setCurrent] = useState(1);
  const [total, setTotal] = useState(1);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;

    setCanPrev(emblaApi.canScrollPrev());
    setCanNext(emblaApi.canScrollNext());
    setCurrent(emblaApi.selectedScrollSnap() + 1);
    setTotal(emblaApi.scrollSnapList().length);
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  return (
    <div className="space-y-3">
      {/* Carousel */}
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex gap-4">{children}</div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
        {/* ページ表示 */}
        <span>
          {current} / {total}
        </span>

        {/* ナビゲーション */}
        <div className="flex gap-2">
          <button
            onClick={() => emblaApi?.scrollPrev()}
            disabled={!canPrev}
            className="flex items-center gap-1 rounded border px-2 py-1 disabled:opacity-30"
          >
            <ChevronLeft size={14} />
            前へ
          </button>

          <button
            onClick={() => emblaApi?.scrollNext()}
            disabled={!canNext}
            className="flex items-center gap-1 rounded border px-2 py-1 disabled:opacity-30"
          >
            次へ
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
