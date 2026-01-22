import Pagination from "@/components/home/Pagination";
import { Button } from "@/components/ui/button";
import {
  fetchLyricsByArtist,
  fetchArtistDetails,
} from "@/utils/actions/lyrics";

import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const artist = await fetchArtistDetails(params.id);

  const name = artist?.name ?? "アーティスト";
  const engName = artist?.engName ? ` (${artist.engName})` : "";
  const pageTitle = `${name}${engName} | 曲一覧・歌詞 和訳・意味 | LyriXplorer`;

  const description = `${name}${engName} の人気曲・最新曲を和訳付きでわかりやすく紹介。英語歌詞の意味、表現、背景まで丁寧に解説。洋楽学習にも役立つ歌詞ガイドサイト。`;

  return {
    title: pageTitle,
    description,
    keywords: [
      `${name} 和訳`,
      `${name} 歌詞 意味`,
      `${name} 曲一覧`,
      "洋楽 歌詞 和訳",
      "英語歌詞 意味",
      "歌詞 解説",
    ],
    openGraph: {
      type: "profile",
      url: `https://www.just-rondon.com/lyrixplorer/artists/${params.id}/all-songs`,
      title: pageTitle,
      description,
      siteName: "LyriXplorer",
    },
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      canonical: `https://www.just-rondon.com/lyrixplorer/artists/${params.id}`,
    },
  };
}

export default async function SongsByArtistPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { page?: string };
}) {
  const currentPage = parseInt(searchParams.page || "1", 10);
  const itemsPerPage = 10;

  const { songs, total, artist } = await fetchLyricsByArtist(
    params.id,
    currentPage,
    itemsPerPage,
  );

  return (
    <>
      <div className="max-w-4xl mx-auto p-6 sm:p-8 space-y-6">
        {/* ミュージカル名 */}
        <h1 className="text-center">
          <span className="block text-4xl font-extrabold text-indigo-700 dark:text-indigo-400">
            {artist.name}
          </span>
          <span className="block text-xl font-light text-gray-500 dark:text-gray-300 mt-1">
            {artist.engName} - 曲一覧・歌詞・和訳
          </span>
        </h1>
        <p className="text-center text-gray-600 dark:text-gray-300 mt-4 max-w-2xl mx-auto">
          {artist.name} ({artist.engName}) の代表曲・人気曲をまとめました。
          各曲ページでは歌詞の和訳や背景解説もご覧いただけます。
        </p>

        {songs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4 rounded-2xl shadow-inner">
            <p className="text-gray-500 dark:text-gray-400 text-lg text-center">
              このアーティストにはまだ曲が登録されていません。
            </p>
            <Link href={`/lyrixplorer/`}>
              <Button variant="default">戻る</Button>
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700 rounded-2xl shadow-md overflow-hidden">
            {songs.map((song: any) => (
              <Link
                key={song.id}
                href={`/lyrixplorer/songs/${song.id}`}
                className="block px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition items-center justify-between rounded-lg"
              >
                {/* 左側: 曲番号 + サムネイル + 曲名/アーティスト */}
                <div className="flex items-center space-x-4">
                  {/* 曲番号 */}
                  <span className="text-gray-500 dark:text-gray-400 font-semibold w-6 text-center">
                    {song.index}
                  </span>

                  {/* YouTube サムネイル */}
                  {song.youtubeId && (
                    <div className="w-16 h-10 relative flex-shrink-0 rounded overflow-hidden">
                      <img
                        src={`https://img.youtube.com/vi/${song.youtubeId}/mqdefault.jpg`}
                        alt={song.name}
                        className="absolute inset-0 w-full h-full object-cover"
                        loading="lazy"
                        decoding="async"
                        fetchPriority="low"
                      />
                    </div>
                  )}

                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {song.name}
                    </p>
                    <p className="text-gray-700 dark:text-gray-300 text-xs">
                      <span className="font-semibold">Artist:</span>
                      {artist.engName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      歌詞・和訳はこちら
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </ul>
        )}
        <Pagination
          currentPage={currentPage}
          totalItems={total}
          itemsPerPage={itemsPerPage}
          baseUrl={`/lyrixplorer/artists/${params.id}`}
          maxPageButtons={5} // 表示するページ番号の数
        />
        <p className=" text-gray-600 dark:text-gray-300 mt-4 max-w-2xl mx-auto">
          意味を知ったあとに聴いた曲は、同じ音でもまるで違う瞬間があります。
          一行の歌詞が、思いがけず心の奥を揺らす夜もあるでしょう。
          気になるフレーズを見つけたら、和訳と一緒にゆっくりと音の物語を追いかけてみてください。
        </p>
        <div className="text-center mt-8">
          <Link href={`/lyrixplorer`}>
            <Button variant="outline">トップページへ戻る</Button>
          </Link>
        </div>
      </div>
    </>
  );
}
