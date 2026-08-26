import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ShoppingGuideLayout from "@/components/shopping/ShoppingGuideLayout";
import {
  buildShoppingGuideMetadata,
  shoppingGuidePath,
  shoppingGuideSlugs,
} from "@/components/shopping/guides";
import { shoppingGuideArticles } from "@/components/shopping/content";
import { buildPageMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return shoppingGuideSlugs.map((slug) => ({ slug }));
}

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const article = shoppingGuideArticles[params.slug];

  if (!article) {
    return buildPageMetadata({
      path: shoppingGuidePath(params.slug),
      title: "ロンドンの買い物ガイド",
      description:
        "ロンドンのマーケット、デパート、免税制度についてまとめています。",
      noindex: true,
    });
  }

  return buildShoppingGuideMetadata(article);
}

export default function ShoppingGuidePage({
  params,
}: {
  params: { slug: string };
}) {
  const article = shoppingGuideArticles[params.slug];

  if (!article) return notFound();

  return <ShoppingGuideLayout article={article} />;
}
