import AdSenseUnit from "@/components/ads/AdSenseUnit";
import { absoluteUrl, buildPageMetadata, truncateDescription } from "@/lib/seo";
import { AD_SLOTS } from "@/lib/adsense";
import MusicalBreadCrumbs from "@/components/musicals/BreadCrumbs";
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
import { musicalBreadcrumbJsonLd } from "@/components/musicals/jsonld";

export async function generateMetadata({
  params,
}: {
  params: { slug: string; id: string };
}): Promise<Metadata> {
  const musical = await fetchMusicalIdandName(params.slug);
  const song = await fetchSongDetails(params.id);

  if (!musical || !song) {
    return {
      title: "曲情報が見つかりません | ジャスト・ロンドン",
      description: "指定された曲の情報が見つかりませんでした。",
      robots: { index: false, follow: false },
    };
  }
  return buildPageMetadata({
    path: `/musicals/${params.slug}/songs/${params.id}`,
    title: `${song.name}の歌詞・和訳 | ${musical.name} (${musical.engName})`,
    // scene は曲がどの場面で歌われるかの解説で、108曲中104曲が異なる文面。
    // 「歌詞と和訳を掲載」のテンプレート文だと全曲が同じスニペットになり、
    // 検索結果でどの曲のページか見分けが付かない。
    description: truncateDescription(
      `${song.name}（${musical.name}）の歌詞と和訳。${song.scene}`
    ),
    type: "article",
  });
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            musicalBreadcrumbJsonLd(
              { name: song.musical.name, slug: params.slug },
              [
                {
                  name: "曲一覧",
                  url: absoluteUrl(`/musicals/${params.slug}/songs`),
                },
                {
                  name: song.name,
                  url: absoluteUrl(`/musicals/${params.slug}/songs/${params.id}`),
                },
              ],
            ),
          ),
        }}
      />
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
        <AdSenseUnit slot={AD_SLOTS.inArticle} className="my-4" />

        {/* 歌詞 */}
        <div className="prose prose-lg prose-indigo mx-auto">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {song.lyrics}
          </ReactMarkdown>
        </div>
        <div className="mt-4 text-left">
          <Link
            href={`/musicals/${params.slug}/songs`}
            className="inline-flex items-center text-sm text-blue-600 dark:text-blue-300 underline hover:opacity-80"
          >
            ← 曲一覧へ戻る
          </Link>
        </div>
      </div>
    </>
  );
}
