"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import Image from "next/image";
type Props = {
  sections: {
    id: string;
    title: string;
    items: {
      title: string;
      description: string;
      href: string;
    }[];
  }[];
};

export default function HomePageSection({ sections }: Props) {
  return (
    <>
      <section className="relative w-full h-[350px] flex justify-center items-center overflow-hidden">
        <div className="relative w-full max-w-[700px]  h-[350px] ">
          <img
            src="/just-rondon-bg.jpg"
            alt="London"
            className="absolute inset-0 w-full h-full rounded-xl object-cover"
            loading="lazy"
            decoding="async"
          />

          <div className="absolute inset-0 flex flex-col justify-center items-center px-4">
            <h1 className="text-center text-4xl md:text-5xl font-extrabold text-red-400 drop-shadow-lg animate-fadeIn">
              ロンド
              <motion.span
                className="inline-block"
                animate={{ rotate: [0, -10, 10, -10, 0] }} // 左右に揺れる
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  repeatType: "loop",
                }}
              >
                ん！
              </motion.span>
            </h1>
            <div className="mt-4 space-y-2 bg-black/40 p-4 rounded-lg">
              <p className="text-white text-sm md:text-base leading-snug">
                ここは〈ジャスト・ロンドン〉ロンドンの街とカルチャーに、ひとつだけ魔法の拍を加えた造語。
                美術館も、ミュージカルも、ブログも、ニュースも。
                日常の選択肢が少しだけ豊かになる瞬間を届けます。
              </p>
              <p className="text-white/90 text-sm md:text-base leading-snug">
                街角の発見や情報のひとつひとつが、あなたの毎日を少しだけ鮮やかに彩る。
                〈ジャスト・ロンドン〉は、そんな小さな体験と好奇心の合言葉です。
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* Sections */}
      {sections.map((section, sIdx) => (
        <section key={sIdx} className="py-24 bg-background text-foreground">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-3xl md:text-4xl font-semibold text-center mb-12">
              {section.title}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {section.items.map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.15 }}
                >
                  <Link href={item.href}>
                    <Card className="hover:scale-105 transition-transform shadow-md cursor-pointer bg-card text-card-foreground p-6 h-40 flex flex-col justify-center items-center text-center rounded-lg">
                      <CardContent className="p-0 flex flex-col justify-center items-center">
                        <CardTitle className="text-xl md:text-2xl">
                          {item.title}
                        </CardTitle>
                        <p className="text-sm md:text-base mt-2">
                          {item.description}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      ))}
    </>
  );
}
