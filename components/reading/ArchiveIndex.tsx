import Link from "next/link";
import clsx from "clsx";
import { ChevronDown } from "lucide-react";
import { READING_ACCENT, type ReadingAccentName } from "@/lib/reading-accent";

/**
 * 書庫の全件索引。題だけを並べ、閉じた <details> に入れておく。
 *
 * 書庫(ColumnBrowser など)はページ送りを画面の状態で持つので、サーバーが
 * 描く HTML には1ページ目の12本しか載らない。2026-10 に本番の HTML を
 * 数えたところ、ハブからリンクされていたのはイギリス英語が42本中13本、
 * コラムが87本中35本、英国のいまが17本中12本(棚の分を含む)だった。
 * 残りの記事に入る道は記事末尾の関連記事(1〜4本)だけで、検索エンジンが
 * 見つけて評価するまでに時間がかかる。
 *
 * 閉じていても中のリンクは HTML にあるので辿られる。開けば読者にも
 * 目次として使える。書庫の絞り込み・ページ送りとは独立している。
 *
 * prefetch を切っているのは、開いた瞬間に数十本の先読みが走るため。
 */
export default function ArchiveIndex({
  accent,
  label,
  items,
  dense = false,
}: {
  accent: ReadingAccentName;
  /** 閉じているときの文言。「全42語を一覧で見る」 */
  label: string;
  items: { href: string; title: string }[];
  /** 題が短い(英単語など)ときは列を増やして詰める。 */
  dense?: boolean;
}) {
  if (items.length === 0) return null;

  return (
    <details className="group mt-10 rounded-2xl border border-border bg-card">
      <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 px-5 py-3 [&::-webkit-details-marker]:hidden">
        <span className="flex items-center gap-2 text-sm font-bold text-foreground">
          <span
            aria-hidden
            className={clsx(
              "h-3 w-0.5 shrink-0 rounded-full",
              READING_ACCENT[accent].bar,
            )}
          />
          {label}
        </span>
        <ChevronDown
          aria-hidden
          className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
        />
      </summary>
      <ul
        className={clsx(
          "grid gap-x-6 gap-y-2 border-t border-border px-5 py-4",
          dense ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4" : "sm:grid-cols-2",
        )}
      >
        {items.map((item) => (
          <li key={item.href} className="text-sm leading-relaxed">
            <Link
              href={item.href}
              prefetch={false}
              className="text-muted-foreground underline-offset-2 transition hover:text-foreground hover:underline"
            >
              {item.title}
            </Link>
          </li>
        ))}
      </ul>
    </details>
  );
}
