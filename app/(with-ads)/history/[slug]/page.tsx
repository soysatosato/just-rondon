import type { Metadata } from "next";
import { notFound } from "next/navigation";
import HistoryChapterLayout from "@/components/history/HistoryChapterLayout";
import {
  buildChapterMetadata,
  historyChapterSlugs,
} from "@/components/history/chapters";
import { historyChapterArticles } from "@/components/history/content";
import { buildPageMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return historyChapterSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const chapter = historyChapterArticles[params.slug];

  if (!chapter) {
    return buildPageMetadata({
      path: `/history/${params.slug}`,
      title: "イギリスの歴史 全10章",
      description:
        "ローマ帝国のブリタニア征服から EU 離脱まで、イギリスの歴史を全10章で解説します。",
      noindex: true,
    });
  }

  return buildChapterMetadata(chapter);
}

export default function HistoryChapterPage({
  params,
}: {
  params: { slug: string };
}) {
  const chapter = historyChapterArticles[params.slug];

  if (!chapter) return notFound();

  return <HistoryChapterLayout chapter={chapter} />;
}
