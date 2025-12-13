"use client";

import { useFormStatus } from "react-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createLyricsRequest } from "@/utils/actions/lyrics";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "送信中…" : "リクエスト送信"}
    </Button>
  );
}

export default function RequestForm({
  defaultTitle,
}: {
  defaultTitle: string;
}) {
  const { pending } = useFormStatus();

  if (!pending && typeof window !== "undefined") {
    // no-op（Server/Client差分対策）
  }

  return (
    <form action={createLyricsRequest} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">
          曲名 <span className="text-red-500">*</span>
        </label>
        <Input
          name="title"
          defaultValue={defaultTitle}
          placeholder="曲名"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">アーティスト名（任意）</label>
        <Input name="artist" placeholder="アーティスト名" />
      </div>

      <SubmitButton />
    </form>
  );
}
