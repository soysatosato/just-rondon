import Link from "next/link";
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

export const metadata = {
  title:
    "絶対に外せないロンドン観光スポット特集 | 初めての旅行におすすめ名所ガイド | ロンドん！",
  description:
    "ロンドン観光の定番スポットを厳選して紹介。ビッグ・ベン、タワーブリッジ、バッキンガム宮殿、ロンドン塔、ウェストミンスター寺院、自然史博物館など、初めてのロンドン旅行で絶対に外せない見どころをまとめた完全ガイド。",
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
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://www.just-rondon.com/sightseeing/must-see",
  },
  openGraph: {
    title: "絶対に外せないロンドン観光スポット特集 | 名所・王道ルートまとめ",
    description:
      "ロンドンを訪れるなら絶対に押さえておきたい観光スポットを総まとめ。タワーブリッジ、ビッグ・ベン、ロンドン塔、自然史博物館など、ロンドンの魅力を網羅した決定版ガイド。",
    url: "https://www.just-rondon.com/sightseeing/must-see",
    siteName: "ロンドん！ | ロンドン観光特集",
    locale: "ja_JP",
    type: "website",
  },
};

export default async function MustSeePage() {
  const attractions = await fetchMustSeeAttractions();

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-4">Must-See Attractions</h1>
      <p className="text-base text-muted-foreground mb-8">
        ロンドンを訪れるなら絶対に見ておきたいスポットをまとめています。
        一生に一度は見ておきたい、王道中の王道の &quot;MUST SEE&quot; です。
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
