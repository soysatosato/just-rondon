"use client";

import { sendContact } from "@/utils/actions/contact";
import { useFormState, useFormStatus } from "react-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2 } from "lucide-react";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? "送信中…" : "送信"}
    </Button>
  );
}

export default function ContactForm() {
  const [state, formAction] = useFormState(sendContact, {
    success: false,
    errors: {},
  });

  if (state.success) {
    return (
      <Alert className="border-green-500 bg-green-50 text-green-800">
        <CheckCircle2 className="h-4 w-4" />
        <AlertDescription>
          確認メールを送信しました。メール内のリンクをクリックしてお問い合わせを完了してください。
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="max-w-xl mx-auto">
      <CardHeader>
        <CardTitle>お問い合わせ</CardTitle>
        <CardDescription>
          下記フォームよりお気軽にお問い合わせください。
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">お名前</label>
            <Input name="name" />
            {state.errors?.name && (
              <p className="text-sm text-red-600">{state.errors.name[0]}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">メールアドレス</label>
            <Input name="email" type="email" />
            {state.errors?.email && (
              <p className="text-sm text-red-600">{state.errors.email[0]}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">お問い合わせ内容</label>
            <Textarea name="message" rows={5} />
            {state.errors?.message && (
              <p className="text-sm text-red-600">{state.errors.message[0]}</p>
            )}
          </div>

          <SubmitButton />
        </form>
      </CardContent>
    </Card>
  );
}
