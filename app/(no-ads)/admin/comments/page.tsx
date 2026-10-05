import Link from "next/link";
import { notFound } from "next/navigation";
import type { Prisma } from "@prisma/client";
import db from "@/utils/db";
import { isAdmin } from "@/lib/admin";
import { noindexMetadata } from "@/lib/seo";
import { formatJst } from "@/lib/publish-schedule";
import { TARGET_LABEL, resolvePaths } from "@/lib/comments";
import {
  DeleteReplyForm,
  EditReplyForm,
  HideForm,
  ReplyForm,
} from "@/components/admin/CommentForms";

export const dynamic = "force-dynamic";

export const metadata = noindexMetadata("コメントの管理");

/** 1画面に出す件数。コメントがこれを超えるほど増えたらページ送りを足す。 */
const TAKE = 100;

const FILTERS = {
  all: { label: "すべて", where: {} },
  unanswered: {
    label: "未返信",
    where: { isHidden: false, replies: { none: { isOfficial: true } } },
  },
  hidden: { label: "非表示", where: { isHidden: true } },
} satisfies Record<
  string,
  { label: string; where: Prisma.PageCommentWhereInput }
>;

type Filter = keyof typeof FILTERS;

function isFilter(value: unknown): value is Filter {
  return (
    typeof value === "string" &&
    Object.prototype.hasOwnProperty.call(FILTERS, value)
  );
}

/** 読者のコメントだけを数える条件(運営の返信は一覧の行にしない)。 */
const READER_COMMENT = { parentId: null, isOfficial: false } as const;

/**
 * 記事コメントの管理ページ。読者のコメントに運営として返信し、荒らしを隠す。
 * 新着コメントの通知メールから #c-{id} 付きで開かれる。
 *
 * 運営者以外には404を返す(ページがあることも知らせない)。
 */
export default async function CommentsAdminPage({
  searchParams,
}: {
  searchParams: { filter?: string };
}) {
  if (!isAdmin()) notFound();

  const filter: Filter = isFilter(searchParams.filter)
    ? searchParams.filter
    : "all";

  const [comments, counts] = await Promise.all([
    db.pageComment.findMany({
      where: { ...READER_COMMENT, ...FILTERS[filter].where },
      orderBy: { createdAt: "desc" },
      take: TAKE,
      select: {
        id: true,
        targetType: true,
        targetKey: true,
        author: true,
        content: true,
        isHidden: true,
        createdAt: true,
        replies: {
          where: { isOfficial: true },
          orderBy: { createdAt: "asc" },
          select: { id: true, content: true, createdAt: true },
        },
      },
    }),
    Promise.all(
      Object.values(FILTERS).map(({ where }) =>
        db.pageComment.count({ where: { ...READER_COMMENT, ...where } }),
      ),
    ),
  ]);
  const countOf = Object.fromEntries(
    Object.keys(FILTERS).map((key, i) => [key, counts[i]]),
  ) as Record<Filter, number>;

  const paths = await resolvePaths(comments);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10">
      <div className="flex items-baseline justify-between gap-4">
        <h1 className="text-2xl font-semibold">コメントの管理</h1>
        <Link
          href="/admin/reading"
          className="text-sm text-muted-foreground underline underline-offset-2"
        >
          読み物の管理
        </Link>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        返信は記事ページのコメントの下に、ロゴと「運営」の印付きで載ります。
        非表示にしたコメントは記事ページから消えますが、ここには残ります。
      </p>

      <nav className="mt-6 flex gap-2 border-b pb-3 text-sm">
        {(Object.keys(FILTERS) as Filter[]).map((key) => (
          <Link
            key={key}
            href={key === "all" ? "/admin/comments" : `/admin/comments?filter=${key}`}
            className={`rounded-md px-3 py-1.5 ${
              key === filter
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            {FILTERS[key].label}({countOf[key]})
          </Link>
        ))}
      </nav>

      {comments.length === 0 && (
        <p className="mt-6 text-sm text-muted-foreground">
          該当するコメントはありません。
        </p>
      )}

      <ul className="divide-y">
        {comments.map((c) => {
          const path = paths.get(`${c.targetType}:${c.targetKey}`);
          return (
            <li key={c.id} id={`c-${c.id}`} className="scroll-mt-6 py-5">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                <span className="rounded bg-muted px-1.5 py-0.5 font-bold text-foreground">
                  {TARGET_LABEL[c.targetType]}
                </span>
                {path ? (
                  <Link href={path} className="underline underline-offset-2">
                    {path}
                  </Link>
                ) : (
                  <span>対象のページが見つかりません({c.targetKey})</span>
                )}
                <span>{formatJst(c.createdAt)}(日本)</span>
                {c.isHidden && (
                  <span className="rounded bg-red-100 px-1.5 py-0.5 font-bold text-red-800 dark:bg-red-950 dark:text-red-200">
                    非表示中
                  </span>
                )}
              </div>

              <p className="mt-2 text-sm font-semibold">{c.author}</p>
              <p
                className={`mt-1 whitespace-pre-wrap text-sm leading-relaxed ${
                  c.isHidden ? "text-muted-foreground line-through" : ""
                }`}
              >
                {c.content}
              </p>

              {c.replies.length > 0 && (
                <ul className="mt-3 ml-4 space-y-2">
                  {c.replies.map((r) => (
                    <li
                      key={r.id}
                      className="rounded-r-lg border-l-4 border-rose-600 bg-rose-50 p-3 dark:border-rose-500 dark:bg-rose-950/30"
                    >
                      <p className="text-xs text-muted-foreground">
                        運営の返信・{formatJst(r.createdAt)}(日本)
                      </p>
                      <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed">
                        {r.content}
                      </p>
                      <div className="mt-2 space-y-2">
                        <EditReplyForm id={r.id} content={r.content} />
                        <DeleteReplyForm id={r.id} />
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              <div className="mt-3 space-y-3">
                {!c.isHidden &&
                  (c.replies.length === 0 ? (
                    <ReplyForm id={c.id} />
                  ) : (
                    <details>
                      <summary className="cursor-pointer text-xs text-muted-foreground">
                        もう一度返信する
                      </summary>
                      <div className="mt-2">
                        <ReplyForm id={c.id} />
                      </div>
                    </details>
                  ))}
                <HideForm id={c.id} isHidden={c.isHidden} />
              </div>
            </li>
          );
        })}
      </ul>

      {comments.length === TAKE && (
        <p className="mt-6 text-xs text-muted-foreground">
          新しい順に{TAKE}件まで出しています。
        </p>
      )}
    </div>
  );
}
