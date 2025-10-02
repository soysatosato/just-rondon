"use client";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { FaMapMarkerAlt } from "react-icons/fa";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { FaGlobe } from "react-icons/fa";
import { motion } from "framer-motion";

export default function MusicalHomePage({
  musicals,
  currentPage,
  itemsPerPage,
}: {
  musicals: any[];
  currentPage: number;
  itemsPerPage: number;
}) {
  return (
    <div className="max-w-7xl mx-auto px-3 space-y-8 bg-gradient-to-b from-background via-secondary to-background text-foreground">
      <section className="relative bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white py-24 px-6">
        <div className="max-w-3xl mx-auto text-center relative z-10">
          {/* タイトル */}
          <motion.h1
            className="text-xl md:text-5xl font-bold mb-6"
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1, type: "spring", stiffness: 120 }}
          >
            ロンドンといえば
            <br />
            ミュージカル
          </motion.h1>

          {/* 説明文 */}
          <motion.p
            className="text-xs md:text-base leading-relaxed text-gray-200 text-left"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
          >
            ミュージカルの魅力を最大限に味わうには、事前に作品の内容を理解しておくことが大切です。
            英語で上演される舞台は、ストーリーや歌詞の細部まで把握するのが容易ではありません。
          </motion.p>
          <motion.p
            className="text-xs md:text-base leading-relaxed text-gray-200 text-left mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
          >
            あらすじや歌詞を押さえておくことで、演技や音楽の深みまで楽しめるでしょう。
            本ページでは、各作品の内容と歌詞についてまとめていますので、観劇前にぜひご一読ください。
          </motion.p>
        </div>
      </section>

      {/* タブ + リスト / カード表示 */}
      <Tabs defaultValue="grid" className="space-y-4">
        <TabsList className="justify-center">
          <TabsTrigger value="list">リスト表示</TabsTrigger>
          <TabsTrigger value="grid">カード表示</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <Accordion type="single" collapsible>
            {musicals.map((musical, idx) => (
              <AccordionItem key={idx} value={musical.name}>
                <AccordionTrigger>{`${
                  (currentPage - 1) * itemsPerPage + idx + 1
                }. ${musical.name}`}</AccordionTrigger>
                <AccordionContent>
                  <p className="whitespace-pre-line">{musical.summary}</p>

                  <Link
                    href={`/musicals/${musical.slug}`}
                    target="_blank"
                    className="text-blue-600 dark:text-blue-300 hover:underline mt-2 inline-block"
                  >
                    詳細を見る
                  </Link>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </TabsContent>

        <TabsContent value="grid">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
            {musicals.map((musical, idx) => (
              <Card
                key={idx}
                className="max-w-sm w-full shadow-lg hover:shadow-2xl transition-shadow duration-300 border border-border bg-card text-card-foreground"
              >
                <div className="flex justify-between items-center px-4 pt-4">
                  <div className="text-lg font-bold text-foreground">
                    {(currentPage - 1) * itemsPerPage + idx + 1}. {musical.name}
                  </div>
                </div>

                <div className="relative w-full h-64 mt-2">
                  <Image
                    src={musical.image}
                    alt={musical.name}
                    fill
                    className="object-cover"
                  />
                </div>

                <Separator />

                <CardContent className="space-y-2 mt-6">
                  <h2 className="text-xl font-bold text-foreground">
                    {musical.name}
                  </h2>
                  <p className="text-muted-foreground whitespace-pre-line">
                    {musical.summary}
                  </p>

                  <Separator />

                  <div className="text-muted-foreground text-sm mt-2">
                    <div className="flex items-center gap-1 mt-2">
                      <FaMapMarkerAlt className="text-accent-foreground" />
                      <span>{musical.address}</span>
                    </div>

                    {musical.website && (
                      <div className="flex items-center gap-1 mt-2">
                        <Link
                          href={musical.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-primary hover:underline text-sm"
                        >
                          <FaGlobe /> 公式サイト
                        </Link>
                      </div>
                    )}
                  </div>
                </CardContent>

                <CardFooter>
                  <Button
                    asChild
                    className="bg-primary text-primary-foreground"
                  >
                    <Link href={`/musicals/${musical.slug}`}>詳細を見る</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
