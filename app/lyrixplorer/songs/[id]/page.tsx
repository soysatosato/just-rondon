import { fetchLyricsDetails } from "@/utils/actions/lyrics";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Link from "next/link";
import ExpandableText from "@/components/card/ExpandableText";

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
          <h2 className="sr-only">
            {song.name} の歌詞と和訳（{song.artist.engName}）
          </h2>
          <p className="text-base sm:text-xl  mb-1">
            <span className="font-semibold">Artist:</span>{" "}
            <Link
              href={`/lyrixplorer/artists/${song.artistId}`}
              className=" text-blue-600 dark:text-blue-300 underline hover:opacity-80"
            >
              {song.artist.engName}
            </Link>
          </p>
          {song.scene && (
            <ExpandableText
              text={song.scene}
              maxLines={4}
              className="text-left text-sm text-muted-foreground italic pt-3 prose-p:my-3 prose-p:leading-relaxed"
            />
          )}
        </div>
        {song.youtubeId && (
          <div className="relative w-full pb-[56.25%] mb-6">
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
        {song.album && (
          <div className="my-10 p-4 text-center bg-gray-100 dark:bg-gray-800 rounded-xl shadow">
            <h2 className="text-base font-bold mb-2 text-indigo-700 dark:text-indigo-300">
              この曲が収録されているアルバム
            </h2>

            <Link
              href={`/lyrixplorer/artists/${
                song.artistId
              }/albums/${encodeURIComponent(song.album)}`}
              className="text-lg font-semibold text-blue-600 dark:text-blue-300 underline hover:opacity-80"
            >
              {song.album}
            </Link>
          </div>
        )}
        {song.relatedSongs && song.relatedSongs.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-6 text-indigo-700 dark:text-indigo-300">
              関連する曲
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {song.relatedSongs.map((rel) => {
                const thumbnail = rel.youtubeId
                  ? `https://img.youtube.com/vi/${rel.youtubeId}/hqdefault.jpg`
                  : "/no-thumbnail.png"; // fallback

                return (
                  <Link
                    key={rel.id}
                    href={`/lyrixplorer/songs/${rel.id}`}
                    className="group block rounded-xl overflow-hidden bg-card shadow-md hover:shadow-xl transition-all duration-300"
                  >
                    {/* サムネイル */}
                    <div className="relative w-full h-40 overflow-hidden">
                      <img
                        src={thumbnail}
                        alt={`${rel.name} thumbnail`}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>

                    {/* 曲情報 */}
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-indigo-700 dark:text-indigo-300 group-hover:underline">
                        {rel.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {rel.artist.name}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
