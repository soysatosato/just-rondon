"use client";

import Link from "next/link";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import TitleLogo from "@/components/home/TitleLogo";
import HeroSearch from "@/components/home/HeroSearch";

export default function HeroContent() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
    >
      <h1 className="text-center text-3xl md:text-4xl font-extrabold tracking-tight select-none">
        <TitleLogo />
      </h1>
      <h1 className="mt-6 text-center text-2xl md:text-3xl font-bold tracking-tight drop-shadow-sm text-foreground">
        ロンドン観光・旅行・現地ガイド
      </h1>
      <h1 className="mt-3 mb-8 text-center text-base md:text-lg tracking-tight drop-shadow-sm text-muted-foreground">
        観光スポット・美術館・ミュージカル情報
      </h1>

      <HeroSearch />

      <div className="mt-5 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Button asChild size="lg" className="rounded-full px-8">
          <Link href="/sightseeing">ロンドン観光ガイドを見る</Link>
        </Button>
        <Button
          asChild
          size="lg"
          variant="outline"
          className="rounded-full px-8 bg-background/80 backdrop-blur"
        >
          <Link href="/jobs">働く人のためのガイド</Link>
        </Button>
      </div>
    </motion.div>
  );
}
