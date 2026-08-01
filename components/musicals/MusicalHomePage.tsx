"use client";
import { useMemo, useState } from "react";
import type { Musical } from "@prisma/client";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FaMapMarkerAlt } from "react-icons/fa";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { FaGlobe } from "react-icons/fa";
import { motion } from "framer-motion";

type SortOption = "recommend" | "name";

export default function MusicalHomePage({ musicals }: { musicals: Musical[] }) {
  const [search, setSearch] = useState("");
  const [mustSeeOnly, setMustSeeOnly] = useState(false);
  // 現状は全31作品が isOnShow: true のため、このチェックボックスは今のところ
  // 見た目上の絞り込み効果を持たない。上映終了作品が出た際に機能する。
  const [onShowOnly, setOnShowOnly] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("recommend");

  const filteredMusicals = useMemo(() => {
    const query = search.trim().toLowerCase();

    const filtered = musicals.filter((musical) => {
      if (mustSeeOnly && !musical.mustSee) return false;
      if (onShowOnly && !musical.isOnShow) return false;
      if (!query) return true;

      const haystack = [
        musical.name,
        musical.engName,
        musical.summary,
        ...musical.highlights,
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    });

    const sorted = [...filtered];
    if (sortBy === "name") {
      sorted.sort((a, b) => a.name.localeCompare(b.name, "ja"));
    } else {
      sorted.sort((a, b) => b.recommendLevel - a.recommendLevel);
    }

    return sorted;
  }, [musicals, search, mustSeeOnly, onShowOnly, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-3 space-y-8 bg-background text-foreground">
      <section className="relative  py-24 px-6">
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

      {/* チケットの買い方・マナーガイドへの導線 */}
      <section className="max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link href="/musicals/west-end-tickets" className="block">
          <Card className="h-full shadow-sm transition hover:border-primary">
            <CardContent className="p-5">
              <span className="block text-base font-semibold">
                チケットの買い方・お得な料金ガイド
              </span>
              <span className="mt-1 block text-sm text-muted-foreground">
                公式サイトの使い分けやTKTS半額ブースなど、節約術をまとめました。
              </span>
            </CardContent>
          </Card>
        </Link>
        <Link href="/musicals/west-end-etiquette" className="block">
          <Card className="h-full shadow-sm transition hover:border-primary">
            <CardContent className="p-5">
              <span className="block text-base font-semibold">
                劇場の楽しみ方・マナーガイド
              </span>
              <span className="mt-1 block text-sm text-muted-foreground">
                服装や開演時間、アクセス、当日のマナーを解説します。
              </span>
            </CardContent>
          </Card>
        </Link>
      </section>

      {/* 絞り込み・検索バー */}
      <section className="max-w-4xl mx-auto flex flex-col md:flex-row md:items-center gap-4">
        <Input
          placeholder="作品名・キーワードで検索"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <div className="flex items-center space-x-2">
          <Checkbox
            id="mustSeeOnly"
            checked={mustSeeOnly}
            onCheckedChange={(v) => setMustSeeOnly(Boolean(v))}
          />
          <Label htmlFor="mustSeeOnly">Must See のみ</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="onShowOnly"
            checked={onShowOnly}
            onCheckedChange={(v) => setOnShowOnly(Boolean(v))}
          />
          <Label htmlFor="onShowOnly">上映中のみ</Label>
        </div>
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
          <SelectTrigger className="w-full md:w-40">
            <SelectValue placeholder="並び替え" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recommend">おすすめ順</SelectItem>
            <SelectItem value="name">名前順</SelectItem>
          </SelectContent>
        </Select>
      </section>
      <p className="max-w-4xl mx-auto text-sm text-muted-foreground">
        {musicals.length}件中 {filteredMusicals.length}件を表示
      </p>

      {filteredMusicals.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">
          該当するミュージカルはありません。検索条件を変更してお試しください。
        </p>
      ) : (
        /* タブ + リスト / カード表示 */
        <Tabs defaultValue="grid" className="space-y-4">
          <TabsList className="justify-center">
            <TabsTrigger value="list">リスト表示</TabsTrigger>
            <TabsTrigger value="grid">カード表示</TabsTrigger>
          </TabsList>

          <TabsContent value="list">
            <Accordion type="single" collapsible>
              {filteredMusicals.map((musical, idx) => (
                <AccordionItem key={musical.id} value={musical.name}>
                  <AccordionTrigger>{`${idx + 1}. ${musical.name}`}</AccordionTrigger>
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
              {filteredMusicals.map((musical, idx) => (
                <Card
                  key={musical.id}
                  className="max-w-sm w-full shadow-lg hover:shadow-2xl transition-shadow duration-300 border border-border bg-card text-card-foreground"
                >
                  <div className="flex justify-between items-center px-4 pt-4">
                    <div className="text-lg font-bold text-foreground">
                      {idx + 1}. {musical.name}
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
                    <Button asChild className="bg-primary text-primary-foreground">
                      <Link href={`/musicals/${musical.slug}`}>詳細を見る</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
