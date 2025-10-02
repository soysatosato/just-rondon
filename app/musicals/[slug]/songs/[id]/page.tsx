import MusicalBreadCrumbs from "@/components/musicals/BreadCrumbs";
import {
  fetchMusicalIdandName,
  fetchSongDetails,
} from "@/utils/actions/musicals";
import { Metadata } from "next";
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
      </div>
    </>
  );
}
