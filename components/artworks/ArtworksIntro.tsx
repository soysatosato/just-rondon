"use client";
import { motion } from "framer-motion";

export default function ArtworksIntro({ museumName }: { museumName: string }) {
  const sentences = [
    `${museumName}では、時間を忘れるほど没入できるコレクションが揃っています。`,
    "ここでは、絶対に見逃せない主要作品の解説を掲載しており、各作品ページではさらに詳しい背景や見どころを紹介しています。",
    "気になる展示作品を選んで、自分だけのアート旅を始めましょう。",
    `${museumName}で、想像力と情熱を解き放つ冒険だ!`,
  ];
  return (
    <section className="mb-12 text-left md:text-center">
      <h1 className="text-xl lg:text-4xl font-extrabold mb-4">
        {museumName} の有名作品・主要作品のガイド・徹底解説
      </h1>
      <div className="text-xs md:text-base text-muted-foreground md:leading-relaxed max-w-4xl mx-auto flex flex-col gap-2">
        {sentences.map((text, i) => (
          <motion.p
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.3, duration: 0.6 }}
          >
            {text}
          </motion.p>
        ))}
      </div>
    </section>
  );
}
