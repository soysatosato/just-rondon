import Link from "next/link";
import { notFound } from "next/navigation";
import { buildPageMetadata } from "@/lib/seo";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { fetchContentBySlug } from "@/utils/actions/contents";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

export const metadata = buildPageMetadata({
  path: "/sightseeing/eta-uk-visa-guide",
  title: "ETA（英国電子渡航認証）完全ガイド 2025｜対象国・申請方法・必要書類・注意点まとめ | ジャスト・ロンドン",
  titleSuffix: false,
  description: "2025年最新版のETA（英国電子渡航認証）について詳しく解説。日本人はいつから必要？申請手順、対象国、料金、審査日数、注意点、よくある質問まで、英国旅行前に知っておくべき情報を網羅した完全ガイド。",
  keywords: [
    "ETA",
    "英国 ETA",
    "イギリス ETA",
    "イギリス 渡航認証",
    "イギリス 入国",
    "ETA 申請",
    "英国観光ビザ",
    "日本人 ETA",
    "イギリス 旅行 2025",
    "渡航条件",
  ],
});

export default async function ETAGUidePage() {
  const slug = "eta-uk-visa-guide";
  const content = await fetchContentBySlug(slug);
  if (!content) return notFound();

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 text-gray-900 dark:text-gray-100">
      {/* Title */}
      <header className="space-y-4">
        <h1 className="text-3xl font-bold leading-tight md:text-4xl">
          {content.title}
        </h1>
        {content.summary && (
          <p className="text-lg text-gray-700 dark:text-gray-300">
            {content.summary}
          </p>
        )}
      </header>

      <Separator className="my-6" />

      {/* Main */}
      {content.mainText && (
        <section className="prose dark:prose-invert prose-gray max-w-none leading-relaxed mb-10">
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
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {section.displayOrder}. {section.title}
              </h2>

              {section.description && (
                <div className="prose dark:prose-invert prose-sm max-w-none space-y-3 leading-relaxed">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeRaw]}
                    components={{
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
                        <p className="mt-3 mb-1">{children}</p>
                      ),
                      strong: ({ children }) => (
                        <strong className="font-semibold text-gray-800 dark:text-gray-200">
                          {children}
                        </strong>
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

      {/* GOV link */}
      {content.website && (
        <footer className="mt-12 text-center">
          <a
            href={content.website}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 underline hover:opacity-80"
          >
            GOV.UK：ETA公式情報はこちら
          </a>
        </footer>
      )}

      <div className="mt-10 rounded-lg border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-900 p-6 space-y-2">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          渡航前に確認しておきたいこと
        </h2>
        <ul className="space-y-2 text-sm">
          <li>
            <Link
              href="/sightseeing/travel-tips"
              className="text-blue-600 dark:text-blue-400 hover:opacity-80"
            >
              ロンドン旅行の実用情報｜両替・カード・チップ・治安・eSIM・電源・服装
            </Link>
          </li>
          <li>
            <Link
              href="/sightseeing/transport"
              className="text-blue-600 dark:text-blue-400 hover:opacity-80"
            >
              ロンドンの交通ガイド｜タッチ決済と空港アクセス
            </Link>
          </li>
        </ul>
      </div>
    </main>
  );
}
