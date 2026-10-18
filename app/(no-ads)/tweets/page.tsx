import { notFound } from "next/navigation";
import db from "@/utils/db";
import { isAdminSession } from "@/lib/admin";
import { buildPageMetadata } from "@/lib/seo";
import { formatJst } from "@/lib/publish-schedule";
import { articleRefsIn, type ArticleRef } from "@/lib/tweet-article";
import TweetDraftCard from "@/components/tweets/TweetDraftCard";

export const dynamic = "force-dynamic";

export const metadata = buildPageMetadata({
  path: "/tweets",
  title: "ツイート下書き",
  description: "X投稿用の下書き一覧。",
  noindex: true,
});

const refKey = (ref: ArticleRef) =>
  ref.kind === "content" ? `${ref.category}/${ref.slug}` : `changes/${ref.slug}`;

/**
 * 本文に貼った記事が、まだ読者に見えていなければその理由を返す。
 * 見えている(または自サイトの記事を貼っていない)なら null。
 */
async function articleNotices(bodies: string[]): Promise<(string | null)[]> {
  const refs = bodies.map(articleRefsIn);
  const contentRefs = refs.flat().filter((r) => r.kind === "content");
  const issueSlugs = refs.flat().flatMap((r) => (r.kind === "changes" ? [r.slug] : []));

  const [contents, issues] = await Promise.all([
    contentRefs.length === 0
      ? []
      : db.content.findMany({
          where: { OR: contentRefs.map(({ category, slug }) => ({ category, slug })) },
          select: { category: true, slug: true, publishedAt: true },
        }),
    issueSlugs.length === 0
      ? []
      : db.monthlyChangeIssue.findMany({
          where: { slug: { in: issueSlugs } },
          select: { slug: true, publishedAt: true },
        }),
  ]);

  const publishedAt = new Map<string, Date | null>([
    ...contents.map((c) => [`${c.category}/${c.slug}`, c.publishedAt] as const),
    ...issues.map((i) => [`changes/${i.slug}`, i.publishedAt] as const),
  ]);

  const now = Date.now();
  return refs.map((list) => {
    for (const ref of list) {
      const key = refKey(ref);
      if (!publishedAt.has(key)) {
        return "リンク先の記事が見つかりません。ボツになったか、URLが違います。";
      }
      const at = publishedAt.get(key);
      if (!at) {
        return "記事はまだ下書きです。管理ページで承認されるまで投稿しないでください。";
      }
      if (at.getTime() > now) {
        return `記事の公開は 日本 ${formatJst(at)}。それより前に投稿するとリンク先が404になります。`;
      }
    }
    return null;
  });
}

export default async function TweetsPage() {
  // 運営者専用。それ以外にはページがあることも知らせない。
  if (!(await isAdminSession())) notFound();

  const drafts = await db.tweetDraft.findMany({
    where: { status: "draft" },
    orderBy: { createdAt: "asc" },
  });
  const notices = await articleNotices(drafts.map((d) => d.body));

  const cards = drafts.map((d, i) => ({ draft: d, notice: notices[i] }));
  const ready = cards.filter((c) => !c.notice);
  const waiting = cards.filter((c) => c.notice);

  const render = ({ draft: d, notice }: (typeof cards)[number]) => (
    <TweetDraftCard
      key={d.id}
      id={d.id}
      body={d.body}
      category={d.category}
      createdAt={d.createdAt.toLocaleDateString("ja-JP")}
      notice={notice ?? undefined}
    />
  );

  return (
    <div className="container mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-1 text-2xl font-bold">ツイート下書き</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        未投稿 {drafts.length} 件。コピーしてXに投稿したら「投稿済みにする」を押してください。
      </p>
      <div className="space-y-4">
        {ready.map(render)}
        {drafts.length === 0 && (
          <p className="text-sm text-muted-foreground">
            下書きはありません。/add-tweets で追加してください。
          </p>
        )}
      </div>
      {waiting.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-1 border-b pb-2 text-lg font-semibold">
            記事の公開待ち({waiting.length})
          </h2>
          <p className="mb-4 text-sm text-muted-foreground">
            貼ってある記事がまだ読者に見えていません。Xの予約投稿に入れるなら、記事の公開より後の時刻にしてください。
          </p>
          <div className="space-y-4">{waiting.map(render)}</div>
        </section>
      )}
    </div>
  );
}
