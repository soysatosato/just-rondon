import Link from "next/link";
import JsonLd from "@/components/seo/JsonLd";
import AdSenseUnit from "@/components/ads/AdSenseUnit";
import { AD_SLOTS } from "@/lib/adsense";
import BreadCrumbs from "@/components/home/BreadCrumbs";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import MarkdownBody from "@/components/jobs/MarkdownBody";
import GuideFaq from "@/components/guides/GuideFaq";
import GuideFreshness from "@/components/guides/GuideFreshness";
import { buildPageMetadata } from "@/lib/seo";
import { breadcrumbJsonLd, faqPageJsonLd } from "@/lib/jsonld";
import { SITE_URL } from "@/lib/seo";
import {
  BEYOND_BASE,
  BEYOND_CATEGORY_BLURBS,
  BEYOND_CATEGORY_LABELS,
  BEYOND_CATEGORY_ORDER,
  BEYOND_SECTION_NAME,
  beyondByCategory,
  beyondHubCollectionJsonLd,
  beyondPath,
} from "@/components/beyond-london/destinations";
import { RAIL_AS_OF, RAIL_UPDATED_AT } from "@/lib/beyond-london/rates";

const TITLE = "Beyond London｜ロンドンから日帰り・週末で行く英国";
const DESCRIPTION = `ロンドンから日帰りで行ける7つの行き先と、週末1泊で行ける4つの行き先を、行き方から書いたガイド。どの駅から何分で、往復いくらで、Oysterが使えるのか。日本語の情報がほとんど書かない「行き方」と「宿と夜」を軸にまとめました。BritRail Passの損得判定つき。${RAIL_AS_OF}時点の情報です。`;

export const metadata = buildPageMetadata({
  path: BEYOND_BASE,
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "ロンドン 日帰り",
    "イギリス 日帰り旅行",
    "ロンドン 郊外",
    "ウィンザー 日帰り",
    "オックスフォード 日帰り",
    "コッツウォルズ 行き方",
    "BritRail Pass",
  ],
});

const INTRO = `ロンドンは、それだけで何日でも過ごせる街です。それでも数日いると、**「イギリスの他の場所も見てみたい」** と思う瞬間が来ます。

このセクションは、そのためのものです。**朝出て夜には戻れる範囲**と、**週末に1泊すれば届く範囲**——このふたつに分けて、行き先をまとめています。

書き方には一つだけ決めごとがあります。**必ず「行き方」から書く**ことです。

日本語の日帰り情報は、その土地に何があるかは丁寧に書きます。しかし**どの駅から乗り、何分かかり、往復いくらで、Oysterが使えるのか**を書いているものは驚くほど少ない。実際に行こうとすると、そこで詰まります。

なので各記事は、街の紹介より先に**行き方の表**を置いています。`;

const FAQ = [
  {
    question: "ロンドンから日帰りできる範囲はどのくらいですか？",
    answer:
      "**片道2時間以内**が現実的な目安です。「日帰りで行ける」に並べた7か所はすべてこの範囲で、朝出て夜にはロンドンに戻れます。[ヨーク](/beyond-london/york)・[エディンバラ](/beyond-london/edinburgh)・[湖水地方](/beyond-london/lake-district)・[ペンザンス](/beyond-london/penzance)はそれ以上遠いので、1泊する前提で組んでください。",
  },
  {
    question: "1泊するなら、どこがいいですか？",
    answer:
      "**距離と目的で決まります**。最も近いのは[ヨーク](/beyond-london/york)（片道2時間）で、日帰りもできますが夜の街が泊まる理由になります。[エディンバラ](/beyond-london/edinburgh)は唯一の「別の国」で、制度も紙幣も変わります。[湖水地方](/beyond-london/lake-district)は自然、[ペンザンス](/beyond-london/penzance)は最も遠いかわりに寝台列車で行けます。",
  },
  {
    question: "宿泊税はかかりますか？",
    answer:
      "**エディンバラだけかかります**。2026年7月24日から宿泊費の5%が上乗せされる制度が始まりました（英国初）。ロンドンをはじめイングランドの都市にはまだありません。予約サイトの表示価格に含まれていないことがあるので、[エディンバラの記事](/beyond-london/edinburgh)で詳しく扱っています。",
  },
  {
    question: "日帰り先でも Oyster やタッチ決済は使えますか？",
    answer:
      "**多くの場合、使えません**。Oysterとタッチ決済が使えるのは原則としてロンドンのゾーン内（Zone 1–9）までです。ウィンザーもブライトンもオックスフォードもゾーン外なので、出発前に目的地までの切符を買う必要があります。各記事の「行き方」で毎回明示しています。",
  },
  {
    question: "切符はいつ買うのが安いですか？",
    answer:
      "**原則として早いほど安いです**。Advance（列車指定）は枚数限定で、安い枠から売り切れます。ただし列車を指定するため、乗り遅れると無効になります。天候で予定が変わる行き先（ブライトンなど）では、当日にOff-Peakを買うほうが合理的なこともあります。詳しくは[英国の鉄道切符の買い方](/sightseeing/transport/national-rail)へ。",
  },
  {
    question: "BritRail Pass は買ったほうがいいですか？",
    answer:
      "**ロンドンを拠点にした日帰り中心の旅程では、まず元が取れません**。日帰り圏は片道£10〜30程度で、パスの1日あたり単価に届かないためです。長距離を3回以上、かつ旅程が直前まで決まらない場合にだけ検討する価値があります。[BritRail Pass は元が取れるのか](/beyond-london/britrail-pass)で数字を出して判定しています。",
  },
  {
    question: "1日でいくつの街を回れますか？",
    answer:
      "**基本は1か所です**。移動に片道1〜2時間かかるため、2か所を詰め込むとどちらも中途半端になります。例外はバースとストーンヘンジで、これは現地発のツアーを使えば1日で回れます。コッツウォルズは村が点在しているので、ツアーかレンタカーなら2〜4か村を回れます。",
  },
];

export default function BeyondHubPage() {
  const collection = beyondHubCollectionJsonLd({
    name: TITLE,
    description: DESCRIPTION,
  });

  return (
    <main className="mx-auto max-w-4xl px-1 py-10 text-gray-900 dark:text-gray-100 sm:px-4">
      <JsonLd data={collection} />
      <JsonLd
        data={breadcrumbJsonLd({
          name: BEYOND_SECTION_NAME,
          path: BEYOND_BASE,
        })}
      />
      <JsonLd data={faqPageJsonLd(FAQ, `${SITE_URL}${BEYOND_BASE}`)} />

      <BreadCrumbs name={BEYOND_SECTION_NAME} />

      <header className="mt-6 space-y-3">
        <h1 className="text-2xl font-bold leading-tight md:text-4xl">
          Beyond London
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          ロンドンから日帰り・週末で行く英国
        </p>
        <GuideFreshness dataAsOf={RAIL_AS_OF} updatedAt={RAIL_UPDATED_AT} />
      </header>

      <Separator className="my-6" />

      <section className="mb-10">
        <MarkdownBody>{INTRO}</MarkdownBody>
      </section>

      <AdSenseUnit slot={AD_SLOTS.inArticle} className="my-10" />

      <div className="space-y-10">
        {BEYOND_CATEGORY_ORDER.map((category) => {
          const items = beyondByCategory(category);

          return (
            <section key={category} className="space-y-4">
              <div className="space-y-1">
                <h2 className="text-lg font-semibold">
                  {BEYOND_CATEGORY_LABELS[category]}
                </h2>
                <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                  {BEYOND_CATEGORY_BLURBS[category]}
                </p>
              </div>

              <div className="space-y-3">
                {items.map((d) => (
                  <Link
                    key={d.slug}
                    href={beyondPath(d.slug)}
                    className="block"
                  >
                    <Card className="border-gray-300 bg-white shadow-sm transition hover:border-teal-400 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:border-teal-500">
                      <CardContent className="p-5">
                        <span className="block text-xs font-semibold text-teal-600">
                          {d.eyebrow}
                        </span>
                        <span className="mt-1 block text-base font-semibold">
                          {d.label}
                        </span>
                        {(d.county || d.journeyTime) && (
                          <span className="mt-1 block text-xs text-gray-500 dark:text-gray-400">
                            {[d.county, d.journeyTime]
                              .filter(Boolean)
                              .join(" ・ ")}
                          </span>
                        )}
                        <span className="mt-2 block text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                          {d.blurb}
                        </span>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <GuideFaq items={FAQ} />

      <div className="mt-10 space-y-2 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-neutral-700 dark:bg-neutral-900 sm:p-6">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          関連ページ
        </h2>
        <ul className="space-y-2 text-sm">
          {[
            {
              href: "/sightseeing/transport/national-rail",
              label: "英国の鉄道切符の買い方｜Advance・Off-Peak・Anytimeの違い",
            },
            {
              href: "/sightseeing/itinerary",
              label: "モデルコース｜日帰りをどの日に入れるか",
            },
            {
              href: "/sightseeing/transport",
              label: "ロンドンの交通ガイド トップ",
            },
            { href: "/history", label: "イギリスの歴史｜訪ねる前に読む" },
          ].map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-blue-600 hover:opacity-80 dark:text-blue-400"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <AdSenseUnit slot={AD_SLOTS.articleBottom} className="mt-10" />
    </main>
  );
}
