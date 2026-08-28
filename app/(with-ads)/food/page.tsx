import Link from "next/link";
import JsonLd from "@/components/seo/JsonLd";
import AdSenseUnit from "@/components/ads/AdSenseUnit";
import { AD_SLOTS } from "@/lib/adsense";
import Breadcrumbs from "@/components/navigation/Breadcrumbs";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import MarkdownBody from "@/components/jobs/MarkdownBody";
import GuideFaq from "@/components/guides/GuideFaq";
import GuideFreshness from "@/components/guides/GuideFreshness";
import { SITE_URL, buildPageMetadata } from "@/lib/seo";
import { breadcrumbJsonLd, faqPageJsonLd } from "@/lib/jsonld";
import {
  FOOD_BASE,
  FOOD_CATEGORY_LABELS,
  FOOD_CATEGORY_ORDER,
  FOOD_SECTION_NAME,
  foodGuidePath,
  foodGuides,
  foodGuidesByCategory,
  foodHubCollectionJsonLd,
} from "@/components/food/guides/guides";
import {
  CLOSING_DISCOUNTS,
  FOOD_AS_OF,
  FOOD_UPDATED_AT,
  MEAL_DEALS,
  SURPLUS_FOOD_APPS,
  WATER_SAVING,
  gbp,
  mealDealSaving,
} from "@/lib/food/prices";

const TITLE = "ロンドンで食費を抑えるコツ｜Meal Deal から買う店の選び方まで";
const DESCRIPTION = `ロンドンの食費を実際に下げる方法をまとめました。Meal Deal の使い切り方、Clubcard の二重価格、閉店前の半額、マクドナルドのアンケートでクーポンを回し続ける手順、Lidl とエスニックスーパーの使い分け、長期滞在者の賄いまで。${FOOD_AS_OF}時点の価格で解説します。`;

export const metadata = buildPageMetadata({
  path: FOOD_BASE,
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "ロンドン 食費 節約",
    "イギリス 食費 安い",
    "Meal Deal ロンドン",
    "ロンドン 安く食べる",
    "ロンドン スーパー 安い",
    "イギリス 節約 アプリ",
    "ロンドン 留学 食費",
  ],
});

/**
 * 状況から入口を選ばせる。
 *
 * 食費の節約は「滞在期間」と「自炊するか」で有効な手段が完全に変わる。
 * 数日の旅行者に米の大袋を勧めても意味がなく、在住者に Meal Deal の
 * 初歩を出しても既知。抽象的な目次ではなく、読者が自分の状況を選べる形にする。
 */
const SCENARIOS: {
  situation: string;
  answer: string;
  detail: string;
  href: string;
  cta: string;
}[] = [
  {
    situation: "昼食代を今日から下げたい",
    answer: "Meal Deal",
    detail: `メイン＋スナック＋ドリンクで ${MEAL_DEALS.tesco.label} 会員価格${gbp(
      MEAL_DEALS.tesco.member
    )}。同じ値段でも選ぶものによって価値が倍近く変わります。12時前に行くのが要点。`,
    href: "/food/meal-deal",
    cta: "Meal Deal の攻略を見る",
  },
  {
    situation: "スーパーで同じ商品に2つの値段が書いてある",
    answer: "会員カードの二重価格",
    detail: `Clubcard も Nectar も無料で、その場で作れます。持たないと Meal Deal だけで毎回${gbp(
      mealDealSaving(MEAL_DEALS.tesco)
    )}損します。旅行者でも作れます。`,
    href: "/food/loyalty-cards",
    cta: "カードの作り方を見る",
  },
  {
    situation: "日本食が恋しいが、店に入ると高い",
    answer: "閉店前の半額",
    detail: `${CLOSING_DISCOUNTS.wasabi.label} や ${CLOSING_DISCOUNTS.itsu.label} は閉店${CLOSING_DISCOUNTS.wasabi.minutesBefore}分前を目安に${CLOSING_DISCOUNTS.wasabi.offMin}〜${CLOSING_DISCOUNTS.wasabi.offMax}%引き。まともな寿司に手頃な値段でありつけます。`,
    href: "/food/discount-timing",
    cta: "値引きの時間帯を見る",
  },
  {
    situation: "アプリを入れる手間はかけられる",
    answer: "クーポンを回し続ける",
    detail:
      "マクドナルドのレシートアンケートは、クーポンで買ったレシートからまた応募できます。ただしキオスク注文が必須。Too Good To Go も併用の価値があります。",
    href: "/food/apps-and-coupons",
    cta: "アプリとクーポンを見る",
  },
  {
    situation: "自炊する。食材そのものを安く買いたい",
    answer: "買う店を変える",
    detail:
      "Lidl と Aldi は体感2〜3割安い。さらにトルコ系・中華系スーパーは野菜と米が別次元で、日本の調味料も専門店より安く手に入ります。",
    href: "/food/where-to-buy",
    cta: "安い店の一覧を見る",
  },
  {
    situation: "数ヶ月以上滞在する。働く予定もある",
    answer: "賄いと生活習慣",
    detail: `飲食店の多くで賄いが出ます。加えて水を買わない（月${gbp(
      WATER_SAVING.perMonth30Days
    )}前後の差）・朝食を家で済ませるという地味な習慣が、月単位では最も効きます。`,
    href: "/food/long-stay",
    cta: "長期滞在者向けを見る",
  },
];

const FAQ_ITEMS = [
  {
    question: "ロンドンで一番簡単に食費を下げる方法は何ですか？",
    answer: `**会員カードを作って Meal Deal を使うこと**です。Clubcard も Nectar も無料でその場で作れ、${
      MEAL_DEALS.tesco.label
    } なら Meal Deal が通常${gbp(MEAL_DEALS.tesco.standard)}から${gbp(
      MEAL_DEALS.tesco.member
    )}になります。次に効くのが「水を買わない」ことで、ロンドンの水道水は飲用可なので、マイボトルを持つだけで月${gbp(
      WATER_SAVING.perMonth30Days
    )}前後変わります。`,
  },
  {
    question: "短期の旅行者でも使える方法はどれですか？",
    answer:
      "[Meal Deal](/food/meal-deal)、[会員カード](/food/loyalty-cards)、[閉店前の半額](/food/discount-timing)、[アプリとクーポン](/food/apps-and-coupons)はすべて数日の滞在でも使えます。会員カードは宿泊先の住所で登録でき、店頭で即日発行してもらえます。逆に自炊前提の[買う店を変える](/food/where-to-buy)と[長期滞在者向け](/food/long-stay)は、滞在が数週間以上ないと効果が出にくいです。",
  },
  {
    question: "ロンドンの水道水は飲めますか？",
    answer:
      "飲めます。水質は厳格に管理されており飲用に適しています。硬水のため日本の水と口当たりが違いますが、安全性の問題ではありません。レストランで水を頼むときは「tap water」と明示しないと有料のボトル水が出てくるので注意してください。",
  },
  {
    question: "マクドナルドのクーポンが無限に出るというのは本当ですか？",
    answer:
      "レシートのアンケートに答えるとクーポンが発行され、**そのクーポンで購入したレシートにもアンケート用のIDが載る**ため、原理的には繰り返せます。ただし**キオスク（店内端末）またはレジでの注文が必須**で、モバイルオーダーだとIDが発行されず循環に入れません。詳しくは[アプリとクーポンで削る](/food/apps-and-coupons)をご覧ください。",
  },
  {
    question: "Lidl や Aldi はどのくらい安いのですか？",
    answer:
      "牛乳・卵・パン・鶏肉・野菜といった基本的な食材で、Tesco や Sainsbury's より体感2〜3割安いです。品揃えを絞り自社ブランド中心にすることでコストを下げていますが、基本食材の品質は標準的なスーパーと大差ありません。ただしロンドン中心部には店舗が少なく、Zone 2〜3以降の住宅街に多く立地しています。",
  },
  {
    question: "値引きシールが貼られる時刻を知る方法はありますか？",
    answer: `公表されていません。担当スタッフのシフトで決まるため、通いたい店に数回夕方に行って実際の時刻を覚えるのが唯一確実な方法です。一般的には${CLOSING_DISCOUNTS.supermarketFirstRound}ごろに1回目、${CLOSING_DISCOUNTS.supermarketFinalRound}に最終の値引きが入ることが多いですが、店舗差が大きいので目安にとどめてください。`,
  },
];

export default function FoodHubPage() {
  const pageUrl = `${SITE_URL}${FOOD_BASE}`;

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 text-gray-900 dark:text-gray-100">
      <JsonLd
        data={breadcrumbJsonLd({
          name: FOOD_SECTION_NAME,
          path: FOOD_BASE,
        })}
      />
      <JsonLd
        data={foodHubCollectionJsonLd({
          name: TITLE,
          description: DESCRIPTION,
        })}
      />
      <JsonLd data={faqPageJsonLd(FAQ_ITEMS, pageUrl)} />

      <Breadcrumbs path="/food" />

      <header className="mt-6 space-y-4">
        <h1 className="text-2xl font-bold leading-tight md:text-4xl">
          ロンドンで食費を抑えるコツ
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          How to Eat Cheaply in London
        </p>
        <p className="text-base leading-relaxed text-gray-700 dark:text-gray-300">
          ロンドンの外食は高い。ただ、
          <strong>仕組みを知っているかどうかだけで差がつく</strong>
          場面がかなりあります。滞在が数日なのか数ヶ月なのかで効く手段が変わるので、
          下から自分の状況に近いものを選んでください。
        </p>
        <GuideFreshness dataAsOf={FOOD_AS_OF} updatedAt={FOOD_UPDATED_AT} />
      </header>

      {/*
        最初に効果の大きい2つだけを出す。
        節約の記事は手段が多いほど「結局どれをやればいいのか」で止まるため、
        まず会員カードと水という、費用ゼロで確実に効くものに絞って示す。
      */}
      <div className="mt-8 rounded-lg border border-sky-300 bg-sky-50/70 p-5 dark:border-sky-900/60 dark:bg-sky-950/25">
        <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
          迷ったら、この2つだけ先にやってください
        </p>
        <ul className="mt-3 space-y-1.5 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
          <li>
            ・<strong>Clubcard か Nectar を作る</strong>（無料・その場で作れる・
            旅行者でも可）。イギリスのスーパーは会員価格と通常価格の二本立てで、
            持たないだけで毎回割高な方を払うことになります
          </li>
          <li>
            ・<strong>ボトル水を買うのをやめる</strong>。ロンドンの水道水は飲用可で、
            1日1本買うと月{gbp(WATER_SAVING.perMonth30Days)}前後の出費になります
          </li>
        </ul>
        <p className="mt-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
          どちらも費用ゼロで、効果が確実です。
          <Link
            href="/food/loyalty-cards"
            className="text-blue-600 underline underline-offset-2 dark:text-blue-400"
          >
            会員カードの作り方
          </Link>
          から読むのが最短です。
        </p>
      </div>

      <Separator className="my-8" />

      <section aria-labelledby="find-your-stage" className="space-y-5">
        <div className="space-y-2">
          <h2 id="find-your-stage" className="text-xl font-bold md:text-2xl">
            自分の状況を選んでください
          </h2>
          <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
            一番近いものが1つ見つかれば、それがあなたの読むべきページです。
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {SCENARIOS.map((s) => (
            <Link key={s.href} href={s.href} className="block">
              <Card className="h-full border-gray-300 bg-white shadow-sm transition hover:border-sky-400 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:border-sky-500">
                <CardContent className="flex h-full flex-col p-5">
                  <p className="text-sm font-semibold leading-snug text-gray-900 dark:text-gray-100">
                    {s.situation}
                  </p>
                  <p className="mt-3 text-xs font-bold tracking-wide text-sky-600 dark:text-sky-400">
                    → {s.answer}
                  </p>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                    {s.detail}
                  </p>
                  <span className="mt-4 text-sm font-medium text-blue-600 dark:text-blue-400">
                    {s.cta} →
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <AdSenseUnit slot={AD_SLOTS.listing} className="my-10" />

      <section aria-labelledby="price-overview" className="space-y-4">
        <h2 id="price-overview" className="text-xl font-bold md:text-2xl">
          価格の基準線
        </h2>
        <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
          「これは高いのか安いのか」を判断する目安です。
          <strong>Meal Deal の価格は年に1〜2回改定される</strong>
          ため、最終的な金額は店頭で確認してください。
        </p>
        <MarkdownBody>
          {`**Meal Deal のチェーン別価格（${FOOD_AS_OF}時点）**

| チェーン | 通常価格 | 会員価格 |
|---|---:|---:|
| ${MEAL_DEALS.morrisons.label} | ${gbp(MEAL_DEALS.morrisons.standard)} | **${gbp(MEAL_DEALS.morrisons.member)}** |
| ${MEAL_DEALS.coop.label} | ${gbp(MEAL_DEALS.coop.standard)} | **${gbp(MEAL_DEALS.coop.member)}** |
| ${MEAL_DEALS.tesco.label} | ${gbp(MEAL_DEALS.tesco.standard)} | **${gbp(MEAL_DEALS.tesco.member)}** |
| ${MEAL_DEALS.sainsburys.label} | ${gbp(MEAL_DEALS.sainsburys.standard)} | **${gbp(MEAL_DEALS.sainsburys.member)}** |
| ${MEAL_DEALS.greggs.label} | ${gbp(MEAL_DEALS.greggs.standard)} | — |
| ${MEAL_DEALS.boots.label} | ${gbp(MEAL_DEALS.boots.standard)} | **${gbp(MEAL_DEALS.boots.member)}** |
| ${MEAL_DEALS.marksAndSpencer.label} | ${gbp(MEAL_DEALS.marksAndSpencer.standard)} | — |
| ${MEAL_DEALS.waitrose.label} | ${gbp(MEAL_DEALS.waitrose.standard)} | — |

**その他の目安**

| 項目 | 金額 |
|---|---|
| ${CLOSING_DISCOUNTS.wasabi.label} の閉店前 | ${CLOSING_DISCOUNTS.wasabi.offMin}〜${CLOSING_DISCOUNTS.wasabi.offMax}%引き（閉店${CLOSING_DISCOUNTS.wasabi.minutesBefore}分前が目安・店舗差あり） |
| ${SURPLUS_FOOD_APPS.tooGoodToGo.label} | 袋1つ ${gbp(SURPLUS_FOOD_APPS.tooGoodToGo.bagMin)}〜${gbp(SURPLUS_FOOD_APPS.tooGoodToGo.bagMax)} |
| ${SURPLUS_FOOD_APPS.olio.label} | 無料（個人間の譲渡） |
| ボトル水（500ml） | ${gbp(WATER_SAVING.bottlePrice)}前後 → 1日1本で月${gbp(WATER_SAVING.perMonth30Days)}前後 |

値引きの時刻と割引率は**店舗ごとの裁量**で決まります。上の数字は複数店舗で確認した目安で、保証されるものではありません。`}
        </MarkdownBody>
      </section>

      <Separator className="my-10" />

      <section aria-labelledby="all-guides" className="space-y-8">
        <div className="space-y-2">
          <h2 id="all-guides" className="text-xl font-bold md:text-2xl">
            食費節約ガイド一覧
          </h2>
          <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
            全{foodGuides.length}
            本。今日すぐ効くものから、長期滞在者向けの仕込みまで順に並べています。
          </p>
        </div>

        {FOOD_CATEGORY_ORDER.map((category) => {
          const guides = foodGuidesByCategory(category);
          if (guides.length === 0) return null;

          return (
            <div key={category} className="space-y-3">
              <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200">
                {FOOD_CATEGORY_LABELS[category]}
              </h3>
              <div className="space-y-3">
                {guides.map((g) => (
                  <Link
                    key={g.slug}
                    href={foodGuidePath(g.slug)}
                    className="block"
                  >
                    <Card className="border-gray-300 bg-white shadow-sm transition hover:border-sky-400 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:border-sky-500">
                      <CardContent className="p-5">
                        <span className="block text-xs font-semibold text-sky-600">
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
            </div>
          );
        })}
      </section>

      <GuideFaq items={FAQ_ITEMS} />

      {/*
        各記事にコメント欄があるので、ハブでは「そこで聞いている」ことだけ伝える。
        ハブ自体にコメント欄は置かない（話題が混ざって読めなくなるため）。
      */}
      <div className="mt-10 rounded-lg border border-emerald-200 bg-emerald-50/70 p-6 dark:border-emerald-900/60 dark:bg-emerald-950/25">
        <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
          あなたの工夫を教えてください
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
          各記事の末尾にコメント欄があります。「この店舗は何時に値引きが入る」
          「このスーパーが安い」といった具体的な情報は、同じエリアに住む人にそのまま役立ちます。
          実践している工夫があれば、関連する記事のコメント欄に残していってください。
        </p>
      </div>

      <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-6 dark:border-neutral-700 dark:bg-neutral-900">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          あわせて読みたい
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
          食費は生活費の一部です。住まいと働き方の条件が決まると、
          食費に回せる金額も変わります。
        </p>
        <ul className="mt-3 space-y-2 text-sm">
          <li>
            <Link
              href="/housing"
              className="text-blue-600 hover:opacity-80 dark:text-blue-400"
            >
              ロンドンの住まい探しガイド｜物件の探し方から契約・退去まで
            </Link>
          </li>
          <li>
            <Link
              href="/jobs"
              className="text-blue-600 hover:opacity-80 dark:text-blue-400"
            >
              ロンドンで働く人のための労働問題ガイド
            </Link>
          </li>
          <li>
            <Link
              href="/restaurants"
              className="text-blue-600 hover:opacity-80 dark:text-blue-400"
            >
              ロンドンのレストランガイド
            </Link>
          </li>
        </ul>
      </div>

      <p className="mt-6 rounded-lg border border-amber-200 bg-amber-50/70 p-4 text-xs leading-relaxed text-gray-700 dark:border-amber-900/60 dark:bg-amber-950/25 dark:text-gray-300">
        本サイトの価格・割引率・値引きの時刻は{FOOD_AS_OF}
        時点で確認したものです。Meal Deal の価格は年に1〜2回改定され、
        閉店前の値引きや対象商品は店舗ごとの裁量で運用されているため、
        記載どおりでない場合があります。最終的な価格は店頭・各社アプリでご確認ください。
        また、就労を伴う内容（賄いなど）については、必ず自身のビザの就労条件を確認してください。
      </p>

      <AdSenseUnit slot={AD_SLOTS.articleBottom} className="mt-10" />
    </main>
  );
}
