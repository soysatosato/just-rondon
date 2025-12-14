import { Flame } from "lucide-react";
import {
  Card,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { SearchBox } from "@/components/lyrix/LyricsSearchBox";
import {
  fetchHotAlbums,
  fetchHotArtistsRandom,
  fetchLatestTop10Lyrics,
  fetchTodaysAlbumPick,
  fetchTodaysPicks,
} from "@/utils/actions/lyrics";
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
  const todaysPick = await fetchTodaysPicks();
  const todaysAlbumPick = await fetchTodaysAlbumPick();
  const hotAlbums = await fetchHotAlbums();
  const hotArtists = await fetchHotArtistsRandom();

  return (
    <main className="min-h-screen bg-gradient-to-b">
      <div className="px-4 py-4 lg:px-6 lg:py-14 space-y-14">
        {/* ================= HERO ================= */}
        <section className="flex flex-col gap-10">
          <div>
            <div className="flex items-center gap-2 px-3 py-2 mb-6 rounded-xl border bg-white/70 dark:bg-slate-950/60">
              <SearchBox href="/lyrixplorer/search" />
            </div>
            <div className="max-w-xl italic text-gray-700 dark:text-slate-300">
              <p>A lyrics explorer that helps you understand every line.</p>
              <p>世界の音楽を、分かりやすい言葉で。</p>
            </div>
          </div>
        </section>

        {/* ================= TODAY'S PICK ================= */}
        {todaysPick.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <Flame className="h-6 w-6 text-pink-400" />
              <div>
                <h2 className="font-bold text-lg">Today’s Pick</h2>
                <p className="text-xs text-slate-400">
                  今日という日に、偶然出会う一曲
                </p>
              </div>
            </div>

            <div className="grid gap-3">
              {todaysPick.map((song) => {
                const youtubeId = song.youtubeId;
                const thumbnail = youtubeId
                  ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`
                  : null;

                return (
                  <Link key={song.id} href={`/lyrixplorer/songs/${song.id}`}>
                    <Card className="group flex gap-3 overflow-hidden border-slate-700/70 bg-slate-900/70 transition hover:border-pink-400/60">
                      {/* ===== サムネイル ===== */}
                      <div className="relative h-20 w-32 shrink-0">
                        {thumbnail ? (
                          <img
                            src={thumbnail}
                            alt={song.name}
                            className="h-full w-full object-cover transition group-hover:scale-105"
                            loading="lazy"
                          />
                        ) : (
                          <div className="h-full w-full bg-gradient-to-br from-pink-500/40 via-purple-500/40 to-sky-500/40" />
                        )}

                        {/* 再生っぽいオーバーレイ */}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition">
                          <div className="h-6 w-6 rounded-full bg-white/80 text-black text-xs flex items-center justify-center">
                            ▶
                          </div>
                        </div>
                      </div>

                      {/* ===== テキスト ===== */}
                      <CardContent className="flex flex-col justify-center py-3 space-y-1">
                        <CardTitle className="text-sm font-semibold text-slate-200 group-hover:text-pink-200 transition">
                          {song.name}
                        </CardTitle>

                        <CardDescription className="text-xs text-slate-400 group-hover:text-slate-300 transition">
                          {song.artist.name}
                        </CardDescription>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* ================= TODAY'S ALBUM PICK ================= */}
        {todaysAlbumPick && (
          <section className="space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <Flame className="h-6 w-6 text-purple-400" />
              <div>
                <h2 className="font-bold text-lg">Today’s Album Pick</h2>
                <p className="text-xs text-slate-400">今日はこのアルバムから</p>
              </div>
            </div>

            <Link
              href={`/lyrixplorer/artists/${todaysAlbumPick.artistId}/albums/${todaysAlbumPick.album}`}
            >
              <Card className="p-4 bg-slate-900/70 hover:border-purple-400/60 transition">
                <CardTitle className="text-sm text-slate-200">
                  {todaysAlbumPick.album}
                </CardTitle>
                <CardDescription className="text-xs text-slate-400">
                  {todaysAlbumPick.artistName}
                  {todaysAlbumPick.year > 0 && ` · ${todaysAlbumPick.year}`}
                  {todaysAlbumPick.month > 0 && `.${todaysAlbumPick.month}`}
                </CardDescription>
              </Card>
            </Link>
          </section>
        )}

        {/* ================= TRENDING ================= */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <Flame className="h-6 w-6 text-red-400" />
            <div>
              <h2 className="font-bold text-lg">Trending</h2>
              <p className="text-xs text-slate-400">
                今いちばん宇宙規模で響いてる曲
              </p>
            </div>
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
                  <Card className="group flex gap-3 bg-slate-900/70 hover:border-sky-500/60 transition">
                    <div className="relative h-20 w-32 shrink-0">
                      {thumbnail ? (
                        <img
                          src={thumbnail}
                          alt={song.lyrics?.name ?? ""}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full bg-gradient-to-br from-sky-700/40 via-purple-600/40 to-pink-500/40" />
                      )}
                      <div className="absolute bottom-1 left-1 text-xs font-bold text-sky-300">
                        #{song.rank}
                      </div>
                    </div>

                    <CardContent className="py-3">
                      <CardTitle className="text-sm text-slate-200 mb-2">
                        {song.lyrics?.name}
                      </CardTitle>
                      <CardDescription className="text-xs text-slate-400">
                        {song.lyrics?.artist.name}
                      </CardDescription>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>

        {/* ================= HOT ALBUM ================= */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <Flame className="h-6 w-6 text-red-400" />
            <div>
              <h2 className="font-bold text-lg">HOT Album</h2>
              <p className="text-xs text-slate-400">今週のアルバムチャート</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {hotAlbums.map((album) => (
              <Link
                key={album.id}
                href={`/lyrixplorer/artists/${album.artistId}/albums/${album.album}`}
              >
                <Card className="p-4 bg-slate-900/70 hover:border-red-400/60 transition">
                  <p className="text-xs font-bold text-sky-400">
                    #{album.rank}
                  </p>
                  <p className="text-sm text-slate-200 font-semibold mb-2">
                    {album.album}
                  </p>
                  <p className="text-xs text-slate-400">
                    {album.artist?.engName}
                  </p>
                </Card>
              </Link>
            ))}
          </div>
        </section>
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <Flame className="h-6 w-6 text-orange-400" />
            <div>
              <h2 className="font-bold text-lg">Hot Artists</h2>
              <p className="text-xs text-slate-400">注目アーティスト</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {hotArtists.map((artist) => (
              <Link key={artist.id} href={`/lyrixplorer/artists/${artist.id}`}>
                <Card className="group flex items-center gap-4 p-4 bg-slate-900/70 hover:border-orange-400/60 transition">
                  <div className="h-12 w-12 rounded-full flex items-center justify-center font-bold bg-gradient-to-br from-orange-500/40 to-pink-500/40">
                    {artist.engName
                      .split(" ")
                      .map((p) => p[0])
                      .join("")
                      .toUpperCase()}
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-slate-200 mb-1">
                      {artist.engName}
                    </p>
                    {artist.name && (
                      <p className="text-xs text-slate-400">{artist.name}</p>
                    )}
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
