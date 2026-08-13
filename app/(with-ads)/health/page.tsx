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
  HEALTH_BASE,
  HEALTH_CATEGORY_LABELS,
  HEALTH_CATEGORY_ORDER,
  HEALTH_SECTION_NAME,
  healthGuidePath,
  healthGuides,
  healthGuidesByCategory,
  healthHubCollectionJsonLd,
} from "@/components/health/guides/guides";
import {
  HEALTH_AS_OF,
  HEALTH_UPDATED_AT,
  IHS,
  NHS_CHARGES,
  NHS_CONTACTS,
  gbp,
} from "@/lib/health/rates";

const TITLE = "ロンドンの医療・NHSガイド｜GP登録から救急・薬・歯科まで";
const DESCRIPTION = `イギリスで病院にかかるための実務ガイド。GP登録に身分証も住所証明も要らないこと、救急車と我慢の間にある ${NHS_CONTACTS.nonEmergency} という選択肢、IHSを払った人がどこまで無料か、処方箋料を頭打ちにする方法まで、${HEALTH_AS_OF}時点の制度で解説します。`;

export const metadata = buildPageMetadata({
  path: HEALTH_BASE,
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "イギリス 病院",
    "ロンドン 医療",
    "NHS 使い方",
    "イギリス GP 登録",
    "ロンドン 救急",
    "イギリス 医療費",
    "NHS 111",
    "イギリス 薬局",
  ],
});

/**
 * 状況から入口を選ばせる。
 *
 * 医療は「今すぐ具合が悪いのか、備えているのか」で必要な情報が正反対になる。
 * 発熱している人に IHS の制度解説を出しても読まれないし、
 * 元気な人に救急の判断表を出しても記憶に残らない。
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
    situation: "渡英したばかり。まだ何も手続きしていない",
    answer: "GP 登録",
    detail:
      "英国の医療はすべて GP が入口です。登録は無料で、身分証も住所証明もビザの提示も要りません。オンラインで10〜15分。元気なうちに終わらせておく手続きです。",
    href: "/health/gp-registration",
    cta: "GP 登録の手順を見る",
  },
  {
    situation: "今すぐ具合が悪い。どこに行けばいいのか分からない",
    answer: `${NHS_CONTACTS.nonEmergency} に電話`,
    detail: `救急車か我慢かの二択ではありません。間に ${NHS_CONTACTS.nonEmergency} があります。24時間・無料・通訳あり。症状を聞いて行き先を指定してくれるので、自分で判断する必要がありません。`,
    href: "/health/when-you-are-ill",
    cta: "行き先の判断表を見る",
  },
  {
    situation: "GP の予約が2週間先。それまで待てない",
    answer: "薬局で相談する",
    detail:
      "薬剤師への相談は無料・予約不要です。副鼻腔炎・扁桃炎・膀胱炎などは、薬剤師が GP を介さず処方薬まで出せます。待つ前に寄る価値があります。",
    href: "/health/pharmacy-and-prescriptions",
    cta: "薬局の使い方を見る",
  },
  {
    situation: "ビザ申請で数十万円払った。あれは何だったのか",
    answer: "IHS（移民健康保険料）",
    detail: `年額${gbp(
      IHS.perYearStandard
    )}（学生・ワーホリは${gbp(
      IHS.perYearStudentAndYms
    )}）を前払いした対価が、NHS の利用資格です。払った人は GP も救急も入院も無料。使わないほうが損をします。`,
    href: "/health/ihs-and-entitlement",
    cta: "無料の範囲を確認する",
  },
  {
    situation: "薬局で請求された金額が思ったより高い",
    answer: "処方箋は1品目ごと",
    detail: `1品目 ${gbp(
      NHS_CHARGES.prescriptionItem
    )}。「1回」ではありません。年${
      NHS_CHARGES.ppc12MonthsBreakEvenItems
    }品目を超えるなら、前払い証で年${gbp(
      NHS_CHARGES.ppc12Months
    )}に頭打ちにできます。`,
    href: "/health/prescription-costs",
    cta: "PPC の損益分岐を見る",
  },
  {
    situation: "歯が痛い。NHS の歯医者が見つからない",
    answer: "歯科は別枠の問題",
    detail: `料金は Band 1 が ${gbp(
      NHS_CHARGES.dentalBand1
    )} と安いのですが、新規患者を受け付ける診療所がほぼありません。一時帰国で治すという選択が現実解になる理由と、その損得。`,
    href: "/health/dentist-and-optician",
    cta: "歯科と眼科の実情を見る",
  },
];

const FAQ_ITEMS = [
  {
    question: "GP の登録に身分証や住所証明は必要ですか？",
    answer:
      "**必要ありません。**写真付き身分証、住所証明、NHS number、ビザや在留資格を示す書類は、いずれも登録の必須要件ではありません。これは診療所の裁量ではなく患者登録のルールとして定められており、これらがないことを理由に登録を拒否することはできません。住所が定まっていない場合、一時的な住所や診療所自体の住所で登録することも認められています。",
  },
  {
    question: "イギリスの医療は無料ですか？",
    answer: `**診療は無料、ただし3つだけ例外があります。**GP の診察、専門医の治療、A&E、救急車、入院、手術、検査はすべて無料です（IHS を払っている人と通常居住者）。自己負担が生じるのは**処方箋・歯科・眼科**の3つだけで、これは英国人も同額を払っています。処方箋は1品目 ${gbp(
      NHS_CHARGES.prescriptionItem
    )}、歯科は3段階の定額制です。`,
  },
  {
    question: `${NHS_CONTACTS.nonEmergency} と ${NHS_CONTACTS.emergency} はどう使い分けますか？`,
    answer: `**${NHS_CONTACTS.emergency}** は生命に関わる緊急事態（意識障害、呼吸困難、大量出血、胸の痛み、脳卒中の兆候）で、救急車が出動します。**${NHS_CONTACTS.nonEmergency}** はそれ以外、あるいは判断がつかない場合の相談窓口で、24時間・無料です。${NHS_CONTACTS.nonEmergency} に電話して緊急度が高いと判断されれば、そのまま救急車を手配してくれます。迷ったら ${NHS_CONTACTS.nonEmergency} にかけるのが最も外れの少ない選択です。`,
  },
  {
    question: "英語が話せなくても受診できますか？",
    answer:
      "**できます。**通訳の手配は患者の権利として認められており、費用も患者負担ではありません。GP でも 111 でも A&E でも依頼できます。予約時に「通訳が必要」と伝えておくと当日の手配が確実です。家族や友人に通訳させる必要はなく、医療上はむしろ専門の通訳が望ましいとされています。",
  },
  {
    question: "NHS を使うと将来のビザ申請に不利になりますか？",
    answer:
      "**なりません。**IHS を払った人が NHS を利用することは、制度が想定している正しい使い方です。利用実績がビザ更新や永住申請に影響することはありません。ただし、IHS の対象外の立場で高額な治療を受け、その費用を**未払いのまま放置した場合**は、その後のビザ申請が拒否される事由になります。請求が来たら必ず対応してください。",
  },
  {
    question: "旅行者でも医療を受けられますか？",
    answer:
      "**受けられますが、費用の扱いが違います。**A&E での初期の診察、111 への電話相談、GP の診察、感染症の診断と治療は、短期滞在者でも無料です。ただしその後の入院や継続的な治療には請求が発生します。IHS を払っていない短期滞在では、海外旅行保険が実質的に必須です。",
  },
];

export default function HealthHubPage() {
  const pageUrl = `${SITE_URL}${HEALTH_BASE}`;

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 text-gray-900 dark:text-gray-100">
      <JsonLd
        data={breadcrumbJsonLd({
          name: HEALTH_SECTION_NAME,
          path: HEALTH_BASE,
        })}
      />
      <JsonLd
        data={healthHubCollectionJsonLd({
          name: TITLE,
          description: DESCRIPTION,
        })}
      />
      <JsonLd data={faqPageJsonLd(FAQ_ITEMS, pageUrl)} />

      <BreadCrumbs name={HEALTH_SECTION_NAME} />

      <header className="mt-6 space-y-4">
        <h1 className="text-2xl font-bold leading-tight md:text-4xl">
          ロンドンの医療・NHS ガイド
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Using the NHS in London: GP, Emergencies, Pharmacies and Costs
        </p>
        <p className="text-base leading-relaxed text-gray-700 dark:text-gray-300">
          英国の医療は、日本と<strong>入口の作りがまったく違います</strong>。
          町の内科に相当するものがなく、すべてが GP を経由します。
          下から自分の状況に近いものを選んでください。
        </p>
        <GuideFreshness dataAsOf={HEALTH_AS_OF} updatedAt={HEALTH_UPDATED_AT} />
      </header>

      {/*
        緊急連絡先をハブの最上部に固定で置く。
        体調が悪い人がカードを読み比べる前提に立たない。
      */}
      <div className="mt-8 rounded-lg border border-red-300 bg-red-50/80 p-5 dark:border-red-900/60 dark:bg-red-950/25">
        <p className="text-sm font-bold text-red-800 dark:text-red-300">
          いま緊急なら、この番号です
        </p>
        <ul className="mt-3 space-y-1.5 text-sm leading-relaxed text-gray-800 dark:text-gray-200">
          <li>
            ・<strong>{NHS_CONTACTS.emergency}</strong>
            ｜意識がない、呼吸が苦しい、大量出血、胸の痛み、
            顔の片側が下がる・言葉が出ない（脳卒中の兆候）
          </li>
          <li>
            ・<strong>{NHS_CONTACTS.nonEmergency}</strong>
            ｜緊急かどうか判断がつかないとき。24時間・無料・通訳を頼めます
          </li>
        </ul>
        <p className="mt-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
          英語に不安があれば、つながってから「I need a Japanese interpreter」と
          伝えれば通訳が入ります。費用はかかりません。
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

      <section aria-labelledby="cost-overview" className="space-y-4">
        <h2 id="cost-overview" className="text-xl font-bold md:text-2xl">
          何が無料で、何にいくらかかるか
        </h2>
        <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
          「NHS は無料」は半分だけ正しい表現です。
          <strong>自己負担があるのは処方箋・歯科・眼科の3つだけ</strong>
          で、それ以外の診療は無料です。
        </p>
        <MarkdownBody>
          {`**無料になるもの（IHS 支払い済み・通常居住者）**

| 項目 | 費用 |
|---|---|
| GP の診察 | 無料 |
| 専門医の診察・治療（GP の紹介経由） | 無料 |
| A&E（救急外来）・救急車 | 無料 |
| 入院・手術・検査 | 無料 |
| 妊娠・出産に関わる医療 | 無料 |

**自己負担があるもの（${HEALTH_AS_OF}時点・イングランド）**

| 項目 | 金額 |
|---|---:|
| 処方箋（1品目あたり） | ${gbp(NHS_CHARGES.prescriptionItem)} |
| 処方箋前払い証 PPC（3ヶ月） | ${gbp(NHS_CHARGES.ppc3Months)} |
| 処方箋前払い証 PPC（12ヶ月） | ${gbp(NHS_CHARGES.ppc12Months)} |
| 歯科 Band 1（検診・レントゲン・歯石除去） | ${gbp(NHS_CHARGES.dentalBand1)} |
| 歯科 Band 2（詰め物・抜歯・根管治療） | ${gbp(NHS_CHARGES.dentalBand2)} |
| 歯科 Band 3（冠・入れ歯・ブリッジ） | ${gbp(NHS_CHARGES.dentalBand3)} |

**IHS（ビザ申請時に前払いする移民健康保険料）**

| 対象 | 年額 |
|---|---:|
| 一般の成人 | ${gbp(IHS.perYearStandard)} |
| 学生・YMS（ワーホリ）・18歳未満 | ${gbp(IHS.perYearStudentAndYms)} |

処方箋料は**1回ではなく1品目ごと**です。3種類処方されれば ${gbp(
            NHS_CHARGES.prescriptionItem * 3
          )} かかります。年に${
            NHS_CHARGES.ppc12MonthsBreakEvenItems
          }品目を超える人は、PPC で頭打ちにできます。

なお処方箋が有料なのは**イングランドだけ**で、スコットランド・ウェールズ・北アイルランドは無料です。`}
        </MarkdownBody>
      </section>

      <Separator className="my-10" />

      <section aria-labelledby="all-guides" className="space-y-8">
        <div className="space-y-2">
          <h2 id="all-guides" className="text-xl font-bold md:text-2xl">
            医療ガイド一覧
          </h2>
          <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
            全{healthGuides.length}
            本。渡英直後の備えから、実際にかかるとき、費用を抑える方法まで、
            順を追って読めるように並べています。
          </p>
        </div>

        {HEALTH_CATEGORY_ORDER.map((category) => {
          const guides = healthGuidesByCategory(category);
          if (guides.length === 0) return null;

          return (
            <div key={category} className="space-y-3">
              <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200">
                {HEALTH_CATEGORY_LABELS[category]}
              </h3>
              <div className="space-y-3">
                {guides.map((g) => (
                  <Link
                    key={g.slug}
                    href={healthGuidePath(g.slug)}
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
          渡英後の手続きで、あわせて必要になること
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
          GP 登録は、銀行口座や住まいと並んで渡英直後に片づけるべき手続きの一つです。
          GP の登録完了通知が住所証明として使えることもあるため、
          先に済ませておくと後の手続きが楽になります。
        </p>
        <ul className="mt-3 space-y-2 text-sm">
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
              href="/housing"
              className="text-blue-600 hover:opacity-80 dark:text-blue-400"
            >
              住まい探しガイド｜物件探しから契約・退去まで
            </Link>
          </li>
          <li>
            <Link
              href="/visa"
              className="text-blue-600 hover:opacity-80 dark:text-blue-400"
            >
              英国ビザガイド｜自分に必要なビザを見つける
            </Link>
          </li>
        </ul>
      </div>

      <p className="mt-6 rounded-lg border border-amber-200 bg-amber-50/70 p-4 text-xs leading-relaxed text-gray-700 dark:border-amber-900/60 dark:bg-amber-950/25 dark:text-gray-300">
        本サイトの情報は{HEALTH_AS_OF}
        時点のもので、NHS の制度と手続きを説明する情報提供です。医学的な助言・診断では
        ありません。症状の判断は必ず医療者に委ねてください。ここで扱う制度はイングランドの
        ものです（スコットランド・ウェールズ・北アイルランドでは処方箋が無料であるなど、
        負担の仕組みが異なります）。患者負担額は毎年4月1日に改定されるため、
        受診前に NHS の公式ページで最新額をご確認ください。
      </p>

      <AdSenseUnit slot={AD_SLOTS.articleBottom} className="mt-10" />
    </main>
  );
}
