"use client";

import { useRef, useState } from "react";
import { useFormState } from "react-dom";
import { Button } from "@/components/ui/button";
import { Result, Submit } from "@/components/admin/ScheduleForms";
import {
  approveIgPost,
  markIgQueued,
  rejectIgPost,
  rescheduleIgPost,
  unqueueIgPost,
  unscheduleIgPost,
} from "@/utils/actions/instagram-admin";
import type { AdminActionState } from "@/utils/actions/reading-admin";

/**
 * Instagram の管理ページ(/admin/instagram)の操作ボタン。
 * 結果の一言の出し方は読み物の管理ページ(ScheduleForms)と同じ。
 */

type Action = (prev: AdminActionState, formData: FormData) => Promise<AdminActionState>;

const ACTIONS = {
  approve: approveIgPost,
  queue: markIgQueued,
  unqueue: unqueueIgPost,
  unschedule: unscheduleIgPost,
  reject: rejectIgPost,
} satisfies Record<string, Action>;

/** id だけを送るボタン1つのフォーム。 */
export function IgActionForm({
  id,
  action,
  label,
  variant = "default",
}: {
  id: string;
  action: keyof typeof ACTIONS;
  label: string;
  variant?: "default" | "outline";
}) {
  const [state, formAction] = useFormState(ACTIONS[action], null);
  return (
    <form action={formAction}>
      <input type="hidden" name="id" value={id} />
      <Submit variant={variant}>{label}</Submit>
      <Result state={state} />
    </form>
  );
}

export function IgRescheduleForm({
  id,
  defaultDate,
  minDate,
}: {
  id: string;
  /** 日本の日付 "2026-10-12" */
  defaultDate: string;
  minDate: string;
}) {
  const [state, formAction] = useFormState(rescheduleIgPost, null);
  return (
    <form action={formAction}>
      <input type="hidden" name="id" value={id} />
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="date"
          name="date"
          required
          defaultValue={defaultDate}
          min={minDate}
          aria-label="投稿日(日本の日付)"
          className="h-9 rounded-md border border-input bg-background px-2 text-sm"
        />
        <Submit variant="outline">日付を変更(21:00)</Submit>
      </div>
      <Result state={state} />
    </form>
  );
}

/** キャプション(誘導・クレジット・タグ込み)をクリップボードへ。 */
export function CopyCaptionButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
    >
      {copied ? "コピーしました" : "キャプションをコピー"}
    </Button>
  );
}

/**
 * 5枚の画像をまとめて端末に保存する。
 *
 * スマホでは共有シート(Web Share API)に5枚を渡す。iOS ならそこから
 * 「画像を5枚保存」で写真アプリに入り、Instagram の投稿画面で選べる。
 * 共有シートが無い環境(PCのブラウザ)では1枚ずつダウンロードする。
 *
 * iOS の Safari は、押してから時間が経つと共有シートを開かせない
 * (画像の取得を待つ間に操作の有効期限が切れる)。そのときは取得済みの
 * 画像を持ったまま「もう一度押す」よう促す。
 */
export function SaveSlidesButton({
  urls,
  baseName,
  label,
}: {
  urls: string[];
  baseName: string;
  label: string;
}) {
  const files = useRef<File[] | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "again" | "done" | "error">("idle");

  async function save() {
    try {
      if (!files.current) {
        setStatus("loading");
        files.current = await Promise.all(
          urls.map(async (url, i) => {
            const res = await fetch(url);
            if (!res.ok) throw new Error(`${res.status}`);
            const blob = await res.blob();
            return new File([blob], `${baseName}-${i + 1}.png`, { type: "image/png" });
          }),
        );
      }

      if (navigator.canShare?.({ files: files.current })) {
        try {
          await navigator.share({ files: files.current });
          setStatus("done");
        } catch (error) {
          // 共有シートを自分で閉じたときも AbortError になる。それは失敗ではない。
          if (error instanceof DOMException && error.name === "NotAllowedError") {
            setStatus("again");
          } else {
            setStatus("idle");
          }
        }
        return;
      }

      for (const file of files.current) {
        const href = URL.createObjectURL(file);
        const a = document.createElement("a");
        a.href = href;
        a.download = file.name;
        a.click();
        URL.revokeObjectURL(href);
      }
      setStatus("done");
    } catch {
      files.current = null;
      setStatus("error");
    }
  }

  const text = {
    idle: label,
    loading: "画像を準備中…",
    again: "準備できました。もう一度押して保存",
    done: "保存しました(もう一度保存する)",
    error: "取得に失敗しました。もう一度押してください",
  }[status];

  return (
    <Button
      type="button"
      size="sm"
      variant={status === "again" ? "default" : "outline"}
      onClick={save}
      disabled={status === "loading"}
    >
      {text}
    </Button>
  );
}
