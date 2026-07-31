import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { guidePath, guides, JOBS_BASE, SITE_URL } from "@/components/jobs/guides/guides";

const TITLE = "ロンドンで働く人のための労働問題ガイド";
const DESCRIPTION =
  "最低賃金、労働契約、ビザと就労の関係、職場ハラスメントの相談先まで、ロンドンで働く日本人が知っておきたい英国の労働法をまとめました。サービスチャージ未払いで審判所に申立てた実体験の記録も公開しています。";

export const metadata = {
  title: `${TITLE} | ジャスト・ロンドン`,
  description: DESCRIPTION,
  keywords: [
    "ロンドン 労働問題",
    "イギリス 労働法",
    "最低賃金",
    "労働契約",
    "ビザ 就労",
    "職場 ハラスメント",
    "サービスチャージ",
  ],
  robots: { index: true, follow: true },
  alternates: { canonical: `${SITE_URL}${JOBS_BASE}` },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: `${SITE_URL}${JOBS_BASE}`,
    siteName: "ジャスト・ロンドン｜英国生活・法律ガイド",
    locale: "ja_JP",
    type: "website" as const,
  },
};

export default function JobsHubPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: TITLE,
    description: DESCRIPTION,
    inLanguage: "ja",
    url: `${SITE_URL}${JOBS_BASE}`,
    hasPart: guides.map((g) => ({
      "@type": "Article",
      name: g.label,
      description: g.blurb,
      url: `${SITE_URL}${guidePath(g.slug)}`,
    })),
  };

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 text-gray-900 dark:text-gray-100">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="space-y-4">
        <h1 className="text-2xl font-bold leading-tight md:text-4xl">
          {TITLE}
        </h1>
        <p className="text-base leading-relaxed text-gray-700 dark:text-gray-300">
          {DESCRIPTION}
        </p>
      </header>

      <Separator className="my-6" />

      <section>
        <h2 className="text-lg font-semibold">働き方の基本ガイド</h2>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          最低賃金・契約・ビザ・ハラスメント対応など、働き始める前後に知っておきたいテーマ別ガイドです。
        </p>
        <div className="mt-4 space-y-3">
          {guides.map((g) => (
            <Link key={g.slug} href={guidePath(g.slug)} className="block">
              <Card className="bg-white dark:bg-neutral-900 border-gray-300 dark:border-neutral-700 shadow-sm transition hover:border-blue-400 dark:hover:border-blue-500">
                <CardContent className="p-5">
                  <span className="block text-base font-semibold">
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
      </section>

      <section className="mt-12">
        <h2 className="text-lg font-semibold">サービスチャージ・チップ</h2>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          レストラン・ホテル業界で特にトラブルになりやすいテーマを、制度解説と実体験の両面でまとめています。
        </p>
        <div className="mt-4 space-y-3">
          <Link href="/jobs/service-charges" className="block">
            <Card className="bg-white dark:bg-neutral-900 border-gray-300 dark:border-neutral-700 shadow-sm transition hover:border-blue-400 dark:hover:border-blue-500">
              <CardContent className="p-5">
                <span className="block text-base font-semibold">
                  英国サービスチャージ完全ガイド
                </span>
                <span className="mt-1 block text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                  Tipping Act 2023の内容、強制・任意の違い、Tronc制度、税務・最低賃金との関係まで網羅的に解説。
                </span>
              </CardContent>
            </Card>
          </Link>
          <Link href="/jobs/service-charges/case-story" className="block">
            <Card className="border-blue-200 dark:border-blue-900/60 bg-blue-50/60 dark:bg-blue-950/20 shadow-sm transition hover:border-blue-400 dark:hover:border-blue-500">
              <CardContent className="p-5">
                <span className="block text-base font-semibold">
                  サービスチャージ未払いで審判所に申立てた記録
                </span>
                <span className="mt-1 block text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                  Acas Early ConciliationからEmployment Tribunalの判決、強制執行までの実体験。認容された計算方法も公開。
                </span>
              </CardContent>
            </Card>
          </Link>
          <Link href="/jobs/service-charges/dashboard" className="block">
            <Card className="bg-white dark:bg-neutral-900 border-gray-300 dark:border-neutral-700 shadow-sm transition hover:border-blue-400 dark:hover:border-blue-500">
              <CardContent className="p-5">
                <span className="block text-base font-semibold">
                  ロンドン市内のサービスチャージ実態調査
                </span>
                <span className="mt-1 block text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                  実際に働いている・働いていた人からの独自調査データを、店舗ごとに検索・閲覧できます。
                </span>
              </CardContent>
            </Card>
          </Link>
        </div>
      </section>
    </main>
  );
}
