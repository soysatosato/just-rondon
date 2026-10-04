import { draftMode } from "next/headers";
import Link from "next/link";
import { formatJst, formatLondon } from "@/lib/publish-schedule";

/**
 * 管理ページからのプレビュー中に、記事ページの上に出す帯。
 *
 * draft mode でないときは何も描かない。読者のページには一切出ない。
 * 公開済みの記事をプレビュー中に開いたときも、プレビュー中であることと
 * 終え方だけは出す(draft mode のままだとキャッシュを通らない描画が続く)。
 */
export default function PreviewBanner({
  publishedAt,
}: {
  publishedAt: Date | null;
}) {
  if (!draftMode().isEnabled) return null;

  const status = !publishedAt
    ? "下書き(未承認)"
    : publishedAt.getTime() > Date.now()
      ? `予約中: ロンドン ${formatLondon(publishedAt)} / 日本 ${formatJst(publishedAt)}`
      : "公開済み";

  return (
    <div className="sticky top-0 z-50 border-b border-amber-300 bg-amber-100 px-4 py-2 text-sm text-amber-950 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-x-4 gap-y-1">
        <p>
          <span className="font-bold">公開前プレビュー</span>
          <span className="ml-2">{status}</span>
        </p>
        <span className="flex gap-4 text-xs font-semibold">
          <Link href="/admin/reading" className="underline">
            管理ページへ
          </Link>
          {/* Route Handler へ飛ぶので、先読みさせない素のリンクにする。 */}
          <a href="/api/admin/preview/exit" className="underline">
            プレビューを終える
          </a>
        </span>
      </div>
    </div>
  );
}
