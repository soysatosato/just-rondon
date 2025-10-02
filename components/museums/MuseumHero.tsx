"use client";

import ImageContainer from "@/components/museums/ImageContainer";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { OpeningHoursTable } from "@/components/museums/OpeningHoursTable";
import { MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Link from "next/link";

export default function MuseumHero({ museum }: { museum: any }) {
  const today = new Date();
  const dayOfWeek = today.toLocaleDateString("en-US", { weekday: "long" });
  const hours = (museum.openingHours as any[]) || [];
  const todayHours = hours.find((h) => h.dayOfWeek === dayOfWeek);

  return (
    <section className="relative h-[300px] md:h-[500px] mt-2">
      <ImageContainer image={museum.image} name={museum.name} />

      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-black/30 text-gray-50 p-8 rounded-lg shadow-xl w-[80%] h-[80%] flex flex-col justify-center items-center text-center">
          <motion.div
            className="text-gray-100 p-6 md:p-12 w-full text-center space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex flex-col items-center text-center">
              <span className="text-gray-300 font-sans uppercase tracking-wider text-[clamp(0.75rem,2vw,1rem)]">
                {museum.engName}
              </span>
              <h1 className="text-xl sm:text-2xl md:text-5xl font-bold font-serif text-gray-100 mt-2">
                {museum.name}
              </h1>
            </div>

            <div className="text-sm md:text-base flex flex-col items-center gap-1">
              <p className="flex items-center gap-2 whitespace-nowrap">
                <Clock size={16} />
                Open today:&nbsp;
                <strong>
                  {todayHours?.openTime && todayHours?.closeTime
                    ? `${todayHours.openTime}–${todayHours.closeTime}`
                    : "Closed"}
                </strong>
              </p>
              <p className="flex items-center gap-2 whitespace-nowrap overflow-hidden text-ellipsis max-w-[90vw]">
                <MapPin size={16} />
                {museum.address}
              </p>
            </div>

            {/* CTAリンク */}
            <div className="flex flex-nowrap gap-4 justify-center mt-4">
              <Button asChild variant="secondary" size="sm">
                <Link
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    museum.engName + " " + museum.address + " London"
                  )}`}
                  target="_blank"
                >
                  地図で見る
                </Link>
              </Button>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="sm">
                    Opening Hours
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="bg-background/80 backdrop-blur-sm border border-border p-1">
                  <OpeningHoursTable openingHours={museum.openingHours} />
                </PopoverContent>
              </Popover>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
