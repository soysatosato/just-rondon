import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { notFound } from "next/navigation";
import { fetchChristmasMarketBySlug } from "@/utils/actions/contents";

import { MapPin, CalendarDays, Sparkles, Compass } from "lucide-react";

interface Props {
  params: {
    slug: string;
  };
}

const SectionBlock = ({
  children,
  icon,
  title,
}: {
  children: React.ReactNode;
  icon: React.ReactNode;
  title: string;
}) => (
  <section className="space-y-3 border-b border-slate-200 dark:border-slate-700 pb-6">
    <h2 className="text-xl sm:text-2xl font-semibold flex items-center gap-2">
      {icon} {title}
    </h2>
    <div className="prose dark:prose-invert max-w-full prose-sm sm:prose-base">
      {children}
    </div>
  </section>
);
export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
  const content = await fetchChristmasMarketBySlug(params.slug);

  // データが存在しない場合（404用メタ）
  if (!content) {
    return {
      title: "ロンドン・クリスマスマーケットガイド | ロンドん!",
      description:
        "ロンドンのクリスマスマーケット情報をまとめて紹介します。ロケーションや開催期間もチェック！",
      robots: { index: false, follow: false },
    };
  }

  // タイトル生成
  const title = `${content.title} | ロンドンのクリスマスマーケット | ロンドん!`;

  // description生成（summary → mainText fallback）
  const text = content.summary || content.mainText || "";
  const trimmedDesc = text.replace(/[#>*_\-`]/g, "").slice(0, 120);

  const description = `${trimmedDesc}… 住所・開催期間・見どころを紹介。`;

  // canonical URL設定
  const canonicalUrl = `https://www.just-rondon.com/christmas-markets/${params.slug}`;

  return {
    title,
    description,
    keywords: [
      content.title,
      "クリスマスマーケット",
      "ロンドン クリスマス",
      "ロンドン 冬",
      "クリスマス おすすめ",
      "London Christmas Market",
      "Christmas Event London",
    ],
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
      locale: "ja_JP",
      siteName: "ロンドん!",
      images: content.image ? [{ url: content.image }] : undefined,
    },
  };
}

export default async function ChristmasMarketDetailPage({ params }: Props) {
  const content = await fetchChristmasMarketBySlug(params.slug);

  if (!content) return notFound();

  const sections = content.sections.sort(
    (a, b) => a.displayOrder - b.displayOrder
  );

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 md:py-10 space-y-10">
      <div>
        <h1 className="text-2xl sm:text-4xl font-bold tracking-tight leading-snug mb-4">
          {content.title}
        </h1>
        <div className="text-sm text-muted-foreground italic prose dark:prose-invert max-w-full prose-sm sm:prose-base">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {content.summary}
          </ReactMarkdown>
        </div>
      </div>

      {/* ③ image */}
      {content.image && (
        <div className="relative w-full h-56 sm:h-72 md:h-80 rounded-xl overflow-hidden">
          <img
            src={content.image}
            alt={content.title}
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
            decoding="async"
          />
        </div>
      )}

      {/* ④ mainText */}
      {content.mainText && (
        <section className="prose dark:prose-invert prose-sm sm:prose-base max-w-full">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {content.mainText}
          </ReactMarkdown>
        </section>
      )}

      {/* 公式サイトリンク */}
      {content.website && (
        <p className="text-sm font-medium text-sky-600 dark:text-sky-300 underline">
          <a href={content.website} target="_blank" rel="noopener noreferrer">
            公式サイトはこちら
          </a>
        </p>
      )}

      {/* ⑤ section（場所／期間／コツ／周辺） */}
      <div className="space-y-8">
        {sections.map((sec) => {
          const title = sec.title.toLowerCase();
          const body = (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {sec.description}
            </ReactMarkdown>
          );

          if (title.includes("場所"))
            return (
              <SectionBlock
                key={sec.id}
                icon={<MapPin className="h-5 w-5 text-sky-500" />}
                title="場所（地図を見る）"
              >
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    a: ({ href, children }) => (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="
                text-sky-600 dark:text-sky-300 underline
                hover:opacity-80
                cursor-pointer
                font-medium
              "
                      >
                        {children}
                      </a>
                    ),
                  }}
                >
                  {sec.description}
                </ReactMarkdown>
              </SectionBlock>
            );

          if (title.includes("期間"))
            return (
              <SectionBlock
                key={sec.id}
                icon={<CalendarDays className="h-5 w-5 text-emerald-400" />}
                title="期間"
              >
                {body}
              </SectionBlock>
            );

          if (title.includes("訪問"))
            return (
              <SectionBlock
                key={sec.id}
                icon={<Sparkles className="h-5 w-5 text-amber-300" />}
                title="訪問のコツ"
              >
                {body}
              </SectionBlock>
            );

          if (title.includes("周辺"))
            return (
              <SectionBlock
                key={sec.id}
                icon={<Compass className="h-5 w-5 text-purple-400" />}
                title="周辺でできること"
              >
                {body}
              </SectionBlock>
            );

          return null;
        })}
      </div>
    </div>
  );
}
