import { notFound } from "next/navigation";
import { buildPageMetadata } from "@/lib/seo";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { fetchContentBySlug } from "@/utils/actions/contents";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import Link from "next/link";

export const metadata = buildPageMetadata({
  path: "/jobs/service-charges",
  title: "英国サービスチャージ完全ガイド｜Tipping Act 2023・従業員の権利・事業者の義務まとめ | ジャスト・ロンドン",
  titleSuffix: false,
  description: "英国のレストランやホテルで一般化しているサービスチャージについて、Tipping Act 2023の内容、強制・任意の違い、従業員の権利、Tronc制度、税務・最低賃金との関係まで網羅的に解説。",
  keywords: [
    "サービスチャージ 英国",
    "Tipping Act 2023",
    "チップ 法律 イギリス",
    "英国 レストラン サービス料",
    "Tronc 制度",
    "イギリス チップ ルール",
    "最低賃金 チップ",
    "Employment Tribunal チップ",
  ],
});

export default async function ServiceChargeGuidePage() {
  const slug = "uk-hospitality-service-charges-guide";
  const content = await fetchContentBySlug(slug);

  if (!content) return notFound();

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 text-gray-900 dark:text-gray-100">
      {/* Title */}
      <header className="space-y-4">
        <h1 className="text-2xl font-bold leading-tight md:text-4xl">
          {content.title}
        </h1>

        {content.summary && (
          <p className="text-base text-gray-700 dark:text-gray-300">
            {content.summary}
          </p>
        )}
      </header>

      {/* このページでわかること／実践コンテンツへの導線 */}
      <div className="mt-8 space-y-5">
        <nav
          aria-label="目次"
          className="rounded-lg border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-900 p-5"
        >
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            このページでわかること
          </h2>
          <ol className="mt-3 list-none space-y-2 border-l border-gray-300 dark:border-neutral-700 pl-4">
            {content.sections.map((section, i) => (
              <li key={section.id}>
                <a
                  href={`#section-${section.id}`}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline underline-offset-2"
                >
                  {i + 1}. {section.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div>
          <p className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
            法律・制度の解説だけでなく、実際のデータや事例も見られます
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Link
              href="/jobs/service-charges/dashboard"
              className="group block rounded-lg border-2 border-blue-200 dark:border-blue-900/60 bg-blue-50/60 dark:bg-blue-950/20 p-5 transition hover:border-blue-400 dark:hover:border-blue-500"
            >
              <p className="text-xs font-semibold text-blue-700 dark:text-blue-400">
                実態調査データ
              </p>
              <p className="mt-1 text-base font-semibold text-gray-900 dark:text-gray-100 group-hover:underline">
                店舗別のサービスチャージ実態を見る →
              </p>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                ロンドン市内の日本食レストランで働く人からの声を集約。店舗名（英名）で検索できます。
              </p>
            </Link>

            <Link
              href="/jobs/service-charges/case-story"
              className="group block rounded-lg border-2 border-amber-200 dark:border-amber-900/60 bg-amber-50/60 dark:bg-amber-950/20 p-5 transition hover:border-amber-400 dark:hover:border-amber-500"
            >
              <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                実例・裁判記録
              </p>
              <p className="mt-1 text-base font-semibold text-gray-900 dark:text-gray-100 group-hover:underline">
                未払いで審判所に申立てた記録を読む →
              </p>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Acasでの相談からEmployment
                Tribunalの判決、強制執行まで。実際に認容された計算方法も公開。
              </p>
            </Link>
          </div>
        </div>
      </div>

      <Separator className="my-6" />

      {/* Main text (optional) */}
      {content.mainText && (
        <section className="text-sm prose dark:prose-invert prose-gray max-w-none leading-relaxed mb-10">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
          >
            {content.mainText}
          </ReactMarkdown>
        </section>
      )}

      {/* Sections */}
      <div className="space-y-8">
        {content.sections.map((section) => (
          <Card
            key={section.id}
            id={`section-${section.id}`}
            className="scroll-mt-24 bg-white dark:bg-neutral-900 border-gray-300 dark:border-neutral-700 shadow-sm"
          >
            <CardContent className="p-6 space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {section.displayOrder}. {section.title}
              </h2>

              {section.description && (
                <div className="text-sm prose dark:prose-invert prose-sm max-w-none leading-relaxed">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeRaw]}
                    components={{
                      h2: ({ children }) => (
                        <h3 className="mt-8 mb-3 text-lg font-semibold text-gray-900 dark:text-gray-100 border-b pb-1">
                          {children}
                        </h3>
                      ),
                      h3: ({ children }) => (
                        <h4 className="mt-6 mb-2 text-base font-semibold text-gray-800 dark:text-gray-200">
                          {children}
                        </h4>
                      ),
                      h4: ({ children }) => (
                        <h5 className="mt-4 mb-1 text-sm font-semibold text-gray-700 dark:text-gray-300">
                          {children}
                        </h5>
                      ),
                      ul: ({ ...props }) => (
                        <ul
                          className="list-disc ml-6 space-y-2 marker:text-gray-600 dark:marker:text-gray-300"
                          {...props}
                        />
                      ),
                      li: ({ children }) => (
                        <li className="pl-1">{children}</li>
                      ),
                      p: ({ children }) => (
                        <p className="mt-3 mb-1 leading-relaxed">{children}</p>
                      ),
                      strong: ({ children }) => (
                        <strong className="font-semibold text-gray-900 dark:text-gray-100">
                          {children}
                        </strong>
                      ),
                      table: ({ ...props }) => (
                        <table className="border-collapse border border-gray-300 dark:border-gray-600 w-full text-sm my-4">
                          {props.children}
                        </table>
                      ),
                      th: ({ ...props }) => (
                        <th className="border border-gray-300 dark:border-gray-600 px-2 py-1 bg-gray-100 dark:bg-neutral-800">
                          {props.children}
                        </th>
                      ),
                      td: ({ ...props }) => (
                        <td className="border border-gray-300 dark:border-gray-600 px-2 py-1">
                          {props.children}
                        </td>
                      ),
                    }}
                  >
                    {section.description}
                  </ReactMarkdown>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 読了後の導線 */}
      <div className="mt-12 space-y-5">
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          読み終えたら、次はこちら
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Link
            href="/jobs/service-charges/dashboard"
            className="group block rounded-lg border-2 border-blue-200 dark:border-blue-900/60 bg-blue-50/60 dark:bg-blue-950/20 p-5 transition hover:border-blue-400 dark:hover:border-blue-500"
          >
            <p className="text-xs font-semibold text-blue-700 dark:text-blue-400">
              実態調査データ
            </p>
            <p className="mt-1 text-base font-semibold text-gray-900 dark:text-gray-100 group-hover:underline">
              店舗別のサービスチャージ実態を見る →
            </p>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              自分の店の実態を検索、または情報を投稿できます。
            </p>
          </Link>

          <Link
            href="/jobs/service-charges/case-story"
            className="group block rounded-lg border-2 border-amber-200 dark:border-amber-900/60 bg-amber-50/60 dark:bg-amber-950/20 p-5 transition hover:border-amber-400 dark:hover:border-amber-500"
          >
            <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">
              実例・裁判記録
            </p>
            <p className="mt-1 text-base font-semibold text-gray-900 dark:text-gray-100 group-hover:underline">
              未払いで審判所に申立てた記録を読む →
            </p>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              申立てから判決、強制執行までの一部始終を公開しています。
            </p>
          </Link>
        </div>

        {content.website && (
          <div className="rounded-lg border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-900 p-6">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              参考リンク
            </h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <a
                  href={content.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:opacity-80"
                >
                  Acas公式サイト｜雇用・チップ分配に関するガイド
                </a>
              </li>
            </ul>
          </div>
        )}
      </div>
    </main>
  );
}
