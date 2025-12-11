import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { fetchLyricsbyQuery } from "@/utils/actions/lyrics";
import Image from "next/image";

export const metadata = {
  title: "洋楽の歌詞を検索して和訳・意味を知る｜LyriXplorer 検索",
  description:
    "英語の歌詞を検索して、その意味や背景をすぐに理解。人気曲・最新曲・アーティスト名から探せます。和訳・対訳・スラング解説も充実した洋楽検索サービス。",
  keywords: [
    "洋楽 和訳 検索",
    "歌詞 検索 英語",
    "英語 歌詞 意味",
    "対訳 検索",
    "歌詞 意味 わかる サイト",
    "洋楽 初心者",
    "スラング 意味",
  ],
  alternates: {
    canonical: "https://www.just-rondon.com/lyrixplorer/search",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    url: "https://www.just-rondon.com/lyrixplorer/search",
    title: "洋楽歌詞を検索して意味を知る｜LyriXplorer",
    description:
      "気になる英語の歌詞をそのまま検索。和訳・解説・背景知識とともに理解が深まる、洋楽リスナーのための検索ツール。",
    siteName: "LyriXplorer",
  },
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const q = searchParams.q ?? "";
  const songs = await fetchLyricsbyQuery(q);
  console.log(q);
  return (
    <main className="min-h-screen px-4 py-10">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Search Form */}
        <form className="flex gap-2">
          <Input
            name="q"
            defaultValue={q}
            placeholder="曲名 / アーティスト名"
            className="bg-slate-900 border-slate-700 text-white"
          />
          <Button type="submit" className="whitespace-nowrap">
            検索
          </Button>
        </form>

        <p className="text-sm text-slate-400">
          “{q}” の検索結果：{songs.length}件
        </p>

        <div className="grid gap-4">
          {songs.map((song) => (
            <Link
              key={song.id}
              href={`/lyrixplorer/songs/${song.id}`}
              className="block"
            >
              <Card
                className="
      bg-white dark:bg-slate-900
      hover:bg-slate-100 dark:hover:bg-slate-800
      transition cursor-pointer border border-slate-200 dark:border-slate-700
    "
              >
                <CardContent className="flex items-center gap-4 p-4">
                  {/* Thumbnail */}
                  {song.youtubeId && (
                    <div className="w-20 h-12 relative rounded overflow-hidden shadow-sm dark:shadow-none dark:border dark:border-slate-700">
                      <Image
                        src={`https://img.youtube.com/vi/${song.youtubeId}/mqdefault.jpg`}
                        alt={song.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}

                  {/* Song Info */}
                  <div className="flex flex-col">
                    <span className="text-base font-semibold text-slate-900 dark:text-slate-100">
                      {song.name}
                    </span>

                    <span className="text-sm text-slate-600 dark:text-slate-300">
                      {song.artist?.name}
                    </span>

                    <span className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {song.year && song.month
                        ? `${song.year}年 ${song.month}月 発売`
                        : song.year
                        ? `${song.year}年`
                        : "リリース情報なし"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}

          {songs.length <= 0 && (
            <p className="text-slate-500 text-sm">検索結果がありません。</p>
          )}
        </div>
      </div>
    </main>
  );
}
