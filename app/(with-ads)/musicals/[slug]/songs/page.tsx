import { fetchMusicalIdandName, fetchSongs } from "@/utils/actions/musicals";
import { redirect } from "next/navigation";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import MusicalBreadCrumbs from "@/components/musicals/BreadCrumbs";
import { Metadata } from "next";
import Image from "next/image";
import Pagination from "@/components/home/Pagination";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const musical = await fetchMusicalIdandName(params.slug);
  // if (!musical) {
  //   return {
  //     title: "情報が見つかりません",
  //     description: "指定されたミュージカルの情報が見つかりませんでした。",
  //   };
  // }

  return {
    title: `${musical?.name} (${musical?.engName}) 歌詞・和訳 | ジャスト・ロンドン`,
    description: `${musical?.name} (${musical?.engName}) の歌詞と和訳を掲載。${musical?.name} の名曲・人気曲を日本語でわかりやすく解説。ミュージカルファン必見の歌詞・翻訳ガイドサイトです。`,
    openGraph: {
      type: "article",
      url: `https://www.just-rondon.com/musicals/${params.slug}/songs`,
      title: `${musical?.name} (${musical?.engName}) 歌詞・和訳 | ジャスト・ロンドン`,
      description: `${musical?.name} (${musical?.engName}) の歌詞と和訳を掲載。${musical?.name} の名曲・人気曲を日本語でわかりやすく解説。`,
      siteName: "ジャスト・ロンドン",
    },
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      canonical: `https://www.just-rondon.com/musicals/${params.slug}/songs`,
    },
  };
}

export default async function SongsPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { page?: string };
}) {
  const musical = await fetchMusicalIdandName(params.slug);
  if (!musical) redirect("/musicals");

  const currentPage = parseInt(searchParams.page || "1", 10);
  const itemsPerPage = 10;

  const { songs, total } = await fetchSongs(
    musical.id,
    currentPage,
    itemsPerPage,
  );

  return (
    <>
      <MusicalBreadCrumbs
        name2="曲一覧"
        link2={params.slug}
        name={
          musical.name.length > 7
            ? musical.name.slice(0, 7) + "..."
            : musical.name
        }
      />
      <div className="max-w-4xl mx-auto p-6 sm:p-8 space-y-6">
        {/* ミュージカル名 */}
        <h1 className="text-center">
          <span className="block text-4xl font-extrabold text-indigo-700 dark:text-indigo-400">
            {musical.name}
          </span>
          <span className="block text-xl font-light text-gray-500 dark:text-gray-300 mt-1">
            {musical.engName} - 曲一覧・歌詞・和訳
          </span>
        </h1>
        <p className="text-center text-gray-600 dark:text-gray-300 mt-4 max-w-2xl mx-auto">
          {musical.name} ({musical.engName}) の代表曲・人気曲をまとめました。
          各曲ページでは歌詞の和訳や背景解説もご覧いただけます。
        </p>

        {songs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4 rounded-2xl shadow-inner">
            <p className="text-gray-500 dark:text-gray-400 text-lg text-center">
              このミュージカルにはまだ曲が登録されていません。
            </p>
            <Link href={`/musicals/${params.slug}`}>
              <Button variant="default">戻る</Button>
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700 rounded-2xl shadow-md overflow-hidden">
            {songs.map((song: any) => (
              <Link
                key={song.id}
                href={`/musicals/${params.slug}/songs/${song.id}`}
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
                      <span className="font-semibold">Artist:</span>{" "}
                      {song.artist}
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
          baseUrl={`/musicals/${params.slug}/songs`}
          maxPageButtons={5} // 表示するページ番号の数
        />
        <p className=" text-gray-600 dark:text-gray-300 mt-4 max-w-2xl mx-auto">
          ミュージカルをより楽しむためには、事前にあらすじや登場人物、主要シーンを把握しておくことが重要です。
          英語で上演される作品では、歌詞やセリフの意味まで理解するのが難しい場合がありますが、このページではわかりやすく解説しています。{" "}
        </p>
        <div className="text-center mt-8">
          <Link href={`/musicals/${params.slug}`}>
            <Button variant="outline">
              {musical.name} の作品解説ページへ戻る
            </Button>
          </Link>
        </div>
      </div>
    </>
  );
}
