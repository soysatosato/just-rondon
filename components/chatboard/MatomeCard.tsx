// components/matome/MatomeCard.tsx
import Link from "next/link";
import { formatDate } from "@/utils/format";

export function MatomeCard({ thread }: { thread: any }) {
  const hasImage = Boolean(thread.imageUrl);

  return (
    <article
      className="
        group overflow-hidden rounded-2xl
        border border-neutral-200 bg-white
        shadow-sm transition hover:shadow-md
        dark:border-neutral-800 dark:bg-neutral-900 dark:shadow-none
      "
    >
      <div className="flex gap-3 p-3 sm:gap-4 sm:p-4">
        {/* image (small thumbnail) */}
        {hasImage && (
          <div
            className="
              relative shrink-0 overflow-hidden rounded-xl
              bg-neutral-100 dark:bg-neutral-800
              h-[72px] w-[96px]
              sm:h-[80px] sm:w-[112px]
            "
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={thread.imageUrl}
              alt=""
              loading="lazy"
              className="
                h-full w-full object-cover
                transition-transform duration-300
                group-hover:scale-[1.02]
              "
            />
          </div>
        )}

        {/* content */}
        <div className="min-w-0 flex-1">
          <Link href={`/matome/${thread.id}`} className="hover:opacity-80">
            <h2
              className="
              text-[15px] font-semibold leading-snug
              text-neutral-900 sm:text-base
              dark:text-neutral-100
            "
            >
              {thread.title}
            </h2>

            {/* titleJa */}
            <p
              className="
            mt-1 whitespace-pre-wrap text-xs
            text-neutral-500 sm:text-sm
            dark:text-neutral-400
            "
            >
              {thread.titleJa}
            </p>

            <div
              className="
            mt-2 flex flex-wrap items-center gap-x-3 gap-y-1
            text-[11px] text-neutral-400
            dark:text-neutral-500
            "
            >
              <span>投稿日: {formatDate(thread.postedAt)}</span>
              <span>コメント: {thread.posts?.length ?? 0}</span>
            </div>

            {/* bodyJa preview */}
            {thread.bodyJa && (
              <p
                className="
            mt-2 line-clamp-3 whitespace-pre-wrap
            text-[13px] leading-relaxed
            text-neutral-700
            dark:text-neutral-300
            [font-family:ui-serif,Georgia,serif]
            "
              >
                {thread.bodyJa}
              </p>
            )}
          </Link>
        </div>
      </div>
    </article>
  );
}
