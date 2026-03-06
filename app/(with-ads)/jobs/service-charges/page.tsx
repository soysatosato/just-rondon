import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { fetchContentBySlug } from "@/utils/actions/contents";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import Link from "next/link";

export const metadata = {
  title:
    "英国サービスチャージ完全ガイド｜Tipping Act 2023・従業員の権利・事業者の義務まとめ | ジャスト・ロンドン",
  description:
    "英国のレストランやホテルで一般化しているサービスチャージについて、Tipping Act 2023の内容、強制・任意の違い、従業員の権利、Tronc制度、税務・最低賃金との関係まで網羅的に解説。",
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
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical:
      "https://www.just-rondon.com/hospitality/uk-service-charges-guide",
  },
  openGraph: {
    title:
      "英国サービスチャージの仕組みと法律｜Tipping Act 2023をわかりやすく解説",
    description:
      "サービスチャージは誰のもの？拒否できる？英国のTipping Act 2023に基づき、事業者・従業員双方が知るべきルールを整理。",
    url: "https://www.just-rondon.com/hospitality/uk-service-charges-guide",
    siteName: "ジャスト・ロンドン｜英国生活・法律ガイド",
    locale: "ja_JP",
    type: "article",
  },
};

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
            className="bg-white dark:bg-neutral-900 border-gray-300 dark:border-neutral-700 shadow-sm"
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

      {/* Related links */}
      <div className="mt-12 rounded-lg border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-900 p-6 space-y-4">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          関連情報・参考リンク
        </h3>

        <ul className="space-y-2 text-sm">
          {content.website && (
            <li>
              <a
                href={content.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400  hover:opacity-80"
              >
                Acas公式サイト｜雇用・チップ分配に関するガイド
              </a>
            </li>
          )}

          <li>
            <Link
              href="/jobs/service-charges/dashboard"
              className="text-blue-600 dark:text-blue-400  hover:opacity-80"
            >
              ロンドン市内のサービスチャージ実態調査（独自調査）
            </Link>
          </li>
        </ul>
      </div>
    </main>
  );
}
