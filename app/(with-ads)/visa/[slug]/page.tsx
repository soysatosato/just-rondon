import type { Metadata } from "next";
import { notFound } from "next/navigation";
import VisaGuideLayout from "@/components/visa/guides/VisaGuideLayout";
import { buildVisaGuideMetadata, visaGuideSlugs } from "@/components/visa/guides/guides";
import { visaGuideArticles } from "@/components/visa/guides/content";
import { buildPageMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return visaGuideSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const article = visaGuideArticles[params.slug];

  if (!article) {
    return buildPageMetadata({
      path: `/visa/${params.slug}`,
      title: "英国ビザガイド",
      description:
        "イギリス渡航に必要なビザの種類と申請手続きを、ルート別に解説します。",
      noindex: true,
    });
  }

  return buildVisaGuideMetadata(article);
}

export default function VisaGuidePage({
  params,
}: {
  params: { slug: string };
}) {
  const article = visaGuideArticles[params.slug];

  if (!article) return notFound();

  return <VisaGuideLayout article={article} />;
}
