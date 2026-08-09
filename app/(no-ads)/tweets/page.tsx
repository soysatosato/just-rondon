import db from "@/utils/db";
import { buildPageMetadata } from "@/lib/seo";
import TweetDraftCard from "@/components/tweets/TweetDraftCard";

export const dynamic = "force-dynamic";

export const metadata = buildPageMetadata({
  path: "/tweets",
  title: "ツイート下書き",
  description: "X投稿用の下書き一覧。",
  noindex: true,
});

export default async function TweetsPage() {
  const drafts = await db.tweetDraft.findMany({
    where: { status: "draft" },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="container mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-1 text-2xl font-bold">ツイート下書き</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        未投稿 {drafts.length} 件。コピーしてXに投稿したら「投稿済みにする」を押してください。
      </p>
      <div className="space-y-4">
        {drafts.map((d) => (
          <TweetDraftCard
            key={d.id}
            id={d.id}
            body={d.body}
            category={d.category}
            createdAt={d.createdAt.toLocaleDateString("ja-JP")}
          />
        ))}
        {drafts.length === 0 && (
          <p className="text-sm text-muted-foreground">
            下書きはありません。/add-tweets で追加してください。
          </p>
        )}
      </div>
    </div>
  );
}
