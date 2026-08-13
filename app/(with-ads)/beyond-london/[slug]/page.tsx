import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BeyondLayout from "@/components/beyond-london/BeyondLayout";
import {
  beyondPath,
  beyondSlugs,
  buildBeyondMetadata,
} from "@/components/beyond-london/destinations";
import { beyondArticles } from "@/components/beyond-london/content";
import { buildPageMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return beyondSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const article = beyondArticles[params.slug];

  if (!article) {
    return buildPageMetadata({
      path: beyondPath(params.slug),
      title: "Beyond London｜ロンドンの外へ",
      description:
        "ロンドンから日帰り・週末で行ける行き先と、英国の鉄道の乗り方をまとめています。",
      noindex: true,
    });
  }

  return buildBeyondMetadata(article);
}

export default function BeyondPage({ params }: { params: { slug: string } }) {
  const article = beyondArticles[params.slug];

  if (!article) return notFound();

  return <BeyondLayout article={article} />;
}
