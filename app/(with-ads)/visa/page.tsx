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
  VISA_BASE,
  VISA_SECTION_NAME,
  VISA_SPONSOR_LABELS,
  getVisaGuideMeta,
  visaGuidePath,
  visaHubCollectionJsonLd,
} from "@/components/visa/guides/guides";
import { visaGuideArticles } from "@/components/visa/guides/content";
import {
  IHS_PER_YEAR,
  RATES_AS_OF,
  RATES_UPDATED_AT,
  VISA_FEES,
  VISA_THRESHOLDS,
  gbp,
} from "@/lib/visa/rates";

const TITLE = "英国ビザガイド｜自分に必要なビザを見つける";
const DESCRIPTION =
  "日本国籍の人が実際に使う英国ビザを、目的・期間・年齢から絞り込めるようにまとめました。観光のETAから、ワーホリ、就労、留学、家族ビザ、そして渡英後の手続きまで。スポンサーの要否・申請時に払う額・永住にカウントされるかを並べて比較できます。2026年8月時点の料金と要件で、申請を最後まで終わらせるための手順を各ルートごとに用意しています。";

export const metadata = buildPageMetadata({
  path: VISA_BASE,
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "イギリス ビザ",
    "英国 ビザ 種類",
    "UK ビザ 日本人",
    "イギリス ワーホリ",
    "イギリス 就労ビザ",
    "イギリス 留学 ビザ",
    "イギリス 配偶者ビザ",
    "ETA イギリス",
  ],
});

/**
 * 状況からルートを選ばせる一覧。
 *
 * 抽象的なフローチャートにしないのは、読者が自分をノードに
 * 当てはめられないため。「6ヶ月以内か?」ではなく「2週間の観光で行く」
 * という具体的な状況を並べ、そのまま自分に当てはまるものを選んでもらう。
 *
 * 以前はこの一覧の下に「ビザガイド一覧」があり、同じ7本を同じリンクで
 * もう一度カードにしていた。読者の仕事は7つから1つ選ぶことなので、
 * 選択肢を2箇所に分けて出す意味がない。カテゴリ別の見出しごと畳んで
 * ここに一本化してある。
 *
 * 状況の文言(situation)は各記事の audience から引く。types.ts が
 * 「記事側を正とし、ハブはここを参照する」と決めているのに、
 * 以前のハブは似た文言を別に持っていて、すでに表現がずれていた。
 *
 * 並び順は該当者の多い順。日本国籍の読者の大多数は観光客なので ETA が先頭。
 */
const SCENARIOS: { slug: string; answer: string; why: string }[] = [
  {
    slug: "eta-uk-visa-guide",
    answer: "ETA（電子渡航認証）",
    why: `ビザは不要ですが、ETA は必須です。無いと日本の空港で搭乗を断られます。${gbp(
      VISA_FEES.eta
    )}・10分ほどで終わります。`,
  },
  {
    slug: "youth-mobility-scheme",
    answer: "YMS（ワーキングホリデー）",
    why: "スポンサーも内定も英語力の証明も不要で、最長2年働けます。日本枠は抽選なし。該当するなら最優先で検討してください。",
  },
  {
    slug: "skilled-worker",
    answer: "Skilled Worker",
    why: "2025年7月に対象職種が学士相当へ引き上げられ、約180職種が対象外になりました。今も取れる職種と、スポンサー企業の探し方から。",
  },
  {
    slug: "global-talent",
    answer: "Global Talent",
    why: "雇用主のスポンサーが不要で、転職も独立も自由。日本人に最も過小評価されているルートです。",
  },
  {
    slug: "student",
    answer: "Student → Graduate",
    why: "在学中は週20時間まで就労可。卒業後は Graduate visa で最長2年働けますが、2027年1月申請分から18ヶ月に短縮されます。",
  },
  {
    slug: "family",
    answer: "家族・配偶者ビザ",
    why: "審査に12週間かかり、他ルートの4倍です。渡英日から逆算して動く必要があります。",
  },
  {
    slug: "after-arrival",
    answer: "渡英後の手続き",
    why: "UKVI アカウント、share code、NINo、GP登録、銀行口座。特にパスポート更新時の旅券番号更新を怠ると、搭乗を拒否されます。",
  },
];

const FAQ_ITEMS = [
  {
    question: "日本国籍なら、観光にビザは要りませんよね？",
    answer: `ビザは不要ですが、**ETA（電子渡航認証）は必須**です。2026年2月25日から全面施行され、ETA が無いと日本の空港で搭乗を断られます。費用は${gbp(VISA_FEES.eta)}、申請は10分ほどで終わります。`,
  },
  {
    question: "観光で入国して、現地で就職先を見つけて切り替えられますか？",
    answer:
      "**できません**。訪問者として入国した人は、英国内から就労ビザへ切り替えることが原則禁止されています。英国にいながら職を探したいなら、YMS（18〜30歳）か Global Talent を検討してください。",
  },
  {
    question: "ワーホリ（YMS）の2年間は、永住権の年数に入りますか？",
    answer:
      "**入りません**。YMS・Graduate・High Potential Individual の滞在期間は、いずれも永住権（ILR）にカウントされません。長期滞在を目指すなら、その期間中に Skilled Worker などへ切り替える設計が必要です。",
  },
  {
    question: "英国ビザで一番お金がかかるのは何ですか？",
    answer: `多くの場合、申請料ではなく **IHS（医療サーチャージ）** です。年${gbp(IHS_PER_YEAR.standard)}（学生・YMS は${gbp(IHS_PER_YEAR.discounted)}）を、滞在年数分まとめて申請時に前払いします。5年分なら${gbp(IHS_PER_YEAR.standard * 5)}になります。`,
  },
  {
    question: "永住までの年数が10年になると聞きましたが、本当ですか？",
    answer:
      "**2026年8月時点では、まだ施行されていません**。意見公募は2026年2月12日に終了しましたが、政府の正式回答も改正規則の議会提出もまだ行われていません。現行の5年ルールが有効です。",
  },
  {
    question: "BRP（在留カード）は、まだ使えますか？",
    answer:
      "**身分証明としては使えません**。2024年12月31日に一斉失効し、eVisa へ完全移行しました。UKVI アカウントを作成し、share code で就労権・居住権を証明する方式になっています。",
  },
];

/**
 * 状況カード1枚。
 *
 * ルート5本は同じ位置に同じ3項目(スポンサー・申請時に払う額・
 * 永住カウント)を出す。以前この比較は下に別立ての GFM テーブルで
 * 置かれていて、MarkdownBody の min-w-[32rem] のせいでスマホでは
 * 横スクロールしないと列が揃わなかった。カードの同じ位置に置けば、
 * 縦に並べたままでも項目同士が対応する。
 */
function ScenarioCard({
  slug,
  answer,
  why,
}: {
  slug: string;
  answer: string;
  why: string;
}) {
  const meta = getVisaGuideMeta(slug);
  if (!meta) return null;

  const audience =
    visaGuideArticles[slug]?.audience ?? meta.externalAudience ?? meta.blurb;
  const facts = meta.routeFacts;

  return (
    <Link href={visaGuidePath(slug)} className="block">
      <article className="flex h-full flex-col rounded-xl border border-gray-300 bg-white p-5 shadow-sm transition hover:border-emerald-400 hover:shadow-md dark:border-neutral-700 dark:bg-neutral-900 dark:hover:border-emerald-500">
        <p className="text-sm font-semibold leading-snug text-gray-900 dark:text-gray-100">
          {audience}
        </p>
        <p className="mt-3 text-xs font-bold tracking-wide text-emerald-600 dark:text-emerald-400">
          → {answer}
        </p>

        {facts && (
          <dl className="mt-3 space-y-1.5 border-y border-gray-200 py-3 text-xs dark:border-neutral-700">
            <div className="flex gap-2">
              <dt className="w-24 shrink-0 font-bold text-gray-500 dark:text-gray-400">
                スポンサー
              </dt>
              <dd
                className={
                  facts.sponsor === "none"
                    ? "font-semibold text-emerald-700 dark:text-emerald-400"
                    : "text-gray-700 dark:text-gray-300"
                }
              >
                {VISA_SPONSOR_LABELS[facts.sponsor]}
              </dd>
            </div>
            <div className="flex gap-2">
              <dt className="w-24 shrink-0 font-bold text-gray-500 dark:text-gray-400">
                申請時に払う額
              </dt>
              <dd className="text-gray-700 dark:text-gray-300">
                {facts.upfrontCost}
              </dd>
            </div>
            <div className="flex gap-2">
              <dt className="w-24 shrink-0 font-bold text-gray-500 dark:text-gray-400">
                永住カウント
              </dt>
              <dd
                className={
                  facts.countsTowardsIlr
                    ? "text-gray-700 dark:text-gray-300"
                    : "font-semibold text-red-700 dark:text-red-400"
                }
              >
                {facts.countsTowardsIlr ? facts.ilrNote : "されません"}
              </dd>
            </div>
          </dl>
        )}

        <p className="mt-3 flex-1 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
          {why}
        </p>
        <span className="mt-4 text-sm font-medium text-blue-600 dark:text-blue-400">
          {meta.label} を読む →
        </span>
      </article>
    </Link>
  );
}

export default function VisaHubPage() {
  const pageUrl = `${SITE_URL}${VISA_BASE}`;

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 text-gray-900 dark:text-gray-100">
      <JsonLd
        data={breadcrumbJsonLd({ name: VISA_SECTION_NAME, path: VISA_BASE })}
      />
      <JsonLd
        data={visaHubCollectionJsonLd({
          name: TITLE,
          description: DESCRIPTION,
        })}
      />
      <JsonLd data={faqPageJsonLd(FAQ_ITEMS, pageUrl)} />

      <Breadcrumbs path="/visa" />

      <header className="mt-6">
        <h1 className="text-2xl font-bold leading-tight md:text-4xl">
          英国ビザガイド
        </h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          UK Visas: Find the Route That Applies to You
        </p>
        <div className="mt-3">
          <GuideFreshness dataAsOf={RATES_AS_OF} updatedAt={RATES_UPDATED_AT} />
        </div>
        <p className="mt-6 text-base leading-relaxed text-gray-700 dark:text-gray-300">
          英国のビザは、種類の多さと名前の分かりにくさが最大の壁です。このページは、
          <strong>まず自分がどれに該当するかを確定させる</strong>
          ことだけを目的にしています。
        </p>
      </header>

      {/*
        出発前に効く1つ。どのルートを選んでも、請求額の大半はここ。
        以前は下の方に「費用の目安」として GFM の表で置いていたが、
        表の8行が伝えていたことの中心はこの一文だった。
      */}
      <div className="mt-6 rounded-lg border-l-4 border-amber-500 bg-amber-50 px-4 py-3 dark:bg-amber-950/25">
        <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
          金額の大部分は申請料ではなく IHS（医療サーチャージ）です
        </p>
        <p className="mt-1.5 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
          年{gbp(IHS_PER_YEAR.standard)}（学生・YMS は
          {gbp(IHS_PER_YEAR.discounted)}）を、滞在年数分まとめて申請時に前払いします。
          5年なら{gbp(IHS_PER_YEAR.standard * 5)}。下のカードの「申請時に払う額」は、
          この IHS を含めた実際の請求額で書いています。申請料は
          <strong>毎年4月に一斉改定</strong>
          されるため（直近は2026年4月8日、6〜7%増）、年をまたぐ申請では GOV.UK
          で申請時点の金額を確認してください。
        </p>
      </div>

      <section aria-labelledby="find-your-route" className="mt-10">
        <h2 id="find-your-route" className="text-xl font-bold md:text-2xl">
          自分の状況を選んでください
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
          一番近いものが1つ見つかれば、それがあなたの読むべきページです。
          複数に当てはまる場合は、<strong>滞在が長くなる方</strong>
          を選んでください。ルートのカードは同じ位置に同じ3項目を出しているので、
          そのまま比較にも使えます。
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {SCENARIOS.map((s) => (
            <ScenarioCard key={s.slug} {...s} />
          ))}
        </div>

        <div className="mt-5 rounded-lg border border-blue-200 bg-blue-50/70 p-4 text-sm leading-relaxed dark:border-blue-900/60 dark:bg-blue-950/25">
          <p className="font-semibold text-gray-900 dark:text-gray-100">
            どれにも当てはまらない、迷っている
          </p>
          <p className="mt-1 text-gray-700 dark:text-gray-300">
            <Link
              href="/visa/uk-visa-guide"
              className="text-blue-600 underline underline-offset-2 dark:text-blue-400"
            >
              英国ビザ全ルート比較
            </Link>
            で、9ルートの費用・滞在期間・永住までの距離を一覧で比較できます。
            High Potential Individual など、上に載せていないルートもこちらで扱っています。
          </p>
        </div>
      </section>

      <AdSenseUnit slot={AD_SLOTS.listing} className="my-10" />

      {/*
        資金の閾値。カードに載せると3項目の対応が崩れるので分けている。
        ここを満たせないと申請自体が通らないので、額は最初に見せておく。
      */}
      <section aria-labelledby="thresholds" className="mt-10">
        <h2 id="thresholds" className="text-xl font-bold md:text-2xl">
          用意しておく資金
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
          申請料とは別に、「これだけ持っている」ことの証明を求められます。却下理由として最も多いのがここです。
        </p>
        <dl className="mt-4 grid gap-4 sm:grid-cols-3">
          {[
            {
              label: "YMS（ワーホリ）",
              value: gbp(VISA_THRESHOLDS.youthMobility.funds),
              note: `本人名義の口座に${VISA_THRESHOLDS.youthMobility.fundsDays}日間連続で`,
            },
            {
              label: "Student（ロンドン）",
              value: `月${gbp(
                VISA_THRESHOLDS.student.maintenanceLondonPerMonth
              )}`,
              note: `学費残額＋最大${VISA_THRESHOLDS.student.maintenanceMaxMonths}ヶ月分`,
            },
            {
              label: "家族・配偶者",
              value: `年${gbp(VISA_THRESHOLDS.family.minimumIncome)}`,
              note: `英国側の所得。または貯蓄${gbp(
                VISA_THRESHOLDS.family.cashSavings
              )}`,
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
      </section>

      <GuideFaq items={FAQ_ITEMS} />

      <div className="mt-10 rounded-lg border border-gray-200 bg-gray-50 p-6 dark:border-neutral-700 dark:bg-neutral-900">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          働き始めてからのこと
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
          ビザが下りて英国で働き始めると、今度は労働条件の問題が出てきます。当サイトでは、
          英国の労働法と、実際にサービスチャージの未払いで雇用審判所に申し立てた記録も公開しています。
        </p>
        <ul className="mt-3 space-y-2 text-sm">
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
              href="/jobs/visa-and-work"
              className="text-blue-600 hover:opacity-80 dark:text-blue-400"
            >
              ビザと就労の接点｜働ける範囲とSkilled Workerへの切り替え
            </Link>
          </li>
        </ul>
      </div>

      <p className="mt-6 rounded-lg border border-amber-200 bg-amber-50/70 p-4 text-xs leading-relaxed text-gray-700 dark:border-amber-900/60 dark:bg-amber-950/25 dark:text-gray-300">
        本サイトの情報は{RATES_AS_OF}
        時点のもので、法的助言ではありません。英国移民法は頻繁に改正され、個別の事情によって
        適用される規則が変わります。申請にあたっては必ず GOV.UK
        の最新情報を確認し、複雑な事案（過去の却下歴・オーバーステイ・犯罪歴がある場合など）では
        OISC 登録アドバイザーまたは事務弁護士にご相談ください。
      </p>

      <AdSenseUnit slot={AD_SLOTS.articleBottom} className="mt-10" />
    </main>
  );
}
