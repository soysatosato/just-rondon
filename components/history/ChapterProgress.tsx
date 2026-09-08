import Link from "next/link";
import { chapterPath, historyChapters } from "./chapters";

/**
 * 章ページの頭に置く現在地。
 *
 * 通史は検索から途中の章に直接入ってくる読者が多く、その人には
 * 「10章のうちのどこか」が分からない。10本の目盛りにして、読み終えた側と
 * これからの側を色で分ける。目盛り自体が各章へのリンクなので、前後章ナビが
 * 末尾にしか無い状態も同時に解消する。
 *
 * 濃い面の上に置く前提の配色。
 */
export default function ChapterProgress({ current }: { current: number }) {
  return (
    <nav aria-label="章の一覧" className="mt-7">
      <div className="flex items-center gap-1">
        {historyChapters.map((c) => {
          const isCurrent = c.number === current;
          const isRead = c.number < current;

          return (
            <Link
              key={c.slug}
              href={chapterPath(c.slug)}
              aria-current={isCurrent ? "page" : undefined}
              title={`第${c.number}章 ${c.label}`}
              className="group flex-1 py-2"
            >
              <span
                className={
                  isCurrent
                    ? "block h-1.5 rounded-full bg-amber-400"
                    : isRead
                      ? "block h-1.5 rounded-full bg-white/45 transition group-hover:bg-amber-300"
                      : "block h-1.5 rounded-full bg-white/15 transition group-hover:bg-amber-300/70"
                }
              />
            </Link>
          );
        })}
      </div>
      <p className="mt-1.5 font-serif text-[11px] tabular-nums text-white/45">
        第{current}章 / 全{historyChapters.length}章
      </p>
    </nav>
  );
}
