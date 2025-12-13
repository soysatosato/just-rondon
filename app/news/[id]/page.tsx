import BreadCrumbs from "@/components/home/BreadCrumbs";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { fetchNews } from "@/utils/actions/news";
import { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const news = await fetchNews(params.id);

  const tags = news?.tags.join("・") || "";

  return {
    title: `${tags ? tags + "・" : ""}${
      news?.category
    }ニュース・ロンドン最新情報`,
    description: `${news?.title} | ${tags}のトピック。ロンドンの最新ニュースや注目トピック、イベント情報をわかりやすくまとめています。`,
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      canonical: `https://www.just-rondon.com/news/${params.id}`,
    },
  };
}
export default async function NewsDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const news = await fetchNews(params.id);
  if (!news) redirect("/news");

  return (
    <div>
      <BreadCrumbs name="ニュース" link="news" name2={news.category} />
      <Card className="max-w-4xl mx-auto my-12 shadow-lg rounded-xl overflow-hidden">
        <div className="relative w-full h-96 rounded-xl overflow-hidden shadow-lg">
          <img
            src={news.image}
            alt={news.title}
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
            decoding="async"
          />

          {/* オーバーレイ */}
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>

          {/* タイトル & highlights */}
          <div className="absolute inset-0 flex flex-col justify-end px-6 py-16 space-y-2">
            {/* Highlights バッジ（タイトルの上） */}
            <div className="absolute top-8 left-6 flex flex-wrap gap-2">
              {news.tags?.map((tag, idx) => (
                <Badge
                  key={idx}
                  className="bg-white/20 text-white backdrop-blur-sm"
                >
                  {tag}
                </Badge>
              ))}
            </div>

            <h1 className="text-3xl md:text-5xl font-extrabold text-white drop-shadow-lg">
              {news.title}
            </h1>
          </div>
        </div>

        {/* 日付と著者 */}
        <CardHeader className="mt-6 px-6">
          <p className="text-sm text-foreground">
            {new Date(news.createdAt).toLocaleDateString("ja-JP", {
              year: "numeric",
              month: "long", // "numeric" にすると 1～12 表示、"long" にすると 〇月
              day: "numeric",
            })}
          </p>
        </CardHeader>

        {/* サマリー */}
        <CardContent className="px-6">
          <p className="text-lg font-semibold mb-6 border-l-4 border-indigo-500 pl-4">
            {news.summary}
          </p>
          <div className="prose prose-lg max-w-none leading-relaxed text-muted-foreground break-words">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                p: ({ ...props }) => <p className="mb-6" {...props} />,
                a: ({ ...props }) => (
                  <a className="text-indigo-600 hover:underline" {...props} />
                ),
                strong: ({ ...props }) => (
                  <strong className="font-bold" {...props} />
                ),
                li: ({ ...props }) => (
                  <li className="ml-6 list-disc" {...props} />
                ),
              }}
            >
              {news.content}
            </ReactMarkdown>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
