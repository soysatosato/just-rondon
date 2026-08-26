import Link from "next/link";
import JsonLd from "@/components/seo/JsonLd";
import AdSenseUnit from "@/components/ads/AdSenseUnit";
import { AD_SLOTS } from "@/lib/adsense";
import BreadCrumbs from "@/components/home/BreadCrumbs";
import GuideFaq from "@/components/guides/GuideFaq";
import type { GuideFaqItem } from "@/components/guides/types";
import { Card, CardContent } from "@/components/ui/card";
import { buildPageMetadata } from "@/lib/seo";
import { breadcrumbJsonLd, faqPageJsonLd } from "@/lib/jsonld";
import { SITE_URL } from "@/lib/seo";
import { fetchSouvenirs } from "@/utils/actions/souvenirs";
import SouvenirCard from "@/components/souvenirs/SouvenirCard";
import { souvenirItemListJsonLd } from "@/components/souvenirs/jsonld";
import {
  SOUVENIR_BASE,
  SOUVENIR_SECTION_NAME,
  categoryAnchor,
  groupByCategory,
  souvenirPath,
} from "@/components/souvenirs/categories";

const TITLE = "ロンドンのお土産｜本当に喜ばれる定番と、渡す相手別の選び方";
const DESCRIPTION =
  "ロンドンで買えるお土産を、紅茶・お菓子・食品・コスメ・雑貨のカテゴリ別にまとめました。価格の目安と買える場所、渡す相手ごとの向き不向きまで具体的に紹介します。スーパーで数百円のばらまき用から、フォートナム&メイソンの缶のような特別な一品まで。";

export const metadata = buildPageMetadata({
  path: SOUVENIR_BASE,
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "ロンドン お土産",
    "イギリス お土産",
    "ロンドン 土産 おすすめ",
    "イギリス 土産 スーパー",
    "ロンドン 紅茶 お土産",
    "イギリス お菓子 土産",
    "ロンドン ばらまき土産",
  ],
});

/**
 * 「予算別」ではなく「渡す相手別」で切る。
 *
 * 土産選びで実際に詰まるのは金額ではなく相手で、
 * 同じ £5 の品でも職場に配れるものと配れないものが分かれるため。
 */
const PICKING_GUIDE: {
  target: string;
  advice: string;
  picks: { name: string; slug: string }[];
}[] = [
  {
    target: "職場・学校にばらまく",
    advice:
      "個包装で、1人あたり100〜200円に収まるもの。人数分をスーツケースに入れる前提なので、軽さと割れにくさが効いてくる。",
    picks: [
      { name: "トワイニングの紅茶", slug: "twinings-tea" },
      { name: "ウォーカーズのショートブレッド", slug: "walkers-shortbread" },
      { name: "タノックスのティーケーキ", slug: "tunnocks-teacake" },
    ],
  },
  {
    target: "親しい友人・家族に1つだけ",
    advice:
      "開けた瞬間の見た目で決まる。缶や箱がそのまま残るものを選ぶと、中身を食べ終えた後も手元に残る。",
    picks: [
      { name: "フォートナム&メイソンの紅茶", slug: "fortnum-and-mason-tea" },
      { name: "ニールズヤード レメディーズ", slug: "neals-yard-remedies" },
      { name: "ロンドン地下鉄のグッズ", slug: "london-underground-goods" },
    ],
  },
  {
    target: "話のネタにしたい",
    advice:
      "味や実用性より、渡したときの反応で選ぶ。ただし食べ物は「どう食べるか」を必ず添えて渡すこと。",
    picks: [
      { name: "マーマイト", slug: "marmite" },
      { name: "HPソース", slug: "hp-sauce" },
      { name: "パディントン ベア", slug: "paddington-bear" },
    ],
  },
];

const FAQ: GuideFaqItem[] = [
  {
    question: "お土産はどこで買うのが一番安いですか？",
    answer:
      "**街のスーパー**です。Tesco、Sainsbury's、Asda あたりが基本で、紅茶もチョコレートもビスケットも土産物店より確実に安く買えます。空港は品揃えは良いものの割高で、街の土産物店（オックスフォード・ストリート周辺など）はさらに高いことがあります。ばらまき用はスーパー、特別な一品は専門店やデパート、という使い分けが現実的です。",
  },
  {
    question: "免税（VAT還付）は受けられますか？",
    answer:
      "**受けられません。** イギリスは2021年1月に、旅行者向けの付加価値税還付制度（VAT Retail Export Scheme）を廃止しました。空港で書類にスタンプをもらって還付を受ける、という手続きは現在存在しません。予算を組むときは表示価格をそのまま支払う前提で計算してください。なお空港の制限エリア内にある免税店（Duty Free）での購入は別で、こちらは従来どおりです。",
  },
  {
    question: "食品を日本に持ち込むときの注意はありますか？",
    answer:
      "紅茶、ビスケット、チョコレート、瓶詰めのジャムやソースは問題なく持ち込めます。注意が必要なのは**肉と乳製品**で、肉製品（ソーセージ、ハム、肉入りのパイなど）は原則として日本への持ち込みが禁止されています。チーズなど乳製品にも制限があります。またマーマイトやHPソース、クロテッドクリームのような液体・ペースト状のものは、100mlを超えると機内持ち込みができません。**必ず預け荷物に入れてください。**",
  },
  {
    question: "スーツケースに入れるとき、何に気をつければいいですか？",
    answer:
      "割れ物と匂いの2つです。ガラス瓶（ジャム、ソース、香水）は衣類で包んでスーツケースの中央に置きます。もうひとつ見落としがちなのが匂いで、**ラッシュのバスボムや石鹸は香りが非常に強く、同じ袋に入れた紅茶やお菓子に匂いが移ります。** 必ずジッパー袋などで分けてください。ショートブレッドは缶入りを選ぶと潰れません。",
  },
  {
    question: "夏に行くのですが、チョコレートは買えますか？",
    answer:
      "買えますが、溶けるリスクがあります。イギリスの夏はそこまで暑くないものの、**問題は日本に着いてからの移動**です。空港から自宅までの気温で溶けてしまうことがあります。夏に行くならビスケット、紅茶、雑貨のほうが安全で、どうしてもチョコレートを買うなら帰国日にまとめて買い、保冷剤を用意しておくと安心です。",
  },
];

export default async function SouvenirsPage() {
  const souvenirs = await fetchSouvenirs();
  const groups = groupByCategory(souvenirs);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 md:py-10">
      <JsonLd
        data={[
          breadcrumbJsonLd({
            name: SOUVENIR_SECTION_NAME,
            path: SOUVENIR_BASE,
          }),
          faqPageJsonLd(FAQ, `${SITE_URL}${SOUVENIR_BASE}`),
          souvenirItemListJsonLd(souvenirs),
        ]}
      />

      <BreadCrumbs name={SOUVENIR_SECTION_NAME} />

      <header className="mt-6 space-y-4">
        <h1 className="text-2xl font-bold leading-snug tracking-tight sm:text-3xl">
          ロンドンのお土産
        </h1>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300">
          ロンドンの土産は、選択肢が多すぎて逆に決まらなくなります。空港の売店で
          時間切れになって適当に掴む、という帰り方をしないために、
          <strong className="font-semibold">
            定番として外さないものを{souvenirs.length}品
          </strong>
          に絞ってまとめました。
        </p>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300">
          それぞれ価格の目安と買える場所を載せています。多くはスーパーで手に入るので、
          観光の合間に済ませられるものがほとんどです。
        </p>
      </header>

      {/* 相手別の指針。カテゴリで探す前に、まずここで当たりをつけてもらう。 */}
      <section className="mt-10 space-y-4">
        <h2 className="text-xl font-semibold">渡す相手から選ぶ</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {PICKING_GUIDE.map((g) => (
            <Card
              key={g.target}
              className="border-slate-200 dark:border-slate-800"
            >
              <CardContent className="space-y-3 p-4">
                <h3 className="text-sm font-bold">{g.target}</h3>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {g.advice}
                </p>
                <ul className="space-y-1">
                  {g.picks.map((p) => (
                    <li key={p.slug}>
                      <Link
                        href={souvenirPath(p.slug)}
                        className="text-xs font-medium text-sky-700 hover:underline dark:text-sky-300"
                      >
                        {p.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* カテゴリ目次 */}
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

      <AdSenseUnit slot={AD_SLOTS.listing} className="mt-8" />

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
              {g.items.map((s) => (
                <SouvenirCard key={s.id} souvenir={s} />
              ))}
            </div>
          </section>
        ))}
      </div>

      <GuideFaq items={FAQ} />

      <AdSenseUnit slot={AD_SLOTS.articleBottom} className="mt-10" />

      <section className="mt-12 space-y-3 rounded-lg border border-slate-200 p-5 dark:border-slate-800">
        <h2 className="text-lg font-semibold">あわせて読みたい</h2>
        <ul className="space-y-2 text-sm">
          <li>
            <Link
              href="/sightseeing/must-see"
              className="text-sky-700 hover:underline dark:text-sky-300"
            >
              絶対に外せないロンドン観光スポット
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
