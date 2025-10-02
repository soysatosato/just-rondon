"use client";

import { useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function MuseumCarousel({ museums }: { museums: any[] }) {
  const swiperRef = useRef<any>(null);

  return (
    <section className="relative">
      <div className="flex justify-center mb-4">
        <Link
          href={`/museums/best-10-museums`}
          className="group inline-block text-center"
        >
          <h2
            className="text-3xl md:text-4xl font-extrabold mb-4 tracking-wide
                   transition-transform duration-300 group-hover:scale-105 group-hover:text-blue-600"
          >
            おすすめの美術館
          </h2>
          <span className="block h-1 w-24 mx-auto mt-2 bg-blue-600 opacity-0 transition-all duration-300 group-hover:opacity-100"></span>
        </Link>
      </div>

      {/* 左右ボタン */}
      <div className="absolute top-1/2 -translate-y-1/2 left-2 z-10">
        <Button
          size="sm"
          onClick={() => swiperRef.current?.slidePrev()}
          className="bg-white/80 hover:bg-white"
        >
          ◀
        </Button>
      </div>
      <div className="absolute top-1/2 -translate-y-1/2 right-2 z-10">
        <Button
          size="sm"
          onClick={() => swiperRef.current?.slideNext()}
          className="bg-white/80 hover:bg-white"
        >
          ▶
        </Button>
      </div>

      <Swiper
        onSwiper={(swiper) => (swiperRef.current = swiper)}
        spaceBetween={24}
        slidesPerView={1.2}
        breakpoints={{
          640: { slidesPerView: 2.2 },
          1024: { slidesPerView: 3.5 },
        }}
      >
        {museums.map(({ name, image, tagline, slug }, i) => (
          <SwiperSlide key={i}>
            <Card className="rounded-lg overflow-hidden shadow-lg cursor-pointer hover:scale-105 transition-transform h-[330px] flex flex-col bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <Link href={`/museums/${slug}`} className="block">
                <CardContent className="p-0 flex flex-col h-full">
                  <div className="relative w-full h-48">
                    <Image
                      src={image}
                      alt={name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                      {name}
                    </CardTitle>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                      {tagline}
                    </p>
                  </div>
                </CardContent>
              </Link>
            </Card>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
