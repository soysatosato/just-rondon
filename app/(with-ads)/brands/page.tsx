import Link from "next/link";
import JsonLd from "@/components/seo/JsonLd";
import AdSenseUnit from "@/components/ads/AdSenseUnit";
import { AD_SLOTS } from "@/lib/adsense";
import BreadCrumbs from "@/components/home/BreadCrumbs";
import GuideFaq from "@/components/guides/GuideFaq";
import type { GuideFaqItem } from "@/components/guides/types";
import { Card, CardContent } from "@/components/ui/card";
import { buildPageMetadata, SITE_URL } from "@/lib/seo";
import { breadcrumbJsonLd, faqPageJsonLd } from "@/lib/jsonld";
import { fetchBrands } from "@/utils/actions/brands";
import BrandCard from "@/components/brands/BrandCard";
import {
  BRAND_BASE,
  BRAND_SECTION_NAME,
  brandListJsonLd,
  categoryAnchor,
  groupByCategory,
} from "@/components/brands/meta";

const TITLE = "イギリスのブランド｜ロンドンで買う価値がある定番と、その成り立ち";
const DESCRIPTION =
  "バーバリー、バブアー、ドクターマーチン、ウェッジウッドなど、イギリス発のブランドをカテゴリ別にまとめました。創業の経緯と定番品が生まれた背景、ロンドンのどこで買えるか、日本との価格差まで具体的に紹介します。";

export const metadata = buildPageMetadata({
  path: BRAND_BASE,
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "イギリス ブランド",
    "イギリス ブランド 一覧",
    "ロンドン 買い物",
    "イギリス 高級ブランド",
    "ロンドン ブランド 安い",
    "王室御用達 ブランド",
    "イギリス 老舗ブランド",
  ],
});

/**
 * 「ブランド別」に入る前に、まず買い方の前提を置く。
 *
 * ここを飛ばすと、読者は各ブランドの価格を見るたびに同じ疑問
 * (免税はあるのか・どこが一番安いのか)に戻ってしまう。
 * 2021年の免税廃止は特に誤解が残っているので、最初に潰しておく。
 */
const BUYING_BASICS: { title: string; body: string }[] = [
  {
    title: "免税（VAT還付）はもう無い",
    body: "2021年1月にイギリスの旅行者向け免税制度は廃止されました。空港で書類を出せば20%戻る、という以前の前提は今は通用しません。それでも現地が安いブランドは多いのですが、理由は免税ではなく元の定価差とセールです。",
  },
  {
    title: "狙うならセール期。年2回ある",
    body: "6月下旬〜7月と、12月26日（ボクシング・デー）からの2回が本番です。この時期は主要ブランドが一斉に下げるので、同じ品の価格が平常時と大きく変わります。旅程が近いなら、買う予定のものだけ時期をずらす価値があります。",
  },
  {
    title: "アウトレットは1日仕事になる",
    body: "ビスター・ヴィレッジ（Bicester Village）はロンドンから列車で約1時間。主要ブランドが集まり値引き幅も大きい一方、往復と滞在で丸1日が消えます。買うものが2〜3ブランドに絞れているときだけ効率が合います。",
  },
];

const FAQ: GuideFaqItem[] = [
  {
    question: "イギリスでブランド品を買うと日本より安いですか？",
    answer:
      "カテゴリによります。アパレル・靴・食器は本国価格が明確に安く、セール期ならさらに開きます。一方で紅茶やコスメは日本の並行輸入品と大きく変わらないこともあります。**免税（VAT還付）は2021年に廃止されている**ので、「20%戻る前提」で計算すると必ずずれます。",
  },
  {
    question: "「王室御用達」とは何ですか？",
    answer:
      "ロイヤル・ワラント（Royal Warrant）は、王室に継続して商品やサービスを納めた企業に与えられる認定です。5年ごとに見直され、取り消されることもあります。品質の目安にはなりますが、**現在も保持しているかは変わる**ため、このサイトでは現在保持しているブランドにだけ表示しています。",
  },
  {
    question: "服や靴のサイズはどう見ればいいですか？",
    answer:
      "UKサイズは日本表記とずれます。靴は UK7 がおよそ 25.5〜26cm ですが、ブランドとラスト（木型）によって1cm近く変わります。**現地で実際に履けること自体が、現地で買う最大の利点**なので、サイズが決まっていないものほど店頭で買う価値があります。",
  },
  {
    question: "ブランドの旗艦店は観光として行く価値がありますか？",
    answer:
      "あります。トワイニングのストランド本店（1706年から同じ場所）やフォートナム&メイソンのように、建物と店内そのものが見どころになっている店が複数あります。買う予定がなくても、観光ルートに組み込む価値のある店はブランドごとに挙げています。",
  },
];

export default async function BrandsPage() {
  const brands = await fetchBrands();
  const groups = groupByCategory(brands);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 md:py-10">
      <JsonLd
        data={[
          breadcrumbJsonLd({
            name: BRAND_SECTION_NAME,
            path: BRAND_BASE,
          }),
          faqPageJsonLd(FAQ, `${SITE_URL}${BRAND_BASE}`),
          brandListJsonLd(brands),
        ]}
      />

      <BreadCrumbs name={BRAND_SECTION_NAME} />

      <header className="mt-6 space-y-4">
        <h1 className="text-2xl font-bold leading-snug tracking-tight sm:text-3xl">
          イギリスのブランド
        </h1>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300">
          イギリスのブランドは、そのほとんどが「必要だったから作られた」ものです。
          雨が降り続く国だからレインコートが生まれ、炭鉱と工場があったから頑丈な靴が生まれた。
          今は高級品として売られていても、出発点は実用品でした。
        </p>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300">
          ここでは
          <strong className="font-semibold">
            イギリス発のブランドを{brands.length}社
          </strong>
          、成り立ちと、ロンドンでの買い方の両方から紹介します。
          どの店に行けばよく、日本と比べて実際どうなのかまで具体的に書いています。
        </p>
      </header>

      {/* 買い方の前提。各ブランドを見る前にここで一度片付けておく。 */}
      <section className="mt-10 space-y-4">
        <h2 className="text-xl font-semibold">買う前に知っておくこと</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {BUYING_BASICS.map((b) => (
            <Card
              key={b.title}
              className="border-slate-200 dark:border-slate-800"
            >
              <CardContent className="space-y-2 p-4">
                <h3 className="text-sm font-bold">{b.title}</h3>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {b.body}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* カテゴリ目次 */}
      {groups.length > 0 && (
        <nav
          aria-label="カテゴリ"
          className="mt-10 flex flex-wrap gap-2 rounded-lg bg-slate-50 p-4 dark:bg-slate-800/60"
        >
          {groups.map((g) => (
            <Link
              key={g.key}
              href={`#${categoryAnchor(g.key)}`}
              className="rounded-full border border-slate-300 bg-white px-3 py-1 text-sm font-medium hover:border-sky-400 hover:text-sky-700 dark:border-slate-600 dark:bg-slate-900 dark:hover:text-sky-300"
            >
              {g.label}
              <span className="ml-1 text-xs text-muted-foreground">
                {g.items.length}
              </span>
            </Link>
          ))}
        </nav>
      )}

      <AdSenseUnit slot={AD_SLOTS.listing} className="mt-8" />

      {groups.length > 0 ? (
        <div className="mt-10 space-y-14">
          {groups.map((g) => (
            <section
              key={g.key}
              id={categoryAnchor(g.key)}
              className="scroll-mt-16 space-y-5"
            >
              <div className="space-y-2 border-b border-slate-200 pb-3 dark:border-slate-700">
                <h2 className="text-xl font-semibold sm:text-2xl">{g.label}</h2>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {g.description}
                </p>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                {g.items.map((brand) => (
                  <BrandCard key={brand.id} brand={brand} />
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <p className="mt-10 text-sm text-muted-foreground">
          近日公開予定です。
        </p>
      )}

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
              ロンドンのお土産 — 渡す相手別の選び方
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
