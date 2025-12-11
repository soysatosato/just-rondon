import ArtistPageClient from "@/components/lyrix/ArtistPageClient";
import { Button } from "@/components/ui/button";
import { fetchArtistDetails, fetchSortedLyrics } from "@/utils/actions/lyrics";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

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
      url: `https://www.just-rondon.com/lyrixplorer/artists/${params.id}`,
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

function safeParam<T extends readonly string[]>(
  value: string | undefined,
  allowed: T,
  fallback: T[number]
): T[number] {
  return allowed.includes(value as any) ? (value as T[number]) : fallback;
}

export default async function ArtistPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { sortBy?: string; sortOrder?: string };
}) {
  const sortBy = safeParam(
    searchParams.sortBy,
    ["album", "name", "year", "views"] as const,
    "album"
  );

  const sortOrder = safeParam(
    searchParams.sortOrder,
    ["asc", "desc"] as const,
    "desc"
  );

  const artist = await fetchArtistDetails(params.id);
  if (!artist) {
    notFound();
  }

  const data = await fetchSortedLyrics(params.id, sortBy, sortOrder);

  return (
    <>
      <ArtistPageClient artist={artist} data={data} />
      <div>
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
