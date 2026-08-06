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
  HOUSING_BASE,
  HOUSING_CATEGORY_LABELS,
  HOUSING_CATEGORY_ORDER,
  HOUSING_SECTION_NAME,
  housingGuidePath,
  housingGuides,
  housingGuidesByCategory,
  housingHubCollectionJsonLd,
} from "@/components/housing/guides/guides";
import {
  HOUSING_AS_OF,
  HOUSING_KEY_DATES,
  HOUSING_LIMITS,
  HOUSING_UPDATED_AT,
  LONDON_RENT,
  TRAVELCARD_MONTHLY,
  depositCapAmount,
  gbp,
  jpDate,
} from "@/lib/housing/rates";

const TITLE = "ロンドンの住まい探しガイド｜物件の探し方から契約・退去まで";
const DESCRIPTION = `ロンドンで部屋を借りるための実務ガイド。2026年5月1日に施行された Renters' Rights Act で、AST も Section 21 も廃止され、借主は2ヶ月前通知でいつでも退去できるようになりました。物件の探し方、初期費用の上限、信用情報ゼロでの審査突破、内見のチェックリスト、敷金の取り戻し方まで、${HOUSING_AS_OF}時点の制度で解説します。`;

export const metadata = buildPageMetadata({
  path: HOUSING_BASE,
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "ロンドン 家探し",
    "イギリス 賃貸",
    "ロンドン 部屋 借りる",
    "フラットシェア ロンドン",
    "Renters Rights Act",
    "イギリス 敷金",
    "ロンドン 家賃 相場",
    "イギリス 賃貸 契約",
  ],
});

/**
 * 状況から入口を選ばせる。
 *
 * 家探しは「今どの段階にいるか」で必要な情報が完全に違う。
 * まだ物件を見ていない人に敷金の法定上限を出しても読まれないし、
 * 契約直前の人に検索サイトの比較を出しても遅い。
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
    situation: "これから探し始める。どのサイトを見ればいいのか分からない",
    answer: "ポータルサイトの使い分け",
    detail:
      "一棟まるごと借りるなら Rightmove・Zoopla・OpenRent。掲載元が違うので3つとも見る必要があります。良い物件は48時間で埋まるので、アラート設定が生命線です。",
    href: "/housing/rightmove-zoopla-openrent",
    cta: "3サイトの違いを見る",
  },
  {
    situation: "予算的にシェアしかない",
    answer: "SpareRoom",
    detail: `ロンドンで最も現実的な選択肢。1部屋あたりインナーロンドンで月${gbp(
      LONDON_RENT.roomInnerLondonMonthly
    )}、アウターで月${gbp(
      LONDON_RENT.roomOuterLondonMonthly
    )}。ただし lodger になると法的保護がまるごと変わります。`,
    href: "/housing/spareroom",
    cta: "フラットシェアの探し方を見る",
  },
  {
    situation: "英語での契約が不安。日本語で完結させたい",
    answer: "日系コミュニティ経由",
    detail:
      "審査も保証人も不要で、渡英直後のつなぎには合理的です。ただし又貸し・契約書なし・敷金が保護されない物件が混じります。使いどころを見極めてください。",
    href: "/housing/japanese-listings",
    cta: "日系物件の注意点を見る",
  },
  {
    situation: "見積もりを出された。この金額は妥当なのか",
    answer: "初期費用の上限",
    detail: `敷金は${HOUSING_LIMITS.depositWeeksUnderThreshold}週間分、holding deposit は${HOUSING_LIMITS.holdingDepositWeeks}週間分、前払い家賃は${HOUSING_LIMITS.rentInAdvanceMonths}ヶ月分まで。契約手数料・更新料・内見料はすべて違法です。`,
    href: "/housing/deposits-and-fees",
    cta: "払ってよい金額を確認する",
  },
  {
    situation: "審査に落ち続けている。収入証明も保証人もない",
    answer: "referencing の突破法",
    detail:
      "年収が家賃の30倍という壁と、英国の信用情報がない問題。従来の「半年分前払い」は2026年5月から違法になり、保証人サービスが事実上の必須になりました。",
    href: "/housing/referencing",
    cta: "審査の通し方を見る",
  },
  {
    situation: "どのエリアに住むべきか決められない",
    answer: "総額での比較",
    detail: `Zone 1-2 の定期が月${gbp(
      TRAVELCARD_MONTHLY.zone1to2
    )}、Zone 1-4 なら月${gbp(
      TRAVELCARD_MONTHLY.zone1to4
    )}。家賃の安さが定期代で消えることがあります。治安データと council tax の調べ方も。`,
    href: "/housing/where-to-live",
    cta: "エリアの選び方を見る",
  },
  {
    situation: "内見の予約が取れた。15分で何を見ればいい？",
    answer: "内見チェックリスト",
    detail:
      "写真に写らないもの——カビの匂い、水圧、階上の足音、冬の寒さ——を確認する手順。シェアなら同居人の生活リズムを聞き出す質問リストつき。",
    href: "/housing/viewing",
    cta: "チェックリストを見る",
  },
  {
    situation: "同居人の騒音で眠れない。大家に言っても改善しない",
    answer: "騒音トラブルの手順",
    detail:
      "「うるさい」では管理会社は動きません。時刻・人数・継続時間を数字で出したときだけ動きます。管理会社の構造的な限界と、大家を飛び越える自治体 noise team への通報まで。",
    href: "/housing/noise",
    cta: "騒音への対処を見る",
  },
  {
    situation: "退去する。敷金が返ってくるか不安",
    answer: "デポジット返還交渉",
    detail:
      "敷金は大家ではなく保護スキームが持っており、勝手に引くことはできません。合意できなければ無料の裁定制度が使えます。立証責任は大家側にあります。",
    href: "/housing/moving-out",
    cta: "退去の手順を見る",
  },
];

const FAQ_ITEMS = [
  {
    question: "2026年5月に何が変わったのですか？",
    answer: `**Renters' Rights Act 2025 の第1段階が施行されました。**AST（定期借家）が廃止され、既存・新規を問わずすべての契約が期間の定めのない assured periodic tenancy に自動転換されました。同時に大家の無過失立ち退き（Section 21）が廃止され、借主は${HOUSING_LIMITS.tenantNoticeMonths}ヶ月前の書面通知でいつでも退去できるようになっています。ネット上の日本語情報の大半はまだ改正前を前提にしているため、注意してください。`,
  },
  {
    question: "契約書に「12ヶ月の固定期間」と書かれています。縛られますか？",
    answer: `**縛られません。**${jpDate(
      HOUSING_KEY_DATES.phase1
    )}時点で、既存の契約も含めてすべてが periodic tenancy に転換されています。固定期間の条項は効力を失っており、${HOUSING_LIMITS.tenantNoticeMonths}ヶ月前に書面で通知すれば退去できます。`,
  },
  {
    question: "日本のような礼金・仲介手数料はかかりますか？",
    answer:
      "**かかりません。**英国に礼金にあたるものは存在せず、エージェントの報酬は大家が支払います。借主への契約手数料・referencing 費用・内見料・更新料の請求は、Tenant Fees Act 2019 ですべて違法です。請求されたら拒否でき、払ってしまった分も返還を請求できます。",
  },
  {
    question: "初期費用はいくら見ておけばいいですか？",
    answer: `月£1,000の部屋なら、**敷金${gbp(
      depositCapAmount(1000)
    )}＋初月家賃£1,000＝約${gbp(
      depositCapAmount(1000) + 1000
    )}**です。敷金は退去時に返還されるため、返ってこない金は初月家賃だけになります。保証人サービスを使う場合は、その手数料が別途かかります。`,
  },
  {
    question: "英国の信用情報も保証人もありません。借りられますか？",
    answer:
      "正規ルートは厳しくなっています。従来使われていた「半年分の家賃を前払いする」方法は、2026年5月1日から違法になりました（上限1ヶ月分）。現実的な代替は有料の保証人サービスです。加えて、渡英直後の1〜3ヶ月は審査の要らない住まい（lodger、ホームステイ、コリビング）で住所を確保し、銀行口座と支払い履歴を作ってから本命に申し込む、という順序が有効です。",
  },
  {
    question: "同居人の騒音がひどい場合、どうすればいいですか？",
    answer:
      "まず時刻・頻度・人数・継続時間を記録し、大家または管理会社に書面で伝えます。「うるさい」では相手は動けません。並行して、自治体の noise team に通報してください。Environmental Protection Act 1990 にもとづき、自治体には調査義務があり、改善命令に違反すれば刑事罰の対象になります。加えて2026年5月以降は2ヶ月前通知で退去できるため、耐え続ける理由はありません。",
  },
  {
    question: "敷金が返ってこない場合、どうすればいいですか？",
    answer:
      "敷金は大家ではなく政府認可の保護スキーム（DPS / MyDeposits / TDS）が保持しており、大家が一方的に引くことはできません。合意できなければ各スキームの ADR（裁定）を無料・弁護士なしで使えます。裁定では立証責任が大家側にあるため、入居時の写真があれば強い立場に立てます。",
  },
];

export default function HousingHubPage() {
  const pageUrl = `${SITE_URL}${HOUSING_BASE}`;

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 text-gray-900 dark:text-gray-100">
      <JsonLd
        data={breadcrumbJsonLd({
          name: HOUSING_SECTION_NAME,
          path: HOUSING_BASE,
        })}
      />
      <JsonLd
        data={housingHubCollectionJsonLd({
          name: TITLE,
          description: DESCRIPTION,
        })}
      />
      <JsonLd data={faqPageJsonLd(FAQ_ITEMS, pageUrl)} />

      <BreadCrumbs name={HOUSING_SECTION_NAME} />

      <header className="mt-6 space-y-4">
        <h1 className="text-2xl font-bold leading-tight md:text-4xl">
          ロンドンの住まい探しガイド
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Renting in London: From Search to Deposit Return
        </p>
        <p className="text-base leading-relaxed text-gray-700 dark:text-gray-300">
          家探しは、<strong>今どの段階にいるか</strong>
          で必要な情報がまったく違います。下から自分の状況に近いものを選んでください。
          制度の話は、必要になった段階で読めば足ります。
        </p>
        <GuideFreshness
          dataAsOf={HOUSING_AS_OF}
          updatedAt={HOUSING_UPDATED_AT}
        />
      </header>

      {/*
        法改正の告知を最上部に置く。
        日本語で流通している家探し情報は、ほぼすべて改正前の前提で書かれており、
        読者が古い知識のまま動くと実害（不要な固定期間の受け入れ、
        違法な前払いの要求への服従）が出るため。
      */}
      <div className="mt-8 rounded-lg border border-sky-300 bg-sky-50/70 p-5 dark:border-sky-900/60 dark:bg-sky-950/25">
        <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
          {jpDate(HOUSING_KEY_DATES.phase1)}、英国の賃貸制度は根本から変わりました
        </p>
        <ul className="mt-3 space-y-1.5 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
          <li>
            ・<strong>AST（定期借家）が廃止</strong>
            。既存の契約も含め、すべてが期間の定めのない assured periodic tenancy
            に自動転換されました
          </li>
          <li>
            ・<strong>Section 21（無過失立ち退き）が廃止</strong>
            。大家が理由なく退去を求めることはできません
          </li>
          <li>
            ・借主は
            <strong>
              {HOUSING_LIMITS.tenantNoticeMonths}ヶ月前の書面通知でいつでも退去可能
            </strong>
          </li>
          <li>
            ・<strong>前払い家賃は{HOUSING_LIMITS.rentInAdvanceMonths}ヶ月分が上限</strong>
            。「半年分前払いして審査を通す」方法は違法になりました
          </li>
          <li>
            ・<strong>募集価格を超える提示の受け入れ（入札）が禁止</strong>
          </li>
        </ul>
        <p className="mt-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
          日本語で流通している家探し情報の大半は、まだ改正前を前提にしています。
          <Link
            href="/housing/tenancy-types"
            className="text-blue-600 underline underline-offset-2 dark:text-blue-400"
          >
            契約形態の地図
          </Link>
          で現在の制度を確認してください。
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
          相場と、払ってよい金額の上限
        </h2>
        <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
          提示された金額が妥当かどうかを判断する基準線です。
          <strong>上限を超える請求はすべて違法</strong>
          で、払ってしまっても返還を請求できます。
        </p>
        <MarkdownBody>
          {`**ロンドンの家賃相場（${HOUSING_AS_OF}時点）**

| 種別 | 月額 | 出典 |
|---|---:|---|
| 一棟まるごと（グレーターロンドン平均） | ${gbp(LONDON_RENT.onsGreaterLondonMonthly)} | ONS |
| シェア1部屋（インナーロンドン） | ${gbp(LONDON_RENT.roomInnerLondonMonthly)} | SpareRoom |
| シェア1部屋（アウターロンドン） | ${gbp(LONDON_RENT.roomOuterLondonMonthly)} | SpareRoom |

**払ってよい金額の上限**

| 項目 | 上限 |
|---|---|
| 敷金（tenancy deposit） | ${HOUSING_LIMITS.depositWeeksUnderThreshold}週間分（年間家賃${gbp(HOUSING_LIMITS.depositThresholdAnnualRent)}以上なら${HOUSING_LIMITS.depositWeeksOverThreshold}週間分） |
| Holding deposit | ${HOUSING_LIMITS.holdingDepositWeeks}週間分 |
| 前払い家賃 | ${HOUSING_LIMITS.rentInAdvanceMonths}ヶ月分（署名後のみ） |
| 契約手数料・更新料・内見料・referencing費用 | **すべて違法。上限ではなくゼロ** |

週あたりの金額は「月額 ÷ 4」ではなく **月額 × 12 ÷ 52** で計算します。÷4で計算すると必ず過大になり、上限超過を見逃します。`}
        </MarkdownBody>
      </section>

      <Separator className="my-10" />

      <section aria-labelledby="all-guides" className="space-y-8">
        <div className="space-y-2">
          <h2 id="all-guides" className="text-xl font-bold md:text-2xl">
            住まい探しガイド一覧
          </h2>
          <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
            全{housingGuides.length}
            本。探し始めから退去後の敷金回収まで、順を追って読めるように並べています。
          </p>
        </div>

        {HOUSING_CATEGORY_ORDER.map((category) => {
          const guides = housingGuidesByCategory(category);
          if (guides.length === 0) return null;

          return (
            <div key={category} className="space-y-3">
              <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200">
                {HOUSING_CATEGORY_LABELS[category]}
              </h3>
              <div className="space-y-3">
                {guides.map((g) => (
                  <Link
                    key={g.slug}
                    href={housingGuidePath(g.slug)}
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
          住まいが決まる前後に必要になること
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
          英国では、住所がないと銀行口座が作れず、口座がないと住所を証明できないという循環に
          多くの人が引っかかります。渡英後の手続きと、働き始めてからの労働条件については
          それぞれ専用のガイドがあります。
        </p>
        <ul className="mt-3 space-y-2 text-sm">
          <li>
            <Link
              href="/visa/after-arrival"
              className="text-blue-600 hover:opacity-80 dark:text-blue-400"
            >
              渡英後の手続きガイド｜share code・NINo・GP登録・銀行口座
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
          <li>
            <Link
              href="/jobs"
              className="text-blue-600 hover:opacity-80 dark:text-blue-400"
            >
              ロンドンで働く人のための労働問題ガイド
            </Link>
          </li>
        </ul>
      </div>

      <p className="mt-6 rounded-lg border border-amber-200 bg-amber-50/70 p-4 text-xs leading-relaxed text-gray-700 dark:border-amber-900/60 dark:bg-amber-950/25 dark:text-gray-300">
        本サイトの情報は{HOUSING_AS_OF}
        時点のもので、法的助言ではありません。ここで扱う制度はイングランドのものです
        （スコットランド・ウェールズ・北アイルランドには別の法律が適用されます）。
        Renters&apos; Rights Act 2025 は段階的に施行が続いており、PRS データベースや
        Decent Homes Standard など未施行の部分があります。実際のトラブルにあたっては
        GOV.UK・Shelter の最新情報を確認し、深刻な事案では Citizens Advice、
        地元自治体の private housing team、または事務弁護士にご相談ください。
      </p>

      <AdSenseUnit slot={AD_SLOTS.articleBottom} className="mt-10" />
    </main>
  );
}
