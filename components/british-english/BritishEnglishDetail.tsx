import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Content, ContentSection } from "@prisma/client";
import BritishEnglishBreadCrumbs from "@/components/british-english/BritishEnglishBreadCrumbs";
import AdSenseUnit from "@/components/ads/AdSenseUnit";
import { AD_SLOTS } from "@/lib/adsense";

const proseClass =
  "prose dark:prose-invert prose-sm sm:prose-base max-w-full";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

type BritishEnglishWithSections = Content & { sections: ContentSection[] };

export default function BritishEnglishDetail({
  content,
}: {
  content: BritishEnglishWithSections;
}) {
  const sections = content.sections
    .slice()
    .sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 md:py-10 space-y-10">
      <BritishEnglishBreadCrumbs title={content.title} />

      <div>
        <p className="text-sm text-muted-foreground mb-2">
          {formatDate(content.createdAt)}
        </p>
        <h1 className="text-2xl sm:text-4xl font-bold tracking-tight leading-snug mb-1">
          {content.engTitle || content.title}
        </h1>
        {content.engTitle && (
          <p className="text-lg text-muted-foreground mb-4">
            {content.title}
          </p>
        )}
        {content.summary && (
          <div className={`text-muted-foreground italic ${proseClass}`}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {content.summary}
            </ReactMarkdown>
          </div>
        )}
      </div>

      {content.image && (
        <div className="relative w-full h-56 sm:h-72 md:h-80 rounded-xl overflow-hidden">
          <img
            src={content.image}
            alt={content.title}
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
            decoding="async"
            fetchPriority="low"
          />
        </div>
      )}

      {content.mainText && (
        <section className={proseClass}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {content.mainText}
          </ReactMarkdown>
        </section>
      )}

      <AdSenseUnit slot={AD_SLOTS.inArticle} />

      <div className="space-y-8">
        {sections.map((sec) => (
          <section
            key={sec.id}
            className="space-y-3 border-b border-slate-200 dark:border-slate-700 pb-6 last:border-b-0"
          >
            <h2 className="text-xl sm:text-2xl font-semibold">
              {sec.title}
            </h2>
            {sec.subtitle && (
              <p className="text-sm text-muted-foreground">{sec.subtitle}</p>
            )}
            {sec.description && (
              <div className={proseClass}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {sec.description}
                </ReactMarkdown>
              </div>
            )}
          </section>
        ))}
      </div>

      <p className="pt-4">
        <Link
          href="/british-english"
          className="text-sm font-medium text-sky-600 dark:text-sky-300 underline"
        >
          ← イギリス英語一覧に戻る
        </Link>
      </p>
    </div>
  );
}
