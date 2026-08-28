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
  TROUBLE_BASE,
  TROUBLE_CATEGORY_LABELS,
  TROUBLE_CATEGORY_ORDER,
  TROUBLE_SECTION_NAME,
  troubleGuidePath,
  troubleGuides,
  troubleGuidesByCategory,
  troubleHubCollectionJsonLd,
} from "@/components/trouble/guides/guides";
import {
  EMBASSY,
  EMERGENCY_CONTACTS,
  FRAUD_REIMBURSEMENT,
  FRAUD_REPORTING,
  POLICE_REPORT,
  SILENT_SOLUTION,
  STALKING_SUPPORT,
  TFL_LOST_PROPERTY,
  TROUBLE_AS_OF,
  TROUBLE_UPDATED_AT,
  gbpLarge,
} from "@/lib/trouble/contacts";

const TITLE = "ロンドンのトラブル対応ガイド｜盗難・紛失・警察への届出";
const DESCRIPTION = `ロンドンでスリに遭った、パスポートを失くした、落とし物をした——起きてしまったあとに何をするかを、順番に沿ってまとめました。${EMERGENCY_CONTACTS.emergency} と ${EMERGENCY_CONTACTS.nonEmergency} の使い分け、保険請求に要る crime reference number の取り方、大使館での手続きまで、${TROUBLE_AS_OF}時点の運用で解説します。`;

export const metadata = buildPageMetadata({
  path: TROUBLE_BASE,
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "ロンドン トラブル",
    "ロンドン スリ 対処",
    "イギリス パスポート 紛失",
    "ロンドン 落とし物",
    "イギリス 警察 通報",
    "ロンドン 盗難 保険",
    "crime reference number",
  ],
});

/**
 * 状況から入口を選ばせる。
 *
 * このセクションの読者は「読みに来た人」ではなく「困っている人」なので、
 * 制度別(警察・保険・大使館)の目次を出しても選べない。
 * 被害直後の人が自分の状況として認識できる言葉で並べる。
 *
 * 各カードに「まず何をするか」を1行で持たせているのは、
 * 記事を開かずにハブだけ見て離脱した人にも、最低限の行動が渡るようにするため。
 */
const SCENARIOS: {
  situation: string;
  answer: string;
  detail: string;
  href: string;
  cta: string;
}[] = [
  {
    situation: "スマホや財布を盗まれた",
    answer: "まずカードを止める",
    detail:
      "非接触決済は暗証番号なしで連続して使われます。探すより先に止めてください。カード、スマホ、SIM の順に塞ぐのが最短です。",
    href: "/trouble/pickpocket",
    cta: "最初の30分の手順を見る",
  },
  {
    situation: "パスポートが見つからない",
    answer: "帰国はできます",
    detail:
      "「帰国のための渡航書」という書類があります。ただし警察の届出が前提なので、大使館に直行すると出直しになります。順番が決まっています。",
    href: "/trouble/lost-passport",
    cta: "渡航書の取り方を見る",
  },
  {
    situation: "地下鉄やバスに置き忘れた",
    answer: "窓口は警察ではありません",
    detail: `TfL の遺失物センターが扱います。保管は${TFL_LOST_PROPERTY.holdMonths}ヶ月。ただしバスは最初の${TFL_LOST_PROPERTY.busDirectContactDays}日だけ、営業所に直接聞くほうが早いことがあります。`,
    href: "/trouble/lost-property",
    cta: "探し方の分岐を見る",
  },
  {
    situation: "つきまとわれている・嫌がらせが続いている",
    answer: "専門の相談窓口があります",
    detail: `通報するか決める前の段階から相談できます（${STALKING_SUPPORT[0].name}・${STALKING_SUPPORT[0].phone}・無料）。声を出せないまま ${EMERGENCY_CONTACTS.emergency} を呼ぶ方法もあります。`,
    href: "/trouble/stalking-harassment",
    cta: "相談先と安全の確保を見る",
  },
  {
    situation: "詐欺に遭った・送金してしまった",
    answer: "返金の対象になりえます",
    detail: `だまされて自分で振り込んだ場合でも、${FRAUD_REIMBURSEMENT.mandatoryFrom}から銀行に返金義務があります（上限${gbpLarge(
      FRAUD_REIMBURSEMENT.appMaxGbp
    )}）。「自分で振り込んだから無理」と諦めないでください。`,
    href: "/trouble/scams",
    cta: "返金の請求方法を見る",
  },
  {
    situation: "警察に届け出たい・受理番号が要る",
    answer: "crime reference number",
    detail: `警察の受理番号がないと、保険請求もパスポート再発給も進みません。${EMERGENCY_CONTACTS.emergency} と ${EMERGENCY_CONTACTS.nonEmergency} の使い分けから説明します。`,
    href: "/trouble/police-report",
    cta: "届出の手順を見る",
  },
  {
    situation: "保険で補償を受けたい",
    answer: "順番を外さないこと",
    detail:
      "請求が通らない理由の多くは、補償の中身ではなく手続きの順番です。受理番号を待ってから保険会社に連絡すると、期限を過ぎることがあります。",
    href: "/trouble/insurance-claim",
    cta: "請求の手順を見る",
  },
  {
    situation: "大使館に相談すべきか迷っている",
    answer: "できることの線を先に知る",
    detail:
      "パスポートの発給と領事面会はできます。弁護士費用の負担と裁判の通訳はできません。範囲を知っておくと、無駄足を踏まずに済みます。",
    href: "/trouble/embassy",
    cta: "できること・できないことを見る",
  },
];

const FAQ_ITEMS = [
  {
    question: `${EMERGENCY_CONTACTS.emergency} と ${EMERGENCY_CONTACTS.nonEmergency} はどう使い分けますか？`,
    answer: `**判断の軸は「いま危険かどうか」だけです**。犯人がその場にいる、けがをした、身に危険が迫っている——このいずれかなら **${EMERGENCY_CONTACTS.emergency}**。すでに終わった盗難の届出は **${EMERGENCY_CONTACTS.nonEmergency}** かオンラインです。被害額の大きさではなく時間で決まります。ただし迷う状況で ${EMERGENCY_CONTACTS.emergency} にかけることを躊躇しないでください。オペレーターが適切な窓口に振り分けてくれます。`,
  },
  {
    question: "警察に届け出るのにお金はかかりますか？",
    answer: `**かかりません**。オンライン・電話・窓口のいずれも${POLICE_REPORT.cost}で、crime reference number の発行にも費用はかかりません。「番号を取るのにお金がかかる」という誤解が流布していますが事実ではなく、費用を請求されたらそれ自体が詐欺を疑うべき状況です。`,
  },
  {
    question: "盗まれた物は戻ってきますか？",
    answer:
      "**正直に言えば、ほとんど戻りません**。とくにスマートフォンや現金の回収率は高くありません。それでも届け出る理由は、**保険請求とパスポート再発給に警察の受理番号が必要**だからです。物を取り戻すためではなく、そのあとの手続きを動かすために届け出ると考えてください。",
  },
  {
    question: "英語が話せません。それでも手続きできますか？",
    answer:
      "**できます**。警察に通訳を依頼でき、費用は自己負担ではありません。電話がつながったら「I need a Japanese interpreter」と伝えてください。また、すでに終わった被害ならオンライン通報が使えます。文章を推敲でき翻訳ツールも使えるので、電話より負担が小さいことが多いです。大使館では日本語で相談できます。",
  },
  {
    question: "銀行から電話がかかってきました。本物でしょうか？",
    answer: `**いったん切って ${EMERGENCY_CONTACTS.bankFraud} にかけ直してください**。これは主要銀行が参加する短縮番号で、自分の銀行の詐欺対応窓口に安全につながります。銀行が暗証番号やパスワードの全体を聞くことはなく、「安全な口座に資金を移して」と言うこともありません。どちらも詐欺の典型的な文句です。かけ直すときは別の端末を使うか、同じ端末なら10分ほど待ってからにしてください。`,
  },
  {
    question: "詐欺で自分から送金してしまいました。もう戻りませんか？",
    answer: `**諦めるのは早いです**。${FRAUD_REIMBURSEMENT.mandatoryFrom}から、だまされて送金した被害（APP詐欺）にも銀行の返金義務が課されています。上限は${gbpLarge(
      FRAUD_REIMBURSEMENT.appMaxGbp
    )}で、原則${FRAUD_REIMBURSEMENT.appRefundWorkingDays}営業日以内の返金です。日本の感覚だと「自分で振り込んだ以上どうにもならない」と考えがちですが、**英国ではそうではありません**。まず銀行に返金を請求してください。`,
  },
  {
    question: "旅行中です。帰国が近いのですが、何を優先すべきですか？",
    answer:
      "**カードの停止と、パスポートの確認です**。パスポートが無事なら帰国はできるので、まずカードを止めて被害の拡大を止めます。パスポートも失っている場合は、警察への届出と大使館への連絡が最優先です。保険を請求するつもりなら、**滞在中に必ず警察へ届け出てください**。帰国後に遡って届け出るのは非常に困難です。",
  },
];

export default function TroubleHubPage() {
  const pageUrl = `${SITE_URL}${TROUBLE_BASE}`;

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 text-gray-900 dark:text-gray-100">
      <JsonLd
        data={breadcrumbJsonLd({
          name: TROUBLE_SECTION_NAME,
          path: TROUBLE_BASE,
        })}
      />
      <JsonLd
        data={troubleHubCollectionJsonLd({
          name: TITLE,
          description: DESCRIPTION,
        })}
      />
      <JsonLd data={faqPageJsonLd(FAQ_ITEMS, pageUrl)} />

      <Breadcrumbs path="/trouble" />

      <header className="mt-6 space-y-4">
        <h1 className="text-2xl font-bold leading-tight md:text-4xl">
          ロンドンのトラブル対応ガイド
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          When Things Go Wrong in London: Theft, Loss and Reporting
        </p>
        <p className="text-base leading-relaxed text-gray-700 dark:text-gray-300">
          起きてしまったあとに、
          <strong>何を、どの順番でやるか</strong>
          だけを書いています。予防の話はしません。
          下から自分の状況に近いものを選んでください。
        </p>
        <GuideFreshness
          dataAsOf={TROUBLE_AS_OF}
          updatedAt={TROUBLE_UPDATED_AT}
        />
      </header>

      {/*
        緊急連絡先をハブの最上部に固定で置く。
        被害直後の人がカードを読み比べる前提に立たない。

        101 と 159 を併記するのは、この2つが日本語圏でほとんど知られておらず、
        知らないことによる実害(999 で切られる/詐欺にかけ直す)が大きいため。
      */}
      <div className="mt-8 rounded-lg border border-red-300 bg-red-50/80 p-5 dark:border-red-900/60 dark:bg-red-950/25">
        <p className="text-sm font-bold text-red-800 dark:text-red-300">
          いま必要な番号は、この3つです
        </p>
        <ul className="mt-3 space-y-1.5 text-sm leading-relaxed text-gray-800 dark:text-gray-200">
          <li>
            ・<strong>{EMERGENCY_CONTACTS.emergency}</strong>
            ｜身に危険がある、犯人がその場にいる、けがをした
          </li>
          <li>
            ・<strong>{EMERGENCY_CONTACTS.nonEmergency}</strong>
            ｜すでに終わったことの通報。盗難の届出はこちらです
          </li>
          <li>
            ・<strong>{EMERGENCY_CONTACTS.bankFraud}</strong>
            ｜銀行を名乗る不審な連絡。いったん切って、この番号にかけ直します
          </li>
        </ul>
        <p className="mt-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
          詐欺の通報は <strong>{EMERGENCY_CONTACTS.reportFraud}</strong>（
          {FRAUD_REPORTING.serviceName}）。
          {FRAUD_REPORTING.replacedOn}に {FRAUD_REPORTING.formerName}{" "}
          から名称が変わりましたが、番号は同じです。
        </p>
        <p className="mt-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
          英語に不安があれば、つながってから「I need a Japanese interpreter」と
          伝えれば通訳が入ります。費用はかかりません。
        </p>
        <p className="mt-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
          <strong>声を出せない状況</strong>なら、携帯から{" "}
          {EMERGENCY_CONTACTS.emergency} にかけ、自動音声のあとに{" "}
          <strong>{SILENT_SOLUTION.pressDigits}</strong> を押すと警察につながります。
          押さないと通話は切られます（
          <Link
            href="/trouble/stalking-harassment"
            className="text-blue-700 underline hover:opacity-80 dark:text-blue-300"
          >
            詳しい手順
          </Link>
          ）。
        </p>
      </div>

      <Separator className="my-8" />

      <section aria-labelledby="find-your-situation" className="space-y-5">
        <div className="space-y-2">
          <h2 id="find-your-situation" className="text-xl font-bold md:text-2xl">
            何が起きましたか
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

      <section aria-labelledby="the-order" className="space-y-4">
        <h2 id="the-order" className="text-xl font-bold md:text-2xl">
          どのトラブルでも、共通する順番があります
        </h2>
        <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
          被害の種類が違っても、動き方の骨格は同じです。
          <strong>被害を止める → 記録を作る → 取り戻す</strong>
          。この順を外すと、あとの手続きが止まります。
        </p>
        <MarkdownBody>
          {`| 段階 | やること | なぜ先にやるか |
|---|---|---|
| **1. 止める** | カード・スマホ・SIM を止める | 非接触決済は暗証番号なしで連続して使われます。時間に比例して被害が増えます |
| **2. 記録する** | 警察に届け出て受理番号を取る | 保険請求もパスポート再発給も、この番号がないと動きません |
| **3. 取り戻す** | 保険請求・再発給・遺失物の照会 | 期限があります。保険は「◯日以内の通報」が条件のことが多い |

最も多い失敗が、**2 を飛ばすこと**です。「届け出ても戻ってこない」と考えて省くと、数日後に保険会社と大使館の両方で止まります。crime reference number は物を取り戻すための番号ではなく、**手続きを動かすための番号**です。

もうひとつ多いのが、**1 より先に探し始めること**。気持ちはわかりますが、その15分がそのまま被害額になります。探すのは止めたあとで構いません。`}
        </MarkdownBody>
      </section>

      <Separator className="my-10" />

      <section aria-labelledby="all-guides" className="space-y-8">
        <div className="space-y-2">
          <h2 id="all-guides" className="text-xl font-bold md:text-2xl">
            トラブル対応ガイド一覧
          </h2>
          <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
            現在{troubleGuides.length}
            本。被害の種類ごとに、その場でやることから手続きの完了までを追えるようにしています。
          </p>
        </div>

        {TROUBLE_CATEGORY_ORDER.map((category) => {
          const guides = troubleGuidesByCategory(category);
          if (guides.length === 0) return null;

          return (
            <div key={category} className="space-y-3">
              <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200">
                {TROUBLE_CATEGORY_LABELS[category]}
              </h3>
              <div className="space-y-3">
                {guides.map((g) => (
                  <Link
                    key={g.slug}
                    href={troubleGuidePath(g.slug)}
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

      <section className="mt-10 rounded-lg border border-gray-200 bg-gray-50 p-6 dark:border-neutral-700 dark:bg-neutral-900">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          在英国日本国大使館
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
          パスポートの紛失、事件・事故に巻き込まれたときの相談先です。
          日本語で相談できます。窓口は平日のみで、土日と英国の祝日は閉まっています。
        </p>
        <dl className="mt-3 space-y-1.5 text-sm text-gray-700 dark:text-gray-300">
          <div className="flex gap-2">
            <dt className="font-semibold">電話</dt>
            <dd>{EMBASSY.phone}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="font-semibold">住所</dt>
            <dd>{EMBASSY.address}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="font-semibold">受付</dt>
            <dd>平日 {EMBASSY.hours}</dd>
          </div>
        </dl>
        <p className="mt-3 text-sm">
          <a
            href={EMBASSY.emergencyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:opacity-80 dark:text-blue-400"
          >
            大使館の緊急連絡先ページ（外部サイト）
          </a>
        </p>
      </section>

      <GuideFaq items={FAQ_ITEMS} />

      <div className="mt-10 rounded-lg border border-gray-200 bg-gray-50 p-6 dark:border-neutral-700 dark:bg-neutral-900">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          あわせて読みたい
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
          このセクションは「起きたあと」に絞っています。
          予防の話や、体調を崩したときの医療の話は別のページにあります。
        </p>
        <ul className="mt-3 space-y-2 text-sm">
          <li>
            <Link
              href="/sightseeing/travel-tips"
              className="text-blue-600 hover:opacity-80 dark:text-blue-400"
            >
              ロンドン旅行の実用情報｜治安とスリ対策（予防）
            </Link>
          </li>
          <li>
            <Link
              href="/health"
              className="text-blue-600 hover:opacity-80 dark:text-blue-400"
            >
              医療・NHS ガイド｜体調を崩したときの行き先
            </Link>
          </li>
          <li>
            <Link
              href="/money"
              className="text-blue-600 hover:opacity-80 dark:text-blue-400"
            >
              お金・銀行ガイド｜口座とカードの基礎
            </Link>
          </li>
          <li>
            <Link
              href="/visa"
              className="text-blue-600 hover:opacity-80 dark:text-blue-400"
            >
              英国ビザガイド｜在留資格の手続き
            </Link>
          </li>
        </ul>
      </div>

      <p className="mt-6 rounded-lg border border-amber-200 bg-amber-50/70 p-4 text-xs leading-relaxed text-gray-700 dark:border-amber-900/60 dark:bg-amber-950/25 dark:text-gray-300">
        本サイトの情報は{TROUBLE_AS_OF}
        時点のもので、手続きの流れを説明する情報提供です。法的な助言ではありません。
        警察・大使館・保険会社・交通機関の運用や手数料は改定されることがあります
        （領事手数料は{EMBASSY.feeRevision}に改定されます）。
        実際に手続きをする前に、各機関の公式ページで最新の必要書類と金額をご確認ください。
        身の安全に関わる状況では、まず{EMERGENCY_CONTACTS.emergency}
        または警察に相談してください。
      </p>

      <AdSenseUnit slot={AD_SLOTS.articleBottom} className="mt-10" />
    </main>
  );
}
