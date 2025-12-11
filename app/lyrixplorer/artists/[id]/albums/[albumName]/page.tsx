import { fetchArtistDetails, fetchLyricsByAlbum } from "@/utils/actions/lyrics";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

// export async function generateMetadata({
//   params,
// }: {
//   params: { id: string };
// }): Promise<Metadata> {
//   const artist = await fetchArtistDetails(params.id);

//   const name = artist?.name ?? "アーティスト";
//   const engName = artist?.engName ? ` (${artist.engName})` : "";
//   const pageTitle = `${name}${engName} | 曲一覧・歌詞 和訳・意味 | LyriXplorer`;

//   const description = `${name}${engName} の人気曲・最新曲を和訳付きでわかりやすく紹介。英語歌詞の意味、表現、背景まで丁寧に解説。洋楽学習にも役立つ歌詞ガイドサイト。`;

//   return {
//     title: pageTitle,
//     description,
//     keywords: [
//       `${name} 和訳`,
//       `${name} 歌詞 意味`,
//       `${name} 曲一覧`,
//       "洋楽 歌詞 和訳",
//       "英語歌詞 意味",
//       "歌詞 解説",
//     ],
//     openGraph: {
//       type: "profile",
//       url: `https://www.just-rondon.com/lyrixplorer/artists/${params.id}/all-songs`,
//       title: pageTitle,
//       description,
//       siteName: "LyriXplorer",
//     },
//     robots: {
//       index: true,
//       follow: true,
//     },
//     alternates: {
//       canonical: `https://www.just-rondon.com/lyrixplorer/artists/${params.id}`,
//     },
//   };
// }
// アルバムページ
export default async function AlbumPage({
  params,
}: {
  params: { id: string; albumName: string };
}) {
  const albumName = decodeURIComponent(params.albumName);
  {
    console.log(albumName);
  }
  const tracks = await fetchLyricsByAlbum(params.id, albumName);

  // アルバムの曲一覧

  if (!tracks.length)
    return (
      <div className="max-w-3xl mx-auto py-10 text-center">
        <h1 className="text-3xl font-bold mb-4">{albumName}</h1>
        <p className="text-gray-500">このアルバムの曲は見つかりません。</p>
        <Link href="/lyrixplorer">Topへ戻る</Link>
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto py-10 px-6">
      {/* アルバムヘッダー */}
      <div className="flex items-center gap-6 mb-10">
        {tracks[0].artist.imageUrl && (
          <img
            src={tracks[0].artist.imageUrl}
            alt={tracks[0].artist.name}
            className="w-24 h-24 rounded-xl object-cover shadow-md"
          />
        )}
        <div>
          <h1 className="text-3xl font-bold mb-2">{albumName}</h1>
          <p>
            <Link
              href={`/lyrixplorer/artists/${params.id}`}
              className=" text-blue-600 dark:text-blue-300 hover:opacity-80"
            >
              {tracks[0].artist.engName}
            </Link>
          </p>
        </div>
      </div>

      {/* 曲リスト */}
      <div className="space-y-3">
        {tracks.map((song, index) => (
          <Link
            key={song.id}
            href={`/lyrixplorer/songs/${song.id}`}
            className="block px-4 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition"
          >
            <div className="flex items-center space-x-4">
              {/* Track Number */}
              <span className="text-gray-500 dark:text-gray-400 font-semibold w-6 text-center">
                {song.albumOrder || index + 1}
              </span>

              {/* Thumbnail */}
              {song.youtubeId && (
                <div className="w-16 h-10 relative rounded overflow-hidden shadow">
                  <Image
                    src={`https://img.youtube.com/vi/${song.youtubeId}/mqdefault.jpg`}
                    alt={song.name}
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              {/* Song Info */}
              <div>
                <p className="text-sm font-semibold">{song.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Track {song.albumOrder}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
