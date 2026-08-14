import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SocialGuideLayout from "@/components/social/guides/SocialGuideLayout";
import {
  buildSocialGuideMetadata,
  socialGuideSlugs,
} from "@/components/social/guides/guides";
import { socialGuideArticles } from "@/components/social/guides/content";
import { buildPageMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return socialGuideSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const article = socialGuideArticles[params.slug];

  if (!article) {
    return buildPageMetadata({
      path: `/social/${params.slug}`,
      title: "ロンドンの出会いと人間関係ガイド",
      description:
        "ロンドンで友だちを作る、恋愛する、日本人コミュニティと付き合う。人間関係の作り方を解説します。",
      noindex: true,
    });
  }

  return buildSocialGuideMetadata(article);
}

export default function SocialGuidePage({
  params,
}: {
  params: { slug: string };
}) {
  const article = socialGuideArticles[params.slug];

  if (!article) return notFound();

  return <SocialGuideLayout article={article} />;
}
