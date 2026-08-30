"use client";

import { sendContact } from "@/utils/actions/contact";
import { useFormState, useFormStatus } from "react-dom";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? "送信中…" : "確認メールを送る"}
    </Button>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400">
        {label}
      </label>
      {children}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}

export default function ContactForm() {
  const [state, formAction] = useFormState(sendContact, {
    success: false,
    errors: {},
  });

  if (state.success) {
    return (
      <div className="flex gap-3 rounded-lg border border-emerald-600/30 bg-emerald-50 p-5 dark:bg-emerald-950/30">
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
        <div className="space-y-1">
          <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-200">
            確認メールを送信しました
          </p>
          <p className="text-sm leading-7 text-emerald-800 dark:text-emerald-300/90">
            メール内のリンクをクリックすると、お問い合わせが完了します。
          </p>
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-8">
      {/*
        入力直後ではなく、確認メールのリンクを踏んだ時点で送信が完了する。
        ボタンを押しても手元では何も起きないように見えるので、
        押す前にその段取りを書いておく。
      */}
      <p className="text-sm leading-7 text-gray-600 dark:text-gray-400">
        送信すると確認メールが届きます。メール内のリンクを開いていただいた時点で、お問い合わせが完了します。
      </p>

      <div className="space-y-6">
        <Field label="お名前" error={state.errors?.name?.[0]}>
          <Input name="name" autoComplete="name" />
        </Field>

        <Field label="メールアドレス" error={state.errors?.email?.[0]}>
          <Input name="email" type="email" autoComplete="email" />
        </Field>

        <Field label="お問い合わせ内容" error={state.errors?.message?.[0]}>
          <Textarea name="message" rows={7} />
        </Field>
      </div>

      <SubmitButton />
    </form>
  );
}
