import {
  fetchMusicalIdandName,
  fetchSongCountsBySlug,
  fetchSongs,
} from "@/utils/actions/musicals";
import { SONGS_PUBLISHED, hasSongList } from "@/lib/musicals/song-pages";
import { buildPageMetadata } from "@/lib/seo";
import { redirect } from "next/navigation";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import Breadcrumbs from "@/components/navigation/Breadcrumbs";
import { Metadata } from "next";
import Image from "next/image";
import { breadcrumbListJsonLd } from "@/components/navigation/tree";
import JsonLd from "@/components/seo/JsonLd";

/**
 * 一覧を生やす作品は lib/musicals/song-pages.js の hasSongList が決める。
 * 曲が無い作品と、SONGS_PUBLISHED が false の間は全作品が 404 になる。
 *
 * ページ内の notFound() では 404 にならない。app/loading.tsx があるため
 * 先にステータス200でストリーミングが始まり、中身の無いページが残る。
 * dynamicParams = false ならルーティングの段階で弾かれる。
 *
 * ★ このページで searchParams を読まないこと。読むと動的レンダリングになり、
 *   dynamicParams = false が効かず、曲の無い作品の一覧も200で返る
 *   (以前の ?page= のページ送りで実際にそうなっていた)。
 *   1作品あたり20曲前後なので、上演順は1ページに通しで並べている。
 */
export async function generateStaticParams() {
  if (!SONGS_PUBLISHED) return [];
  const musicals = await fetchSongCountsBySlug();
  return musicals
    .filter((m) => hasSongList(m._count.songs))
    .map(({ slug }) => ({ slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const musical = await fetchMusicalIdandName(params.slug);
  if (!musical) {
    return {
      title: "ミュージカル情報が見つかりません | ジャスト・ロンドン",
      description: "指定されたミュージカルの曲一覧情報が見つかりませんでした。",
      robots: { index: false, follow: false },
    };
  }

  // 曲一覧は上演順を示すページで、歌詞そのものはここには無い。
  // 歌詞本文を持つ各曲ページは第三者の著作物のため noindex にしてあり、
  // この一覧が「歌詞・和訳」を名乗ると、検索結果に出ない中身を宣伝することになる。
  return buildPageMetadata({
    path: `/musicals/${params.slug}/songs`,
    title: `${musical?.name} (${musical?.engName}) 曲一覧`,
    description: `${musical?.name} (${musical?.engName}) で歌われる曲を上演順に並べた一覧。どの場面で何が歌われるかを観劇前に把握できます。`,
    type: "article",
  });
}

export default async function SongsPage({
  params,
}: {
  params: { slug: string };
}) {
  const musical = await fetchMusicalIdandName(params.slug);
  if (!musical) redirect("/musicals");

  const songs = await fetchSongs(musical.id);

  return (
    <>
      <JsonLd
        data={breadcrumbListJsonLd({
          path: "/musicals",
          trail: [{ label: musical.name, href: `/musicals/${params.slug}` }],
          current: "曲一覧",
          currentHref: `/musicals/${params.slug}/songs`,
        })}
      />
      <Breadcrumbs
        path="/musicals"
        trail={[{ label: musical.name, href: `/musicals/${params.slug}` }]}
        current="曲一覧"
      />
      <div className="max-w-4xl mx-auto p-6 sm:p-8 space-y-6">
        {/* ミュージカル名 */}
        <h1 className="text-center">
          <span className="block text-4xl font-extrabold text-indigo-700 dark:text-indigo-400">
            {musical.name}
          </span>
          <span className="block text-xl font-light text-gray-500 dark:text-gray-300 mt-1">
            {musical.engName} - 曲一覧
          </span>
        </h1>
        <p className="text-center text-gray-600 dark:text-gray-300 mt-4 max-w-2xl mx-auto">
          {musical.name} ({musical.engName}) で歌われる曲を上演順に並べました。
          どの場面で何が歌われるかを、観劇前に把握しておけます。
        </p>
        <ul className="divide-y divide-gray-200 dark:divide-gray-700 rounded-2xl shadow-md overflow-hidden">
          {songs.map((song: any) => (
            <li key={song.id}>
              <Link
                href={`/musicals/${params.slug}/songs/${song.id}`}
                className="flex w-full items-center px-4 py-4 hover:bg-gray-50 dark:hover:bg-gray-800 active:bg-gray-100 dark:active:bg-gray-700 transition rounded-lg"
              >
                <div className="flex items-center space-x-4 min-w-0 w-full">
                  <span className="text-gray-500 dark:text-gray-400 font-semibold w-6 text-center shrink-0">
                    {song.index}
                  </span>

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

                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                      {song.name}
                    </p>
                    <p className="text-gray-700 dark:text-gray-300 text-xs truncate">
                      <span className="font-semibold">Artist:</span>{" "}
                      {song.artist}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      この曲について
                    </p>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
        <p className=" text-gray-600 dark:text-gray-300 mt-4 max-w-2xl mx-auto">
          曲順を先に押さえておくと、どの場面で物語が動くのかが掴めます。英語で観ても
          筋を見失いにくくなるので、観劇前にひと通り眺めておくのがおすすめです。チケットの買い方やお得な観劇方法は
          <Link
            href="/musicals/west-end-tickets"
            className="text-blue-600 dark:text-blue-300 underline hover:opacity-80 mx-1"
          >
            チケットの買い方・お得な料金ガイド
          </Link>
          もあわせてご覧ください。
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
