export const revalidate = 60 * 60;

import { notFound } from "next/navigation";
import { CommentTargetType } from "@prisma/client";
import {
  fetchAdjacentContents,
  fetchColumnBySlug,
  fetchColumnSeries,
} from "@/utils/actions/contents";
import { buildPageMetadata, truncateDescription } from "@/lib/seo";
import { columnOgImage } from "@/lib/og";
import JsonLd from "@/components/seo/JsonLd";
import ViewTracker from "@/components/analytics/ViewTracker";
import { columnArticleJsonLd, columnPath } from "@/components/column/jsonld";
import ColumnDetail from "@/components/column/ColumnDetail";
import type { PageCommentItem } from "@/components/comments/PageCommentSection";
import db from "@/utils/db";
import { breadcrumbListJsonLd } from "@/components/navigation/tree";

interface Props {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: Props) {
  const content = await fetchColumnBySlug(params.slug);

  if (!content) {
    return {
      title: "コラム | ジャスト・ロンドン",
      description: "イギリスの歴史・文化・伝統にまつわるコラムをお届けします。",
      robots: { index: false, follow: false },
    };
  }

  const text = content.summary || content.mainText || "";
  const trimmed = truncateDescription(text.replace(/[#>*_\-`]/g, ""));

  return buildPageMetadata({
    path: `/column/${params.slug}`,
    title: content.title,
    description: trimmed || `${content.title}についてのコラムです。`,
    type: "article",
    publishedTime: content.createdAt.toISOString(),
    modifiedTime: content.updatedAt.toISOString(),
    // 挿絵(content.image)を直接 og:image に書かない。Wikimedia は
    // facebookexternalhit を 403 で拒否し、縦長・5MB超の写真は X と LINE に
    // 捨てられる。自分のドメインから 1200x630 のカードを配る。
    images: [columnOgImage(content)],
  });
}

export default async function ColumnDetailPage({ params }: Props) {
  const content = await fetchColumnBySlug(params.slug);

  if (!content) return notFound();

  const series = await fetchColumnSeries(content.seriesName);
  const { prev, next } = await fetchAdjacentContents("column", {
    id: content.id,
    createdAt: content.createdAt,
  });

  // コメントは投稿された時点で表示したいので、ここだけはリクエスト時に読む。
  // 投稿APIから revalidatePath で更新される。
  const rawComments = await db.pageComment.findMany({
    where: {
      targetType: CommentTargetType.COLUMN,
      targetKey: content.slug,
      isHidden: false,
    },
    orderBy: { createdAt: "desc" },
    select: { id: true, author: true, content: true, createdAt: true },
    take: 200,
  });

  const comments: PageCommentItem[] = rawComments.map((c) => ({
    id: c.id,
    author: c.author,
    content: c.content,
    createdAt: c.createdAt.toISOString(),
  }));

  return (
    <>
      <JsonLd
        data={breadcrumbListJsonLd({
          path: "/column",
          current: content.title,
          currentHref: columnPath(content.slug),
        })}
      />
      <JsonLd data={columnArticleJsonLd(content)} />
      <ColumnDetail
        content={content}
        series={series}
        prev={prev}
        next={next}
        comments={comments}
      />

      {/* 閲覧の記録(内部データ)。何も描画しない。 */}
      <ViewTracker targetType="column" slug={content.slug} />
    </>
  );
}
