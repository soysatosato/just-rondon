"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type Artwork = {
  id: string;
  title: string;
  artist: string | null;
  year: string | null;
  description: string | null;
  image: string | null;
};

export default function HighlightedArtworks({
  artworks = [],
  slug,
}: {
  artworks?: Artwork[];
  slug: string;
}) {
  // 作品データが揃っているのは6館だけ。無い館では
  // 以前「Upcoming / 準備中」のプレースホルダーを出していたが、
  // 中身の無いセクションを見せる意味が無いので何も描画しない。
  // テキストの見どころは MuseumHighlightSpots が担当する。
  if (artworks.length === 0) return null;

  return (
    <section className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-6">
        <span className="inline-block rounded-full bg-violet-600 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white">
          Artworks
        </span>
        <h2 className="mt-3 text-2xl font-bold tracking-tight">見どころ作品</h2>
      </div>

      <Swiper
        slidesPerView={1.1}
        spaceBetween={20}
        breakpoints={{
          768: { slidesPerView: 2.2 },
          1024: { slidesPerView: 3 },
        }}
        pagination={{ clickable: true }}
        modules={[Pagination]}
        className="!pb-10"
      >
        {artworks.map((artwork) => (
          <SwiperSlide key={artwork.id} className="h-auto">
            <Link
              href={`/museums/${slug}/artworks/${artwork.id}`}
              className="group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card transition hover:shadow-lg"
            >
              <div className="relative h-56 w-full overflow-hidden bg-muted">
                {artwork.image && (
                  <img
                    src={artwork.image}
                    alt={artwork.title}
                    className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    loading="lazy"
                    decoding="async"
                  />
                )}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-4 py-3">
                  <h3 className="font-semibold leading-snug text-white">
                    {artwork.title}
                  </h3>
                  {(artwork.artist || artwork.year) && (
                    <p className="mt-0.5 text-xs text-white/75">
                      {[artwork.artist, artwork.year]
                        .filter(Boolean)
                        .join(" — ")}
                    </p>
                  )}
                </div>
              </div>
              {artwork.description && (
                <p className="line-clamp-3 p-4 text-sm leading-relaxed text-muted-foreground">
                  {artwork.description}
                </p>
              )}
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>

      <div className="flex justify-center">
        <Button asChild variant="outline">
          <Link href={`/museums/${slug}/artworks`}>主要作品の一覧を見る</Link>
        </Button>
      </div>
    </section>
  );
}
