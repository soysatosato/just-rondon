import type { Metadata } from "next";
import { notFound } from "next/navigation";
import TransportGuideLayout from "@/components/sightseeing/transport/TransportGuideLayout";
import {
  buildTransportGuideMetadata,
  transportGuidePath,
  transportGuideSlugs,
} from "@/components/sightseeing/transport/guides";
import { transportGuideArticles } from "@/components/sightseeing/transport/content";
import { buildPageMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return transportGuideSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const article = transportGuideArticles[params.slug];

  if (!article) {
    return buildPageMetadata({
      path: transportGuidePath(params.slug),
      title: "ロンドンの交通ガイド",
      description:
        "ロンドンの地下鉄・バス・シェアサイクル・タクシーの使い方と運賃をまとめています。",
      noindex: true,
    });
  }

  return buildTransportGuideMetadata(article);
}

export default function TransportGuidePage({
  params,
}: {
  params: { slug: string };
}) {
  const article = transportGuideArticles[params.slug];

  if (!article) return notFound();

  return <TransportGuideLayout article={article} />;
}
