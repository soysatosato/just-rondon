import Link from "next/link";
import JsonLd from "@/components/seo/JsonLd";
import AdSenseUnit from "@/components/ads/AdSenseUnit";
import { AD_SLOTS } from "@/lib/adsense";
import Breadcrumbs from "@/components/navigation/Breadcrumbs";
import GuideFaq from "@/components/guides/GuideFaq";
import type { GuideFaqItem } from "@/components/guides/types";
import { Card, CardContent } from "@/components/ui/card";
import { SITE_URL, buildPageMetadata } from "@/lib/seo";
import { breadcrumbJsonLd, faqPageJsonLd } from "@/lib/jsonld";
import {
  SHOPPING_BASE,
  SHOPPING_CATEGORY_BLURBS,
  SHOPPING_CATEGORY_LABELS,
  SHOPPING_CATEGORY_ORDER,
  SHOPPING_SECTION_NAME,
  shoppingGuidePath,
  shoppingGuidesByCategory,
  shoppingHubCollectionJsonLd,
} from "@/components/shopping/guides";

const TITLE = "ロンドンの買い物ガイド｜どこで、いつ、何を買うか";
const DESCRIPTION =
  "ロンドンで買い物をするための実務をまとめました。曜日で中身が変わるマーケット、建物そのものが見どころのデパート、そして2021年に廃止された免税制度。何を買うか（ブランド・お土産）と、どこで買うかの両方から探せます。";

export const metadata = buildPageMetadata({
  path: SHOPPING_BASE,
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "ロンドン 買い物",
    "ロンドン ショッピング",
    "ロンドン マーケット",
    "ロンドン デパート",
    "イギリス 免税",
    "ロンドン 買い物 おすすめ",
  ],
});

/**
 * 「何を買うか」を扱う既存セクションへの導線。
 *
 * このハブは意図的に場所と制度だけを扱い、品目は /brands と /souvenirs に
 * 任せている。読者にとっては地続きなので、入口だけはここに置く。
 */
const WHAT_TO_BUY: { href: string; label: string; blurb: string }[] = [
  {
    href: "/souvenirs",
    label: "ロンドンのお土産",
    blurb:
      "紅茶、お菓子、コスメ、雑貨。渡す相手ごとの向き不向きと、持ち帰るときの注意まで品目別にまとめています。",
  },
  {
    href: "/brands",
    label: "イギリスのブランド",
    blurb:
      "バーバリー、バブアー、ドクターマーチン、ウェッジウッド。成り立ちと、ロンドンのどこで買えるかを会社ごとに紹介します。",
  },
];

const FAQ: GuideFaqItem[] = [
  {
    question: "ロンドンで買い物をするなら何曜日がいいですか？",
    answer:
      "**行き先によって変わります。** マーケットは曜日で中身が入れ替わり、コロンビア・ロードの花市場は日曜の午前中しか立ちません。一方でデパートは**日曜だけ法律で6時間しか営業できない**ため、日曜午前は選択肢から外れます。つまり「日曜の午前は市場、午後はデパート」が最も無駄がありません。",
  },
  {
    question: "免税（VAT還付）は受けられますか？",
    answer:
      "**受けられません。** イギリスは2021年1月に旅行者向けの還付制度を廃止しました。空港で書類にスタンプをもらって20%戻る、という手続きは存在しません。ただし保安検査後の免税店（Duty Free）は別物で、従来どおり営業しています。",
  },
  {
    question: "一番安く買えるのはどこですか？",
    answer:
      "食品と日用品は**街のスーパー**が最も安く、Tesco や Sainsbury's なら土産物店より確実に下回ります。空港は品揃えが良い代わりに割高です。ブランド品は年2回のセール期（6月下旬〜7月と12月26日から）が本番で、この時期は平常時と価格が大きく変わります。",
  },
  {
    question: "スーツケースに入りきらないときはどうすればいいですか？",
    answer:
      "店から日本の住所へ直送してもらう方法がありますが、**国際送料と日本側の消費税・関税がかかる**ため、必ず得になるとは限りません。現実的には、現地で安い折りたたみバッグを買って預け荷物を1つ増やすほうが安く済むことが多い。航空会社の追加手荷物料金と比べて判断してください。",
  },
];

export default function ShoppingHubPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 md:py-10">
      <JsonLd
        data={[
          breadcrumbJsonLd({
            name: SHOPPING_SECTION_NAME,
            path: SHOPPING_BASE,
          }),
          faqPageJsonLd(FAQ, `${SITE_URL}${SHOPPING_BASE}`),
          shoppingHubCollectionJsonLd({
            name: TITLE,
            description: DESCRIPTION,
          }),
        ]}
      />

      <Breadcrumbs path="/shopping" />

      <header className="mt-6 space-y-4">
        <h1 className="text-2xl font-bold leading-snug tracking-tight sm:text-3xl">
          ロンドンの買い物
        </h1>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300">
          ロンドンの買い物でつまずくのは、たいてい「何を買うか」ではなく
          <strong className="font-semibold">「いつ行くか」</strong>
          です。日曜の午前しか立たない花市場があり、
          土曜だけアンティークが並ぶ通りがあり、
          そして日曜に6時間しか開けられないデパートがあります。
        </p>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300">
          ここでは
          <strong className="font-semibold">どこで、いつ買うか</strong>
          を扱います。品目そのものは、お土産とブランドのページに分けています。
        </p>
      </header>

      <AdSenseUnit slot={AD_SLOTS.listing} className="mt-8" />

      {/* 記事一覧。カテゴリ見出しごと出す。 */}
      <div className="mt-10 space-y-12">
        {SHOPPING_CATEGORY_ORDER.map((category) => {
          const guides = shoppingGuidesByCategory(category);
          if (guides.length === 0) return null;

          return (
            <section key={category} className="space-y-5">
              <div className="space-y-2 border-b border-slate-200 pb-3 dark:border-slate-700">
                <h2 className="text-xl font-semibold sm:text-2xl">
                  {SHOPPING_CATEGORY_LABELS[category]}
                </h2>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {SHOPPING_CATEGORY_BLURBS[category]}
                </p>
              </div>

              <div className="space-y-3">
                {guides.map((g) => (
                  <Link
                    key={g.slug}
                    href={shoppingGuidePath(g.slug)}
                    className="block"
                  >
                    <Card className="border-gray-300 bg-white shadow-sm transition hover:border-emerald-400 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:border-emerald-500">
                      <CardContent className="p-5">
                        <span className="block text-xs font-semibold text-emerald-600">
                          {g.eyebrow}
                        </span>
                        <span className="mt-1 block text-base font-semibold">
                          {g.label}
                        </span>
                        <span className="mt-1 block text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                          {g.blurb}
                        </span>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}

        {/* 何を買うか。実体は別セクションにあるので、入口だけ置く。 */}
        <section className="space-y-5">
          <div className="space-y-2 border-b border-slate-200 pb-3 dark:border-slate-700">
            <h2 className="text-xl font-semibold sm:text-2xl">何を買うか</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              品目とブランドは別のページにまとめています。
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {WHAT_TO_BUY.map((item) => (
              <Link key={item.href} href={item.href} className="block">
                <Card className="h-full border-gray-300 bg-white shadow-sm transition hover:border-sky-400 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:border-sky-500">
                  <CardContent className="p-5">
                    <span className="block text-base font-semibold">
                      {item.label}
                    </span>
                    <span className="mt-1 block text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                      {item.blurb}
                    </span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      </div>

      <GuideFaq items={FAQ} />

      <AdSenseUnit slot={AD_SLOTS.articleBottom} className="mt-10" />

      <section className="mt-12 space-y-3 rounded-lg border border-slate-200 p-5 dark:border-slate-800">
        <h2 className="text-lg font-semibold">あわせて読みたい</h2>
        <ul className="space-y-2 text-sm">
          <li>
            <Link
              href="/sightseeing/tipping-and-payment"
              className="text-sky-700 hover:underline dark:text-sky-300"
            >
              チップと支払いの実務
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
          <li>
            <Link
              href="/sightseeing/itinerary"
              className="text-sky-700 hover:underline dark:text-sky-300"
            >
              ロンドン モデルコース（1〜5日）
            </Link>
          </li>
        </ul>
      </section>
    </div>
  );
}
