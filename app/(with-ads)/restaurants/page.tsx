import Link from "next/link";
import { ArrowRight } from "lucide-react";
import JsonLd from "@/components/seo/JsonLd";
import AdSenseUnit from "@/components/ads/AdSenseUnit";
import { AD_SLOTS } from "@/lib/adsense";
import Breadcrumbs from "@/components/navigation/Breadcrumbs";
import GuideFaq from "@/components/guides/GuideFaq";
import type { GuideFaqItem } from "@/components/guides/types";
import PhotoTile from "@/components/shared/PhotoTile";
import DishCard from "@/components/restaurants/DishCard";
import { SITE_URL, buildPageMetadata } from "@/lib/seo";
import { breadcrumbJsonLd, faqPageJsonLd } from "@/lib/jsonld";
import { fetchDishes } from "@/utils/actions/dishes";
import {
  RESTAURANT_BASE,
  RESTAURANT_SECTION_NAME,
  dishListJsonLd,
  dishPath,
} from "@/components/restaurants/meta";
import {
  restaurantGuidePath,
  restaurantGuides,
} from "@/components/restaurants/guides/guides";

/*
 * 料理別に店を選ぶハブ。
 *
 * 以前は「写真を左端の224pxに置いた横長カード」を10枚、1列で縦に積んでいた。
 * 料理から入るという構成そのものは正しいが、ページとしては次の問題があった。
 *
 *   - 10品すべてに写真があるのに、最も強い素材をサムネイル扱いしていた。
 *   - 冒頭の3段落(約400字)を読み終えるまで、写真が1枚も出なかった。
 *   - 「パブの作法」「絶対行くべき超人気店」が10品の後ろにいた。カウンター
 *     注文を知らないと最初の一杯にたどり着けない、と記事自身が書いている
 *     のに、料理を全部スクロールしないと届かなかった。
 *
 * そこで写真を主役に組み直した。上から順に、名前と一文 → 料理の写真 →
 * 店に入る前に読む2本 → 料理10品(写真を上に大きく) → なぜ料理から入るのか
 * → FAQ。前置きの3段落は消さず、一覧の後ろに畳んでいる。読者が「どれを
 * 食べるか」を決めた後なら、セクションの主張を読む理由ができる。
 */

const TITLE = "ロンドンのレストラン｜料理別に店を選ぶガイド";
const DESCRIPTION =
  "アフタヌーンティー、フィッシュ&チップス、サンデーロースト、イングリッシュ・ブレックファスト、インドカレー、パイ&マッシュ、ラーメン、日本食、中華。料理ごとにまとめ、それぞれどの店で食べるべきかを紹介します。予約の要否、価格帯、最寄り駅つき。";

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
    "ロンドン ラーメン",
    "ロンドン 日本食",
    "ロンドン 中華",
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
    question: "イギリス料理以外も載っているのはなぜですか？",
    answer:
      "**ロンドンの日常の食事が、イギリス料理だけではないからです。** インドカレーは英国で最も食べられている外食のひとつで、チャイナタウンの飲茶は戦後に香港からの移民が作った街の食事です。観光客向けの店ではなく、地元の人が普通に食べているものを落とすと、この街の食の実態から離れてしまいます。日本食とラーメンを入れているのは**滞在が長くなるほど必要になる**ためで、「日本の味が恋しい」ときの行き先は旅行者にも在住者にも役に立ちます。",
  },
  {
    question: "ロンドンで日本食は食べられますか？高くつきませんか？",
    answer:
      "**食べられますし、価格帯を選べば高くつきません。** うどんや定食の店なら£15〜25で、ロンドンの外食としてはむしろ手頃な部類です。[ラーメン](/restaurants/ramen)も£13〜20が標準で、日本の感覚では高いものの現地の物価では妥当な水準です。一方で江戸前のおまかせは£90を超え、サービス料が別途15%程度かかります。**同じ「日本食」でも別の世界**なので、目的に合わせて選んでください。自炊するなら[食材を安く買う店](/food/where-to-buy)もあわせてご覧ください。",
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

  /*
   * 見出しの直下に敷く写真の帯。displayOrder の先頭4品をそのまま使う。
   * 並び自体が編集上の順序(イギリス料理の定番から)なので、ここで別の
   * 基準を持ち込むと、下の一覧と順番が食い違って理由の説明がつかなくなる。
   */
  const bandTiles = dishes
    .filter((dish) => dish.image)
    .slice(0, 4)
    .map((dish) => ({
      href: dishPath(dish.slug),
      name: dish.name,
      engName: dish.engName,
      image: dish.image as string,
    }));

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:py-8">
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

      <Breadcrumbs path="/restaurants" />

      <header className="mt-6 max-w-3xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-sky-700 dark:text-sky-400">
          Eat &amp; Drink
        </p>
        <h1 className="mt-2 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
          ロンドンのレストラン
        </h1>
        <p className="mt-4 leading-relaxed text-gray-700 dark:text-gray-300">
          「イギリスの料理はまずい」という評判は、もう実態を表していません。ただし
          <strong className="font-semibold">当たり外れの幅は本当に大きい</strong>
          。だからこの特集は、店ではなく
          <strong className="font-semibold">料理から入ります</strong>。
        </p>
        <p className="mt-3 text-sm font-medium text-muted-foreground">
          {dishes.length}品・掲載{totalRestaurants}軒。それぞれ何を食べているのか、どう頼むのか、どこで食べるのか。
        </p>
      </header>

      {bandTiles.length > 0 && (
        <ul className="mt-7 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          {bandTiles.map((tile) => (
            <li key={tile.href} className="aspect-[3/2]">
              <PhotoTile item={tile} size="md" className="h-full w-full" />
            </li>
          ))}
        </ul>
      )}

      {/*
        店に入る前に読む記事。料理を選ぶより手前の話なので、一覧の後ろではなく
        前に置く。カウンター注文を知らないと、どの店を選んでも最初の一杯に
        たどり着けない。guides.ts の restaurantGuides から引くので、記事を
        足せばここにも自動で並ぶ。並び順もあちらに従う。
      */}
      <section className="mt-10">
        <h2 className="text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
          Before You Order ・ 店に入る前に
        </h2>
        <ul className="mt-3 grid gap-3 sm:grid-cols-2">
          {restaurantGuides.map((g) => (
            <li key={g.slug}>
              <Link
                href={restaurantGuidePath(g.slug)}
                className="group flex h-full flex-col rounded-xl border border-slate-200 p-5 transition hover:border-sky-400 hover:bg-sky-50/50 dark:border-slate-800 dark:hover:border-sky-500 dark:hover:bg-sky-950/20"
              >
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-sky-700 dark:text-sky-300">
                  {g.eyebrow}
                </span>
                <span className="mt-1.5 flex items-center gap-1 text-base font-bold">
                  {g.label}
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                </span>
                <span className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {g.blurb}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <AdSenseUnit slot={AD_SLOTS.listing} className="mt-10" />

      <section className="mt-12">
        <h2 className="text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
          By Dish ・ 料理から選ぶ
        </h2>
        <div className="mt-6 grid gap-x-8 gap-y-10 md:grid-cols-2">
          {dishes.map((dish) => (
            <DishCard key={dish.id} dish={dish} />
          ))}
        </div>
      </section>

      {/*
        かつて冒頭に置いていた3段落。イギリス料理以外を扱う理由をここで
        明示している。見出しだけ広げて中身の説明を変えないと、
        「イギリス料理を読みに来たのに中華がある」と映るため。
      */}
      <section className="mt-14 max-w-3xl border-t pt-8">
        <h2 className="text-xl font-bold tracking-tight">
          なぜ「料理から」入るのか
        </h2>
        <p className="mt-4 leading-relaxed text-gray-700 dark:text-gray-300">
          同じフィッシュ&チップスでも、店を選べば忘れられない一皿になり、選ばなければただの油っぽい揚げ物で終わります。「まずい」という評判の多くは、この選び方の差から来ています。店の名前を先に並べても、その差は埋まりません。
        </p>
        <p className="mt-4 leading-relaxed text-gray-700 dark:text-gray-300">
          そしてロンドンの外食は、イギリス料理だけではありません。
          <strong className="font-semibold">
            移民が持ち込んだ料理こそがこの街の日常
          </strong>
          で、インドカレーもチャイナタウンの飲茶も、観光客向けではなく地元の食事として根づいています。日本食も同じで、「日本の味が恋しくなったとき」に行ける店が揃っています。
        </p>
        <p className="mt-4 leading-relaxed text-gray-700 dark:text-gray-300">
          だからこの特集は、{dishes.length}品それぞれについて、何を食べているのか・どう頼むのか・どこで食べるのかをまとめています。掲載店は全
          {totalRestaurants}軒です。
        </p>
      </section>

      <GuideFaq items={FAQ} />

      <AdSenseUnit slot={AD_SLOTS.articleBottom} className="mt-10" />

      <section className="mt-12 max-w-3xl space-y-3 rounded-lg border border-slate-200 p-5 dark:border-slate-800">
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
