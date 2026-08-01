"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { MapPin, Ticket } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import RecommendStars from "@/components/musicals/shared/RecommendStars";

export default function MusicalHero({
  name,
  engName,
  tagline,
  image,
  slug,
  website,
  highlights,
  blurb,
  mustSee,
  recommendLevel,
  theatreName,
  songsCount,
}: {
  name: string;
  engName: string;
  tagline: string | null;
  image: string;
  slug: string;
  website: string;
  highlights: string[];
  blurb: string | null;
  mustSee: boolean;
  recommendLevel: number;
  theatreName: string;
  songsCount: number;
}) {
  const hasSongs = songsCount > 1;

  return (
    <div>
      <div className="relative min-h-[320px] sm:min-h-[420px] rounded-2xl overflow-hidden shadow-lg">
        <Image
          src={image}
          alt={name}
          fill
          priority
          sizes="(min-width: 1024px) 960px, 100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

        <div className="absolute left-4 right-4 top-4 flex items-start justify-between gap-2">
          {mustSee ? (
            <Badge className="bg-rose-600 text-white border-transparent shadow">
              Must See
            </Badge>
          ) : (
            <span />
          )}
          <span className="rounded-full bg-black/50 backdrop-blur-sm px-2.5 py-1.5">
            <RecommendStars level={recommendLevel} size="md" />
          </span>
        </div>

        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-8">
          <motion.span
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="block text-sm sm:text-base font-medium text-white/80"
          >
            {engName}
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: -16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, type: "spring", stiffness: 120 }}
            className="mt-1 text-2xl sm:text-4xl font-extrabold text-white drop-shadow"
          >
            {name}
          </motion.h1>
          {tagline && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="mt-2 text-sm sm:text-base text-white/85"
            >
              {tagline}
            </motion.p>
          )}
          {theatreName && (
            <a
              href="#theatre-info"
              className="mt-3 inline-flex items-center gap-1.5 text-xs sm:text-sm text-white/90 hover:text-white transition-colors"
            >
              <MapPin className="h-3.5 w-3.5" />
              {theatreName}
            </a>
          )}
        </div>
      </div>

      <Card className="relative z-10 -mt-8 sm:-mt-10 mx-auto max-w-3xl rounded-2xl border-border/60 shadow-xl">
        <CardContent className="space-y-3 p-4 sm:p-5">
          {highlights.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {highlights.map((item, index) => (
                <Badge key={index} variant="secondary">
                  {item}
                </Badge>
              ))}
            </div>
          )}

          {blurb && (
            <p className="text-sm text-muted-foreground italic">{blurb}</p>
          )}

          <div className="flex flex-wrap gap-2">
            <Button asChild size="lg">
              <Link href={website} target="_blank" rel="noopener noreferrer">
                <Ticket className="h-4 w-4" />
                予約する
              </Link>
            </Button>
            {hasSongs ? (
              <Button asChild size="lg" variant="outline">
                <Link href={`/musicals/${slug}/songs`}>曲一覧へ</Link>
              </Button>
            ) : (
              <Button size="lg" variant="outline" disabled>
                曲一覧へ
              </Button>
            )}
          </div>

          <p className="text-sm text-muted-foreground">
            チケットの選び方は
            <Link
              href="/musicals/west-end-tickets"
              className="underline text-primary hover:text-primary/80 transition-colors"
            >
              チケットの買い方・お得な料金ガイド
            </Link>
            もあわせてどうぞ。
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
