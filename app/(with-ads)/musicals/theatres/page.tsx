import Image from "next/image";
import Link from "next/link";
import { MapPin, Theater, ArrowRight } from "lucide-react";

import JsonLd from "@/components/seo/JsonLd";
import { buildPageMetadata } from "@/lib/seo";
import { fetchAllTheatres } from "@/utils/actions/theatres";
import {
  THEATRES_BASE,
  theatrePath,
  theatresHubJsonLd,
} from "@/components/musicals/theatres/theatres";
import { Badge } from "@/components/ui/badge";
import type { Metadata } from "next";

export const metadata: Metadata = buildPageMetadata({
  path: THEATRES_BASE,
  title: "ロンドン・ウエストエンドの劇場ガイド｜アクセス・座席・上演作品",
  titleSuffix: false,
  description:
    "ウエストエンドの主要劇場を一覧で。各劇場のアクセス、座席の選び方、いま上演中の作品をまとめた観光客向けガイドです。",
  keywords: [
    "ロンドン 劇場",
    "ウエストエンド 劇場",
    "ロンドン 劇場 アクセス",
    "ロンドン 劇場 座席",
  ],
});

export default async function TheatresHubPage() {
  const theatres = await fetchAllTheatres();

  return (
    <>
      <JsonLd data={theatresHubJsonLd(theatres)} />

      <div className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
        <header className="max-w-3xl">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <Theater className="h-3.5 w-3.5" />
            劇場ガイド
          </span>
          <h1 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
            ウエストエンドの劇場
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
            ロンドンの劇場は、その多くが100年以上前に建てられたものです。
            座席の見やすさや階段の多さは劇場ごとに大きく違い、同じ値段でも
            体験が変わります。作品を決めたあと、行く劇場のこともひととおり
            見ておくと当日に慌てません。
          </p>
        </header>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {theatres.map((theatre) => {
            const showing = theatre.musicals[0];

            return (
              <Link
                key={theatre.id}
                href={theatrePath(theatre.slug)}
                className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition hover:border-primary hover:shadow-md"
              >
                {showing ? (
                  <div className="relative aspect-[16/9] w-full overflow-hidden">
                    <Image
                      src={showing.image}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    <span className="absolute inset-x-0 bottom-0 p-3 text-xs font-semibold text-white">
                      上演中『{showing.name}』
                    </span>
                  </div>
                ) : (
                  <div className="flex aspect-[16/9] w-full items-center justify-center bg-muted">
                    <Theater className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}

                <div className="flex flex-1 flex-col p-4">
                  <h2 className="text-base font-bold leading-snug">
                    {theatre.name}
                  </h2>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {theatre.nameJa}
                  </p>

                  {theatre.nearestStation && (
                    <p className="mt-2 flex items-start gap-1.5 text-xs text-muted-foreground">
                      <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      {theatre.nearestStation}
                    </p>
                  )}

                  {theatre.musicals.length > 1 && (
                    <Badge variant="secondary" className="mt-3 w-fit">
                      上演中 {theatre.musicals.length}作品
                    </Badge>
                  )}

                  <span className="mt-auto pt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary">
                    劇場の詳細
                    <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        <p className="mt-10 text-sm text-muted-foreground">
          チケットの買い方は
          <Link
            href="/musicals/west-end-tickets"
            className="mx-1 text-primary underline hover:opacity-80"
          >
            チケットの買い方・お得な料金ガイド
          </Link>
          、当日のマナーや服装は
          <Link
            href="/musicals/west-end-etiquette"
            className="mx-1 text-primary underline hover:opacity-80"
          >
            劇場の楽しみ方・マナーガイド
          </Link>
          をどうぞ。
        </p>
      </div>
    </>
  );
}
