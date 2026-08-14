import type { Metadata } from "next";
import { notFound } from "next/navigation";
import TroubleGuideLayout from "@/components/trouble/guides/TroubleGuideLayout";
import {
  buildTroubleGuideMetadata,
  troubleGuideSlugs,
} from "@/components/trouble/guides/guides";
import { troubleGuideArticles } from "@/components/trouble/guides/content";
import { buildPageMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return troubleGuideSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const article = troubleGuideArticles[params.slug];

  if (!article) {
    return buildPageMetadata({
      path: `/trouble/${params.slug}`,
      title: "ロンドンのトラブル対応ガイド",
      description:
        "ロンドンで盗難・紛失などのトラブルに遭ったときの対処法を、手順に沿って解説します。",
      noindex: true,
    });
  }

  return buildTroubleGuideMetadata(article);
}

export default function TroubleGuidePage({
  params,
}: {
  params: { slug: string };
}) {
  const article = troubleGuideArticles[params.slug];

  if (!article) return notFound();

  return <TroubleGuideLayout article={article} />;
}
