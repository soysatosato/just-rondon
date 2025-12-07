import { fetchLyricsDetails } from "@/utils/actions/lyrics";

import { Metadata } from "next";
import { redirect } from "next/navigation";
import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const song = await fetchLyricsDetails(params.id);

  const title = song?.name
    ? `${song.name} 和訳・歌詞の意味 | ${song.artist.name} (${song.artist.engName})`
    : `歌詞の和訳・意味 | LyriXplorer`;

  const description = song?.name
    ? `${song.name} の歌詞をわかりやすく和訳。${song.artist.name} (${song.artist.engName}) の感情や比喩表現を丁寧に解説。英語初心者でも理解できる洋楽歌詞ガイドです。`
    : `英語歌詞を検索して和訳・意味を理解できる洋楽歌詞解説サイト。`;

  return {
    title,
    description,
    keywords: [
      `${song?.name} 和訳`,
      `${song?.artist.name} 歌詞 意味`,
      "英語歌詞 意味",
      "洋楽 和訳",
      "歌詞 解説",
    ],
    openGraph: {
      type: "article",
      url: `https://www.just-rondon.com/lyrixplorer/songs/${params.id}`,
      title,
      description,
      siteName: "LyriXplorer",
    },
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      canonical: `https://www.just-rondon.com/lyrixplorer/songs/${params.id}`,
    },
  };
}

export default async function SongDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const song = await fetchLyricsDetails(params.id);
  if (!song) redirect("/musicals");
  return (
    <>
      <div className="max-w-3xl mx-auto p-8 bg-background rounded-2xl shadow-lg">
        <div className="mb-6 sm:mb-8 text-center">
          <p className="text-left mb-4 text-xs sm:text-base text-gray-600 dark:text-gray-300 mt-2">
            このページでは、{song.artist.name} ({song.artist.engName}) の{" "}
            {song.name} の歌詞と和訳を掲載しています。
          </p>
          <h1 className="text-xl sm:text-3xl font-extrabold mb-2 text-indigo-700 dark:text-indigo-300 leading-snug">
            {song.name}
          </h1>
          <p className="text-base sm:text-xl  mb-1">
            <span className="font-semibold">Artist:</span> {song.artist.engName}
          </p>
          {song.scene && (
            <p className="text-sm text-muted-foreground italic pt-3">
              {song.scene}
            </p>
          )}
        </div>
        {song.youtubeId && (
          <div className="relative w-full pb-[56.25%] mb-6">
            {" "}
            {/* 16:9比率 */}
            <iframe
              className="absolute top-0 left-0 w-full h-full rounded-lg shadow-md"
              src={`https://www.youtube.com/embed/${song.youtubeId}`}
              title={song.name}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        )}

        {/* 歌詞 */}
        <div className="prose prose-lg prose-indigo mx-auto">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {song.lyrics}
          </ReactMarkdown>
        </div>
      </div>
    </>
  );
}
