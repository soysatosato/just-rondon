"use client";

import { useEffect, useRef } from "react";
import { useFormState } from "react-dom";
import { Textarea } from "@/components/ui/textarea";
import { Result, Submit } from "@/components/admin/ScheduleForms";
import {
  deleteReply,
  replyToComment,
  setCommentHidden,
  updateReply,
} from "@/utils/actions/comments-admin";

/**
 * コメントの管理ページ(/admin/comments)の操作フォーム。
 * 返信は記事ページに「運営」として出る。
 */

const MAX_CONTENT = 2000;

export function ReplyForm({ id }: { id: string }) {
  const [state, action] = useFormState(replyToComment, null);
  const formRef = useRef<HTMLFormElement>(null);

  // 載せたら入力欄を空にする。失敗したときは書いた文を残す。
  useEffect(() => {
    if (state?.ok) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={action} className="space-y-2">
      <input type="hidden" name="id" value={id} />
      <Textarea
        name="content"
        rows={3}
        maxLength={MAX_CONTENT}
        required
        placeholder="運営として返信する(記事ページにそのまま載ります)"
        aria-label="返信"
      />
      <Submit>運営として返信</Submit>
      <Result state={state} />
    </form>
  );
}

export function EditReplyForm({
  id,
  content,
}: {
  id: string;
  content: string;
}) {
  const [state, action] = useFormState(updateReply, null);
  return (
    <details className="text-sm">
      <summary className="cursor-pointer text-xs text-muted-foreground">
        直す
      </summary>
      <form action={action} className="mt-2 space-y-2">
        <input type="hidden" name="id" value={id} />
        <Textarea
          name="content"
          rows={3}
          maxLength={MAX_CONTENT}
          required
          defaultValue={content}
          aria-label="返信を直す"
        />
        <Submit variant="outline">保存</Submit>
        <Result state={state} />
      </form>
    </details>
  );
}

export function DeleteReplyForm({ id }: { id: string }) {
  const [state, action] = useFormState(deleteReply, null);
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm("この返信を消しますか？記事ページからも消えます。")) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <Submit variant="outline">返信を消す</Submit>
      <Result state={state} />
    </form>
  );
}

export function HideForm({ id, isHidden }: { id: string; isHidden: boolean }) {
  const [state, action] = useFormState(setCommentHidden, null);
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (
          !isHidden &&
          !confirm("このコメントを記事ページから隠しますか？運営の返信も一緒に隠れます。")
        ) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="hidden" value={isHidden ? "0" : "1"} />
      <Submit variant="outline">{isHidden ? "再表示する" : "非表示にする"}</Submit>
      <Result state={state} />
    </form>
  );
}
