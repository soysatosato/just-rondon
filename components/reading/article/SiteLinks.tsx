import Link from "next/link";
import {
  READING_LINK_KIND_LABEL,
  type ReadingLink,
} from "@/lib/reading-topics";

/**
 * 記事から観光以外のページ(ブランド・料理・おみやげ・美術館・実用ガイド・
 * 通史の章)へ進む導線。対応は lib/reading-topics.ts の READING_LINKS。
 *
 * 観光スポットは写真つきの AttractionSpotRail が別に出す。ここは文字だけの
 * 短い一覧にして、読み終えた人が「その店に行く」「その制度を使う」側の
 * ページへ1回で移れるようにする。本文の途中には埋めない(読んでいる
 * 最中に記事の外へ連れ出さない)。
 */
export default function SiteLinks({
  links,
  heading = "この記事とつながるページ",
}: {
  links: readonly ReadingLink[];
  heading?: string;
}) {
  if (links.length === 0) return null;

  return (
    <section aria-labelledby="site-links">
      <h2
        id="site-links"
        className="text-lg font-bold tracking-tight text-neutral-950 dark:text-white sm:text-xl"
      >
        {heading}
      </h2>
      <ul className="mt-3 divide-y divide-neutral-200 border-y border-neutral-200 dark:divide-neutral-800 dark:border-neutral-800">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="group flex items-center gap-3 py-3 text-[15px]"
            >
              <span className="w-[6.5em] shrink-0 text-xs font-bold text-neutral-500 dark:text-neutral-400">
                {READING_LINK_KIND_LABEL[link.kind]}
              </span>
              <span className="min-w-0 flex-1 font-medium text-neutral-900 group-hover:underline dark:text-neutral-100">
                {link.label}
              </span>
              <span
                aria-hidden
                className="shrink-0 text-neutral-400 transition-transform group-hover:translate-x-0.5"
              >
                →
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
