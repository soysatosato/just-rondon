"use client";
import { useMemo, useState } from "react";
import type { BrowseMusical } from "./browse-types";
import MusicalFinder from "./MusicalFinder";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  MapPin,
  Search,
  Sparkles,
  Star,
  Ticket,
  BookOpen,
  ArrowRight,
  Theater,
} from "lucide-react";
import { motion } from "framer-motion";
import RecommendStars from "@/components/musicals/shared/RecommendStars";
import ViewRanking, { type RankedItem } from "@/components/rankings/ViewRanking";

type SortOption = "recommend" | "name";
type ViewMode = "grid" | "list";

function MusicalPosterCard({ musical }: { musical: BrowseMusical }) {
  return (
    <Link
      href={`/musicals/${musical.slug}`}
      className="group block h-full overflow-hidden rounded-2xl border border-border bg-card shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden">
        <Image
          src={musical.image}
          alt={musical.name}
          fill
          sizes="(min-width: 1024px) 360px, (min-width: 640px) 33vw, 50vw"
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

        <div className="absolute left-2 top-2 right-2 flex items-start justify-between gap-1">
          {musical.mustSee ? (
            <Badge className="bg-rose-600 text-white border-transparent shadow">
              Must See
            </Badge>
          ) : (
            <span />
          )}
          <span className="rounded-full bg-black/50 backdrop-blur-sm px-2 py-1">
            <RecommendStars level={musical.recommendLevel} />
          </span>
        </div>

        <div className="absolute inset-x-0 bottom-0 p-4 text-white">
          <h3 className="text-lg font-bold leading-snug drop-shadow">
            {musical.name}
          </h3>
          <p className="text-xs text-white/80 mt-0.5">{musical.engName}</p>
          <p className="mt-2 line-clamp-2 text-xs text-white/85 leading-relaxed">
            {musical.summary}
          </p>
          <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-white/95 group-hover:gap-2 transition-all">
            詳細を見る <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function MusicalHomePage({
  musicals,
  ranking,
}: {
  musicals: BrowseMusical[];
  /**
   * よく見られている作品。集計はサーバー(fetchMusicalRankings)で済ませ、
   * ここには並べるぶんだけを渡す。週間が薄いうちは weekly が空で来る。
   */
  ranking: { weekly: RankedItem[]; allTime: RankedItem[] };
}) {
  const [search, setSearch] = useState("");
  const [mustSeeOnly, setMustSeeOnly] = useState(false);
  // 現状は全31作品が isOnShow: true のため、このトグルは今のところ
  // 見た目上の絞り込み効果を持たない。上映終了作品が出た際に機能する。
  const [onShowOnly, setOnShowOnly] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("recommend");
  const [view, setView] = useState<ViewMode>("grid");

  const spotlightMusicals = useMemo(
    () => musicals.filter((m) => m.mustSee).slice(0, 8),
    [musicals],
  );
  const heroImages = useMemo(() => musicals.slice(0, 4), [musicals]);

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

  const isFiltering = search.trim() !== "" || mustSeeOnly || onShowOnly;

  return (
    <div className="bg-background text-foreground pb-16">
      {/* ===== ヒーロー ===== */}
      <section className="relative isolate flex min-h-[480px] items-center overflow-hidden pb-24 pt-20 sm:min-h-[560px] sm:pb-28">
        <div className="absolute inset-0 grid grid-cols-2 sm:grid-cols-4">
          {heroImages.map((m, i) => (
            <div key={m.id} className="relative h-full w-full">
              <Image
                src={m.image}
                alt=""
                fill
                priority={i === 0}
                sizes="(min-width: 640px) 25vw, 50vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-background via-black/70 to-black/60" />

        <div className="relative z-10 mx-auto max-w-3xl px-6 text-center text-white">
          <motion.span
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide text-white/90 backdrop-blur-sm ring-1 ring-white/20"
          >
            <Sparkles className="h-3.5 w-3.5" />
            {musicals.length}作品を掲載中
          </motion.span>

          <motion.h1
            className="mt-5 text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl md:text-6xl"
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, type: "spring", stiffness: 120 }}
          >
            ロンドンといえば、
            <br />
            ミュージカル。
          </motion.h1>

          <motion.p
            className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-white/85 sm:text-base"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            英語で上演される舞台も、あらすじや歌詞を事前に押さえておけば理解が深まります。
            見どころ・チケットの買い方・劇場マナーまで、観劇前に知っておきたい情報をまとめました。
          </motion.p>
        </div>
      </section>

      {/* ===== フローティング検索バー(ヒーローに重ねる) ===== */}
      <div className="relative z-20 mx-auto -mt-14 max-w-4xl px-4 sm:-mt-16">
        <Card className="rounded-2xl border-border/60 shadow-xl">
          <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:gap-4 sm:p-5">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="作品名・キーワードで検索（例: 家族向け、ディズニー）"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setMustSeeOnly((v) => !v)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                  mustSeeOnly
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-transparent text-muted-foreground hover:bg-muted",
                )}
              >
                Must See
              </button>
              <button
                type="button"
                onClick={() => setOnShowOnly((v) => !v)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                  onShowOnly
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-transparent text-muted-foreground hover:bg-muted",
                )}
              >
                上映中のみ
              </button>
              <Select
                value={sortBy}
                onValueChange={(v) => setSortBy(v as SortOption)}
              >
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="並び替え" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recommend">おすすめ順</SelectItem>
                  <SelectItem value="name">名前順</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mx-auto mt-12 max-w-7xl space-y-16 px-4">
        {/* ===== ガイドへの導線 ===== */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Link
            href="/musicals/west-end-tickets"
            className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:border-primary hover:shadow-md"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Ticket className="h-6 w-6" />
            </span>
            <span className="min-w-0">
              <span className="block text-base font-semibold">
                チケットの買い方・お得な料金ガイド
              </span>
              <span className="mt-0.5 block text-sm text-muted-foreground">
                公式サイトの使い分けやTKTS半額ブースなど、節約術をまとめました。
              </span>
            </span>
            <ArrowRight className="ml-auto h-4 w-4 shrink-0 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" />
          </Link>
          <Link
            href="/musicals/west-end-etiquette"
            className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:border-primary hover:shadow-md"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Theater className="h-6 w-6" />
            </span>
            <span className="min-w-0">
              <span className="block text-base font-semibold">
                劇場の楽しみ方・マナーガイド
              </span>
              <span className="mt-0.5 block text-sm text-muted-foreground">
                服装や開演時間、アクセス、当日のマナーを解説します。
              </span>
            </span>
            <ArrowRight className="ml-auto h-4 w-4 shrink-0 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" />
          </Link>
          <Link
            href="/musicals/theatres"
            className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:border-primary hover:shadow-md"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <MapPin className="h-6 w-6" />
            </span>
            <span className="min-w-0">
              <span className="block text-base font-semibold">
                劇場ガイド
              </span>
              <span className="mt-0.5 block text-sm text-muted-foreground">
                最寄り駅、座席の選び方、いま上演中の作品を劇場ごとに。
              </span>
            </span>
            <ArrowRight className="ml-auto h-4 w-4 shrink-0 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" />
          </Link>
        </section>

        {/*
          ===== 条件から探す =====
          作品名を知らない読者はキーワード検索を使えない。
          「英語が不安」「子連れ」「時間がない」の3軸で絞り込ませる。
        */}
        <MusicalFinder musicals={musicals} />

        {/*
          ===== よく見られている作品 =====
          下の Must See もおすすめ順の一覧も編集側の並びで、作品を
          入れ替えない限り顔ぶれが動かない。読者側の軸をここに挟んで、
          週ごとに変わる面を作る。絞り込み中は他の棚と同じく隠す。
        */}
        {!isFiltering && (
          <section>
            <ViewRanking
              title="よく見られている作品"
              description="実際に読まれているページの順位です。今週と、これまでの累計。おすすめ順や必見とは別の並びになります。"
              weekly={ranking.weekly}
              allTime={ranking.allTime}
              weeklyLabel="Weekly ・ 今週よく見られている"
              accentClassName="bg-primary"
            />
          </section>
        )}

        {/* ===== Must See スポットライト ===== */}
        {spotlightMusicals.length > 0 && !isFiltering && (
          <section>
            <div className="mb-5 flex items-end justify-between">
              <div>
                <h2 className="flex items-center gap-2 text-xl font-bold sm:text-2xl">
                  <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                  必見・Must See ミュージカル
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  初めてのロンドン観劇なら、まずこの中から選べば間違いありません。
                </p>
              </div>
            </div>
            <Carousel opts={{ align: "start" }} className="w-full">
              <CarouselContent className="-ml-4">
                {spotlightMusicals.map((musical) => (
                  <CarouselItem
                    key={musical.id}
                    className="basis-[62%] pl-4 sm:basis-[42%] lg:basis-[27%]"
                  >
                    <MusicalPosterCard musical={musical} />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="hidden sm:flex" />
              <CarouselNext className="hidden sm:flex" />
            </Carousel>
          </section>
        )}

        {/* ===== 全作品一覧 ===== */}
        <section>
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-xl font-bold sm:text-2xl">
                <BookOpen className="h-5 w-5 text-primary" />
                全ミュージカル一覧
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {musicals.length}件中 {filteredMusicals.length}件を表示
              </p>
            </div>

            <Tabs value={view} onValueChange={(v) => setView(v as ViewMode)}>
              <TabsList>
                <TabsTrigger value="grid">カード表示</TabsTrigger>
                <TabsTrigger value="list">リスト表示</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {filteredMusicals.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16 text-center">
              <Search className="h-8 w-8 text-muted-foreground" />
              <p className="mt-3 text-muted-foreground">
                該当するミュージカルはありません。検索条件を変更してお試しください。
              </p>
            </div>
          ) : view === "grid" ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
              {filteredMusicals.map((musical) => (
                <MusicalPosterCard key={musical.id} musical={musical} />
              ))}
            </div>
          ) : (
            <Accordion type="single" collapsible className="rounded-2xl border border-border">
              {filteredMusicals.map((musical, idx) => (
                <AccordionItem key={musical.id} value={musical.name}>
                  <AccordionTrigger className="px-4 hover:no-underline">
                    <div className="flex min-w-0 flex-1 items-center gap-3 text-left">
                      <div className="relative h-12 w-9 shrink-0 overflow-hidden rounded-md">
                        <Image
                          src={musical.image}
                          alt={musical.name}
                          fill
                          sizes="36px"
                          className="object-cover"
                        />
                      </div>
                      <span className="min-w-0 flex-1 truncate font-semibold">
                        {idx + 1}. {musical.name}
                      </span>
                      {musical.mustSee && (
                        <Badge className="shrink-0 bg-rose-600 text-white border-transparent">
                          Must See
                        </Badge>
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4">
                    <div className="flex items-start gap-2 text-sm text-muted-foreground">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>{musical.address}</span>
                    </div>
                    <p className="mt-2 whitespace-pre-line text-sm">
                      {musical.summary}
                    </p>

                    <Link
                      href={`/musicals/${musical.slug}`}
                      className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
                    >
                      詳細を見る <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </section>
      </div>
    </div>
  );
}
