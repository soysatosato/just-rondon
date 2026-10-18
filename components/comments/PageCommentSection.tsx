"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { CornerDownRight } from "lucide-react";
import { SITE_NAME } from "@/lib/seo";

/**
 * 記事ページ用の汎用コメント欄。
 *
 * targetType + targetKey で任意のページに紐づく(/api/page-comments)。
 * food/housing/column/attraction/museum の5種で使っている。
 *
 * heading・placeholder は呼び出し側で必ず指定する。「みんなの工夫」は
 * 食費・住まいのような実践Tips向けの文言で、コラムや観光スポットの
 * 感想・口コミには合わないため、デフォルト値は持たせていない。
 *
 * 承認制にしていないので投稿は即時表示される。サーバ側から渡された
 * initialComments に、投稿成功したものを先頭に足していく。
 *
 * コメントが1件も無いページでは、見出しと誘導文と「コメントを書く」ボタンの
 * 1行だけを出し、押したらフォームを開く。以前は空のフォーム(約450px)と
 * 「まだコメントはありません」を全ページ(341ページ)に出しており、
 * 記事の最後に空欄が続く見え方になっていた。
 *
 * 運営の返信は管理ページ(/admin/comments)から付ける。どのコメントへの
 * 返信かが一目でわかるよう、元のコメントの枠の中に「〇〇さんへの返信」と
 * 添えて入れ、ロゴ・「運営」バッジ・ブランドの赤の枠で描く。読者は名前を
 * 文字で入れるだけでアイコンも枠も出せないので、名前を真似ても見分けがつく。
 */

/** 運営の返信。読者の返信は無いので、名前は持たせない。 */
export type PageCommentReply = {
  id: string;
  content: string;
  createdAt: string;
};

export type PageCommentItem = {
  id: string;
  author: string;
  content: string;
  createdAt: string;
  replies: PageCommentReply[];
};

const MAX_CONTENT = 2000;

function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

function OfficialReply({
  reply,
  replyTo,
}: {
  reply: PageCommentReply;
  /** 返信先のコメントの名前。「〇〇さんへの返信」に使う。 */
  replyTo: string;
}) {
  return (
    <li className="rounded-r-md border-l-4 border-rose-600 bg-rose-50 p-3 dark:border-rose-500 dark:bg-rose-950/30">
      {/* 名前の行に日付まで並べると、狭い画面で名前が切れる。日付は2行目に回す。 */}
      <div className="flex items-start gap-2.5">
        <img
          src="/logo.svg"
          width={28}
          height={28}
          alt=""
          aria-hidden
          className="mt-0.5 h-7 w-7 shrink-0 rounded-full"
          decoding="async"
        />
        <div className="min-w-0">
          <p className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
            <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              {SITE_NAME}
            </span>
            <span className="rounded bg-rose-600 px-1.5 py-0.5 text-xs font-bold leading-none text-white">
              運営
            </span>
          </p>
          <p className="mt-0.5 flex items-start gap-1 text-xs text-neutral-500 dark:text-neutral-400">
            <CornerDownRight className="mt-px h-3 w-3 shrink-0" aria-hidden />
            <span className="[overflow-wrap:anywhere]">
              {replyTo}さんへの返信・{formatDate(reply.createdAt)}
            </span>
          </p>
        </div>
      </div>
      <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-neutral-800 dark:text-neutral-200">
        {reply.content}
      </p>
    </li>
  );
}

export default function PageCommentSection({
  targetType,
  targetKey,
  prompt,
  heading,
  placeholder,
  initialComments,
}: {
  targetType: string;
  targetKey: string;
  /** 記事ごとの誘導文。何を聞きたいのか具体的に書く。 */
  prompt: string;
  /** セクション見出し。例: 「みんなの工夫」「みんなの口コミ」。 */
  heading: string;
  /** 入力欄のプレースホルダー。コンテンツ種別に合わせて具体的に書く。 */
  placeholder: string;
  initialComments: PageCommentItem[];
}) {
  const [comments, setComments] = useState(initialComments);
  // コメントがあるページは最初からフォームを開いておく(読んだ流れで書けるように)。
  const [formOpen, setFormOpen] = useState(initialComments.length > 0);
  const [author, setAuthor] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  const remaining = MAX_CONTENT - content.length;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim() || status === "sending") return;

    setStatus("sending");
    setError(null);

    try {
      const res = await fetch("/api/page-comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetType, targetKey, author, content }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setError(data?.error ?? "送信に失敗しました。もう一度お試しください。");
        setStatus("idle");
        return;
      }

      if (data?.comment) {
        setComments((prev) => [data.comment as PageCommentItem, ...prev]);
      }
      setContent("");
      setAuthor("");
      setStatus("done");
    } catch {
      setError("通信に失敗しました。電波状況を確認してください。");
      setStatus("idle");
    }
  }

  if (!formOpen && comments.length === 0) {
    return (
      <section className="mt-12 flex flex-col gap-3 rounded-xl border border-dashed border-neutral-300 p-4 dark:border-neutral-700 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <div className="min-w-0">
          <h2 className="text-base font-semibold">{heading}</h2>
          <p className="mt-1 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
            {prompt}
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => setFormOpen(true)}
          className="shrink-0 self-start sm:self-center"
        >
          コメントを書く
        </Button>
      </section>
    );
  }

  return (
    <section className="mt-12">
      <h2 className="text-lg font-semibold">{heading}</h2>
      <p className="mt-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
        {prompt}
      </p>

      <Card className="mt-4 bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700 shadow-sm">
        <CardContent className="p-5">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label
                htmlFor="comment-author"
                className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400"
              >
                お名前（任意）
              </label>
              <Input
                id="comment-author"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                maxLength={40}
                placeholder="匿名"
                className="mt-1"
              />
            </div>

            <div>
              <label
                htmlFor="comment-content"
                className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400"
              >
                コメント
              </label>
              <Textarea
                id="comment-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                maxLength={MAX_CONTENT}
                rows={4}
                placeholder={placeholder}
                className="mt-1"
                // 「コメントを書く」で開いたときは、そのまま打てるようにする。
                autoFocus={initialComments.length === 0}
                required
              />
              <p className="mt-1 text-right text-xs text-muted-foreground">
                残り{remaining}文字
              </p>
            </div>

            {error && (
              <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/25 dark:text-red-300">
                {error}
              </p>
            )}

            {status === "done" && (
              <p className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/25 dark:text-emerald-300">
                投稿しました。ありがとうございます。
              </p>
            )}

            <div className="flex items-center justify-between gap-4">
              <p className="text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
                投稿は誰でも読めます。個人情報は書かないでください。
              </p>
              <Button
                type="submit"
                disabled={!content.trim() || status === "sending"}
                className="shrink-0"
              >
                {status === "sending" ? "送信中…" : "投稿する"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {comments.length > 0 && (
        <ul className="mt-6 space-y-3">
          {comments.map((c) => (
            <li
              key={c.id}
              className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 p-4"
            >
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                  {c.author}
                </span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {formatDate(c.createdAt)}
                </span>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
                {c.content}
              </p>

              {c.replies.length > 0 && (
                <ul className="mt-4 space-y-3 border-t border-neutral-200 pt-4 dark:border-neutral-700">
                  {c.replies.map((r) => (
                    <OfficialReply key={r.id} reply={r} replyTo={c.author} />
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
