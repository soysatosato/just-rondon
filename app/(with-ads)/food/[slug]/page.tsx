import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CommentTargetType } from "@prisma/client";
import FoodGuideLayout from "@/components/food/guides/FoodGuideLayout";
import {
  buildFoodGuideMetadata,
  foodGuideSlugs,
} from "@/components/food/guides/guides";
import { foodGuideArticles } from "@/components/food/guides/content";
import type { PageCommentItem } from "@/components/comments/PageCommentSection";
import { buildPageMetadata } from "@/lib/seo";
import db from "@/utils/db";

export function generateStaticParams() {
  return foodGuideSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const article = foodGuideArticles[params.slug];

  if (!article) {
    return buildPageMetadata({
      path: `/food/${params.slug}`,
      title: "ロンドンで食費を抑えるコツ",
      description:
        "ロンドンの食費を下げる実践的な方法を、Meal Deal から買う店の選び方までまとめています。",
      noindex: true,
    });
  }

  return buildFoodGuideMetadata(article);
}

export default async function FoodGuidePage({
  params,
}: {
  params: { slug: string };
}) {
  const article = foodGuideArticles[params.slug];

  if (!article) return notFound();

  // コメントは投稿された時点で表示したいので、記事本文が静的でも
  // ここだけはリクエスト時に読む。投稿APIから revalidatePath で更新される。
  const comments = await db.pageComment.findMany({
    where: {
      targetType: CommentTargetType.FOOD_TIP,
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

  return <FoodGuideLayout article={article} comments={initialComments} />;
}
