"use client";

import { useEffect, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import BotGuardFields from "@/components/form/BotGuardFields";
import Choice from "@/components/jobs/survey/Choice";
import { sendConsultation, type ConsultState } from "@/utils/actions/consult";
import {
  type AcasStatus,
  GENERIC_DEADLINE_ADVICE,
  deadlineAdvice,
  londonToday,
} from "@/lib/jobs/claim-deadline";
import {
  ACAS_OPTIONS,
  EMPLOYMENT_OPTIONS,
  type Employment,
} from "@/lib/jobs/consult";
import DeadlineNotice from "./DeadlineNotice";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" size="lg" disabled={pending} className="w-full sm:w-auto">
      {pending ? "送信中…" : "確認メールを送る"}
    </Button>
  );
}

function Field({
  label,
  required,
  hint,
  error,
  htmlFor,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={htmlFor} className="flex items-center gap-2 text-sm font-semibold">
        {label}
        {required && (
          <span className="rounded bg-muted px-1.5 py-0.5 text-xs font-medium text-muted-foreground">
            必須
          </span>
        )}
      </label>
      {hint && (
        <p className="text-xs leading-relaxed text-muted-foreground">{hint}</p>
      )}
      {children}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}

export default function ConsultForm() {
  const [state, formAction] = useFormState<ConsultState, FormData>(
    sendConsultation,
    { success: false, errors: {} },
  );
  const [employment, setEmployment] = useState<Employment | null>(null);
  const [acas, setAcas] = useState<AcasStatus | null>(null);
  const [lastPaidOn, setLastPaidOn] = useState("");
  // 未来の日付を選べないようにする上限。描画時に入れるとサーバーとの
  // 日付のずれでハイドレーションが食い違うので、マウント後に入れる。
  const [today, setToday] = useState<string>();
  useEffect(() => setToday(londonToday()), []);

  // 返信を待たずに動くべきかは、送る前に分かっていてほしい。入力に合わせてその場で出す。
  const advice = deadlineAdvice(lastPaidOn, acas, today);

  if (state.success) {
    return (
      <div className="space-y-4">
        <div className="flex gap-3 rounded-lg border border-emerald-600/30 bg-emerald-50 p-5 dark:bg-emerald-950/30">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <div className="space-y-1">
            <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-200">
              確認メールを送信しました
            </p>
            <p className="text-sm leading-7 text-emerald-800 dark:text-emerald-300/90">
              メール内のリンクを開くと、ご相談が届きます。1週間を目安に返信します。
            </p>
          </div>
        </div>
        <DeadlineNotice advice={advice ?? GENERIC_DEADLINE_ADVICE} />
      </div>
    );
  }

  const errors = state.errors ?? {};

  return (
    <form action={formAction} className="space-y-8">
      <BotGuardFields />

      <Field label="いまの状況" required error={errors.employment?.[0]}>
        <Choice
          name="employment"
          value={employment}
          onChange={setEmployment}
          options={EMPLOYMENT_OPTIONS}
          columns={2}
        />
      </Field>

      <Field
        label="最後に給与を受け取った日"
        htmlFor="lastPaidOn"
        hint="辞めた方は最後の給与日。分からなければ退職日で構いません。入れると、期限の目安をその場で出します。"
        error={errors.lastPaidOn?.[0]}
      >
        <Input
          id="lastPaidOn"
          name="lastPaidOn"
          type="date"
          max={today}
          value={lastPaidOn}
          onChange={(e) => setLastPaidOn(e.target.value)}
          className="w-auto"
        />
      </Field>

      <Field label="Acasには連絡しましたか" required error={errors.acas?.[0]}>
        <Choice name="acas" value={acas} onChange={setAcas} options={ACAS_OPTIONS} />
      </Field>

      {advice && <DeadlineNotice advice={advice} />}

      <Field
        label="サービスチャージの率"
        htmlFor="chargeRate"
        error={errors.chargeRate?.[0]}
      >
        <Input id="chargeRate" name="chargeRate" placeholder="例: 12.5%" />
      </Field>

      <Field
        label="どう還元されていたか"
        htmlFor="sharing"
        error={errors.sharing?.[0]}
      >
        <Input
          id="sharing"
          name="sharing"
          placeholder="例: 時給に£1上乗せ／まったく無い／分からない"
        />
      </Field>

      <Field
        label="相談したいこと"
        required
        htmlFor="message"
        hint="いつから働いていて、何が起きていて、何に困っているか。同僚や上司の名前は書かなくて大丈夫です。"
        error={errors.message?.[0]}
      >
        <Textarea id="message" name="message" rows={8} />
      </Field>

      <Field
        label="呼び名"
        htmlFor="nickname"
        hint="返信の宛名に使います。本名でなくて構いません。"
        error={errors.nickname?.[0]}
      >
        <Input id="nickname" name="nickname" autoComplete="nickname" />
      </Field>

      <Field
        label="メールアドレス"
        required
        htmlFor="email"
        hint="返信はこのアドレスに送ります。"
        error={errors.email?.[0]}
      >
        <Input id="email" name="email" type="email" autoComplete="email" />
      </Field>

      <label className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed">
        <Checkbox name="publishOk" className="mt-0.5" />
        <span className="text-muted-foreground">
          店名や個人が分かる部分を伏せたうえで、Q&Aとしてサイトに載せてもよい
        </span>
      </label>

      <div className="space-y-4">
        {/*
          入力直後ではなく、確認メールのリンクを踏んだ時点で相談が届く。
          ボタンを押しても手元では何も起きないように見えるので、押す前に段取りを書いておく。
        */}
        <p className="text-sm leading-7 text-muted-foreground">
          送信すると確認メールが届きます。メール内のリンクを開いた時点で、ご相談が届きます。
        </p>
        {state.error && <p className="text-sm text-red-600">{state.error}</p>}
        <SubmitButton />
      </div>
    </form>
  );
}
