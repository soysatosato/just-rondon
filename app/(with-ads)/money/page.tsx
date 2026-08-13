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
import { SITE_URL, buildPageMetadata } from "@/lib/seo";
import { breadcrumbJsonLd, faqPageJsonLd } from "@/lib/jsonld";
import {
  MONEY_BASE,
  MONEY_CATEGORY_LABELS,
  MONEY_CATEGORY_ORDER,
  MONEY_SECTION_NAME,
  moneyGuidePath,
  moneyGuides,
  moneyGuidesByCategory,
  moneyHubCollectionJsonLd,
} from "@/components/money/guides/guides";
import {
  BANKS,
  BANK_KIND_LABELS,
  MONEY_AS_OF,
  MONEY_UPDATED_AT,
  NATIONAL_INSURANCE,
  REVOLUT_WEEKEND_MARKUP_PERCENT,
  TRANSFER_SERVICES,
} from "@/lib/money/rates";

const TITLE = "イギリスの銀行口座と送金ガイド｜渡英直後でも開ける口座はどれか";
const DESCRIPTION = `渡英直後の口座開設が詰まる原因は、ほぼ住所証明です。Monzo と Starling はそれを要求しません。審査に通る条件、日本からの送金で本当に取られている手数料の内訳、National Insurance number の取り方まで、${MONEY_AS_OF}時点の情報で解説します。`;

export const metadata = buildPageMetadata({
  path: MONEY_BASE,
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "イギリス 銀行口座 開設",
    "ロンドン 銀行 おすすめ",
    "イギリス 銀行 審査",
    "日本からイギリス 送金",
    "Wise Revolut 比較",
    "National Insurance number",
    "イギリス 住所証明",
  ],
});

/**
 * 状況から入口を選ばせる。
 *
 * お金まわりは「まだ口座がない/もう開いた」で必要な情報が断絶する。
 * 口座を持っていない人に FSCS の解説を出しても読まれないし、
 * すでに開いた人に開設手順を出しても遅い。
 * 抽象的な目次ではなく、読者が自分の現在地を選べる形にする。
 */
const SCENARIOS: {
  situation: string;
  answer: string;
  detail: string;
  href: string;
  cta: string;
}[] = [
  {
    situation: "渡英したばかり。まだ英国の口座がない",
    answer: "アプリ銀行から開く",
    detail:
      "Monzo か Starling なら住所証明が要りません。パスポートと eVisa のシェアコードで、数分から数日で開きます。高街銀行は後回しで構いません。",
    href: "/money/opening-an-account",
    cta: "口座開設の手順を見る",
  },
  {
    situation: "口座開設を断られた。何が悪かったのか分からない",
    answer: "原因はほぼ住所証明",
    detail:
      "信用スコアではありません。渡英直後に落ちる原因は住所証明の不備がほとんどです。卵と鶏の循環をどこで断つか、落ちたあと何を変えて出し直すか。",
    href: "/money/passing-the-checks",
    cta: "審査の通し方を見る",
  },
  {
    situation: "アプリ銀行で本当に大丈夫なのか不安",
    answer: "FSCS の保護を確認する",
    detail:
      "Monzo と Starling は英国の銀行免許を持ち、£85,000まで預金が保護されます。給与を置くべき口座と、送金の通り道として使う口座の違い。",
    href: "/money/choosing-a-bank",
    cta: "銀行の選び方を見る",
  },
  {
    situation: "日本から生活費や学費を送りたい",
    answer: "手数料より為替の上乗せ",
    detail: `「手数料無料」の送金ほど高いことがあります。取られているのがレートの上乗せだからです。比べるべきは手数料ではなく受取額。週末に送ると損をする話も。`,
    href: "/money/sending-money-from-japan",
    cta: "送金の比較を見る",
  },
  {
    situation: "働き始めたい。NIN がないと働けないのか",
    answer: "働けます",
    detail: `就労権があれば初日から働けます。NIN の通知には${NATIONAL_INSURANCE.processingWeeks}かかるので、待つと収入の開始が1ヶ月遅れます。誤解を信じないでください。`,
    href: "/money/national-insurance-number",
    cta: "NIN の取り方を見る",
  },
];

const FAQ_ITEMS = [
  {
    question: "審査が一番通りやすい銀行はどこですか？",
    answer:
      "**住所証明を要求しないという意味では Monzo と Starling です**。ただし「審査が緩い」わけではありません。本人確認の方式が、パスポートと eVisa のシェアコードによるデジタル確認になっているため、渡英直後で光熱費の請求書を持っていない人でも要件を満たせる、という構造の違いです。高街銀行（HSBC、Lloyds など）は住所証明を求めるため、渡英直後は詰まります。",
  },
  {
    question: "住所証明がなくても口座を開けますか？",
    answer:
      "**アプリ銀行なら開けます**。Monzo、Starling、Revolut は住所証明を要求せず、住所は自己申告で受け付けられます。ホテルや友人宅の住所でも構いませんが、デビットカードの郵送先になるため、数日以内に受け取れる場所にしてください。正式な住居が決まったら変更できます。",
  },
  {
    question: "クレジットヒストリーがないと口座は作れませんか？",
    answer:
      "**作れます**。当座貸越（overdraft）を付けない基本口座であれば、銀行はリスクを取っていないため、信用情報は大きな判断材料になりません。信用情報が効いてくるのは、クレジットカードの発行、携帯の月額契約、賃貸の審査、住宅ローンといった場面です。なお日本での信用情報は英国には引き継がれず、完全に白紙から始まります。",
  },
  {
    question: "日本からの送金で一番安いのはどれですか？",
    answer: `**為替レートに上乗せがない点で Wise が基準になります**。Revolut は平日かつ無料枠の範囲であれば競合しますが、週末は約${REVOLUT_WEEKEND_MARKUP_PERCENT}%の上乗せが入ります。銀行の国際送金は固定手数料に加えて2〜3%程度の上乗せがあり、少額では選ぶ理由が乏しいです。比較する際は手数料ではなく、**同じ金額を送ったときの受取額**を見比べてください。`,
  },
  {
    question: "National Insurance number がないと働けませんか？",
    answer: `**働けます**。雇用主が確認する義務があるのは就労権（right to work）であって、NIN ではありません。eVisa のシェアコードで就労権を証明すれば、NIN が届く前から合法的に働けます。通知までは${NATIONAL_INSURANCE.processingWeeks}かかるため、待っていると収入の開始がそのぶん遅れます。なお NIN がない間は緊急税コードで税金が多く引かれることがありますが、払いすぎた分は後から還付されます。`,
  },
  {
    question: "銀行口座はいくつ持つべきですか？",
    answer:
      "**2本で足ります**。メイン口座（Monzo または Starling）に給与と家賃の引き落としを集約し、送金や多通貨の管理に Revolut か Wise を使う、という構成が実用的です。口座を複数持つことに不利益はなく、維持手数料も基本口座なら無料が標準です。",
  },
];

export default function MoneyHubPage() {
  const pageUrl = `${SITE_URL}${MONEY_BASE}`;

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 text-gray-900 dark:text-gray-100">
      <JsonLd
        data={breadcrumbJsonLd({
          name: MONEY_SECTION_NAME,
          path: MONEY_BASE,
        })}
      />
      <JsonLd
        data={moneyHubCollectionJsonLd({
          name: TITLE,
          description: DESCRIPTION,
        })}
      />
      <JsonLd data={faqPageJsonLd(FAQ_ITEMS, pageUrl)} />

      <BreadCrumbs name={MONEY_SECTION_NAME} />

      <header className="mt-6 space-y-4">
        <h1 className="text-2xl font-bold leading-tight md:text-4xl">
          イギリスの銀行口座と送金ガイド
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Banking, Transfers and National Insurance in the UK
        </p>
        <p className="text-base leading-relaxed text-gray-700 dark:text-gray-300">
          渡英直後に口座開設が詰まる原因は、ほぼ一つです。
          <strong>住所証明</strong>
          。信用スコアではありません。だから対策も単純で、順番を間違えなければ詰まりません。
        </p>
        <GuideFreshness dataAsOf={MONEY_AS_OF} updatedAt={MONEY_UPDATED_AT} />
      </header>

      {/*
        「順番」を最上部に置く。
        この記事群で最も実害を防げるのが、口座 → 住居 → 高街銀行 という
        順序の提示だから。逆順で動くと卵と鶏の循環に入って動けなくなる。
      */}
      <div className="mt-8 rounded-lg border border-sky-300 bg-sky-50/70 p-5 dark:border-sky-900/60 dark:bg-sky-950/25">
        <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
          順番を間違えなければ、卵と鶏の循環には入りません
        </p>
        <ul className="mt-3 space-y-1.5 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
          <li>
            ・<strong>1. 英国の SIM を買う</strong>
            ｜電話番号がないと口座開設が始まりません
          </li>
          <li>
            ・<strong>2. アプリ銀行で口座を開く</strong>
            ｜住所証明が要らないので、ここは詰まりません
          </li>
          <li>
            ・<strong>3. 住まいを決める</strong>
            ｜家賃の引き落としに口座が要るため、この順です
          </li>
          <li>
            ・<strong>4. 必要になったら高街銀行</strong>
            ｜住宅ローンや事業口座の段階で構いません
          </li>
        </ul>
        <p className="mt-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
          「ちゃんとした銀行を先に作ろう」と考えると、高街銀行の住所証明で詰まります。
          <Link
            href="/money/opening-an-account"
            className="text-blue-600 underline underline-offset-2 dark:text-blue-400"
          >
            口座開設の手順
          </Link>
          から始めてください。
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

      <section aria-labelledby="at-a-glance" className="space-y-4">
        <h2 id="at-a-glance" className="text-xl font-bold md:text-2xl">
          銀行と送金の早見表
        </h2>
        <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
          渡英直後の通りやすさ順に並べています。
          <strong>1本目はアプリ銀行</strong>
          、というのがこの表の結論です。
        </p>
        <MarkdownBody>
          {`**口座開設（${MONEY_AS_OF}時点）**

| 銀行 | 種別 | 住所証明 | FSCS保護 | 開設まで |
|---|---|---|---|---|
${BANKS.map(
  (b) =>
    `| ${b.name} | ${BANK_KIND_LABELS[b.kind]} | ${
      b.worksWithoutProofOfAddress ? "不要" : "必要"
    } | ${b.fscsProtected ? "あり" : "要確認"} | ${b.openingTime} |`
).join("\n")}

**日本からの送金**

| サービス | 手数料 | 為替レート | 着金 |
|---|---|---|---|
${TRANSFER_SERVICES.map(
  (s) => `| ${s.name} | ${s.feeModel} | ${s.rateModel} | ${s.speed} |`
).join("\n")}

送金の総コストは「手数料」と「為替レートの上乗せ」の合計です。
**上乗せのほうが大きいことが多く**、手数料が無料でも割高になることがあります。
比べるべきは手数料ではなく、同じ金額を送ったときの**受取額**です。`}
        </MarkdownBody>
      </section>

      <Separator className="my-10" />

      <section aria-labelledby="all-guides" className="space-y-8">
        <div className="space-y-2">
          <h2 id="all-guides" className="text-xl font-bold md:text-2xl">
            お金・銀行ガイド一覧
          </h2>
          <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
            全{moneyGuides.length}
            本。口座を開くところから、日本からの送金、働いて受け取るところまで、
            渡英直後に金が動く順に並べています。
          </p>
        </div>

        {MONEY_CATEGORY_ORDER.map((category) => {
          const guides = moneyGuidesByCategory(category);
          if (guides.length === 0) return null;

          return (
            <div key={category} className="space-y-3">
              <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200">
                {MONEY_CATEGORY_LABELS[category]}
              </h3>
              <div className="space-y-3">
                {guides.map((g) => (
                  <Link
                    key={g.slug}
                    href={moneyGuidePath(g.slug)}
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

      <div className="mt-10 rounded-lg border border-gray-200 bg-gray-50 p-6 dark:border-neutral-700 dark:bg-neutral-900">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          渡英直後に、あわせて片づけること
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
          口座・住まい・GP 登録は互いに絡み合っています。GP
          の登録は無料かつ書類不要ででき、その完了通知が住所証明として使えることもあるため、
          先に済ませておくと口座開設や賃貸の手続きが楽になります。
        </p>
        <ul className="mt-3 space-y-2 text-sm">
          <li>
            <Link
              href="/health"
              className="text-blue-600 hover:opacity-80 dark:text-blue-400"
            >
              医療・NHS ガイド｜GP 登録から救急・薬・歯科まで
            </Link>
          </li>
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
              href="/jobs"
              className="text-blue-600 hover:opacity-80 dark:text-blue-400"
            >
              ロンドンで働く人のための労働問題ガイド
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
        </ul>
      </div>

      <p className="mt-6 rounded-lg border border-amber-200 bg-amber-50/70 p-4 text-xs leading-relaxed text-gray-700 dark:border-amber-900/60 dark:bg-amber-950/25 dark:text-gray-300">
        本サイトの情報は{MONEY_AS_OF}
        時点のもので、金融商品の推奨や投資助言ではありません。手数料・為替の上乗せ・
        口座開設の条件は各社が予告なく変更します。実際に送金・申込みをする前に、
        必ず申込画面に表示される金額とレートをご確認ください。特定の事業者との提携関係はなく、
        掲載順は渡英直後の使いやすさを基準にした編集判断です。
      </p>

      <AdSenseUnit slot={AD_SLOTS.articleBottom} className="mt-10" />
    </main>
  );
}
