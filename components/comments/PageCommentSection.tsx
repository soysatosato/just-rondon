"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

/**
 * 記事ページ用の汎用コメント欄。
 *
 * targetType + targetKey で任意のページに紐づく(/api/page-comments)。
 * 食費節約ガイド以外(コラム・アトラクションなど)でも、この2つを渡せば
 * そのまま使える。
 *
 * 承認制にしていないので投稿は即時表示される。サーバ側から渡された
 * initialComments に、投稿成功したものを先頭に足していく。
 */

export type PageCommentItem = {
  id: string;
  author: string;
  content: string;
  createdAt: string;
};

const MAX_CONTENT = 2000;

function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

export default function PageCommentSection({
  targetType,
  targetKey,
  prompt,
  initialComments,
}: {
  targetType: string;
  targetKey: string;
  /** 記事ごとの誘導文。何を聞きたいのか具体的に書く。 */
  prompt: string;
  initialComments: PageCommentItem[];
}) {
  const [comments, setComments] = useState(initialComments);
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

  return (
    <section className="mt-12">
      <h2 className="text-lg font-semibold">みんなの工夫</h2>
      <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
        {prompt}
      </p>

      <Card className="mt-4 bg-white dark:bg-neutral-900 border-gray-300 dark:border-neutral-700 shadow-sm">
        <CardContent className="p-5">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label
                htmlFor="comment-author"
                className="block text-xs font-semibold text-gray-600 dark:text-gray-400"
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
                className="block text-xs font-semibold text-gray-600 dark:text-gray-400"
              >
                コメント
              </label>
              <Textarea
                id="comment-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                maxLength={MAX_CONTENT}
                rows={4}
                placeholder="実践している節約の工夫を教えてください"
                className="mt-1"
                required
              />
              <p className="mt-1 text-right text-xs text-gray-400">
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
              <p className="text-xs leading-relaxed text-gray-500 dark:text-gray-400">
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

      {comments.length > 0 ? (
        <ul className="mt-6 space-y-3">
          {comments.map((c) => (
            <li
              key={c.id}
              className="rounded-lg border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-900 p-4"
            >
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                  {c.author}
                </span>
                <span className="shrink-0 text-xs text-gray-400">
                  {formatDate(c.createdAt)}
                </span>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                {c.content}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-6 rounded-lg border border-dashed border-gray-300 dark:border-neutral-700 p-6 text-center text-sm text-gray-500 dark:text-gray-400">
          まだコメントはありません。最初の投稿をお待ちしています。
        </p>
      )}
    </section>
  );
}
