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
      {/* ================= ALBUM HEADER ================= */}
      <div
        className="
    relative mb-12 rounded-2xl overflow-hidden
    border border-slate-200/60 dark:border-slate-700/60
    bg-gradient-to-br
      from-slate-50 via-white to-slate-100
      dark:from-slate-900 dark:via-slate-800 dark:to-slate-900
    shadow-md dark:shadow-lg
  "
      >
        {/* 背景アクセント */}
        <div
          className="
      absolute inset-0 opacity-20 dark:opacity-25
      bg-gradient-to-br from-pink-400/30 via-purple-400/20 to-sky-400/30
    "
        />

        <div className="relative flex items-center gap-5 p-5 sm:p-6">
          {/* アーティスト画像 */}
          {tracks[0].artist.imageUrl && (
            <img
              src={tracks[0].artist.imageUrl}
              alt={tracks[0].artist.name}
              className="
          w-20 h-20 sm:w-24 sm:h-24
          rounded-xl object-cover
          ring-1 ring-black/10 dark:ring-white/20
          shadow-sm
        "
            />
          )}

          {/* テキスト */}
          <div className="flex-1 space-y-2">
            <p className="text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400">
              Album
            </p>

            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 leading-tight">
              {albumName}
            </h1>

            {/* アーティストリンク */}
            <Link
              href={`/lyrixplorer/artists/${params.id}`}
              className="
          inline-flex items-center gap-2
          text-sm font-medium
          text-sky-700 dark:text-sky-300
          hover:text-sky-600 dark:hover:text-sky-200
          transition
        "
            >
              {/* モバイル用：ボタン感 */}
              <span
                className="
            inline-flex items-center gap-1
            px-2.5 py-1 rounded-full
            bg-sky-100 text-sky-700
            dark:bg-sky-500/20 dark:text-sky-300
            sm:bg-transparent sm:px-0 sm:py-0
          "
              >
                {tracks[0].artist.engName}
                <span className="text-xs opacity-70">→</span>
              </span>
            </Link>
          </div>
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
                  <img
                    src={`https://img.youtube.com/vi/${song.youtubeId}/mqdefault.jpg`}
                    alt={song.name}
                    className="absolute inset-0 w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
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
