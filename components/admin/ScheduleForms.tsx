"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import {
  approveContent,
  rescheduleContent,
  unscheduleContent,
  type AdminActionState,
} from "@/utils/actions/reading-admin";

/**
 * 管理ページ(/admin/reading)の操作ボタン。結果の一言をボタンの下に出す。
 *
 * 日付はロンドンの日付で選ぶ。時刻はセクションごとに決まっていて
 * (lib/publish-schedule.ts の SCHEDULE_RULES)、ここでは選ばせない。
 */

function Submit({
  children,
  variant = "default",
}: {
  children: React.ReactNode;
  variant?: "default" | "outline";
}) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="sm" variant={variant} disabled={pending}>
      {pending ? "処理中…" : children}
    </Button>
  );
}

function Result({ state }: { state: AdminActionState }) {
  if (!state) return null;
  return (
    <p
      className={`mt-1.5 text-xs ${
        state.ok
          ? "text-emerald-700 dark:text-emerald-400"
          : "text-red-600 dark:text-red-400"
      }`}
    >
      {state.message}
    </p>
  );
}

function DateField({ defaultValue, min }: { defaultValue: string; min: string }) {
  return (
    <input
      type="date"
      name="date"
      required
      defaultValue={defaultValue}
      min={min}
      aria-label="公開日(ロンドンの日付)"
      className="h-9 rounded-md border border-input bg-background px-2 text-sm"
    />
  );
}

/**
 * 承認。毎日のセクションは日付を選ばせず、ボタンに入る予定の枠を出す。
 * 不定期のセクションは日付欄を出す。
 */
export function ApproveForm({
  id,
  nextSlotLabel,
  defaultDate,
  minDate,
}: {
  id: string;
  /** 毎日のセクションのときだけ渡す。「ロンドン 10/11(日) 12:30」 */
  nextSlotLabel?: string;
  defaultDate: string;
  minDate: string;
}) {
  const [state, action] = useFormState(approveContent, null);
  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      <div className="flex flex-wrap items-center gap-2">
        {nextSlotLabel ? (
          <Submit>承認して {nextSlotLabel} に予約</Submit>
        ) : (
          <>
            <DateField defaultValue={defaultDate} min={minDate} />
            <Submit>承認して予約</Submit>
          </>
        )}
      </div>
      <Result state={state} />
    </form>
  );
}

export function RescheduleForm({
  id,
  defaultDate,
  minDate,
}: {
  id: string;
  defaultDate: string;
  minDate: string;
}) {
  const [state, action] = useFormState(rescheduleContent, null);
  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      <div className="flex flex-wrap items-center gap-2">
        <DateField defaultValue={defaultDate} min={minDate} />
        <Submit variant="outline">日付を変更</Submit>
      </div>
      <Result state={state} />
    </form>
  );
}

export function UnscheduleForm({ id }: { id: string }) {
  const [state, action] = useFormState(unscheduleContent, null);
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm("予約を取り消して下書きに戻しますか？")) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <Submit variant="outline">下書きに戻す</Submit>
      <Result state={state} />
    </form>
  );
}
