"use client";

import { motion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Ticket } from "lucide-react";

export default function MuseumExhibitions({
  exhibitions = [],
}: {
  exhibitions?: any[];
}) {
  const singleSlide = exhibitions.length === 1;

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="py-10"
    >
      <h2 className="text-3xl font-bold text-center mb-6">開催中の企画展</h2>

      {singleSlide ? (
        // スライドが1つだけならSwiperを使わず、普通のカード表示にする
        <div className="px-4">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 flex flex-col justify-between max-w-md mx-auto"
          >
            <div className="space-y-3">
              <h3 className="text-xl font-semibold text-gray-900">
                {exhibitions[0].name}
              </h3>
              <p className="text-gray-600 text-sm">
                {exhibitions[0].description}
              </p>

              <div className="text-sm text-gray-500 space-y-1 mt-2">
                <div className="flex items-center gap-2">
                  <CalendarDays size={16} />
                  <span>
                    {new Date(exhibitions[0].startDate).toLocaleDateString()} 〜{" "}
                    {new Date(exhibitions[0].endDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Ticket size={16} />
                  <span>{exhibitions[0].admission}ポンド</span>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <Badge className="text-xs">開催中</Badge>
            </div>
          </motion.div>
        </div>
      ) : (
        <Swiper
          slidesPerView={1.2}
          spaceBetween={20}
          breakpoints={{
            768: {
              slidesPerView: 2.1,
            },
            1024: {
              slidesPerView: 3,
            },
          }}
          autoplay={{
            delay: 5000,
          }}
          pagination={{
            clickable: true,
          }}
          modules={[Autoplay, Pagination]}
          className="px-4"
        >
          {exhibitions.map((exhibition) => (
            <SwiperSlide key={exhibition.id}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 h-full flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <h3 className="text-xl font-semibold">{exhibition.name}</h3>
                  <p className="text-gray-600 text-sm">
                    {exhibition.description}
                  </p>

                  <div className="text-sm text-gray-500 space-y-1 mt-2">
                    <div className="flex items-center gap-2">
                      <CalendarDays size={16} />
                      <span>
                        {new Date(exhibition.startDate).toLocaleDateString()} 〜{" "}
                        {new Date(exhibition.endDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Ticket size={16} />
                      <span>{exhibition.admission}ポンド</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <Badge className="text-xs">開催中</Badge>
                </div>
              </motion.div>
            </SwiperSlide>
          ))}
        </Swiper>
      )}
    </motion.section>
  );
}
