import ArtworkBrowser, {
  type BrowsableArtwork,
} from "@/components/artworks/ArtworkBrowser";
import { buildPageMetadata } from "@/lib/seo";
import ArtworksIntro from "@/components/artworks/ArtworksIntro";
import Breadcrumbs from "@/components/navigation/Breadcrumbs";
import JsonLd from "@/components/seo/JsonLd";
import { breadcrumbListJsonLd } from "@/components/navigation/tree";
import { fetchArtworks, fetchMuseumIDandName } from "@/utils/actions/museums";
import { Metadata } from "next";
import { notFound } from "next/navigation";

type ArtworkRow = Awaited<ReturnType<typeof fetchArtworks>>[number];

// 展示室名を「基準名 + 部屋番号」に分解する。"Room 9" が "Room 10" より後ろに
// 来ないよう、番号は文字列ではなく数値で比べる。
const roomSortKey = (room: string): [string, number, string] => {
  const withBase = room.match(/^(.+?)\s*\(Room\s*(\d+)(\w*)\)$/i);
  if (withBase) return [withBase[1], parseInt(withBase[2], 10), withBase[3]];

  const plain = room.match(/^Room\s*(\d+)(\w*)$/i);
  if (plain) return ["Room", parseInt(plain[1], 10), plain[2]];

  return [room, 0, ""];
};

const compareRooms = (a: string, b: string) => {
  const [aName, aNum, aSuffix] = roomSortKey(a);
  const [bName, bNum, bSuffix] = roomSortKey(b);
  return (
    aName.localeCompare(bName) || aNum - bNum || aSuffix.localeCompare(bSuffix)
  );
};

// 同じ部屋の中では、必見 → おすすめ度の高い順に並べる。
const compareArtworks = (a: ArtworkRow, b: ArtworkRow) =>
  Number(b.mustSee) - Number(a.mustSee) ||
  b.recommendLevel - a.recommendLevel ||
  a.title.localeCompare(b.title, "ja");

// カードでは1行のリード文として出すだけなので、マークダウン記法は落とす。
const toPlainText = (text: string) =>
  text
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[*_`]/g, "")
    .trim();

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const museum = await fetchMuseumIDandName(params.slug);

  return buildPageMetadata({
    path: `/museums/${params.slug}/artworks`,
    title: `${museum?.name}の主要作品一覧`,
    description: `${museum?.name}の主要作品を解説。ロンドン観光で絶対に見たい美術館・注目作品、必見作品の情報をわかりやすくガイドします。`,
  });
}

export default async function ArtworksPage({
  params,
}: {
  params: { slug: string };
}) {
  const museum = await fetchMuseumIDandName(params.slug);
  if (!museum) notFound();
  const artworks = await fetchArtworks(museum.id);
  if (!artworks || artworks.length === 0) notFound();

  const sorted = [...artworks].sort(
    (a, b) =>
      compareRooms(a.room ?? "Unknown Room", b.room ?? "Unknown Room") ||
      compareArtworks(a, b),
  );

  // 本文(description)や2件目以降のハイライトは一覧では使わないので payload に載せない
  const items: BrowsableArtwork[] = sorted.map((art) => ({
    id: art.id,
    title: art.title,
    engTitle: art.engTitle,
    artist: art.artist,
    year: art.year,
    room: art.room ?? "Unknown Room",
    image: art.image,
    mustSee: art.mustSee,
    recommendLevel: art.recommendLevel,
    highlight: art.highlights[0] ? toPlainText(art.highlights[0]) : null,
  }));

  const rooms = Array.from(new Set(items.map((a) => a.room)));

  return (
    <div className="mx-auto max-w-5xl px-4 py-4 text-foreground">
      <JsonLd
        data={breadcrumbListJsonLd({
          path: "/museums",
          trail: [{ label: museum.name, href: `/museums/${params.slug}` }],
          current: "コレクション",
          currentHref: `/museums/${params.slug}/artworks`,
        })}
      />

      <div className="mb-6">
        <Breadcrumbs
          path="/museums"
          trail={[{ label: museum.name, href: `/museums/${params.slug}` }]}
          current="コレクション"
        />
      </div>

      <ArtworksIntro
        museumName={museum.name}
        total={items.length}
        mustSeeCount={items.filter((a) => a.mustSee).length}
        roomCount={rooms.length}
      />

      <ArtworkBrowser slug={params.slug} artworks={items} rooms={rooms} />
    </div>
  );
}
