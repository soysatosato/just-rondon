import Link from "next/link";
import db from "@/utils/db";
import { buildPageMetadata } from "@/lib/seo";
import { wikimediaThumbUrl } from "@/lib/og";
import { publishedWhere } from "@/lib/publish-schedule";
import { isIgCategory, type IgCategory } from "@/lib/instagram/limits";
import { articlePath } from "@/lib/instagram/caption";

/**
 * Instagram のプロフィールに貼るリンクの行き先。
 *
 * Instagram のキャプションのリンクは押せず、外へ出られるのはプロフィールの
 * リンク1本だけ。投稿を見て記事を読みたくなった人がここに来るので、
 * 投稿した記事を新しい順に並べ、いちばん上が「いま見た投稿」になるようにする。
 *
 * 載せるのは、運営者がアプリの予約に入れた(queued)投稿のうち、投稿時刻を
 * 過ぎたものだけ。承認しただけの投稿は Instagram にまだ出ていない。
 *
 * 投稿は日本時間21:00に出るので、キャッシュは短くする(最大5分の遅れ)。
 * 検索から来るページではないので noindex。
 */
export const revalidate = 300;

export const metadata = buildPageMetadata({
  path: "/ig",
  title: "Instagramで紹介した記事",
  description:
    "ジャスト・ロンドンの Instagram で紹介したコラムとイギリス英語の記事を、新しい順に並べています。",
  noindex: true,
});

/** 一覧に出す本数。プロフィールから来た人が見るのは上の数本。 */
const TAKE = 30;

const LABEL: Record<IgCategory, string> = {
  column: "コラム",
  "british-english": "イギリス英語",
};

function formatDate(at: Date): string {
  return new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    month: "numeric",
    day: "numeric",
  }).format(at);
}

export default async function InstagramLinksPage() {
  const now = new Date();
  const posts = await db.instagramPost.findMany({
    where: {
      status: "queued",
      scheduledAt: { lte: now },
      content: { category: { in: ["column", "british-english"] }, ...publishedWhere() },
    },
    orderBy: { scheduledAt: "desc" },
    take: TAKE,
    select: {
      id: true,
      coverHead: true,
      scheduledAt: true,
      content: {
        select: { category: true, slug: true, title: true, engTitle: true, image: true },
      },
    },
  });

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-10">
      <p className="text-xs font-bold tracking-widest text-muted-foreground">
        JUST RONDON on Instagram
      </p>
      <h1 className="mt-1 text-2xl font-semibold">Instagramで紹介した記事</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        投稿の続きは、ここから記事の全文で読めます。新しい投稿が上です。
      </p>

      {posts.length ? (
        <ul className="mt-6 divide-y">
          {posts.map((post) => {
            const { category, slug, title, engTitle, image } = post.content;
            if (!isIgCategory(category)) return null;
            return (
              <li key={post.id}>
                <Link
                  href={articlePath(category, slug)}
                  className="flex items-center gap-4 py-4 hover:opacity-80"
                >
                  <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-md bg-muted">
                    {category === "column" && image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={wikimediaThumbUrl(image, 250)}
                        alt=""
                        className="absolute inset-0 h-full w-full object-cover"
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-rose-50 p-1 text-center text-[10px] font-bold leading-tight text-rose-600 dark:bg-rose-950 dark:text-rose-300">
                        {engTitle ?? "English"}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">
                      {formatDate(post.scheduledAt!)}・{LABEL[category]}
                    </p>
                    <p className="mt-0.5 font-semibold leading-snug">
                      {category === "british-english" && engTitle
                        ? `${engTitle} ${post.coverHead}`
                        : post.coverHead}
                    </p>
                    <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                      {title}
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="mt-6 text-sm text-muted-foreground">まだ投稿がありません。</p>
      )}

      <div className="mt-10 flex flex-wrap gap-x-5 gap-y-2 text-sm">
        <Link href="/column" className="underline underline-offset-2">
          コラムの一覧
        </Link>
        <Link href="/british-english" className="underline underline-offset-2">
          イギリス英語の一覧
        </Link>
        <Link href="/" className="underline underline-offset-2">
          トップページ
        </Link>
      </div>
    </div>
  );
}
