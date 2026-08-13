import type { Metadata } from "next";
import { notFound } from "next/navigation";
import MoneyGuideLayout from "@/components/money/guides/MoneyGuideLayout";
import {
  buildMoneyGuideMetadata,
  moneyGuideSlugs,
} from "@/components/money/guides/guides";
import { moneyGuideArticles } from "@/components/money/guides/content";
import { buildPageMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return moneyGuideSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const article = moneyGuideArticles[params.slug];

  if (!article) {
    return buildPageMetadata({
      path: `/money/${params.slug}`,
      title: "イギリスの銀行口座と送金ガイド",
      description:
        "イギリスで銀行口座を開き、日本から送金し、働いて受け取るまでの手順を解説します。",
      noindex: true,
    });
  }

  return buildMoneyGuideMetadata(article);
}

export default function MoneyGuidePage({
  params,
}: {
  params: { slug: string };
}) {
  const article = moneyGuideArticles[params.slug];

  if (!article) return notFound();

  return <MoneyGuideLayout article={article} />;
}
