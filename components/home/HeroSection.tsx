"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Link from "next/link";
import "swiper/css";

function HeroSection() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="text-center space-y-6 relative"
    >
      <div className="relative w-full h-[450px] rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-r from-gray-400 via-gray-500 to-gray-600 flex flex-col justify-center items-center text-white p-6">
        {/* <div className="absolute inset-0 bg-black/50 flex flex-col justify-center items-center text-white p-6"> */}
        <h1 className="text-3xl md:text-4xl font-extrabold mb-4 tracking-tight drop-shadow-md">
          ロンドンの美術館の楽しみ方
        </h1>

        <p className="text-lg max-w-2xl drop-shadow-sm">
          無料で芸術と歴史に触れる、豊かな時間を体験しよう
        </p>
        <Link href="/museums/best-25-museums">
          <Button
            className="mt-6 px-6 py-3 text-base rounded-full shadow-md"
            variant="secondary"
          >
            おすすめの美術館を見る
          </Button>
        </Link>
        {/* </div> */}
      </div>
    </motion.section>
  );
}

export { HeroSection };
