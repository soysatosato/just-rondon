import Link from "next/link";
import JsonLd from "@/components/seo/JsonLd";
import AdSenseUnit from "@/components/ads/AdSenseUnit";
import { AD_SLOTS } from "@/lib/adsense";
import Breadcrumbs from "@/components/navigation/Breadcrumbs";
import GuideFaq from "@/components/guides/GuideFaq";
import GuideFreshness from "@/components/guides/GuideFreshness";
import { SITE_URL, buildPageMetadata } from "@/lib/seo";
import { breadcrumbJsonLd, faqPageJsonLd } from "@/lib/jsonld";
import {
  BILLS_BASE,
  BILLS_CATEGORY_LABELS,
  BILLS_SECTION_NAME,
  billsGuidePath,
  billsGuides,
  billsHubCollectionJsonLd,
  getBillsGuideMeta,
} from "@/components/bills/guides/guides";
import { billsGuideArticles } from "@/components/bills/guides/content";
import {
  BILLS_AS_OF,
  BILLS_UPDATED_AT,
  COUNCIL_TAX,
  ENERGY_CAP,
  ENERGY_STANDING_PER_MONTH,
  TELECOM,
  TV_LICENCE,
  WATER,
  gbp,
  gbpRound,
} from "@/lib/bills/rates";

const TITLE =
  "イギリスの光熱費と生活の契約ガイド｜Council Tax・ガス電気・水道・TV Licence・ネット回線";
const DESCRIPTION = `家賃のほかに毎月出ていくお金は、ほぼ Council Tax・ガス電気・水道・ネット回線・TV Licence の5つです。入居の前後にどの順で片づけるか、それぞれ誰が払っていくらかかるか、「bills included」の中身の確かめ方まで、${BILLS_AS_OF}時点の制度と料金で解説します。`;

export const metadata = buildPageMetadata({
  path: BILLS_BASE,
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "イギリス 光熱費",
    "ロンドン 生活費 光熱費",
    "Council Tax",
    "イギリス 引っ越し 手続き",
    "bills included",
    "TV licence",
    "イギリス ネット回線",
  ],
});

/**
 * 状況カード。文言は記事の audience から引く(医療ハブと同じ作り)。
 * answer と detail だけをハブ側で持つ。
 */
const SCENARIOS: { slug: string; answer: string; detail: string }[] = [
  {
    slug: "bills-included",
    answer: "5項目を1つずつ確かめる",
    detail:
      "bills included に決まった意味はありません。council tax が別のことが多く、「込み」でも使用量の上限がついていることがあります。含まれない分を足してから家賃を比べます。",
  },
  {
    slug: "council-tax",
    answer: "区に登録し、割引を申請する",
    detail: `ロンドン平均で Band D 年${gbp(
      COUNCIL_TAX.londonBandD
    )}。一人暮らしは${COUNCIL_TAX.singlePersonDiscountPercent}%引き、全員フルタイム学生なら免除ですが、どちらも申請しないと適用されません。`,
  },
  {
    slug: "energy",
    answer: "まずメーターを撮る",
    detail: `契約は入居した時点ですでにあります。price cap は単価の上限で、基本料金だけで月約${gbpRound(
      ENERGY_STANDING_PER_MONTH
    )}。前の住人の使用分と切り離すのが最初の仕事です。`,
  },
  {
    slug: "water",
    answer: "会社は選べない。届け出るだけ",
    detail: `ロンドンの大半は ${WATER.company} で、典型的な年額は${gbp(
      WATER.typicalAnnual
    )}。メーターのない家に一人で住むなら、メーターを付けると安くなることがあります。`,
  },
  {
    slug: "tv-licence",
    answer: "何を見るかで決まる",
    detail: `ライブ放送と BBC iPlayer を見るなら年${gbp(
      TV_LICENCE.annual
    )}。Netflix のオンデマンドだけなら不要で、届く手紙には「要らない」と申告すれば止まります。`,
  },
  {
    slug: "broadband",
    answer: "入居日が決まったら申し込む",
    detail: `開通には日数がかかります。途中の値上げは、${TELECOM.poundsAndPenceRuleFrom}以降の契約なら£いくらかが契約時に明記されています。`,
  },
  {
    slug: "mobile",
    answer: "SIM only で番号を確保する",
    detail:
      "英国の番号がないと、銀行も物件探しも始まりません。本体込みの長期契約は信用審査で落ちやすいので、渡英直後は審査の軽い契約から。",
  },
];

const FAQ_ITEMS = [
  {
    question: "ロンドンの光熱費は家賃のほかに月いくらかかりますか。",
    answer: `住み方と物件で大きく変わりますが、5項目すべてを自分たちで払う場合、世帯で見ると Council Tax（ロンドン平均 Band D で年${gbp(
      COUNCIL_TAX.londonBandD
    )}）、ガス・電気（Ofgem の典型的な世帯で年${gbp(
      ENERGY_CAP.typicalAnnual
    )}）、水道（${WATER.company} の典型的な年額${gbp(
      WATER.typicalAnnual
    )}）、TV Licence（年${gbp(
      TV_LICENCE.annual
    )}）、それにネット回線の月額が加わります。シェアならこれを人数で割ります。`,
  },
  {
    question: "入居したら何に連絡すればいいですか。",
    answer:
      "区（Council Tax の登録）、ガス・電気の供給会社（入居日とメーターの数値）、水道会社（入居の届け出）の3つです。ネット回線は入居前に申し込んでおき、テレビのライブ放送や BBC iPlayer を見るなら TV Licence も必要です。bills included の物件では、大家が契約しているものは連絡不要です。",
  },
  {
    question: "Council Tax は外国人やワーホリでも払いますか。",
    answer: `払います。ビザの種類で免除されることはなく、一人暮らしの${COUNCIL_TAX.singlePersonDiscountPercent}%割引やフルタイム学生の免除も英国人と同じ条件で判定されます。部屋ごとに別々の契約で貸すシェアハウスでは大家が払うので、借りる側には請求されません。`,
  },
  {
    question: "テレビを見ないのに TV Licensing から手紙が来ます。",
    answer:
      "ライブ放送も BBC iPlayer も見ていないなら、TV Licensing のサイトで「No Licence Needed」の申告をすれば手紙は止まります。無料で数分で終わります。",
  },
  {
    question: "光熱費を払えなくなったらどうなりますか。",
    answer:
      "Council Tax は1回の遅れで年額の残りを一括請求される仕組みがあり、最も進みが速いので、払えないと分かった時点で区に連絡してください。ガス・電気は供給会社に支払い計画を相談でき、家庭の水道は未払いを理由に止められることはありません。どれも Citizens Advice に無料で相談できます。",
  },
];

/** 状況カード1枚。見出しは記事の audience。 */
function ScenarioCard({
  slug,
  answer,
  detail,
}: {
  slug: string;
  answer: string;
  detail: string;
}) {
  const meta = getBillsGuideMeta(slug);
  if (!meta) return null;

  const audience = billsGuideArticles[slug]?.audience ?? meta.blurb;

  return (
    <Link href={billsGuidePath(slug)} className="block">
      <article className="flex h-full flex-col rounded-xl border border-gray-300 bg-white p-5 shadow-sm transition hover:border-sky-400 hover:shadow-md dark:border-neutral-700 dark:bg-neutral-900 dark:hover:border-sky-500">
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
          {BILLS_CATEGORY_LABELS[meta.category]}
        </p>
        <p className="mt-1.5 text-sm font-semibold leading-snug text-gray-900 dark:text-gray-100">
          {audience}
        </p>
        <p className="mt-3 text-xs font-bold tracking-wide text-sky-600 dark:text-sky-400">
          → {answer}
        </p>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
          {detail}
        </p>
        <span className="mt-4 text-sm font-medium text-blue-600 dark:text-blue-400">
          {meta.label} を読む →
        </span>
      </article>
    </Link>
  );
}

export default function BillsHubPage() {
  const pageUrl = `${SITE_URL}${BILLS_BASE}`;

  const costRows = [
    {
      label: "Council Tax",
      value: `年${gbp(COUNCIL_TAX.londonBandD)}`,
      note: `ロンドン平均 Band D（${COUNCIL_TAX.year}）。${COUNCIL_TAX.defaultInstalments}回払いなら1回約${gbpRound(
        COUNCIL_TAX.londonBandD / COUNCIL_TAX.defaultInstalments
      )}。区で半分にも倍にもなる`,
      href: billsGuidePath("council-tax"),
    },
    {
      label: "ガス・電気",
      value: `年${gbp(ENERGY_CAP.typicalAnnual)}`,
      note: `Ofgem の典型的な世帯（${ENERGY_CAP.period}）。基本料金だけで月約${gbpRound(
        ENERGY_STANDING_PER_MONTH
      )}`,
      href: billsGuidePath("energy"),
    },
    {
      label: "水道",
      value: `年${gbp(WATER.typicalAnnual)}`,
      note: `${WATER.company} の典型的な上下水道（${WATER.year}）。月にすると約${gbpRound(
        WATER.typicalAnnual / 12
      )}`,
      href: billsGuidePath("water"),
    },
    {
      label: "TV Licence",
      value: `年${gbp(TV_LICENCE.annual)}`,
      note: "ライブ放送か BBC iPlayer を見る場合だけ。見ないなら不要",
      href: billsGuidePath("tv-licence"),
    },
  ];

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 text-gray-900 dark:text-gray-100">
      <JsonLd
        data={breadcrumbJsonLd({
          name: BILLS_SECTION_NAME,
          path: BILLS_BASE,
        })}
      />
      <JsonLd
        data={billsHubCollectionJsonLd({
          name: TITLE,
          description: DESCRIPTION,
        })}
      />
      <JsonLd data={faqPageJsonLd(FAQ_ITEMS, pageUrl)} />

      <Breadcrumbs path={BILLS_BASE} />

      <header className="mt-6 space-y-4">
        <h1 className="text-2xl font-bold leading-tight md:text-4xl">
          イギリスの光熱費と生活の契約ガイド
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Household Bills in London: Council Tax, Energy, Water, TV Licence and
          Broadband
        </p>
        <p className="text-base leading-relaxed text-gray-700 dark:text-gray-300">
          家賃のほかに毎月出ていくお金は、ほぼ5つに決まっています。
          <strong>Council Tax・ガス電気・水道・ネット回線・TV Licence</strong>
          。どれも入居した日から発生し、日本と違って
          <strong>ガスと電気は申し込む前から契約が始まっています</strong>。
        </p>
        <GuideFreshness dataAsOf={BILLS_AS_OF} updatedAt={BILLS_UPDATED_AT} />
      </header>

      {/*
        「順番」を最上部に置く。
        この記事群で最も実害を防げるのが、入居の前後に何をいつやるかの提示だから。
        ネット回線を入居後に探すと数週間つながらず、メーターを撮り忘れると
        前の住人の使用分を払わされ、Council Tax の登録を忘れると遡って請求される。
        どれも「知っていれば起きない」失敗なので、手順として先に見せる。
      */}
      <div className="mt-8 rounded-lg border border-sky-300 bg-sky-50/70 p-5 dark:border-sky-900/60 dark:bg-sky-950/25">
        <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
          入居の前後に、この順で片づけます
        </p>
        <ol className="mt-3 space-y-2 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
          <li>
            <strong>1. 契約前｜bills に何が含まれるかをメールで確かめる</strong>
            <span className="block text-gray-600 dark:text-gray-400">
              含まれない分を足してから家賃を比べる。
              <Link
                href={billsGuidePath("bills-included")}
                className="text-blue-600 underline underline-offset-2 dark:text-blue-400"
              >
                bills included の中身
              </Link>
            </span>
          </li>
          <li>
            <strong>2. 入居日が決まったら｜ネット回線を申し込む</strong>
            <span className="block text-gray-600 dark:text-gray-400">
              開通日を入居日以降に指定する。入居してからでは数週間つながらない。
              <Link
                href={billsGuidePath("broadband")}
                className="text-blue-600 underline underline-offset-2 dark:text-blue-400"
              >
                ネット回線
              </Link>
            </span>
          </li>
          <li>
            <strong>3. 入居日｜ガス・電気・水道のメーターを撮る</strong>
            <span className="block text-gray-600 dark:text-gray-400">
              これで前の住人の使用分と切り離せる。
              <Link
                href={billsGuidePath("energy")}
                className="text-blue-600 underline underline-offset-2 dark:text-blue-400"
              >
                ガス・電気
              </Link>
            </span>
          </li>
          <li>
            <strong>4. 入居後すぐ｜区・供給会社・水道会社に届け出る</strong>
            <span className="block text-gray-600 dark:text-gray-400">
              Council Tax の割引や免除は、ここで同時に申請する。
              <Link
                href={billsGuidePath("council-tax")}
                className="text-blue-600 underline underline-offset-2 dark:text-blue-400"
              >
                Council Tax
              </Link>
              ・
              <Link
                href={billsGuidePath("water")}
                className="text-blue-600 underline underline-offset-2 dark:text-blue-400"
              >
                水道
              </Link>
            </span>
          </li>
          <li>
            <strong>5. ライブ放送か iPlayer を見るなら｜TV Licence を買う</strong>
            <span className="block text-gray-600 dark:text-gray-400">
              見ないなら、届く手紙に「要らない」と申告する。
              <Link
                href={billsGuidePath("tv-licence")}
                className="text-blue-600 underline underline-offset-2 dark:text-blue-400"
              >
                TV Licence
              </Link>
            </span>
          </li>
        </ol>
        <p className="mt-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
          英国の電話番号がまだなければ、これより前に
          <Link
            href={billsGuidePath("mobile")}
            className="text-blue-600 underline underline-offset-2 dark:text-blue-400"
          >
            SIM を確保
          </Link>
          してください。どの届け出も、電話番号が前提です。
        </p>
      </div>

      <section aria-labelledby="cost-overview" className="mt-10">
        <h2 id="cost-overview" className="text-xl font-bold md:text-2xl">
          家賃のほかに、年いくら出ていくか
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
          世帯あたりの目安です。シェアなら人数で割ります。ネット回線は事業者と
          契約で違うので、ここには含めていません。
          <strong>ガス・電気は{ENERGY_CAP.nextChange}に、それ以外は毎年4月に改定</strong>
          されます。
        </p>

        <dl className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {costRows.map((row) => (
            <div
              key={row.label}
              className="flex flex-col rounded-lg border border-gray-200 p-4 dark:border-neutral-700"
            >
              <dt className="text-xs font-bold text-gray-500 dark:text-gray-400">
                {row.label}
              </dt>
              <dd className="mt-1 flex flex-1 flex-col">
                <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  {row.value}
                </span>
                <span className="mt-0.5 flex-1 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
                  {row.note}
                </span>
                <Link
                  href={row.href}
                  className="mt-2 text-xs font-medium text-blue-600 hover:opacity-80 dark:text-blue-400"
                >
                  詳しく →
                </Link>
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <AdSenseUnit slot={AD_SLOTS.listing} className="my-10" />

      <section aria-labelledby="find-your-stage" className="mt-10">
        <h2 id="find-your-stage" className="text-xl font-bold md:text-2xl">
          自分の状況を選んでください
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
          全{billsGuides.length}本。一番近いものが1つ見つかれば、それがあなたの読むべきページです。
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {SCENARIOS.map((s) => (
            <ScenarioCard key={s.slug} {...s} />
          ))}
        </div>
      </section>

      <GuideFaq items={FAQ_ITEMS} />

      <div className="mt-10 rounded-lg border border-gray-200 bg-gray-50 p-6 dark:border-neutral-700 dark:bg-neutral-900">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          住み始める前後に、あわせて必要になること
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
          光熱費の引き落としには英国の銀行口座が要り、物件選びの段階で
          Council Tax の band と暖房方式を見ておくと、入居後の請求で驚かずに済みます。
        </p>
        <ul className="mt-3 space-y-2 text-sm">
          <li>
            <Link
              href="/housing"
              className="text-blue-600 hover:opacity-80 dark:text-blue-400"
            >
              住まい探しガイド｜物件探しから契約・退去まで
            </Link>
          </li>
          <li>
            <Link
              href="/money"
              className="text-blue-600 hover:opacity-80 dark:text-blue-400"
            >
              お金・銀行ガイド｜口座開設と日本からの送金
            </Link>
          </li>
          <li>
            <Link
              href="/food"
              className="text-blue-600 hover:opacity-80 dark:text-blue-400"
            >
              食費を抑えるコツ｜Meal Deal から買う店の選び方まで
            </Link>
          </li>
          <li>
            <Link
              href="/health"
              className="text-blue-600 hover:opacity-80 dark:text-blue-400"
            >
              医療・NHS ガイド｜GP 登録から救急・薬・歯科まで
            </Link>
          </li>
        </ul>
      </div>

      <p className="mt-6 rounded-lg border border-amber-200 bg-amber-50/70 p-4 text-xs leading-relaxed text-gray-700 dark:border-amber-900/60 dark:bg-amber-950/25 dark:text-gray-300">
        本サイトの情報は{BILLS_AS_OF}
        時点のイングランドの制度と料金にもとづく情報提供で、特定の事業者や料金プランを
        勧めるものではありません。ガス・電気の単価は3か月ごと、Council Tax・水道・
        TV Licence は毎年4月に改定され、Council Tax は区によっても大きく違います。
        実際の金額は請求書と各機関の公式ページでご確認ください。
      </p>

      <AdSenseUnit slot={AD_SLOTS.articleBottom} className="mt-10" />
    </main>
  );
}
