import Link from "next/link";
import { buildPageMetadata } from "@/lib/seo";
import Image from "next/image";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { fetchMustSeeAttractions } from "@/utils/actions/attractions";

export const metadata = buildPageMetadata({
  path: "/sightseeing/must-see",
  title: "絶対に外せないロンドン観光スポット特集 | 初めての旅行におすすめ名所ガイド | ジャスト・ロンドン",
  titleSuffix: false,
  description: "ロンドン観光の定番スポットを厳選して紹介。ビッグ・ベン、タワーブリッジ、バッキンガム宮殿、ロンドン塔、ウェストミンスター寺院、自然史博物館など、初めてのロンドン旅行で絶対に外せない見どころをまとめた完全ガイド。",
  keywords: [
    "ロンドン",
    "ロンドン観光",
    "ロンドン 観光スポット",
    "ロンドン 観光名所",
    "ロンドン旅行",
    "おすすめ",
    "定番スポット",
    "ロンドン観光地",
    "王道ルート",
  ],
});

export default async function MustSeePage() {
  const attractions = await fetchMustSeeAttractions();

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-4">Must-See Attractions</h1>
      <p className="text-base text-muted-foreground mb-4">
        ロンドンを訪れるなら絶対に見ておきたいスポットをまとめています。
        一生に一度は見ておきたい、王道中の王道の &quot;MUST SEE&quot; です。
      </p>
      <p className="text-sm text-muted-foreground mb-8">
        これらをどの順番で、何日かけて回るかは
        <Link
          href="/sightseeing/itinerary"
          className="mx-1 font-medium text-blue-600 dark:text-blue-400 hover:underline"
        >
          ロンドン モデルコース（1〜5日）
        </Link>
        にまとめています。
      </p>

      <div className="grid gap-8">
        {attractions.map((a) => (
          <Card key={a.id} className="overflow-hidden">
            <CardHeader>
              <CardTitle className="text-base flex flex-wrap items-center gap-1">
                <span className="whitespace-nowrap">{a.name}</span>
                <Badge
                  variant="secondary"
                  className="whitespace-nowrap flex-none"
                >
                  {a.engName}
                </Badge>
              </CardTitle>

              <CardDescription className="text-sm italic">
                {a.tagline}
              </CardDescription>
            </CardHeader>

            <CardContent>
              <AspectRatio
                ratio={16 / 9}
                className="rounded-md overflow-hidden"
              >
                <img
                  src={a.image}
                  alt={a.name}
                  className="absolute inset-0 w-full h-full object-cover"
                  loading="lazy"
                  decoding="async"
                  fetchPriority="low"
                />
              </AspectRatio>

              {a.summary && (
                <p className="mt-4 text-gray-700 dark:text-neutral-300">
                  {a.summary}
                </p>
              )}

              <div className="mt-4">
                <Button asChild variant="outline">
                  <Link href={`/sightseeing/${a.slug}`}>詳細を表示</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
