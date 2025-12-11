import { Flame } from "lucide-react";
import {
  Card,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { SearchBox } from "@/components/lyrix/LyricsSearchBox";
import { fetchLatestTop10Lyrics } from "@/utils/actions/lyrics";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "【和訳付き】人気曲の歌詞の意味がわかる｜LyriXplorer｜英語歌詞・対訳・解説",
  description:
    "英語の歌詞の意味を知りたい人へ。最新ヒット曲、話題曲の対訳・和訳をわかりやすく解説。日常英語・スラング・比喩表現まで丁寧にサポート。アーティスト情報や作品背景も学べる音楽理解サイト。",
  keywords: [
    "和訳",
    "歌詞 和訳",
    "英語歌詞 意味",
    "歌詞 解説",
    "対訳",
    "スラング 意味",
    "洋楽 初心者",
    "曲名 和訳",
  ],
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://www.just-rondon.com/lyrixplorer",
  },
  openGraph: {
    type: "website",
    url: "https://www.just-rondon.com/lyrixplorer",
    title: "【和訳付き】英語歌詞の意味がわかる｜LyriXplorer｜洋楽対訳・解説",
    description:
      "洋楽の歌詞、ちゃんと理解できてる？直訳ではわからない真意や感情を日本語で丁寧に。英語学習にも役立つ、歌詞の背景・文化を探る新感覚の音楽ガイド。",
    siteName: "LyriXplorer",
  },
};

export default async function LyriXplolerHome() {
  const top10 = await fetchLatestTop10Lyrics();
  return (
    <main className="min-h-screen bg-gradient-to-b ">
      <div className="px-4 py-4 lg:px-6 lg:py-14 space-y-12">
        {/* ================= HERO ================= */}
        <section className="flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div
              className="flex w-full items-center gap-2 px-3 py-2 mb-6 rounded-xl shadow-sm backdrop-blur
                   border border-gray-300 bg-white/70 
                   dark:border-slate-700/70 dark:bg-slate-950/60"
            >
              <SearchBox href="/lyrixplorer/search" />
            </div>
            <div
              className="max-w-xl mb-3 text-base space-y-4 italic
                    text-gray-700 dark:text-slate-300"
            >
              <p>A lyrics explorer that helps you understand every line.</p>
              <p>世界の音楽を、分かりやすい言葉で。</p>
            </div>
          </div>
        </section>
        {/* ================= HOT SONGS ================= */}
        <section className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <Flame className="h-6 w-6 text-red-400" />
              <div>
                <h2 className="font-bold text-lg">Trending</h2>
                <p className="text-xs text-slate-400">
                  今いちばん宇宙規模で響いてる曲
                </p>
              </div>
            </div>
            {/* <Button
              variant="ghost"
              size="sm"
              className="text-xs text-slate-300 hover:text-slate-100"
            >
              View All
            </Button> */}
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {top10.map((song) => {
              const youtubeId = song.lyrics?.youtubeId;
              const thumbnail = youtubeId
                ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`
                : null;

              return (
                <Link
                  key={song.rank}
                  href={`/lyrixplorer/songs/${song.lyricsId}`}
                >
                  <Card className="group flex gap-3 border-slate-700/70 bg-slate-900/70 transition hover:border-sky-500/60 hover:bg-slate-900 overflow-hidden">
                    {/* サムネ or グラデ */}
                    <div className="relative h-20 w-32 shrink-0">
                      {thumbnail ? (
                        <img
                          src={thumbnail}
                          alt={song.lyrics?.name ?? "thumbnail"}
                          className="h-full w-full object-cover transition group-hover:scale-105"
                        />
                      ) : (
                        <div className="h-full w-full bg-gradient-to-br from-sky-700/40 via-purple-600/40 to-pink-500/40 group-hover:opacity-90 transition" />
                      )}

                      {/* Rank Badge */}
                      <div className="absolute bottom-1 left-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-bold text-sky-300">
                        #{song.rank}
                      </div>
                    </div>

                    {/* 曲情報 */}
                    <CardContent className="flex flex-col justify-center py-3 space-y-1">
                      <CardTitle className="text-sm text-slate-200 font-semibold group-hover:text-sky-200">
                        {song.lyrics?.name}
                      </CardTitle>

                      <CardDescription className="text-xs text-slate-400 group-hover:text-sky-300 transition">
                        {song.lyrics?.artist.name} ·{" "}
                        {song.lyrics?.artist.engName}
                      </CardDescription>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <Flame className="h-6 w-6 text-orange-400" />
            <div>
              <h2 className="font-bold text-lg">Hot Artists</h2>
              <p className="text-xs text-slate-400">
                世界を動かすトップアーティスト
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                name: "Taylor Swift",
                nameJa: "テイラー・スウィフト",
                slug: "taylor-swift",
              },
              {
                name: "Ed Sheeran",
                nameJa: "エド・シーラン",
                slug: "ed-sheeran",
              },
              {
                name: "Ariana Grande",
                nameJa: "アリアナ・グランデ",
                slug: "ariana-grande",
              },
            ].map((artist) => (
              <Link
                key={artist.name}
                href={`/lyrixplorer/artists/${artist.slug}`}
              >
                <Card
                  className="
            group flex items-center gap-4 p-4 
            border border-slate-700/70 bg-slate-900/70 
            rounded-xl relative overflow-hidden
            transition 
            hover:border-pink-400/60 hover:shadow-lg hover:shadow-pink-500/20
          "
                >
                  {/* 背景のグラデ */}
                  <div
                    className="
              absolute inset-0 opacity-10 
              bg-gradient-to-br from-pink-500/40 via-purple-500/30 to-sky-500/40
              group-hover:opacity-20 transition
            "
                  />

                  {/* アバター */}
                  <div
                    className="
              relative h-12 w-12 rounded-full flex items-center justify-center
              text-slate-200 font-bold text-sm
              bg-gradient-to-br from-pink-500/40 to-purple-600/40
              ring-1 ring-slate-700/60
              group-hover:scale-105 group-hover:shadow-md 
              transition
            "
                  >
                    {artist.name
                      .split(" ")
                      .map((part) => part[0])
                      .join("")
                      .toUpperCase()}
                  </div>

                  {/* テキスト */}
                  <div className="relative space-y-1">
                    <p className="text-sm font-semibold text-slate-200 group-hover:text-pink-200 transition">
                      {artist.name}
                    </p>

                    <p className="text-xs text-slate-400 group-hover:text-slate-300 transition">
                      {artist.nameJa}
                    </p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
