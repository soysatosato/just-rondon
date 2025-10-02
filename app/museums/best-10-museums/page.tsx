// app/museums/page.tsx
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { FaMapMarkerAlt, FaMoneyBillWave } from "react-icons/fa";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { fetchTop10Museums } from "@/utils/actions/museums";
import Link from "next/link";
import { FaGlobe } from "react-icons/fa";
import MuseumBreadCrumbs from "@/components/museums/BreadCrumbs";

export const metadata = {
  title: "ロンドンの絶対行くべき美術館10選 | ロンドん!!",
  description:
    "ロンドン観光で絶対行くべき美術館10館を厳選紹介！ナショナルギャラリーやテートモダン、ヴィクトリア＆アルバート美術館など、無料・話題の展示情報も網羅。見どころ、アクセス、最新展覧会まで初心者でも安心して楽しめる完全ガイド。",
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://www.just-rondon.com/museums/best-10-museums",
  },
};

export default async function MuseumsPage() {
  const museums = await fetchTop10Museums();
  return (
    <div className="max-w-7xl mx-auto px-3 space-y-8 bg-gradient-to-b from-background via-secondary to-background text-foreground">
      <div>
        <MuseumBreadCrumbs name="美術館ナビ" link2="" name2="ベスト10" />
      </div>
      <div className="space-y-4">
        <div className="bg-indigo-600 text-white py-20 text-center">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            ミュージアムTOP10特集
          </h1>
          <p className="">ロンドンで絶対に行きたい10のミュージアムを紹介！</p>
        </div>
        <p className="text-muted-foreground">
          ロンドンは、世界初の国立公立博物館を擁する街であり、長い歴史を通して文化の発信地としての地位を築いてきました。大英博物館やテート・モダンのような世界的な美術館が揃い、古代遺物から現代アートまで、幅広いコレクションを通して都市の豊かな文化を体感できます。
        </p>
        <p className="text-muted-foreground">
          以下は選りすぐりのトップ10(順不同)のリストです。これらを訪れれば、きっとロンドンを巡る旅は一生の思い出になること間違いなしです。
        </p>
      </div>

      {/* タブ + リスト / カード表示 */}
      <Tabs defaultValue="grid" className="space-y-4">
        <TabsList className="justify-center">
          <TabsTrigger value="list">リスト表示</TabsTrigger>
          <TabsTrigger value="grid">カード表示</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <Accordion type="single" collapsible>
            {museums.map((museum, idx) => (
              <AccordionItem key={idx} value={museum.name}>
                <AccordionTrigger>{`${idx + 1}. ${
                  museum.name
                }`}</AccordionTrigger>
                <AccordionContent>
                  <p className="whitespace-pre-line">{museum.summary}</p>

                  <Link
                    href={`/museums/${museum.slug}`}
                    target="_blank"
                    className="text-blue-600 hover:underline mt-2 inline-block"
                  >
                    Find out more
                  </Link>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </TabsContent>

        <TabsContent value="grid">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
            {museums.map((museum, idx) => (
              <Card
                key={idx}
                className="max-w-sm w-full shadow-lg hover:shadow-2xl transition-shadow duration-300 border border-border bg-card text-card-foreground"
              >
                <div className="flex justify-between items-center px-4 pt-4">
                  <div className="text-lg font-bold text-foreground">
                    {idx + 1}. {museum.name}
                  </div>
                  {museum.price === 0 && (
                    <span className="bg-destructive text-destructive-foreground text-sm font-bold px-3 py-1 rounded-full">
                      Free
                    </span>
                  )}
                </div>

                <div className="relative w-full h-64 mt-2">
                  <Image
                    src={museum.image}
                    alt={museum.name}
                    fill
                    className="object-cover"
                  />
                </div>

                <Separator />

                <CardContent className="space-y-2 mt-6">
                  <h2 className="text-xl font-bold text-foreground">
                    {museum.name}
                  </h2>
                  <p className="text-muted-foreground whitespace-pre-line">
                    {museum.summary}
                  </p>

                  <Separator />

                  <div className="text-muted-foreground text-sm mt-2">
                    <div className="flex items-center gap-1 mt-2">
                      <FaMapMarkerAlt className="text-accent-foreground" />
                      <span>{museum.address}</span>
                    </div>
                    <div className="flex items-center gap-1 mt-2">
                      <FaMoneyBillWave className="text-accent-foreground" />
                      <span>
                        {museum.price === 0 ? "無料" : `£${museum.price}`}
                      </span>
                    </div>

                    {museum.website && (
                      <div className="flex items-center gap-1 mt-2">
                        <Link
                          href={museum.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-primary hover:underline text-sm"
                        >
                          <FaGlobe /> 公式サイト
                        </Link>
                      </div>
                    )}
                  </div>
                </CardContent>

                <CardFooter>
                  <Button
                    asChild
                    className="bg-primary text-primary-foreground"
                  >
                    <Link href={`/museums/${museum.slug}`}>Find out more</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
