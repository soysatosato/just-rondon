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
import TflStatusWidget from "@/components/live/TflStatusWidget";
import { SITE_URL, buildPageMetadata } from "@/lib/seo";
import {
  faqPageJsonLd,
  sightseeingBreadcrumbJsonLd,
} from "@/components/sightseeing/jsonld";
import {
  TRANSPORT_BASE,
  TRANSPORT_CATEGORY_BLURBS,
  TRANSPORT_CATEGORY_LABELS,
  TRANSPORT_CATEGORY_ORDER,
  TRANSPORT_SECTION_NAME,
  transportGuidePath,
  transportGuides,
  transportGuidesByCategory,
  transportHubCollectionJsonLd,
} from "@/components/sightseeing/transport/guides";
import {
  BUS,
  CAPS,
  DRIVING,
  RAILCARD,
  SANTANDER,
  TRANSPORT_AS_OF,
  TRANSPORT_KEY_DATES,
  TRANSPORT_UPDATED_AT,
  TRAVELCARD,
  annualSavingAmount,
  gbp,
  jpDate,
} from "@/lib/transport/rates";

const TITLE = "ロンドンの交通ガイド｜地下鉄・バス・自転車・タクシーの完全版";
const DESCRIPTION = `ロンドンの移動手段を10本の記事で網羅。切符を買わずにタッチ決済で乗る方法、1日${gbp(CAPS.zone1to2.daily)}の上限額、5空港からのアクセス、ロンドンの外に出るときの鉄道切符の買い方、シェアサイクルと配車アプリの使い分け。さらに在住者向けに、定期券の損得、自転車の買い方、車とバイクの維持費まで${TRANSPORT_AS_OF}時点の公式データで解説します。`;

export const metadata = buildPageMetadata({
  path: TRANSPORT_BASE,
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "ロンドン 交通",
    "ロンドン 地下鉄",
    "オイスターカード",
    "ロンドン タッチ決済",
    "ロンドン 交通費",
    "ヒースロー 市内",
    "ロンドン バス",
    "ロンドン 定期券",
  ],
});

/**
 * 状況から入口を選ばせる。
 *
 * 交通の記事は「今どういう立場でロンドンにいるか」で必要な情報がまるごと違う。
 * 3日間の旅行者に定期券の損得を出しても読まれないし、
 * 2年住む人に「Oyster は買わなくていい」だけを言っても足りない。
 * /housing ハブと同じく、抽象的な目次ではなく読者の現在地を選ばせる。
 */
const SCENARIOS: {
  situation: string;
  answer: string;
  detail: string;
  href: string;
  cta: string;
}[] = [
  {
    situation: "初めてのロンドン。切符はどこで買うのか分からない",
    answer: "買いません",
    detail: `日本で使っているタッチ決済のクレジットカードを、そのまま改札にかざすだけです。運賃は Oyster と同額で、1日 ${gbp(CAPS.zone1to2.daily)} を超えて請求されることもありません。ただし JCB は使えません。`,
    href: "/sightseeing/transport/fares",
    cta: "運賃と支払い方法を見る",
  },
  {
    situation: "空港に着いた。市内までどう行けばいい？",
    answer: "空港ごとに最適解が違う",
    detail: `ヒースローなら最安がピカデリー線 ${gbp(5.9)}、最適がエリザベス・ライン、最速がヒースロー・エクスプレス。ガトウィックは Thameslink が狙い目です。深夜着の対処法も。`,
    href: "/sightseeing/transport/airports",
    cta: "5空港のアクセスを見る",
  },
  {
    situation: "地下鉄の路線図に色が多すぎて分からない",
    answer: "5種類の鉄道が走っている",
    detail:
      "チューブ、エリザベス・ライン、オーバーグラウンド、DLR、ナショナル・レール。運賃は共通ですが、快適さと速さが違います。週末の計画運休への備えも必須です。",
    href: "/sightseeing/transport/tube",
    cta: "鉄道の使い分けを見る",
  },
  {
    situation: "バスは難しそうで避けている",
    answer: "実はいちばん安い",
    detail: `どこまで乗っても ${gbp(BUS.single)}、${BUS.hopperMinutes}分以内の乗り継ぎは無料、降車時のタッチも不要。2階最前列は有料の観光バスと同じ景色です。ただし${jpDate(TRANSPORT_KEY_DATES.busFareRise)}に値上げされます。`,
    href: "/sightseeing/transport/bus",
    cta: "バスの乗り方を見る",
  },
  {
    situation: "自転車で回りたい。どのサービスが安い？",
    answer: "Santander の Day Pass",
    detail: `${gbp(SANTANDER.dayPass)} で24時間、${SANTANDER.passRideMinutes}分以内の乗車が何度でも。Lime と Forest は分課金なので、20分乗ると £7 前後になります。私有の電動キックボードは公道走行が違法です。`,
    href: "/sightseeing/transport/cycling",
    cta: "シェアサイクルを比べる",
  },
  {
    situation: "深夜に移動したい。タクシーは安全？",
    answer: "呼び方で決まる",
    detail:
      "街で拾えるのはブラックキャブだけ。Uber と Bolt は同じ区間で3〜4割違うので必ず比較を。路上で声をかけてくる車は、その時点で違法です。",
    href: "/sightseeing/transport/taxi",
    cta: "タクシーの使い分けを見る",
  },
  {
    situation: "ロンドンで働き始めた。定期券は買うべき？",
    answer: "働き方によります",
    detail: `7 Day Travelcard は週の上限額と同額なので無意味です。週5日出社なら年間定期が年 ${gbp(annualSavingAmount("zone1to2"))} 得。週4日以下なら都度払いのほうが安くなります。`,
    href: "/sightseeing/transport/travelcard",
    cta: "定期券の損得を計算する",
  },
  {
    situation: "毎日の交通費を減らしたい",
    answer: "自転車を買う",
    detail: `Zone 1–2 の年間定期 ${gbp(TRAVELCARD.zone1to2.annual)} で、通勤に十分な自転車が買えます。Cycle to Work なら実質3〜4割引き。ただし盗難対策が前提条件です。`,
    href: "/sightseeing/transport/own-bike",
    cta: "自転車の買い方を見る",
  },
  {
    situation: "車かバイクを持ちたい。免許はどうなる？",
    answer: `日本の免許は${DRIVING.foreignLicenceMonths}ヶ月で切れる`,
    detail: `居住者になってから${DRIVING.foreignLicenceMonths}ヶ月を過ぎたら英国免許が必要です。日本は指定国なので試験なしで交換できます。Congestion Charge は ${gbp(DRIVING.congestionCharge)}、バイクは免除。`,
    href: "/sightseeing/transport/car",
    cta: "車・バイクの実務を見る",
  },
];

const FAQ_ITEMS = [
  {
    question: "ロンドンで切符を買う必要はありますか？",
    answer: `**ありません**。日本で発行された Visa / Mastercard / American Express のタッチ決済対応カード、または Apple Pay・Google Pay をそのまま改札にかざせば乗れます。運賃は Oyster カードと同額です。ただし **JCB は非対応**なので、JCB しか持っていない場合は別のカードを用意するか、現地で Oyster を買ってください。`,
  },
  {
    question: "1日の交通費はいくらぐらいですか？",
    answer: `観光でよく使う Zone 1–2 なら、**1日の上限額 ${gbp(CAPS.zone1to2.daily)}** を超えて請求されることはありません（${TRANSPORT_AS_OF}時点）。月曜〜日曜の週の上限は ${gbp(CAPS.zone1to2.weekly)} です。バスだけの日は1日 ${gbp(BUS.dailyCap)} が上限になります。`,
  },
  {
    question: "Oyster カードは買ったほうがいいですか？",
    answer:
      "**ほとんどの旅行者には不要です**。運賃はタッチ決済と同額で、カード代がかかるうえ、週の上限額がタッチ決済にしか適用されません。Oyster が必要になるのは、タッチ決済対応カードを持っていない場合、Railcard の割引を使いたい場合、子ども料金を設定したい場合です。",
  },
  {
    question: "ロンドンに住む場合、定期券を買うべきですか？",
    answer: `**週5日出社しているなら年間 Travelcard が得です**（Zone 1–2 で年 ${gbp(annualSavingAmount("zone1to2"))} の節約）。**週4日以下なら、何も買わずにタッチ決済のほうが安くなります**。上限額が自動で守ってくれるためです。7 Day Travelcard は週の上限額とまったく同額なので、買う意味がありません。`,
  },
  {
    question: "Railcard は TfL の路線でも使えますか？",
    answer: `**Oyster カードに紐付ければ使えます。**年 ${gbp(RAILCARD.annual)} の Railcard を駅の窓口で Oyster に紐付けると、地下鉄・オーバーグラウンド・エリザベス・ラインの**オフピーク運賃と1日上限が${RAILCARD.discountRate}引き**になります。ただし**タッチ決済のクレジットカードには紐付けられません**（${TRANSPORT_AS_OF}時点）。ピーク時間帯にも適用されません。`,
  },
  {
    question: "ロンドンで車を持つ意味はありますか？",
    answer: `**Zone 1–2 に住んでいるなら、ほぼありません。**Congestion Charge が1日 ${gbp(DRIVING.congestionCharge)}、年間の維持費が購入費を除いて ${gbp(DRIVING.runningCostLow)}〜${gbp(DRIVING.runningCostHigh)}、そして駐車許可証が取れない住所もあります。郊外在住、子どもが複数いる、仕事で機材を運ぶといった事情がなければ、カーシェアやレンタカーのほうが安く済みます。なお**バイクは Congestion Charge が免除**されます。`,
  },
  {
    question: "日本の運転免許でロンドンを運転できますか？",
    answer: `**英国の居住者になってから${DRIVING.foreignLicenceMonths}ヶ月間だけ**です。それ以降は英国の免許が必要になります。ただし**日本は DVLA の指定国**なので、居住者になってから${DRIVING.exchangeWithinYears}年以内であれば、試験を受けずに交換できます（D1 申請、手数料 ${gbp(DRIVING.licenceExchangeFee)}、大使館発行の翻訳証明が必要）。`,
  },
  {
    question: "クリスマスに移動できますか？",
    answer:
      "**12月25日は、地下鉄・バス・鉄道のほぼすべてが運休します**。この日の移動手段は徒歩かタクシー（料金は割増）だけです。12月26日（Boxing Day）も大幅な減便になります。年末年始にロンドンにいるなら、25日は移動しない前提で計画してください。",
  },
];

export default function TransportHubPage() {
  const pageUrl = `${SITE_URL}${TRANSPORT_BASE}`;

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 text-gray-900 dark:text-gray-100">
      <JsonLd
        data={sightseeingBreadcrumbJsonLd([
          { name: TRANSPORT_SECTION_NAME, path: TRANSPORT_BASE },
        ])}
      />
      <JsonLd
        data={transportHubCollectionJsonLd({
          name: TITLE,
          description: DESCRIPTION,
        })}
      />
      <JsonLd data={faqPageJsonLd(FAQ_ITEMS, pageUrl)} />

      <Breadcrumbs path="/sightseeing/transport" />

      <header className="mt-6 space-y-4">
        <h1 className="text-2xl font-bold leading-tight md:text-4xl">
          ロンドンの交通ガイド
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Getting Around London
        </p>
        <p className="text-base leading-relaxed text-gray-700 dark:text-gray-300">
          ロンドンの移動で必要な情報は、<strong>数日いるのか、数年いるのか</strong>
          でまったく違います。旅行者は上の2段だけで足ります。定期券の損得や自転車・車の買い方は、
          住み始めてから読んでください。
        </p>
        <GuideFreshness
          dataAsOf={TRANSPORT_AS_OF}
          updatedAt={TRANSPORT_UPDATED_AT}
        />
      </header>

      {/*
        「切符を買わない」を最上部に置く。
        日本語で流通しているロンドンの交通情報は、いまだに
        「まず Oyster カードを買いましょう」から始まるものが多く、
        読者が空港や駅で券売機の列に並ぶという実害が出ているため。
      */}
      <div className="mt-8 rounded-lg border border-emerald-300 bg-emerald-50/70 p-5 dark:border-emerald-900/60 dark:bg-emerald-950/25">
        <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
          先に結論：ロンドンで切符は買いません
        </p>
        <ul className="mt-3 space-y-1.5 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
          <li>
            ・
            <strong>
              日本のタッチ決済対応クレジットカードを、そのまま改札にかざすだけ
            </strong>
            です。事前登録も券売機も要りません
          </li>
          <li>
            ・運賃は Oyster カードと<strong>同額</strong>。Oyster を買う理由は
            ほとんどの人にありません
          </li>
          <li>
            ・<strong>JCB は使えません。</strong>Visa か Mastercard を用意して
            ください
          </li>
          <li>
            ・Zone 1–2 なら
            <strong>1日 {gbp(CAPS.zone1to2.daily)}、週 {gbp(CAPS.zone1to2.weekly)}</strong>
            を超えて請求されることはありません
          </li>
          <li>
            ・<strong>降りるときもタッチ</strong>
            が必要です（バスは不要）。忘れると最大運賃を引かれます
          </li>
        </ul>
        <p className="mt-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
          仕組みの詳細は
          <Link
            href="/sightseeing/transport/fares"
            className="text-blue-600 underline underline-offset-2 dark:text-blue-400"
          >
            運賃と支払い方法のすべて
          </Link>
          にまとめています。
        </p>
      </div>

      {/*
        運行状況は記事本文と違って毎日変わる。
        滞在中の読者がこのページを繰り返し開く理由になるので、
        目次(状況を選ぶセクション)より前に置いている。
        外部APIが落ちているときはウィジェットが自分で消える。
        天気はこのページのテーマ(交通)と直接関係がないため、
        トップページのLiveStripのみに表示する。
      */}
      <div className="mt-8">
        <TflStatusWidget />
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

      <section aria-labelledby="cost-overview" className="space-y-4">
        <h2 id="cost-overview" className="text-xl font-bold md:text-2xl">
          料金の早見表
        </h2>
        <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
          予算を立てるための基準線です。上限額と定期券の価格は
          <strong>{TRANSPORT_KEY_DATES.capsFrozenUntil}まで据え置き</strong>
          が公式にアナウンスされています。
        </p>
        <MarkdownBody>
          {`**旅行者が知っておけばいい数字（${TRANSPORT_AS_OF}時点）**

| 項目 | 金額 |
|---|---:|
| 地下鉄・鉄道の1日上限（Zone 1–2） | ${gbp(CAPS.zone1to2.daily)} |
| 同、月〜日の上限 | ${gbp(CAPS.zone1to2.weekly)} |
| バス・トラム 1回 | ${gbp(BUS.single)}（${jpDate(TRANSPORT_KEY_DATES.busFareRise)}から ${gbp(BUS.from2026Nov.single)}） |
| バス・トラムの1日上限 | ${gbp(BUS.dailyCap)}（同 ${gbp(BUS.from2026Nov.dailyCap)}） |
| ヒースロー〜Zone 1（ピカデリー線） | ${gbp(5.9)} |
| ヒースロー〜Zone 1（エリザベス・ライン） | ${gbp(15.5)} |
| シェアサイクル 1日券（Santander） | ${gbp(SANTANDER.dayPass)} |

**在住者が知っておけばいい数字**

| 項目 | 金額 |
|---|---:|
| 年間 Travelcard（Zone 1–2） | ${gbp(TRAVELCARD.zone1to2.annual)} |
| 年間 Travelcard（Zone 1–6） | ${gbp(TRAVELCARD.zone1to6.annual)} |
| 月額 Bus & Tram Pass | ${gbp(BUS.passMonthly)} |
| Railcard（年） | ${gbp(RAILCARD.annual)} → オフピークが${RAILCARD.discountRate}引き |
| Santander Cycles 年間会員 | ${gbp(SANTANDER.annual)} |
| Congestion Charge（1日） | ${gbp(DRIVING.congestionCharge)}（バイクは免除） |
| ULEZ（基準外の車両・1日） | ${gbp(DRIVING.ulezDaily)} |
| 車の年間維持費（購入費を除く） | ${gbp(DRIVING.runningCostLow)}〜${gbp(DRIVING.runningCostHigh)} |

金額はすべて大人料金です。**11歳未満は大人と一緒なら地下鉄・バスとも無料**になります。`}
        </MarkdownBody>
      </section>

      <Separator className="my-10" />

      <section aria-labelledby="all-guides" className="space-y-8">
        <div className="space-y-2">
          <h2 id="all-guides" className="text-xl font-bold md:text-2xl">
            交通ガイド一覧
          </h2>
          <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
            全{transportGuides.length}本。旅行者は上の2段、ロンドンに住む人は
            3段目まで読んでください。
          </p>
        </div>

        {TRANSPORT_CATEGORY_ORDER.map((category) => {
          const guides = transportGuidesByCategory(category);
          if (guides.length === 0) return null;

          return (
            <div key={category} className="space-y-3">
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200">
                  {TRANSPORT_CATEGORY_LABELS[category]}
                </h3>
                <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                  {TRANSPORT_CATEGORY_BLURBS[category]}
                </p>
              </div>
              <div className="space-y-3">
                {guides.map((g) => (
                  <Link
                    key={g.slug}
                    href={transportGuidePath(g.slug)}
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
            </div>
          );
        })}
      </section>

      <GuideFaq items={FAQ_ITEMS} />

      <div className="mt-10 rounded-lg border border-gray-200 bg-gray-50 p-6 dark:border-neutral-700 dark:bg-neutral-900">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          移動と一緒に決まること
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
          どこに泊まるか、どこに住むかは、そのまま毎日の移動時間と交通費になります。
          宿とエリアの選び方は、交通の話と一緒に読んでください。
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
              href="/housing/where-to-live"
              className="text-blue-600 hover:opacity-80 dark:text-blue-400"
            >
              エリアの選び方と、家賃と交通費の総額
            </Link>
          </li>
          <li>
            <Link
              href="/sightseeing/travel-tips"
              className="text-blue-600 hover:opacity-80 dark:text-blue-400"
            >
              ロンドン旅行の実用情報｜両替・カード・治安・eSIM
            </Link>
          </li>
        </ul>
      </div>

      <p className="mt-6 rounded-lg border border-amber-200 bg-amber-50/70 p-4 text-xs leading-relaxed text-gray-700 dark:border-amber-900/60 dark:bg-amber-950/25 dark:text-gray-300">
        本サイトの料金・制度は{TRANSPORT_AS_OF}時点で TfL・GOV.UK
        の公式情報を確認したものです。地下鉄・鉄道の運賃は毎年3月に、バス・トラムの運賃は
        {jpDate(TRANSPORT_KEY_DATES.busFareRise)}に改定されます。Congestion Charge
        は{jpDate(TRANSPORT_KEY_DATES.congestionChargeRevision)}
        に改定済みです。運転免許・車両登録・保険に関する記述は情報提供を目的としたもので、
        法的助言ではありません。実際の手続きにあたっては、TfL・GOV.UK・DVLA
        の最新情報を必ずご確認ください。
      </p>

      <AdSenseUnit slot={AD_SLOTS.articleBottom} className="mt-10" />
    </main>
  );
}
