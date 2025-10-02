"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { FaCommentDots } from "react-icons/fa";
import { useState } from "react";
import { commentSchema } from "@/utils/schemas";

type Props = {
  postId: number;
  parentId?: number; // 親コメントがある場合にセット
  triggerText?: any;
};

const CommentFormDialog: React.FC<Props> = ({
  postId,
  parentId,
  triggerText = "",
}) => {
  const [open, setOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return; // 連打防止
    setSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    const parsed = commentSchema.safeParse(data);
    if (!parsed.success) {
      const flat = parsed.error.flatten();
      const fieldErrors: Record<string, string> = {};
      Object.entries(flat.fieldErrors).forEach(([key, messages]) => {
        if (messages && messages.length > 0) fieldErrors[key] = messages[0];
      });
      setErrors(fieldErrors);
      setSubmitting(false);
      return;
    }

    const res = await fetch("/api/chatboard/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (res.redirected) window.location.href = res.url;
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerText ? (
          <span className="text-xs cursor-pointer">{triggerText}</span>
        ) : (
          <Button
            variant="outline"
            size="icon"
            className="p-0 w-6 h-6 flex items-center justify-center"
          >
            <FaCommentDots className="w-4 h-4" />
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="w-[80vw] md:w-[50vw] max-w-lg mx-auto sm:rounded-lg sm:p-6">
        <DialogHeader>
          <DialogTitle>
            {parentId ? "返信を投稿" : "コメントを投稿"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="hidden" name="postId" value={postId} />
          {parentId && <input type="hidden" name="parentId" value={parentId} />}

          <div className="flex flex-col">
            <label className="text-sm font-semibold">ハンドルネーム</label>
            <input name="author" type="text" className="border p-2 rounded" />
            {errors.author && (
              <p className="text-red-500 text-xs">{errors.author}</p>
            )}
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-semibold">
              {parentId ? "返信内容" : "コメント内容"}
            </label>
            <textarea name="content" rows={4} className="border p-2 rounded" />
            {errors.content && (
              <p className="text-red-500 text-xs">{errors.content}</p>
            )}
          </div>

          <DialogFooter>
            <button
              type="submit"
              disabled={submitting}
              className={`bg-blue-600 dark:bg-blue-500 text-white dark:text-gray-100 px-4 py-2 rounded transition-colors
    hover:bg-blue-700 dark:hover:bg-blue-600
    ${submitting ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              投稿する
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CommentFormDialog;
