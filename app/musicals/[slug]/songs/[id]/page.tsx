import MusicalBreadCrumbs from "@/components/musicals/BreadCrumbs";
import { fetchTodaysPicks } from "@/utils/actions/lyrics";
import {
  fetchMusicalIdandName,
  fetchSongDetails,
} from "@/utils/actions/musicals";
import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export async function generateMetadata({
  params,
}: {
  params: { slug: string; id: string };
}): Promise<Metadata> {
  const musical = await fetchMusicalIdandName(params.slug);
  const song = await fetchSongDetails(params.id);

  // if (!musical || !song) {
  //   return {
  //     title: "情報が見つかりません",
  //     description: "指定されたミュージカルの情報が見つかりませんでした。",
  //     robots: { index: true, follow: true },
  //   };
  // }
  return {
    title: `${song?.name}の歌詞・和訳 | ${musical?.name} (${musical?.engName}) | ロンドん！`,
    description: `${song?.name} の歌詞と和訳を掲載。${musical?.name} (${musical?.engName})の名曲・人気曲を日本語でわかりやすく解説。ミュージカルファン必見の歌詞・翻訳ガイドサイトです。`,
    openGraph: {
      type: "article",
      url: `https://www.just-rondon.com/musicals/${params.slug}/songs/${params.id}`,
      title: `${song?.name}の歌詞・和訳 | ${musical?.name} (${musical?.engName}) | ロンドん！`,
      description: `${song?.name} の歌詞と和訳を掲載。${musical?.name} (${musical?.engName})の名曲・人気曲を日本語でわかりやすく解説。`,
      siteName: "ロンドん！",
    },
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      canonical: `https://www.just-rondon.com/musicals/${params.slug}/songs/${params.id}`,
    },
  };
}

export default async function SongDetailsPage({
  params,
}: {
  params: { slug: string; id: string };
}) {
  const song = await fetchSongDetails(params.id);
  const picks = await fetchTodaysPicks(2);
  if (!song) redirect("/musicals");
  return (
    <>
      <MusicalBreadCrumbs
        name2="曲一覧"
        name3={song.name.length > 7 ? song.name.slice(0, 7) + "..." : song.name}
        link2={params.slug}
        name={
          song.musical.name.length > 7
            ? song.musical.name.slice(0, 7) + "..."
            : song.musical.name
        }
      />
      <div className="max-w-3xl mx-auto p-8 bg-background rounded-2xl shadow-lg">
        <div className="mb-6 sm:mb-8 text-center">
          <p className="text-left mb-4 text-xs sm:text-base text-gray-600 dark:text-gray-300 mt-2">
            このページでは、ミュージカル「{song.musical.name} (
            {song.musical.engName})」の{song.name}{" "}
            の歌詞と和訳、背景解説を掲載しています。
            観劇前にチェックすると、歌詞の意味やシーンの深みまで楽しめます。
          </p>
          <h1 className="text-xl sm:text-3xl font-extrabold mb-2 text-indigo-700 dark:text-indigo-300 leading-snug">
            {song.name}
          </h1>
          <p className="text-base sm:text-xl  mb-1">
            <span className="font-semibold">Artist:</span> {song.artist}
          </p>
          <p className="text-sm text-muted-foreground italic pt-3">
            {song.scene}
          </p>
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
        <div className="mt-16">
          <h2 className="text-xl font-bold mb-6 text-indigo-700 dark:text-indigo-300">
            こちらもおすすめ
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {picks.map((pick) => {
              if (!pick) return null;
              const thumbnail = pick.youtubeId
                ? `https://img.youtube.com/vi/${pick.youtubeId}/hqdefault.jpg`
                : "/no-thumbnail.png"; // fallback

              return (
                <Link
                  key={pick.id}
                  href={`/lyrixplorer/songs/${pick.id}`}
                  className="group block rounded-xl overflow-hidden bg-card shadow-md hover:shadow-xl transition-all duration-300"
                >
                  {/* サムネイル */}
                  <div className="relative w-full h-40 overflow-hidden">
                    <img
                      src={thumbnail}
                      alt={`${pick.name} thumbnail`}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>

                  {/* 曲情報 */}
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-indigo-700 dark:text-indigo-300 group-hover:underline">
                      {pick.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {pick.artist.name}
                    </p>
                  </div>
                </Link>
              );
            })}
            <Link
              href={`/lyrixplorer/`}
              className="block text-xs text-right text-blue-600 dark:text-blue-300 underline hover:opacity-80"
            >
              和訳サイトTOPへ →
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
