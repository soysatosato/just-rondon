import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CommentTargetType } from "@prisma/client";
import HousingGuideLayout from "@/components/housing/guides/HousingGuideLayout";
import {
  buildHousingGuideMetadata,
  housingGuideSlugs,
} from "@/components/housing/guides/guides";
import { housingGuideArticles } from "@/components/housing/guides/content";
import type { PageCommentItem } from "@/components/comments/PageCommentSection";
import { buildPageMetadata } from "@/lib/seo";
import db from "@/utils/db";

export function generateStaticParams() {
  return housingGuideSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const article = housingGuideArticles[params.slug];

  if (!article) {
    return buildPageMetadata({
      path: `/housing/${params.slug}`,
      title: "ロンドンの住まい探しガイド",
      description:
        "ロンドンで部屋を借りるための手順を、物件の探し方から契約・退去まで解説します。",
      noindex: true,
    });
  }

  return buildHousingGuideMetadata(article);
}

export default async function HousingGuidePage({
  params,
}: {
  params: { slug: string };
}) {
  const article = housingGuideArticles[params.slug];

  if (!article) return notFound();

  // コメントは投稿された時点で表示したいので、記事本文が静的でも
  // ここだけはリクエスト時に読む。投稿APIから revalidatePath で更新される。
  const comments = await db.pageComment.findMany({
    where: {
      targetType: CommentTargetType.HOUSING,
      targetKey: article.slug,
      isHidden: false,
    },
    orderBy: { createdAt: "desc" },
    select: { id: true, author: true, content: true, createdAt: true },
    take: 200,
  });

  const initialComments: PageCommentItem[] = comments.map((c) => ({
    id: c.id,
    author: c.author,
    content: c.content,
    createdAt: c.createdAt.toISOString(),
  }));

  return <HousingGuideLayout article={article} comments={initialComments} />;
}
