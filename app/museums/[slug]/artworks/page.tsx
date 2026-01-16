import ArtworksAccordion from "@/components/artworks/ArtworksAccordion";
import ArtworksIntro from "@/components/artworks/ArtworksIntro";
import RainCanvas from "@/components/home/RainParticles";
import MuseumBreadCrumbs from "@/components/museums/BreadCrumbs";
import { fetchArtworks, fetchMuseumIDandName } from "@/utils/actions/museums";
import { Metadata } from "next";
import { redirect } from "next/navigation";

// ---------- Roomごとに分類 ----------
const groupByRoom = (items: any[]) => {
  const roomsMap: Record<string, any[]> = {};

  items.forEach((art) => {
    const room = art.room || "Unknown Room";

    // baseRoom と数字部分を抽出
    let match = room.match(/^(.+?)\s*\(Room\s*(\d+\w*)\)$/i);
    let baseRoom: string, roomNum: string;
    if (match) {
      baseRoom = match[1];
      roomNum = match[2];
    } else if (/^Room\s*\d+/i.test(room)) {
      // 単純な Room X
      match = room.match(/^Room\s*(\d+\w*)/i);
      baseRoom = "Room";
      roomNum = match ? match[1] : "";
    } else {
      // それ以外は文字列として
      baseRoom = room;
      roomNum = "";
    }

    const key = `${baseRoom}___${roomNum}`;
    if (!roomsMap[key]) roomsMap[key] = [];
    roomsMap[key].push(art);
  });

  // ソート済みキーを作る
  const sortedKeys = Object.keys(roomsMap).sort((a, b) => {
    const [aName, aNum] = a.split("___");
    const [bName, bNum] = b.split("___");

    if (aName !== bName) return aName.localeCompare(bName);

    // 数字部分で自然順ソート
    const numA = parseInt(aNum.match(/\d+/)?.[0] || "0", 10);
    const numB = parseInt(bNum.match(/\d+/)?.[0] || "0", 10);
    if (numA !== numB) return numA - numB;

    // サフィックスがあれば文字順
    const suffixA = aNum.replace(/\d+/, "");
    const suffixB = bNum.replace(/\d+/, "");
    return suffixA.localeCompare(suffixB);
  });

  // 表示用 Record に変換
  const sortedRooms: Record<string, any[]> = {};
  sortedKeys.forEach((key) => {
    const artworks = roomsMap[key];
    const roomName = artworks[0].room || "Unknown Room";
    sortedRooms[roomName] = artworks;
  });

  return sortedRooms;
};

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const museum = await fetchMuseumIDandName(params.slug);

  return {
    title: `${museum?.name}の主要作品一覧 | ジャスト・ロンドン`,
    description: `${museum?.name}の主要作品を解説。ロンドン観光で絶対に見たい美術館・注目作品、必見作品の情報をわかりやすくガイドします。`,
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      canonical: `https://www.just-rondon.com/museums/${params.slug}/artworks`,
    },
  };
}
export default async function ArtworksPage({
  params,
}: {
  params: { slug: string };
}) {
  const museum = await fetchMuseumIDandName(params.slug);
  if (!museum) redirect("/museums");
  const artworks = await fetchArtworks(museum.id);
  if (!artworks || artworks.length === 0) redirect("/museums");
  const rooms = groupByRoom(artworks);

  return (
    <div className="px-12 bg-background text-foreground min-h-screen">
      <div className="fixed inset-0 z-[9999] pointer-events-none">
        <RainCanvas />
      </div>
      <div className="py-4 mb-6">
        <MuseumBreadCrumbs
          name={museum.name}
          link2={params.slug}
          name2="コレクション"
        />
      </div>
      <ArtworksIntro museumName={museum.name} />
      <ArtworksAccordion rooms={rooms} slug={params.slug} />
    </div>
  );
}
