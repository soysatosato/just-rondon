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
import { fetchKidsMuseums } from "@/utils/actions/museums";
import Link from "next/link";
import { FaGlobe } from "react-icons/fa";
import MuseumBreadCrumbs from "@/components/museums/BreadCrumbs";

export const metadata = {
  title:
    "キッズ向けロンドン美術館おすすめセレクション＆家族で楽しむ無料・話題の展示ガイド",
  description:
    "ロンドン観光で子どもと一緒に楽しめるキッズ向け美術館のおすすめセレクションを紹介！テート・モダン、ヴィクトリア＆アルバート美術館など、家族で楽しめる無料・話題の展示情報やアクセス、体験型イベントまでわかりやすくガイドします。",
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://www.just-rondon.com/museums/best-museums-for-kids",
  },
};

export default async function MuseumsPage() {
  const museums = await fetchKidsMuseums();
  return (
    <div className="max-w-7xl mx-auto p-3 space-y-8">
      <div>
        <MuseumBreadCrumbs
          name="美術館ナビ"
          link2=""
          name2="キッズ向け美術館"
        />
      </div>
      <div className="space-y-4">
        <div className="bg-indigo-600 text-white py-20 text-center">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            家族で楽しめる美術館特集
          </h1>
          <p className="">子供と一緒に楽しめる美術館を紹介！</p>
        </div>
        <p className="text-muted-foreground">
          ロンドンには、子どもも大人も楽しめる美術館がたくさんあります。
          実際に触れて体験できる展示や、ワークショップが充実している場所もあり、家族で一日中楽しめます。
        </p>
        <p className="text-muted-foreground">
          このページでは、特に家族連れにおすすめの美術館を厳選して紹介します。
          週末のお出かけや小旅行の計画にぴったりのスポットばかり。
          「子どもが喜ぶかな？」「大人も楽しめるかな？」と迷ったときは、ここで紹介する美術館をチェックすれば安心です。
          さあ、家族で一緒に忘れられない文化体験の旅に出かけましょう！
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
                <AccordionTrigger className="text-foreground">
                  {`${idx + 1}. ${museum.name}`}
                </AccordionTrigger>

                <AccordionContent className="flex flex-col gap-3">
                  {museum.blurb && (
                    <div className="flex items-start gap-2 border-l-4 border-primary bg-primary/20 p-3 rounded-md italic text-muted-foreground group hover:bg-primary/30 transition">
                      <p>{museum.blurb}</p>
                    </div>
                  )}

                  {museum.summary && (
                    <p className="whitespace-pre-line text-muted-foreground">
                      {museum.summary}
                    </p>
                  )}

                  <div className="mt-2 flex gap-2 flex-wrap">
                    <Link
                      href={`/museums/${museum.slug}`}
                      target="_blank"
                      className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/80 transition"
                    >
                      詳細を見る
                    </Link>

                    <Link
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        museum.name + " " + museum.address + " London"
                      )}`}
                      target="_blank"
                      className="px-4 py-2 rounded-lg border border-border text-foreground hover:bg-muted transition"
                    >
                      地図で見る
                    </Link>
                  </div>
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
                      <FaMapMarkerAlt className="text-accent-foreground flex-shrink-0" />
                      <span className="truncate block">{museum.address}</span>
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
                    <Link href={`/museums/${museum.slug}`}>詳細を見る</Link>
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
