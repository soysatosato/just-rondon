import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { ArrowRight, Landmark, Palette, Info } from "lucide-react";
import "swiper/css";
import { HeroSection } from "./HeroSection";
import Link from "next/link";
import Markdown from "react-markdown";
import { fetchTop10Museums } from "@/utils/actions/museums";
import MuseumCarousel from "./MuseumCarousel";

export default async function HowToEnjoyUKMuseums() {
  const museums = await fetchTop10Museums();
  return (
    <div className="space-y-20 px-6 py-20 max-w-6xl mx-auto bg-background text-foreground">
      <HeroSection />

      <section className="space-y-6">
        <h2 className="text-3xl font-semibold text-center">
          美術館の魅力とは？
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: Landmark,
              text: "多くの美術館が入場無料",
            },
            {
              icon: Info,
              text: "歴史ある建築そのものも見どころ",
            },
            {
              icon: Palette,
              text: "併設カフェやショップも楽しめる",
            },
          ].map(({ icon: Icon, text }, i) => (
            <Card key={i} className="shadow-md hover:shadow-lg transition">
              <CardContent className="p-6 text-center flex flex-col items-center space-y-4">
                <Icon className="h-10 w-10 text-primary" />
                <p className="text-lg font-medium">{text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-semibold text-center">楽しみ方ガイド</h2>
        <Tabs defaultValue="guide1" className="max-w-2xl mx-auto">
          <TabsList className="flex space-x-2 overflow-x-auto">
            <TabsTrigger value="guide1" className="min-w-[80px] text-center">
              時間帯
            </TabsTrigger>
            <TabsTrigger value="guide2" className="min-w-[100px] text-center">
              クリームティー
            </TabsTrigger>
            <TabsTrigger value="guide3" className="min-w-[100px] text-center">
              キュレーション
            </TabsTrigger>
          </TabsList>
          <TabsContent value="guide1" className="mt-4  text-muted-foreground">
            混みやすい人気作品や展示室は開館直後に訪れ、混雑前に鑑賞してしまうのがおすすめ。
            また、金曜日は夜間開館している美術館が多く、日中より空いていることが多いです。
          </TabsContent>
          <TabsContent value="guide2" className="mt-4 text-muted-foreground">
            <Markdown>
              ロンドンのミュージアム巡りの合間に、ぜひ体験してほしいのが**クリームティー**です。ミュージアム巡りは意外と体力を使いますので、鑑賞したあと、ミュージアム内のカフェで紅茶とスコーンを楽しむというのが、まさに理想的な午後の過ごし方です。
            </Markdown>
            <h1 className="mt-3 font-semibold">クリームティーとは？</h1>
            クリームティーは、紅茶とスコーン、クロテッドクリーム（濃厚なクリーム）、そしてジャムのセット。イギリス南西部のデボン州やコーンウォール州が発祥とされ、イギリス全土で愛されています。スコーンは外はサクサク、中はふんわり。クロテッドクリームの濃厚なコクと甘酸っぱいジャムが紅茶にぴったりマッチします。
          </TabsContent>
          <TabsContent value="guide3" className="mt-4 text-muted-foreground">
            <Markdown>
              多くの人は、絵や彫刻そのものを**見る**ために美術館を訪れる。
              しかし、展示の意図、その配置や照明、順番やキャプション、空間と文脈に目を向けると、まったく違う世界が立ち上があります。
            </Markdown>

            <div className="mt-4">
              <Markdown>
                例えば、大英博物館。
                ここでは**分類**と**網羅**がキュレーションの軸にあります。
                ロゼッタ・ストーン、アッシリアのレリーフ、アフリカの仮面、あらゆる文明が**国家**や**時代**で並べられています。まるで19世紀の**百科事典を歩く**ようです。
              </Markdown>
            </div>
          </TabsContent>
        </Tabs>
      </section>

      <MuseumCarousel museums={museums} />

      <section className="space-y-6">
        <h2 className="text-3xl font-semibold text-center text-foreground">
          現地Tips
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Alert className="bg-yellow-50 dark:bg-yellow-900 text-yellow-900 dark:text-yellow-200 border border-yellow-200 dark:border-yellow-700">
            <AlertTitle className="text-lg font-semibold">
              開館時間に注意
            </AlertTitle>
            <AlertDescription>
              曜日や祝日で時間が異なることがあるので、公式サイトで事前確認を。
            </AlertDescription>
          </Alert>

          <Alert className="bg-blue-50 dark:bg-blue-900 text-blue-900 dark:text-blue-200 border border-blue-200 dark:border-blue-700">
            <AlertTitle className="text-lg font-semibold">
              ロッカーの使い方
            </AlertTitle>
            <AlertDescription>
              大きな荷物はロッカーに預けるのが基本。コインが必要な場合も。
            </AlertDescription>
          </Alert>

          <Alert className="bg-green-50 dark:bg-green-900 text-green-900 dark:text-green-200 border border-green-200 dark:border-green-700">
            <AlertTitle className="text-lg font-semibold">
              お土産ショップ
            </AlertTitle>
            <AlertDescription>
              出口近くにあることが多く、限定アイテムは早めのチェックがおすすめ。
            </AlertDescription>
          </Alert>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-semibold text-center">よくある質問</h2>
        <Accordion type="single" collapsible className="max-w-2xl mx-auto">
          <AccordionItem value="q1">
            <AccordionTrigger>英語が苦手でも大丈夫？</AccordionTrigger>
            <AccordionContent>
              音声ガイドやパンフレットに日本語対応がある場合もあります。
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="q2">
            <AccordionTrigger>子ども連れでも楽しめる？</AccordionTrigger>
            <AccordionContent>
              キッズ向けエリアやワークショップがある美術館も多数あります。
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>

      <section className="text-center pt-12">
        <Button size="lg" className="text-base" asChild>
          <Link href="/museums/all-museums">
            ミュージアム一覧 <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </section>
    </div>
  );
}
