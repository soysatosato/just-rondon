import Link from "next/link";
import { ArrowRight } from "lucide-react";
import JsonLd from "@/components/seo/JsonLd";
import AdSenseUnit from "@/components/ads/AdSenseUnit";
import { AD_SLOTS } from "@/lib/adsense";
import BreadCrumbs from "@/components/home/BreadCrumbs";
import GuideFaq from "@/components/guides/GuideFaq";
import type { GuideFaqItem } from "@/components/guides/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ImageCredit from "@/components/shared/ImageCredit";
import { SITE_URL, buildPageMetadata } from "@/lib/seo";
import { breadcrumbJsonLd, faqPageJsonLd } from "@/lib/jsonld";
import { fetchDishes } from "@/utils/actions/dishes";
import {
  RESTAURANT_BASE,
  RESTAURANT_SECTION_NAME,
  dishListJsonLd,
  dishPath,
} from "@/components/restaurants/meta";

const TITLE = "ロンドンで食べるイギリス料理｜料理別に店を選ぶガイド";
const DESCRIPTION =
  "アフタヌーンティー、フィッシュ&チップス、サンデーロースト、イングリッシュ・ブレックファスト、インドカレー、パイ&マッシュ。イギリス料理を料理ごとにまとめ、それぞれどの店で食べるべきかを紹介します。予約の要否、価格帯、最寄り駅つき。";

export const metadata = buildPageMetadata({
  path: RESTAURANT_BASE,
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "ロンドン レストラン",
    "イギリス料理",
    "ロンドン グルメ",
    "ロンドン アフタヌーンティー",
    "ロンドン フィッシュアンドチップス",
    "サンデーロースト ロンドン",
    "イングリッシュブレックファスト",
    "ロンドン 名物料理",
  ],
});

const FAQ: GuideFaqItem[] = [
  {
    question: "イギリス料理はまずいと聞きますが、本当ですか？",
    answer:
      "**店を選べば問題ありません。** 「まずい」という評判の多くは、観光地の回転の悪い店や、素材を茹ですぎる時代の調理法に由来します。この20〜30年でロンドンの外食は大きく変わり、今は世界有数の食の街です。ただし**当たり外れの幅は依然として大きい**のも事実で、同じフィッシュ&チップスでも店によって別物になります。だからこそ料理ごとに店を決めてから行くのが有効です。",
  },
  {
    question: "予約は必要ですか？",
    answer:
      "料理によります。**アフタヌーンティーは数週間〜数か月前の予約が必要**で、思い立った日には入れません。日曜のサンデーローストも人気店は予約必須です。逆にフィッシュ&チップス、パイ&マッシュ、ベーグルは予約という概念がなく、並んで買うだけです。各料理のページに要否を書いています。",
  },
  {
    question: "チップはどれくらい払えばいいですか？",
    answer:
      "着席してサービスを受けるレストランでは **10〜15%** が目安です。ただし伝票に **service charge（サービス料）が最初から加算されている店が多く**、その場合は追加で払う必要はありません。伝票をよく見てください。パブでカウンターに注文しに行く形式や、テイクアウェイ、カフェではチップは不要です。",
  },
  {
    question: "ベジタリアン・ヴィーガンでも食べられますか？",
    answer:
      "**ロンドンは世界でもかなり対応が進んでいる都市です。** ほとんどの店にベジタリアンの選択肢があり、メニューに (v) や (ve) の表記が付いています。サンデーローストにも肉の代わりの nut roast を用意する店が多い。インド料理はもともと菜食の料理が豊富なので、選択肢の幅が最も広くなります。",
  },
  {
    question: "掲載されている店の営業時間や価格は最新ですか？",
    answer:
      "**営業時間・定休日・価格は変わります。** このページでは変わりにくいエリアと最寄り駅、そしておおよその価格帯だけを載せ、各店の公式サイトへのリンクを添えています。**行く前に必ず公式サイトで確認してください。** 特にパイ&マッシュ店のような老舗は夕方に閉まることが多く、日曜が休みの店もあります。",
  },
];

export default async function RestaurantsPage() {
  const dishes = await fetchDishes();
  const totalRestaurants = dishes.reduce(
    (n, d) => n + d.restaurants.length,
    0,
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 md:py-10">
      <JsonLd
        data={[
          breadcrumbJsonLd({
            name: RESTAURANT_SECTION_NAME,
            path: RESTAURANT_BASE,
          }),
          faqPageJsonLd(FAQ, `${SITE_URL}${RESTAURANT_BASE}`),
          dishListJsonLd(dishes),
        ]}
      />

      <BreadCrumbs name={RESTAURANT_SECTION_NAME} />

      <header className="mt-6 space-y-4">
        <h1 className="text-2xl font-bold leading-snug tracking-tight sm:text-3xl">
          ロンドンで食べるイギリス料理
        </h1>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300">
          「イギリスの料理はまずい」という評判は、もう実態を表していません。
          ただし
          <strong className="font-semibold">当たり外れの幅は本当に大きい</strong>
          。同じフィッシュ&チップスでも、店を選べば忘れられない一皿になり、
          選ばなければただの油っぽい揚げ物で終わります。
        </p>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300">
          そこでこの特集は、店ではなく
          <strong className="font-semibold">料理から入る</strong>
          構成にしました。{dishes.length}品それぞれについて、
          何を食べているのか・どう頼むのか・どこで食べるのかをまとめています。
          掲載店は全{totalRestaurants}軒です。
        </p>
      </header>

      <AdSenseUnit slot={AD_SLOTS.listing} className="mt-8" />

      <div className="mt-10 space-y-6">
        {dishes.map((dish) => (
          <Card
            key={dish.id}
            className="overflow-hidden border-slate-200 transition-shadow hover:shadow-md dark:border-slate-800"
          >
            <Link href={dishPath(dish.slug)} className="block sm:flex">
              {dish.image && (
                <div className="relative aspect-[16/9] w-full flex-none sm:aspect-auto sm:w-56">
                  <img
                    src={dish.image}
                    alt={dish.name}
                    className="absolute inset-0 h-full w-full object-cover"
                    loading="lazy"
                    decoding="async"
                    fetchPriority="low"
                  />
                </div>
              )}

              <CardContent className="flex-1 space-y-3 p-5">
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                  <h2 className="text-lg font-bold">{dish.name}</h2>
                  <span className="text-xs italic text-muted-foreground">
                    {dish.engName}
                  </span>
                </div>

                <p className="text-sm font-medium text-sky-800 dark:text-sky-300">
                  {dish.tagline}
                </p>

                <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                  {dish.summary}
                </p>

                <div className="flex flex-wrap gap-1.5">
                  {dish.priceRange && (
                    <Badge variant="secondary" className="font-normal">
                      {dish.priceRange}
                    </Badge>
                  )}
                  {dish.bestTime && (
                    <Badge variant="secondary" className="font-normal">
                      {dish.bestTime}
                    </Badge>
                  )}
                  <Badge variant="secondary" className="font-normal">
                    店 {dish.restaurants.length}軒
                  </Badge>
                </div>

                <p className="flex items-center gap-1 text-sm font-semibold text-sky-700 dark:text-sky-300">
                  {dish.name}の店を見る
                  <ArrowRight className="h-4 w-4" />
                </p>
              </CardContent>
            </Link>

            {dish.image && (
              <div className="px-5 pb-3">
                <ImageCredit
                  source={dish.imageSource}
                  credit={dish.imageCredit}
                  link={dish.imageLink}
                />
              </div>
            )}
          </Card>
        ))}
      </div>

      {/*
        店に入る前に読む記事。料理を選ぶより手前の話なので、
        「あわせて読みたい」の一覧ではなくカードで独立させている。
        カウンター注文を知らないと、どの店を選んでも最初の一杯に
        たどり着けないため。
      */}
      <Link href="/restaurants/pub-etiquette" className="mt-12 block">
        <Card className="border-slate-200 transition hover:border-sky-400 dark:border-slate-800 dark:hover:border-sky-500">
          <CardContent className="p-5">
            <span className="block text-xs font-semibold text-sky-700 dark:text-sky-300">
              Pub Etiquette
            </span>
            <span className="mt-1 block text-base font-semibold">
              パブの作法｜カウンターで注文する、席で待たない
            </span>
            <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">
              イギリスのパブでは、席に着いても誰も注文を取りに来ません。
              入店から会計までの流れ、パイントの頼み方、ラウンド制、
              チップの要不要までまとめました。
            </span>
          </CardContent>
        </Card>
      </Link>

      <GuideFaq items={FAQ} />

      <AdSenseUnit slot={AD_SLOTS.articleBottom} className="mt-10" />

      <section className="mt-12 space-y-3 rounded-lg border border-slate-200 p-5 dark:border-slate-800">
        <h2 className="text-lg font-semibold">あわせて読みたい</h2>
        <ul className="space-y-2 text-sm">
          <li>
            <Link
              href="/souvenirs"
              className="text-sky-700 hover:underline dark:text-sky-300"
            >
              ロンドンのお土産｜本当に喜ばれる定番
            </Link>
          </li>
          <li>
            <Link
              href="/sightseeing/itinerary"
              className="text-sky-700 hover:underline dark:text-sky-300"
            >
              ロンドン モデルコース（1〜5日）
            </Link>
          </li>
          <li>
            <Link
              href="/sightseeing/travel-tips"
              className="text-sky-700 hover:underline dark:text-sky-300"
            >
              ロンドン旅行の実用メモ
            </Link>
          </li>
        </ul>
      </section>
    </div>
  );
}
