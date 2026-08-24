import Link from "next/link";
import JsonLd from "@/components/seo/JsonLd";
import AdSenseUnit from "@/components/ads/AdSenseUnit";
import { AD_SLOTS } from "@/lib/adsense";
import BreadCrumbs from "@/components/home/BreadCrumbs";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import GuideFaq from "@/components/guides/GuideFaq";
import GuideFreshness from "@/components/guides/GuideFreshness";
import { SITE_URL, buildPageMetadata } from "@/lib/seo";
import {
  faqPageJsonLd,
  sightseeingBreadcrumbJsonLd,
} from "@/components/sightseeing/jsonld";
import {
  AREAS_BASE,
  AREA_CATEGORY_BLURBS,
  AREA_CATEGORY_LABELS,
  AREA_CATEGORY_ORDER,
  AREAS_SECTION_NAME,
  areaGuidePath,
  areaGuides,
  areaGuidesByCategory,
  areasHubCollectionJsonLd,
} from "@/components/sightseeing/areas/areas";
import { AREA_AS_OF, AREA_UPDATED_AT, MARKET_DAYS } from "@/lib/sightseeing/areas";
import { getAreaSpotCounts } from "@/utils/areas";

const TITLE = "ロンドンのエリアガイド｜街区ごとに半日で歩く6つの回遊ルート";
const DESCRIPTION =
  "ロンドンをスポット単位ではなく街区単位で歩くためのガイド。ウェストミンスター、ソーホー、サウスバンク、シティ、ショーディッチ、グリニッジの6エリアについて、半日の回遊ルート、最寄駅、所要時間、曜日ごとの違いをまとめています。";

export const metadata = buildPageMetadata({
  path: AREAS_BASE,
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "ロンドン エリア ガイド",
    "ロンドン 半日 観光",
    "ロンドン 街歩き",
    "ロンドン モデルコース エリア別",
    "ロンドン 観光 まわり方",
    "ロンドン 徒歩 観光",
  ],
});

/**
 * 滞在日数から入口を選ばせる。
 *
 * エリアガイドを探す読者は「ロンドンのどこを歩くか」で迷っている。
 * この迷いは滞在日数でほぼ決まる——3日ならウェストミンスターと
 * ソーホーで足りるし、5日目にグリニッジまで足を延ばす余裕が出る。
 * 交通ガイドが「旅行者か在住者か」で切っているのと同じ考え方。
 */
const SCENARIOS: {
  situation: string;
  answer: string;
  detail: string;
  href: string;
  cta: string;
}[] = [
  {
    situation: "初めてのロンドン。まずどこを歩けばいい？",
    answer: "ウェストミンスター",
    detail:
      "ビッグベン、バッキンガム宮殿、ウェストミンスター寺院。「ロンドンといえば」がほぼ全部、徒歩25分の圏内に入っています。衛兵交代式の時刻から逆算すると半日がきれいに埋まります。",
    href: "/sightseeing/areas/westminster",
    cta: "ウェストミンスターを見る",
  },
  {
    situation: "地図を見ながら歩くのが苦手",
    answer: "サウスバンク",
    detail:
      "川沿いの遊歩道が一本で繋がっているので、東へ歩くだけで見どころが順に現れます。ロンドンで最も道に迷いにくいエリアです。しかも大半が無料。",
    href: "/sightseeing/areas/southbank",
    cta: "サウスバンクを見る",
  },
  {
    situation: "夜の時間をどう使うか決まっていない",
    answer: "ソーホー／コヴェント・ガーデン",
    detail:
      "食事・買い物・劇場が全部この範囲にあります。昼と夜で街の顔が変わるので、昼だけ見て帰ると半分しか見ていないことになります。",
    href: "/sightseeing/areas/soho",
    cta: "ソーホーを見る",
  },
  {
    situation: "無料で高いところに登りたい",
    answer: "シティ／タワー地区",
    detail:
      "スカイガーデン、ガーキン。高層ビルの展望台が無料で開放されています。ただし事前予約と身分証が必須です。",
    href: "/sightseeing/areas/city",
    cta: "シティを見る",
  },
  {
    situation: "日曜の予定が空いている",
    answer: "ショーディッチ",
    detail: `マーケットが3つ同時に立つのは日曜だけです。コロンビア・ロードは${MARKET_DAYS.columbiaRoadFlower}。平日に行くと、ただの住宅街を歩くことになります。`,
    href: "/sightseeing/areas/shoreditch",
    cta: "ショーディッチを見る",
  },
  {
    situation: "3日目以降。少し足を延ばしたい",
    answer: "グリニッジ",
    detail:
      "本初子午線と海洋史の世界遺産地区。中心部から20〜30分かかりますが、船で行けば移動そのものが観光になります。着けば全部が徒歩圏です。",
    href: "/sightseeing/areas/greenwich",
    cta: "グリニッジを見る",
  },
];

const FAQ_ITEMS = [
  {
    question: "ロンドンで1日に何エリア回れますか？",
    answer:
      "**1日1〜2エリアが現実的です**。各エリアが半日（3〜4時間）の単位で設計されているため、午前に1つ、午後に1つが上限になります。3つ詰め込むと移動だけで疲れ、どのエリアも印象に残りません。隣接するエリア同士（ウェストミンスターとソーホー、サウスバンクとシティ）なら、徒歩で繋いで1日にできます。",
  },
  {
    question: "滞在3日ならどのエリアを選ぶべきですか？",
    answer:
      "**ウェストミンスターとソーホー、加えてサウスバンクかシティのどちらか**をおすすめします。有名なものはこの範囲にほぼ入っています。グリニッジは往復の移動に1〜2時間かかるため、4日目以降に余裕があれば、という位置づけです。",
  },
  {
    question: "エリア間の移動には地下鉄が必要ですか？",
    answer:
      "**中心部の4エリア（ウェストミンスター、ソーホー、サウスバンク、シティ）は徒歩で繋がります**。ウェストミンスターからソーホーは徒歩15分、サウスバンクからシティは橋を渡って10分です。地下鉄が必要になるのはグリニッジ（DLRか船で20〜30分）と、ショーディッチへ向かう場合です。",
  },
  {
    question: "雨の日に強いエリアはどこですか？",
    answer:
      "**ウェストミンスターとソーホー**です。寺院、ナショナル・ギャラリー、大英博物館、チャーチル戦争指令室と、屋内で完結する選択肢が揃っています。逆に**ショーディッチとサウスバンクは雨に弱い**エリアです。どちらも屋外を歩くことが前提になっているためです。",
  },
  {
    question: "曜日によって行くべきエリアは変わりますか？",
    answer:
      `**変わります。**ショーディッチは日曜（マーケットが3つ立つ）、シティは平日（週末は店が閉まる金融街）、グリニッジは火曜を避ける（マーケットが休み）、サウスバンクは日曜を避ける（バラ・マーケットが休み）。曜日を意識するだけで、同じエリアでも体験の質がかなり変わります。`,
  },
  {
    question: "カムデンやノッティングヒルのガイドはありませんか？",
    answer:
      "**現時点では扱っていません**。当サイトに登録しているスポットが少なく、「半日この辺りを歩く」という回遊の記事として成立しないためです。掲載スポットが充実した段階で追加を検討します。",
  },
];

export default async function AreasHubPage() {
  const pageUrl = `${SITE_URL}${AREAS_BASE}`;
  const spotCounts = await getAreaSpotCounts();

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 text-gray-900 dark:text-gray-100">
      <JsonLd
        data={sightseeingBreadcrumbJsonLd([
          { name: AREAS_SECTION_NAME, path: AREAS_BASE },
        ])}
      />
      <JsonLd
        data={areasHubCollectionJsonLd({
          name: TITLE,
          description: DESCRIPTION,
        })}
      />
      <JsonLd data={faqPageJsonLd(FAQ_ITEMS, pageUrl)} />

      <BreadCrumbs
        name="観光ガイド"
        link="sightseeing"
        name2={AREAS_SECTION_NAME}
      />

      <header className="mt-6 space-y-4">
        <h1 className="text-2xl font-bold leading-tight md:text-4xl">
          ロンドンのエリアガイド
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          London by Neighbourhood
        </p>
        <p className="text-base leading-relaxed text-gray-700 dark:text-gray-300">
          観光スポットを1つずつ調べていくと、
          <strong>「結局その日どう歩くのか」が最後まで分かりません</strong>。
          このガイドは、ロンドンを街区の単位で区切って、
          半日で歩ける回遊ルートとして組み直したものです。
        </p>
        <GuideFreshness dataAsOf={AREA_AS_OF} updatedAt={AREA_UPDATED_AT} />
      </header>

      {/*
        曜日の話を最上部に置く。
        エリアガイドで最も多い失敗が「行ったら閉まっていた」で、
        しかもこれは記事を読む前に日程を決めてしまうと手遅れになる。
        だから各記事に入る前のこの位置で警告する。
      */}
      <div className="mt-8 rounded-lg border border-emerald-300 bg-emerald-50/70 p-5 dark:border-emerald-900/60 dark:bg-emerald-950/25">
        <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
          先に確認：エリアは「何曜日に行くか」で価値が変わります
        </p>
        <ul className="mt-3 space-y-1.5 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
          <li>
            ・<strong>ショーディッチは日曜。</strong>マーケットが3つ同時に立つのは
            この日だけで、平日はただの住宅街です
          </li>
          <li>
            ・<strong>シティは平日。</strong>金融街なので、週末は店がほぼ閉まります
            （その代わり写真は撮り放題です）
          </li>
          <li>
            ・<strong>サウスバンクは日曜を避ける。</strong>バラ・マーケットが休みで、
            このエリアの昼食が弱くなります
          </li>
          <li>
            ・<strong>グリニッジは火曜を避ける。</strong>マーケットが休みです
          </li>
        </ul>
      </div>

      <Separator className="my-8" />

      <section aria-labelledby="find-your-area" className="space-y-5">
        <div className="space-y-2">
          <h2 id="find-your-area" className="text-xl font-bold md:text-2xl">
            どこを歩くか決まっていない場合
          </h2>
          <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
            一番近いものが1つ見つかれば、それがその日に歩くエリアです。
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {SCENARIOS.map((s) => (
            <Link key={s.href} href={s.href} className="block">
              <Card className="h-full border-gray-300 bg-white shadow-sm transition hover:border-emerald-400 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:border-emerald-500">
                <CardContent className="flex h-full flex-col p-5">
                  <p className="text-sm font-semibold leading-snug text-gray-900 dark:text-gray-100">
                    {s.situation}
                  </p>
                  <p className="mt-3 text-xs font-bold tracking-wide text-emerald-600 dark:text-emerald-400">
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

      <section aria-labelledby="all-areas" className="space-y-8">
        <div className="space-y-2">
          <h2 id="all-areas" className="text-xl font-bold md:text-2xl">
            エリア一覧
          </h2>
          <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
            全{areaGuides.length}エリア。中心部の4つは徒歩で繋がるので、
            隣接するエリア同士を1日で組み合わせられます。
          </p>
        </div>

        {AREA_CATEGORY_ORDER.map((category) => {
          const areas = areaGuidesByCategory(category);
          if (areas.length === 0) return null;

          return (
            <div key={category} className="space-y-3">
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200">
                  {AREA_CATEGORY_LABELS[category]}
                </h3>
                <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                  {AREA_CATEGORY_BLURBS[category]}
                </p>
              </div>
              <div className="space-y-3">
                {areas.map((a) => (
                  <Link key={a.slug} href={areaGuidePath(a.slug)} className="block">
                    <Card className="border-gray-300 bg-white shadow-sm transition hover:border-emerald-400 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:border-emerald-500">
                      <CardContent className="p-5">
                        <span className="block text-xs font-semibold text-emerald-600">
                          {a.eyebrow}
                        </span>
                        <span className="mt-1 block text-base font-semibold">
                          {a.label}
                        </span>
                        <span className="mt-1 block text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                          {a.blurb}
                        </span>
                        <span className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                          <span>最寄駅：{a.station}</span>
                          <span>歩く時間：{a.walkTime}</span>
                          {spotCounts[a.slug] > 0 && (
                            <span>掲載スポット {spotCounts[a.slug]}件</span>
                          )}
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

      <div className="mt-10 rounded-lg border border-gray-200 bg-gray-50 p-6 dark:border-neutral-700 dark:bg-neutral-900">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          エリアと一緒に決まること
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
          どのエリアを歩くかは、どこに泊まるか、何日いるかと不可分です。
          あわせて読んでください。
        </p>
        <ul className="mt-3 space-y-2 text-sm">
          <li>
            <Link
              href="/sightseeing/hotels"
              className="text-blue-600 hover:opacity-80 dark:text-blue-400"
            >
              宿泊エリア別ホテル選び｜どのゾーンに泊まるべきか
            </Link>
          </li>
          <li>
            <Link
              href="/sightseeing/itinerary"
              className="text-blue-600 hover:opacity-80 dark:text-blue-400"
            >
              ロンドン モデルコース（1〜5日）
            </Link>
          </li>
          <li>
            <Link
              href="/sightseeing/transport/fares"
              className="text-blue-600 hover:opacity-80 dark:text-blue-400"
            >
              運賃と支払い方法のすべて
            </Link>
          </li>
          <li>
            <Link
              href="/sightseeing/all"
              className="text-blue-600 hover:opacity-80 dark:text-blue-400"
            >
              観光スポット一覧
            </Link>
          </li>
        </ul>
      </div>

      <AdSenseUnit slot={AD_SLOTS.articleBottom} className="mt-10" />
    </main>
  );
}
