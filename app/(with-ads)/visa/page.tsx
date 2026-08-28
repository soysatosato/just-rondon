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
  VISA_BASE,
  VISA_CATEGORY_LABELS,
  VISA_SECTION_NAME,
  type VisaCategory,
  visaGuidePath,
  visaGuides,
  visaGuidesByCategory,
  visaHubCollectionJsonLd,
} from "@/components/visa/guides/guides";
import {
  IHS_PER_YEAR,
  JAPAN_YMS_QUOTA,
  RATES_AS_OF,
  RATES_UPDATED_AT,
  VISA_FEES,
  VISA_THRESHOLDS,
  gbp,
} from "@/lib/visa/rates";

const TITLE = "英国ビザガイド｜自分に必要なビザを見つける";
const DESCRIPTION =
  "日本国籍の人が実際に使う英国ビザを、目的・期間・年齢から絞り込めるようにまとめました。観光のETAから、ワーホリ、就労、留学、家族ビザ、そして渡英後の手続きまで。2026年8月時点の料金と要件で、申請を最後まで終わらせるための手順を各ルートごとに用意しています。";

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
 * 診断カード。
 *
 * 抽象的なフローチャートにしないのは、読者が自分をノードに当てはめられない
 * ため。「6ヶ月以内か?」ではなく「2週間の観光で行く」という具体的な状況を
 * 並べ、そのまま自分に当てはまるものを選んでもらう方が速い。
 *
 * 並び順は該当者の多い順。日本国籍の読者の大多数は観光客なので ETA が先頭。
 */
const SCENARIOS: {
  situation: string;
  answer: string;
  detail: string;
  href: string;
  cta: string;
}[] = [
  {
    situation: "観光や短期の出張で、6ヶ月以内の滞在",
    answer: "ETA（電子渡航認証）",
    detail: `ビザは不要ですが、ETA は必須です。無いと日本の空港で搭乗を断られます。${gbp(VISA_FEES.eta)}・10分ほどで終わります。`,
    href: "/sightseeing/eta-uk-visa-guide",
    cta: "ETA の申請手順を見る",
  },
  {
    situation: "18〜30歳で、働きながら英国で暮らしたい",
    answer: "YMS（ワーキングホリデー）",
    detail: `スポンサーも内定も英語力の証明も不要で、最長2年働けます。日本枠は年${JAPAN_YMS_QUOTA.toLocaleString("ja-JP")}人・抽選なし。該当するなら最優先で検討してください。`,
    href: "/visa/youth-mobility-scheme",
    cta: "YMS の申請手順を見る",
  },
  {
    situation: "英国企業に就職して、長期的に働きたい",
    answer: "Skilled Worker",
    detail: `雇用主のスポンサーと、年収${gbp(VISA_THRESHOLDS.skilledWorker.general)}以上が必要です。2025年7月に対象職種が学士相当へ引き上げられ、約180職種が対象外になりました。`,
    href: "/visa/skilled-worker",
    cta: "Skilled Worker の要件を見る",
  },
  {
    situation: "研究・芸術・技術の分野で実績がある",
    answer: "Global Talent",
    detail:
      "雇用主のスポンサーが不要で、転職も独立も自由。最短3年で永住権に届きます。日本人に最も過小評価されているルートです。",
    href: "/visa/global-talent",
    cta: "Global Talent の要件を見る",
  },
  {
    situation: "英国の大学・大学院に留学したい",
    answer: "Student → Graduate",
    detail:
      "在学中は週20時間まで就労可。卒業後は Graduate visa で最長2年働けますが、2027年1月申請分から18ヶ月に短縮されます。",
    href: "/visa/student",
    cta: "Student／Graduate の手順を見る",
  },
  {
    situation: "英国人・英国定住者のパートナーと暮らしたい",
    answer: "家族・配偶者ビザ",
    detail: `英国側に年収${gbp(VISA_THRESHOLDS.family.minimumIncome)}または貯蓄${gbp(VISA_THRESHOLDS.family.cashSavings)}が必要です。審査に約12週間かかるため、逆算が要ります。`,
    href: "/visa/family",
    cta: "家族ビザの要件を見る",
  },
  {
    situation: "ビザは下りた。渡英後に何をすればいい？",
    answer: "渡英後の手続き",
    detail:
      "UKVI アカウント、share code、NINo、GP登録、銀行口座。特にパスポート更新時の旅券番号更新を怠ると、搭乗を拒否されます。",
    href: "/visa/after-arrival",
    cta: "渡英後の手続きを見る",
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

const CATEGORY_ORDER: VisaCategory[] = [
  "short",
  "work",
  "study",
  "family",
  "after",
];

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

      <header className="mt-6 space-y-4">
        <h1 className="text-2xl font-bold leading-tight md:text-4xl">
          英国ビザガイド
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          UK Visas: Find the Route That Applies to You
        </p>
        <p className="text-base leading-relaxed text-gray-700 dark:text-gray-300">
          英国のビザは、種類の多さと名前の分かりにくさが最大の壁です。このページは、
          <strong>まず自分がどれに該当するかを確定させる</strong>
          ことだけを目的にしています。下の一覧から、自分の状況に一番近いものを選んでください。
          そこから先は、各ルートの申請手順に進めます。
        </p>
        <GuideFreshness dataAsOf={RATES_AS_OF} updatedAt={RATES_UPDATED_AT} />
      </header>

      <Separator className="my-8" />

      {/* 診断：具体的な状況から選ばせる */}
      <section aria-labelledby="find-your-route" className="space-y-5">
        <div className="space-y-2">
          <h2
            id="find-your-route"
            className="text-xl font-bold md:text-2xl"
          >
            自分の状況を選んでください
          </h2>
          <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
            一番近いものが1つ見つかれば、それがあなたの読むべきページです。
            複数に当てはまる場合は、<strong>滞在が長くなる方</strong>を選んでください。
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

        <div className="rounded-lg border border-blue-200 bg-blue-50/70 p-4 text-sm leading-relaxed dark:border-blue-900/60 dark:bg-blue-950/25">
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

      {/* 費用の目安。ハブの段階で「いくらかかるか」を見せておく */}
      <section aria-labelledby="cost-overview" className="space-y-4">
        <h2 id="cost-overview" className="text-xl font-bold md:text-2xl">
          費用の目安
        </h2>
        <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
          申請料だけを見ていると、実際の請求額で驚きます。多くのルートで金額の大部分を占めるのは
          <strong>IHS（医療サーチャージ）</strong>
          で、滞在年数分を申請時に一括で前払いします。
        </p>
        <MarkdownBody>
          {`| ルート | 申請料 | IHS（年額） |
|---|---:|---:|
| ETA | ${gbp(VISA_FEES.eta)} | — |
| YMS（ワーホリ） | ${gbp(VISA_FEES.youthMobility)} | ${gbp(IHS_PER_YEAR.discounted)} |
| Student | ${gbp(VISA_FEES.student)} | ${gbp(IHS_PER_YEAR.discounted)} |
| Graduate | ${gbp(VISA_FEES.graduate)} | ${gbp(IHS_PER_YEAR.standard)} |
| Skilled Worker（英国外・3年以下） | ${gbp(VISA_FEES.skilledWorker.outsideUpTo3y)} | ${gbp(IHS_PER_YEAR.standard)} |
| Global Talent | ${gbp(VISA_FEES.globalTalent.total)} | ${gbp(IHS_PER_YEAR.standard)} |
| 家族・配偶者（英国外） | ${gbp(VISA_FEES.familyPartner.outside)} | ${gbp(IHS_PER_YEAR.standard)} |
| 永住（ILR） | ${gbp(VISA_FEES.ilr)} | — |

英国の申請料は**毎年4月に一斉改定**されます（直近は2026年4月8日、6〜7%増）。年をまたぐ申請では、必ず申請時点の金額を GOV.UK で確認してください。`}
        </MarkdownBody>
      </section>

      <Separator className="my-10" />

      {/* 全ガイド一覧。カテゴリ別 */}
      <section aria-labelledby="all-guides" className="space-y-8">
        <div className="space-y-2">
          <h2 id="all-guides" className="text-xl font-bold md:text-2xl">
            ビザガイド一覧
          </h2>
          <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
            全{visaGuides.length}本。それぞれ、申請を最後まで終わらせるための手順書として書いています。
          </p>
        </div>

        {CATEGORY_ORDER.map((category) => {
          const guides = visaGuidesByCategory(category);
          if (guides.length === 0) return null;

          return (
            <div key={category} className="space-y-3">
              <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200">
                {VISA_CATEGORY_LABELS[category]}
              </h3>
              <div className="space-y-3">
                {guides.map((g) => (
                  <Link
                    key={g.slug}
                    href={visaGuidePath(g.slug)}
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
