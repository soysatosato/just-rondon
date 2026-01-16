import type { Metadata } from "next";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import ReactMarkdown from "react-markdown";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { fetchContentBySlug } from "@/utils/actions/contents";
import Link from "next/link";
const components = {
  a: ({ href, children }: any) => (
    <Link
      href={href ?? "#"}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-600 underline font-medium hover:text-blue-800"
    >
      {children}
    </Link>
  ),
};

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const content = await fetchContentBySlug(params.slug);

  if (!content) {
    return {
      title: "英国ビザ・入国手続きガイド | ジャスト・ロンドン",
      description:
        "イギリス渡航前に知っておきたいビザ情報や入国要件を分かりやすく解説します。",
      robots: {
        index: true,
        follow: true,
      },
      alternates: {
        canonical: `https://www.just-rondon.com/visa/${params.slug}`,
      },
    };
  }

  const title = `${content.title} | 英国ビザガイド | ジャスト・ロンドン`;

  const description = content.summary
    ? `${content.summary} 英国渡航に必要な最新のビザ要件と申請手続きについて詳しく解説。`
    : "英国ビザ情報を詳しく紹介します。";

  const canonicalUrl = `https://www.just-rondon.com/visa/${params.slug}`;

  return {
    title,
    description,
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: "article",
      url: canonicalUrl,
      title,
      description,
      siteName: "ジャスト・ロンドン｜英国ビザ情報",
      locale: "ja_JP",
    },
  };
}

export default async function VisaGuidePage({
  params,
}: {
  params: { slug: string };
}) {
  const content = await fetchContentBySlug(params.slug);

  if (!content) return <p>Not Found</p>;

  return (
    <div className="container mx-auto max-w-3xl py-10">
      <Card className="shadow-md rounded-2xl border border-border/60">
        <CardHeader className="space-y-4 pb-0">
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
            Visa Guide
          </p>
          <CardTitle
            className="
    text-2xl md:text-5xl font-black
    tracking-tight leading-[1.15]
    bg-clip-text text-transparent
    bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600
    drop-shadow-sm
    mb-6
  "
          >
            {content.title}
          </CardTitle>
          {content.summary && (
            <p className="text-sm italic text-muted-foreground mt-2 leading-relaxed">
              {content.summary}
            </p>
          )}
        </CardHeader>

        <CardContent className="pt-8">
          <div
            className="prose prose-neutral dark:prose-invert max-w-none
            prose-h2:mt-14 prose-h2:mb-5
            prose-p:leading-relaxed prose-p:my-4
            prose-li:leading-relaxed prose-li:my-1
            prose-strong:font-semibold
            prose-a:text-blue-600 prose-a:underline
          "
          >
            {/* 
            {content.mainText && (
              <section
                className="
    prose prose-neutral dark:prose-invert
    text-[17px] max-sm:text-[15px]
    leading-relaxed
    mb-20
    max-w-[780px] mx-auto
    space-y-5

    [& ul]:list-disc
    [& ul]:pl-6
    [& li]:marker:text-blue-600
    [& li]:marker:text-lg
  "
              >
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw]}
                >
                  {content.mainText}
                </ReactMarkdown>
              </section>
            )} */}

            {/* Sections */}
            {content.sections.map((section: any) => (
              <section key={section.id} className="mt-16 mb-20">
                <h2
                  className="
    text-lg md:text-2xl font-extrabold tracking-tight
    text-foreground mb-6 leading-snug
    inline-block
    pb-1 border-b-4 border-blue-600
  "
                >
                  {section.title}
                </h2>

                {section.description && (
                  <div
                    className="
    prose prose-neutral dark:prose-invert
    max-w-none text-sm md:text-[17px] leading-relaxed
    space-y-4 prose-p:my-4 prose-li:my-1
    prose-strong:font-semibold prose-a:text-blue-600 prose-a:underline
    [&>p]:whitespace-pre-line [&>p]:break-words



    /* 👇 表スタイルを大幅に強化 */
    [&_table]:w-full
    [&_table]:border-collapse
    [&_table]:overflow-hidden
    [&_table]:rounded-lg
    [&>table]:text-[14px] max-sm:[&>table]:text-[12px]


    [&_th]:border [&_td]:border
    [&_th]:px-4 [&_th]:py-2
    [&_td]:px-3 [&_td]:py-1

    [&_thead_th]:bg-gray-200 dark:[&_thead_th]:bg-gray-700
    [&_tr:nth-child(even)]:bg-gray-50 dark:[&_tr:nth-child(even)]:bg-gray-800
  "
                  >
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeRaw]}
                      components={components}
                    >
                      {section.description}
                    </ReactMarkdown>
                  </div>
                )}
              </section>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
