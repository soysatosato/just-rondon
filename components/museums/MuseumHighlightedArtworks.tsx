"use client";

import { motion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { Button } from "../ui/button";

export default function HighlightedArtworks({
  artworks = [],
  slug,
}: {
  artworks?: any[];
  slug: string;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="py-16 text-gray-900"
    >
      <div className="flex justify-center mb-4">
        {artworks.length > 0 ? (
          <Link
            href={`/museums/${slug}/artworks`}
            className="group inline-block text-center"
          >
            <h2
              className="text-3xl md:text-5xl font-extrabold mb-4 tracking-wide
                 transition-transform duration-300 group-hover:scale-105
                 text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400"
            >
              見どころ作品
            </h2>
            <span
              className="block h-1 w-24 mx-auto mt-2
                     bg-blue-600 dark:bg-blue-400
                     opacity-0 transition-all duration-300 group-hover:opacity-100"
            ></span>
          </Link>
        ) : (
          <h2
            className="text-3xl md:text-5xl font-extrabold mb-4 tracking-wide
                 text-gray-900 dark:text-gray-100"
          >
            見どころ作品
          </h2>
        )}
      </div>
      <Swiper
        slidesPerView={1.1}
        spaceBetween={28}
        breakpoints={{
          768: { slidesPerView: 2.3 },
          1024: { slidesPerView: 3.2 },
        }}
        autoplay={{ delay: 6000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        modules={[Autoplay, Pagination]}
        className="max-w-[1200px] mx-auto px-6"
      >
        {artworks.map((artwork) => {
          const shortDescription = artwork.description
            ? artwork.description.length > 50
              ? artwork.description.slice(0, 50) + "..."
              : artwork.description
            : "説明文がありません。";
          console.log(artwork);

          return (
            <SwiperSlide key={artwork.name}>
              <motion.div
                whileHover={{ scale: 1.05, rotateX: 8, rotateY: -8 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="bg-white rounded-3xl shadow-lg border border-gray-300 p-5 flex flex-col h-full cursor-pointer select-none"
              >
                <Link href={`/museums/${slug}/artworks/${artwork.id}`}>
                  <div className="relative w-full h-72 rounded-2xl overflow-hidden shadow-md">
                    <div className="relative w-full h-72 rounded-2xl overflow-hidden shadow-md pointer-events-none">
                      <Image
                        src={artwork.image}
                        alt={artwork.title}
                        fill
                        className="object-cover w-full h-full transition-transform duration-500 ease-in-out hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-4 py-3 rounded-b-2xl">
                        <h3 className="text-lg md:text-xl font-semibold tracking-wide text-white">
                          {artwork.title}
                        </h3>
                        <p className="text-xs md:text-sm text-gray-300">
                          {artwork.artist} — {artwork.year}
                        </p>
                      </div>
                    </div>
                  </div>
                  <p className="mt-4 text-sm md:text-base text-gray-700 flex-grow line-clamp-3">
                    {shortDescription}
                  </p>
                </Link>
              </motion.div>
            </SwiperSlide>
          );
        })}
      </Swiper>

      {artworks.length > 0 && (
        <div className="flex justify-center mt-8">
          <Link href={`/museums/${slug}/artworks`}>
            <Button size="lg" variant="default">
              主要作品一覧へ
            </Button>
          </Link>
        </div>
      )}
      {artworks.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          whileHover={{ scale: 1.05, y: -5 }}
          className="max-w-4xl mx-auto mt-2"
        >
          <Card className="rounded-3xl shadow-2xl p-12 bg-gradient-to-r from-purple-700 via-pink-600 to-red-500 text-white">
            <CardHeader className="text-center">
              <CardTitle className="text-5xl md:text-6xl font-bold tracking-tight font-sans">
                Upcoming
              </CardTitle>
            </CardHeader>

            <CardContent className="text-center mt-6 text-lg md:text-xl font-sans">
              ここに表示されるコンテンツはまだ準備中です。
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.section>
  );
}
