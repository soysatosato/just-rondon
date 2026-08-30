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
  HEALTH_BASE,
  HEALTH_SECTION_NAME,
  getHealthGuideMeta,
  healthGuidePath,
  healthHubCollectionJsonLd,
} from "@/components/health/guides/guides";
import { healthGuideArticles } from "@/components/health/guides/content";
import {
  HEALTH_AS_OF,
  HEALTH_CHARGE_REVISION,
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
 *
 * 以前はこの一覧の下に「医療ガイド一覧」があり、同じ6本を同じリンクで
 * もう一度カードにしていた。読者の仕事は6つから1つ選ぶことなので、
 * 選択肢を2箇所に分けて出す意味がない。カテゴリ別の見出しごと畳んで
 * ここに一本化してある。
 *
 * 状況の文言は各記事の audience から引く。types.ts が「ハブのカードが
 * 振り分け先の説明に使う」と決めているのに、以前のハブは似た文言を
 * 別に持っていて、すでに表現がずれていた。ハブ側の書き方のほうが
 * 具体的だったので、その文言を記事の audience へ移してある。
 */
const SCENARIOS: { slug: string; answer: string; detail: string }[] = [
  {
    slug: "gp-registration",
    answer: "GP 登録",
    detail:
      "英国の医療はすべて GP が入口です。登録は無料で、身分証も住所証明もビザの提示も要りません。オンラインで10〜15分。元気なうちに終わらせておく手続きです。",
  },
  {
    slug: "when-you-are-ill",
    answer: `${NHS_CONTACTS.nonEmergency} に電話`,
    detail: `救急車か我慢かの二択ではありません。間に ${NHS_CONTACTS.nonEmergency} があります。24時間・無料・通訳あり。症状を聞いて行き先を指定してくれるので、自分で判断する必要がありません。`,
  },
  {
    slug: "pharmacy-and-prescriptions",
    answer: "薬局で相談する",
    detail:
      "薬剤師への相談は無料・予約不要です。副鼻腔炎・扁桃炎・膀胱炎などは、薬剤師が GP を介さず処方薬まで出せます。待つ前に寄る価値があります。",
  },
  {
    slug: "ihs-and-entitlement",
    answer: "IHS（移民健康保険料）",
    detail: `年額${gbp(IHS.perYearStandard)}（学生・ワーホリは${gbp(
      IHS.perYearStudentAndYms
    )}）を前払いした対価が、NHS の利用資格です。払った人は GP も救急も入院も無料。使わないほうが損をします。`,
  },
  {
    slug: "prescription-costs",
    answer: "処方箋は1品目ごと",
    detail: `1品目 ${gbp(NHS_CHARGES.prescriptionItem)}。「1回」ではありません。年${
      NHS_CHARGES.ppc12MonthsBreakEvenItems
    }品目を超えるなら、前払い証で年${gbp(
      NHS_CHARGES.ppc12Months
    )}に頭打ちにできます。`,
  },
  {
    slug: "dentist-and-optician",
    answer: "歯科は別枠の問題",
    detail: `料金は Band 1 が ${gbp(
      NHS_CHARGES.dentalBand1
    )} と安いのですが、新規患者を受け付ける診療所がほぼありません。一時帰国で治すという選択が現実解になる理由と、その損得。`,
  },
];

const FAQ_ITEMS = [
  {
    question: "GP の登録に身分証や住所証明は必要ですか？",
    answer:
      "**必要ありません**。写真付き身分証、住所証明、NHS number、ビザや在留資格を示す書類は、いずれも登録の必須要件ではありません。これは診療所の裁量ではなく患者登録のルールとして定められており、これらがないことを理由に登録を拒否することはできません。住所が定まっていない場合、一時的な住所や診療所自体の住所で登録することも認められています。",
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
      "**できます**。通訳の手配は患者の権利として認められており、費用も患者負担ではありません。GP でも 111 でも A&E でも依頼できます。予約時に「通訳が必要」と伝えておくと当日の手配が確実です。家族や友人に通訳させる必要はなく、医療上はむしろ専門の通訳が望ましいとされています。",
  },
  {
    question: "NHS を使うと将来のビザ申請に不利になりますか？",
    answer:
      "**なりません。**IHS を払った人が NHS を利用することは、制度が想定している正しい使い方です。利用実績がビザ更新や永住申請に影響することはありません。ただし、IHS の対象外の立場で高額な治療を受け、その費用を**未払いのまま放置した場合**は、その後のビザ申請が拒否される事由になります。請求が来たら必ず対応してください。",
  },
  {
    question: "旅行者でも医療を受けられますか？",
    answer:
      "**受けられますが、費用の扱いが違います**。A&E での初期の診察、111 への電話相談、GP の診察、感染症の診断と治療は、短期滞在者でも無料です。ただしその後の入院や継続的な治療には請求が発生します。IHS を払っていない短期滞在では、海外旅行保険が実質的に必須です。",
  },
];

/**
 * 状況カード1枚。文言は記事の audience から引く。
 */
function ScenarioCard({
  slug,
  answer,
  detail,
}: {
  slug: string;
  answer: string;
  detail: string;
}) {
  const meta = getHealthGuideMeta(slug);
  if (!meta) return null;

  const audience = healthGuideArticles[slug]?.audience ?? meta.blurb;

  return (
    <Link href={healthGuidePath(slug)} className="block">
      <article className="flex h-full flex-col rounded-xl border border-gray-300 bg-white p-5 shadow-sm transition hover:border-sky-400 hover:shadow-md dark:border-neutral-700 dark:bg-neutral-900 dark:hover:border-sky-500">
        <p className="text-sm font-semibold leading-snug text-gray-900 dark:text-gray-100">
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

      <Breadcrumbs path="/health" />

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

      <section aria-labelledby="find-your-stage" className="mt-10">
        <h2 id="find-your-stage" className="text-xl font-bold md:text-2xl">
          自分の状況を選んでください
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
          一番近いものが1つ見つかれば、それがあなたの読むべきページです。
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {SCENARIOS.map((s) => (
            <ScenarioCard key={s.slug} {...s} />
          ))}
        </div>
      </section>

      <AdSenseUnit slot={AD_SLOTS.listing} className="my-10" />

      {/*
        何が無料で、何にいくらかかるか。

        以前ここは GFM のテーブル3つだった。MarkdownBody の
        min-w-[32rem] がかかるので、スマホでは金額を見るのに
        横スクロールが要った——このページで最も参照される数字なのに。

        しかも1つ目の表は2列目が全行「無料」で、列として情報を
        持っていなかった。あれは表ではなく箇条書き。
      */}
      <section aria-labelledby="cost-overview" className="mt-10">
        <h2 id="cost-overview" className="text-xl font-bold md:text-2xl">
          何が無料で、何にいくらかかるか
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
          「NHS は無料」は半分だけ正しい表現です。
          <strong>自己負担があるのは処方箋・歯科・眼科の3つだけ</strong>
          で、それ以外の診療は無料です。以下は{HEALTH_AS_OF}
          時点・イングランドの額で、
          <strong>{HEALTH_CHARGE_REVISION}に改定</strong>されます。
        </p>

        <div className="mt-5 rounded-lg border-l-4 border-emerald-500 bg-emerald-50 px-4 py-3 dark:bg-emerald-950/25">
          <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
            無料になるもの（IHS 支払い済み・通常居住者）
          </p>
          <ul className="mt-2 flex flex-wrap gap-x-2 gap-y-1.5 text-sm text-gray-700 dark:text-gray-300">
            {[
              "GP の診察",
              "専門医の診察・治療",
              "A&E（救急外来）",
              "救急車",
              "入院・手術・検査",
              "妊娠・出産に関わる医療",
            ].map((item) => (
              <li
                key={item}
                className="rounded-full bg-white/70 px-2.5 py-1 dark:bg-neutral-900/50"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>

        <h3 className="mt-6 text-sm font-bold text-gray-700 dark:text-gray-300">
          自己負担があるもの
        </h3>
        <dl className="mt-3 grid gap-3 sm:grid-cols-3">
          {[
            {
              label: "処方箋（1品目）",
              value: gbp(NHS_CHARGES.prescriptionItem),
              note: `「1回」ではありません。3種類出れば ${gbp(
                NHS_CHARGES.prescriptionItem * 3
              )}`,
            },
            {
              label: "処方箋前払い証 PPC",
              value: `年${gbp(NHS_CHARGES.ppc12Months)}`,
              note: `3ヶ月なら${gbp(NHS_CHARGES.ppc3Months)}。年${
                NHS_CHARGES.ppc12MonthsBreakEvenItems
              }品目を超えるなら得`,
            },
            {
              label: "歯科 Band 1",
              value: gbp(NHS_CHARGES.dentalBand1),
              note: "検診・レントゲン・歯石除去",
            },
            {
              label: "歯科 Band 2",
              value: gbp(NHS_CHARGES.dentalBand2),
              note: "詰め物・抜歯・根管治療",
            },
            {
              label: "歯科 Band 3",
              value: gbp(NHS_CHARGES.dentalBand3),
              note: "冠・入れ歯・ブリッジ",
            },
            {
              label: "眼科",
              value: "自己負担",
              note: "視力検査・眼鏡は原則すべて実費",
            },
          ].map((row) => (
            <div
              key={row.label}
              className="rounded-lg border border-gray-200 p-4 dark:border-neutral-700"
            >
              <dt className="text-xs font-bold text-gray-500 dark:text-gray-400">
                {row.label}
              </dt>
              <dd className="mt-1 text-lg font-bold text-gray-900 dark:text-gray-100">
                {row.value}
                <span className="mt-0.5 block text-xs font-normal leading-relaxed text-gray-500 dark:text-gray-400">
                  {row.note}
                </span>
              </dd>
            </div>
          ))}
        </dl>

        <p className="mt-4 rounded-lg border-l-4 border-sky-500 bg-sky-50 px-4 py-3 text-sm leading-relaxed text-gray-700 dark:bg-sky-950/25 dark:text-gray-300">
          <strong className="text-gray-900 dark:text-gray-100">
            処方箋が有料なのはイングランドだけです。
          </strong>
          スコットランド・ウェールズ・北アイルランドは全面的に無料です。また
          IHS（ビザ申請時に前払いする移民健康保険料）は一般の成人で年
          {gbp(IHS.perYearStandard)}、学生・YMS（ワーホリ）・18歳未満は年
          {gbp(IHS.perYearStudentAndYms)}。これを払っていれば、上の「無料」が
          適用されます。
        </p>
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
