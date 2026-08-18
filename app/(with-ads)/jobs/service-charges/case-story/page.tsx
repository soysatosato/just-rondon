import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Disclaimer from "@/components/jobs/case-story/Disclaimer";
import LocaleSwitch from "@/components/jobs/case-story/LocaleSwitch";
import {
  CASE_STORY_BASE,
  CASE_STORY_BASE_EN,
  SITE_URL,
  chapterPath,
  chapters,
} from "@/components/jobs/case-story/chapters";
import { buildPageMetadata } from "@/lib/seo";

const TITLE = "サービスチャージ未払いで審判所に申立てた記録";
const DESCRIPTION =
  "ロンドンのレストランで働いていたときの未払いサービスチャージについて、Acas Early ConciliationからEmployment Tribunalの判決、そして強制執行までを記録しました。実際に認容された計算方法も公開しています。";

export const metadata = buildPageMetadata({
  path: CASE_STORY_BASE,
  title: `${TITLE}｜実体験と実用ガイド`,
  description: DESCRIPTION,
  keywords: [
    "サービスチャージ 未払い",
    "Employment Tribunal 体験談",
    "Acas Early Conciliation",
    "イギリス 労働問題 相談",
    "チップ 未払い 請求",
    "Tipping Act 2023",
  ],
  type: "article",
  locale: "ja",
  siteName: "ジャスト・ロンドン｜英国生活・法律ガイド",
  languages: { ja: CASE_STORY_BASE, en: CASE_STORY_BASE_EN },
});

const timeline = [
  {
    phase: "発端",
    text: "会計時に12.5%のサービスチャージが加算されていた一方、還元は時給に上乗せされる1ポンド程度。配分ルールの説明は書面でも口頭でもなかった。",
  },
  {
    phase: "問題提起の前後",
    text: "Acasへの相談を検討していることが社内で知られる。その後、弁護士が関与する形でサービスチャージに関する契約書が用意された。内容の食い違いから署名せず、その後に雇用が終了。",
  },
  {
    phase: "Acas Early Conciliation",
    text: "通知からおよそ6週間でcertificateが発行された。和解には至らず。",
  },
  {
    phase: "ET1提出",
    text: "certificate発行から10日ほどで申立て。提出から3週間ほどで相手方へ送付され、28日の答弁期間が始まる。",
  },
  {
    phase: "証拠提出",
    text: "会社自身の業務記録にもとづく8点の証拠を索引付きで提出。その2か月ほど後、相手方から「リンクが切れていて受け取れない」との連絡。再送しつつ、それが新たな送達にあたらないことを明記した。",
  },
  {
    phase: "審理前",
    text: "相手方の清算を理由に手続きを停止するという通知が届くが、2日後に「誤送付」として撤回された。あわせて請求額の算出根拠を7日以内に提出するよう求められた。",
  },
  {
    phase: "判決",
    text: "相手方は答弁書を提出せず、審理にも出席せず。オンライン審理に通訳付きで本人出席し、Rule 22により£4,007.55（gross）の支払いが命じられた。",
  },
  {
    phase: "強制執行",
    text: "支払期限を過ぎても入金なし。High Courtのwritに移行し、執行官が現地対応。相手方は判決の取消しを申し立てたと述べて執行の停止を求めたが、裁判所が却下。£1,000を隔週で支払う合意に至った。",
  },
];

export default function CaseStoryIndexPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: TITLE,
    description: DESCRIPTION,
    inLanguage: "ja",
    mainEntityOfPage: `${SITE_URL}${CASE_STORY_BASE}`,
    publisher: {
      "@type": "Organization",
      name: "ジャスト・ロンドン",
      url: SITE_URL,
    },
    hasPart: chapters.map((c) => ({
      "@type": "Article",
      name: c.label,
      description: c.blurb,
      url: `${SITE_URL}${chapterPath(c.slug)}`,
    })),
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "ホーム", item: SITE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: "サービスチャージ",
        item: `${SITE_URL}/jobs/service-charges`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: TITLE,
        item: `${SITE_URL}${CASE_STORY_BASE}`,
      },
    ],
  };

  const storyChapters = chapters.filter((c) => c.kind === "story");
  const toolChapters = chapters.filter((c) => c.kind === "tool");

  return (
    <main className="mx-auto max-w-4xl py-10 text-gray-900 dark:text-gray-100">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mb-6 flex items-center justify-between gap-4">
        <nav className="text-xs text-gray-500 dark:text-gray-400">
          <Link href="/jobs/service-charges" className="hover:underline">
            サービスチャージ
          </Link>
        </nav>
        <LocaleSwitch path={CASE_STORY_BASE} locale="ja" />
      </div>

      <header className="space-y-4">
        <h1 className="text-2xl font-bold leading-tight md:text-4xl">
          {TITLE}
        </h1>
        <p className="text-base leading-relaxed text-gray-700 dark:text-gray-300">
          ロンドンのレストラン Tenshi（運営会社 Tenshi61
          LTD）で働いていたときの、
          未払いサービスチャージについての記録です。Acasへの相談から、Employment
          Tribunalの判決、そして実際にお金を回収するまでを、順を追って書いています。
        </p>
        <p className="text-base leading-relaxed text-gray-700 dark:text-gray-300">
          読み物としてではなく、
          <strong className="font-semibold">
            同じ状況にいる人が自分の数字を出せる形
          </strong>
          にすることを目指しました。実際に審判所で認容された計算方法も、そのまま公開しています。
        </p>
      </header>

      <Separator className="my-6" />

      {/* 結論を先に */}
      <section className="rounded-lg border border-gray-300 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-900 p-6">
        <h2 className="text-lg font-semibold">結論から</h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <dt className="text-xs text-gray-500 dark:text-gray-400">
              認容された未払い額
            </dt>
            <dd className="mt-1 text-2xl font-bold">£4,007.55</dd>
            <dd className="text-xs text-gray-500 dark:text-gray-400">
              gross・未払い賃金として
            </dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500 dark:text-gray-400">
              自己負担した費用
            </dt>
            <dd className="mt-1 text-2xl font-bold">£80</dd>
            <dd className="text-xs text-gray-500 dark:text-gray-400">
              執行申立ての立替のみ。弁護士なし
            </dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500 dark:text-gray-400">
              相手方の対応
            </dt>
            <dd className="mt-1 text-2xl font-bold">答弁なし</dd>
            <dd className="text-xs text-gray-500 dark:text-gray-400">
              Rule 22により判決
            </dd>
          </div>
        </dl>
        <p className="mt-5 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
          Acasも審判所も無料で、通訳費用の負担もありませんでした。弁護士は立てず、
          審理には本人で出席しています。金銭的なハードルはほとんどなく、かかったのは時間と労力でした。
        </p>
        <p className="mt-3 text-sm leading-relaxed text-amber-800 dark:text-amber-300">
          なお、相手方は、この判決の取消しを裁判所に申し立てたと述べていました。ただし申立書の写しは、
          私にも、執行を担当しているHigh Court Enforcement
          Officerにも届いていません。相手方が求めた執行の停止は、裁判所が却下しています。
          取消しの申立てが実際になされたという証拠がない、というのが理由です。
        </p>
      </section>

      {/* 経過 */}
      <section className="mt-10">
        <h2 className="text-lg font-semibold">経過</h2>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          順序と、間隔の感覚が伝わるように書きました。
        </p>
        <ol className="mt-5 space-y-4 border-l-2 border-gray-200 dark:border-neutral-700 pl-5">
          {timeline.map((t) => (
            <li key={t.phase} className="relative">
              <span className="absolute -left-[26px] top-1.5 h-2.5 w-2.5 rounded-full bg-blue-600 dark:bg-blue-400" />
              <h3 className="text-sm font-semibold">{t.phase}</h3>
              <p className="mt-1 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                {t.text}
              </p>
            </li>
          ))}
        </ol>
      </section>

      {/* 経過の章 */}
      <section className="mt-12">
        <h2 className="text-lg font-semibold">記録</h2>
        <div className="mt-4 space-y-3">
          {storyChapters.map((c) => (
            <Link key={c.slug} href={chapterPath(c.slug)} className="block">
              <Card className="bg-white dark:bg-neutral-900 border-gray-300 dark:border-neutral-700 shadow-sm transition hover:border-blue-400 dark:hover:border-blue-500">
                <CardContent className="flex gap-4 p-5">
                  <span className="mt-0.5 shrink-0 text-sm font-semibold tabular-nums text-blue-600 dark:text-blue-400">
                    {String(chapters.indexOf(c) + 1).padStart(2, "0")}
                  </span>
                  <span>
                    <span className="block text-base font-semibold">
                      {c.label}
                    </span>
                    <span className="mt-1 block text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                      {c.blurb}
                    </span>
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* 実用の章 */}
      <section className="mt-10">
        <h2 className="text-lg font-semibold">自分のケースに使う</h2>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          経過を読まなくても、ここから始められます。
        </p>
        <div className="mt-4 space-y-3">
          {toolChapters.map((c) => (
            <Link key={c.slug} href={chapterPath(c.slug)} className="block">
              <Card className="border-blue-200 dark:border-blue-900/60 bg-blue-50/60 dark:bg-blue-950/20 shadow-sm transition hover:border-blue-400 dark:hover:border-blue-500">
                <CardContent className="flex gap-4 p-5">
                  <span className="mt-0.5 shrink-0 text-sm font-semibold tabular-nums text-blue-600 dark:text-blue-400">
                    {String(chapters.indexOf(c) + 1).padStart(2, "0")}
                  </span>
                  <span>
                    <span className="block text-base font-semibold">
                      {c.label}
                    </span>
                    <span className="mt-1 block text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                      {c.blurb}
                    </span>
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* 関連 */}
      <div className="mt-12 rounded-lg border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-900 p-6 space-y-3">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          関連ページ
        </h2>
        <ul className="space-y-2 text-sm">
          <li>
            <Link
              href="/jobs/service-charges"
              className="text-blue-600 dark:text-blue-400 hover:opacity-80"
            >
              英国サービスチャージ完全ガイド｜Tipping Act 2023と従業員の権利
            </Link>
          </li>
          <li>
            <Link
              href="/jobs/service-charges/dashboard"
              className="text-blue-600 dark:text-blue-400 hover:opacity-80"
            >
              ロンドン市内のサービスチャージ実態調査（独自調査）
            </Link>
          </li>
        </ul>
      </div>

      <Disclaimer />
    </main>
  );
}
