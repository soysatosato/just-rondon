import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BillsGuideLayout from "@/components/bills/guides/BillsGuideLayout";
import {
  buildBillsGuideMetadata,
  billsGuideSlugs,
} from "@/components/bills/guides/guides";
import { billsGuideArticles } from "@/components/bills/guides/content";
import { buildPageMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return billsGuideSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const article = billsGuideArticles[params.slug];

  if (!article) {
    return buildPageMetadata({
      path: `/bills/${params.slug}`,
      title: "イギリスの光熱費と生活の契約ガイド",
      description:
        "Council Tax、ガス・電気、水道、TV Licence、ネット回線、携帯の契約を、入居の前後に必要になる順に解説します。",
      noindex: true,
    });
  }

  return buildBillsGuideMetadata(article);
}

export default function BillsGuidePage({
  params,
}: {
  params: { slug: string };
}) {
  const article = billsGuideArticles[params.slug];

  if (!article) return notFound();

  return <BillsGuideLayout article={article} />;
}
