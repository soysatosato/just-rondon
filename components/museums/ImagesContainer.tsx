"use client";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

type props = {
  images: string[];
  name: string;
};
export default function ImagesContainer({ images, name }: props) {
  return (
    <Swiper
      spaceBetween={10}
      slidesPerView={1}
      navigation
      pagination={{ clickable: true }}
      loop={true}
      style={{ width: "100%", height: "400px" }}
    >
      {images.map((src, index) => (
        <SwiperSlide
          key={index}
          style={{ position: "relative", height: "100%" }}
        >
          <Image
            src={src}
            alt={`${name} - ${index + 1}`}
            fill
            sizes="100vw"
            className="object-cover rounded"
            priority={index === 0}
          />
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
