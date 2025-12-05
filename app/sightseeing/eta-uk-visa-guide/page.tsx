import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { fetchContentBySlug } from "@/utils/actions/contents";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

export const metadata = {
  title:
    "ETA（英国電子渡航認証）完全ガイド 2025｜対象国・申請方法・必要書類・注意点まとめ | ロンドん！",
  description:
    "2025年最新版のETA（英国電子渡航認証）について詳しく解説。日本人はいつから必要？申請手順、対象国、料金、審査日数、注意点、よくある質問まで、英国旅行前に知っておくべき情報を網羅した完全ガイド。",
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
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://www.just-rondon.com/sightseeing/eta-uk-visa-guide",
  },
  openGraph: {
    title: "ETA（英国電子渡航認証）2025 最新情報｜申請方法・対象国まとめ",
    description:
      "渡航前に要チェック！イギリス入国に必要なETA（電子渡航認証）について、日本語でわかりやすく解説。申請手順・必要書類・いつから義務化？など疑問を完全網羅。",
    url: "https://www.just-rondon.com/sightseeing/eta-uk-visa-guide",
    siteName: "ロンドん！｜英国ビザ・旅行手続き情報",
    locale: "ja_JP",
    type: "article",
  },
};

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
    </main>
  );
}
