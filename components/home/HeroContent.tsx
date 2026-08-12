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
      {/* サイトのワードマーク。見出しではなくブランド表示なので h1 にしない。 */}
      <div className="text-center text-3xl md:text-4xl font-extrabold tracking-tight select-none">
        <TitleLogo />
      </div>
      {/* ページ唯一の h1。トップの主題を表す語をここに集約する。 */}
      <h1 className="mt-6 text-center text-2xl md:text-3xl font-bold tracking-tight text-foreground">
        ロンドン観光・旅行・現地ガイド
      </h1>
      <p className="mt-3 mb-8 text-center text-base md:text-lg tracking-tight text-muted-foreground">
        観光スポット・美術館・ミュージカル情報
      </p>

      <HeroSearch />

      {/*
        このサイトは旅行者と在住者の両方を扱う。読者の関心はこの2つで大きく割れるので、
        最初にどちらかへ飛ばす。リンク先はトップページ内の大区分セクション。
      */}
      <div className="mt-5 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Button asChild size="lg" className="rounded-full px-8">
          <Link href="#sightseeing">旅行者向け</Link>
        </Button>
        <Button
          asChild
          size="lg"
          variant="outline"
          className="rounded-full px-8 bg-background"
        >
          <Link href="#resident">在住者向け</Link>
        </Button>
      </div>
    </motion.div>
  );
}
