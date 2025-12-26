// components/matome/MatomeCard.tsx
import Link from "next/link";
import { formatDate } from "@/utils/format";

export function MatomeCard({ thread }: { thread: any }) {
  const hasImage = Boolean(thread.imageUrl);

  return (
    <article
      className="
        group overflow-hidden rounded-2xl border border-neutral-200 bg-white
        shadow-sm transition hover:shadow-md
      "
    >
      <div className="flex gap-3 p-3 sm:gap-4 sm:p-4">
        {/* image (small thumbnail) */}
        {hasImage && (
          <div
            className="
              relative shrink-0 overflow-hidden rounded-xl bg-neutral-100
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
                transition-transform duration-300 group-hover:scale-[1.02]
              "
            />
          </div>
        )}

        {/* content */}
        <div className="min-w-0 flex-1">
          <h2 className="text-[15px] font-semibold leading-snug sm:text-base">
            <Link
              href={`/matome/${thread.id}`}
              className="hover:underline underline-offset-4"
            >
              {thread.title}
            </Link>
          </h2>

          {/* titleJa (thin + slightly different feel) */}
          <p className="mt-1 text-xs text-neutral-500 whitespace-pre-wrap sm:text-sm">
            {thread.titleJa}
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-neutral-400">
            <span>投稿日: {formatDate(thread.postedAt)}</span>
            <span>コメント: {thread.posts?.length ?? 0}</span>
          </div>

          {/* bodyJa preview (3 lines, softer font) */}
          {thread.bodyJa && (
            <p
              className="
                mt-2 line-clamp-3 whitespace-pre-wrap
                text-[13px] leading-relaxed text-neutral-700
                [font-family:ui-serif,Georgia,serif]
              "
            >
              {thread.bodyJa}
            </p>
          )}
        </div>
      </div>
    </article>
  );
}
