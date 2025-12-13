import { Skeleton } from "@/components/ui/skeleton";
import dynamic from "next/dynamic";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import {
  fetchMusicalDetails,
  fetchMusicalIdandName,
} from "@/utils/actions/musicals";
import MusicalSceneDescription from "@/components/musicals/MusicalSceneDescription";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import MusicalInfo from "@/components/musicals/MusicalInfo";
import BreadCrumbs from "@/components/home/BreadCrumbs";
import Link from "next/link";

// dynamic 関数を使ってコンポーネントを、遅延読み込み（Dynamic Import）する
const DynamicMap = dynamic(() => import("@/components/museums/PropertyMap"), {
  ssr: false,
  loading: () => <Skeleton className=" h-[400px] w-full" />,
});
// const DynamicBookingWrapper = dynamic(
//   () => import("@/components/bookings/BookingWrapper"),
//   { ssr: false, loading: () => <Skeleton className=" h-[200px] w-full" /> }
// );

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const musical = await fetchMusicalIdandName(params.slug);

  // if (!musical) {
  //   return {
  //     title: "美術館情報が見つかりません",
  //     description: "指定された美術館の情報が見つかりませんでした。",
  //   };
  // }

  return {
    title: `${musical?.name}・${musical?.engName}｜ロンドン観光・ミュージカルガイド`,
    description: `${musical?.name}|${musical?.engName}・ミュージカルの見どころ、アクセス、あらすじ、歌などを紹介。ロンドン観光で絶対に訪れたいミュージカルの情報・これだけは観るべき必見作品をわかりやすくガイドします。`,
    openGraph: {
      type: "article",
      url: `https://www.just-rondon.com/musicals/${params.slug}`,
      title: `${musical?.name}・${musical?.engName}｜ロンドン観光・ミュージカルガイド`,
      description: `${musical?.name}|${musical?.engName}・ミュージカルの見どころ、アクセス、あらすじ、歌などを紹介。`,
      siteName: "ロンドん！",
    },
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      canonical: `https://www.just-rondon.com/musicals/${params.slug}`,
    },
  };
}

export default async function musicalDetailsPage({
  params,
}: {
  params: { slug: string };
}) {
  const musical = await fetchMusicalDetails(params.slug);
  if (!musical) redirect("/");

  return (
    <div>
      <BreadCrumbs
        name="ミュージカル"
        link="musicals"
        name2={
          musical.name.length > 7
            ? musical.name.slice(0, 7) + "..."
            : musical.name
        }
      />
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="relative h-96 mb-2 rounded-xl overflow-hidden shadow-lg">
          <img
            src={musical.image}
            alt={musical.name}
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
            decoding="async"
          />

          <div className="absolute inset-0 bg-black/40 flex flex-col justify-end p-6">
            <h2 className="text-base sm:text-lg md:text-xl font-medium text-gray-200 mb-1">
              {musical.engName}
            </h2>
            <h1 className="text-xl sm:text-2xl md:text-4xl font-extrabold text-white">
              {musical.name}
            </h1>
            <p className="text-gray-300 mt-2">{musical.tagline}</p>
          </div>
        </div>
        <div className="mb-12">
          <div className="flex justify-between items-start mb-3">
            {/* ハイライト部分 */}
            <div className="flex-1 flex flex-wrap gap-2">
              {musical.highlights.map((item, index) => (
                <Badge key={index} variant="secondary">
                  {item}
                </Badge>
              ))}
            </div>

            {/* リンク部分 */}
            <Link
              href={
                musical.songs.length > 1
                  ? `/musicals/${musical.slug}/songs`
                  : "#"
              }
              className={`
      ml-2 inline-block px-4 py-2 font-bold rounded-lg text-sm shadow-lg transition
      ${
        musical.songs.length > 1
          ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
          : "bg-gray-400 text-gray-200 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400"
      }
    `}
              aria-disabled={musical.songs.length < 1} // アクセシビリティ対応
            >
              曲一覧へ
            </Link>
          </div>

          <p className="text-gray-400 italic">{musical.blurb}</p>
        </div>

        <MusicalInfo
          isOnShow={musical.isOnShow}
          mustSee={musical.mustSee}
          original={musical.original}
          recommendLevel={musical.recommendLevel}
          website={musical.website}
        />
        <MusicalSceneDescription
          name={musical.name}
          description={musical.description}
        />

        <div className="my-8 space-y-2">
          <h2 className="text-xl md:text-2xl font-semibold">劇場情報</h2>
          <Card>
            <CardContent className="space-y-1">
              <CardHeader>
                <CardTitle>{musical.theatreName}</CardTitle>
                <CardDescription>{musical.address}</CardDescription>
              </CardHeader>
              <DynamicMap lat={musical.lat} lng={musical.lng} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
