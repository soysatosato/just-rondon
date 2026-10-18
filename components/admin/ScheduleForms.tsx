"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import {
  approveContent,
  discardContent,
  publishChangeIssue,
  publishContentNow,
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

/** 管理ページの送信ボタン。送信中は押せなくする。CommentForms でも使う。 */
export function Submit({
  children,
  variant = "default",
}: {
  children: React.ReactNode;
  variant?: "default" | "outline" | "destructive";
}) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="sm" variant={variant} disabled={pending}>
      {pending ? "処理中…" : children}
    </Button>
  );
}

/** 操作の結果の一言。CommentForms でも使う。 */
export function Result({ state }: { state: AdminActionState }) {
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

/** 下書きを枠を待たずにいま公開する。 */
export function PublishNowForm({ id }: { id: string }) {
  const [state, action] = useFormState(publishContentNow, null);
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm("この記事をいま公開しますか？公開後は下書きに戻せません。")) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <Submit variant="outline">いま公開</Submit>
      <Result state={state} />
    </form>
  );
}

/** 下書きをボツにする(削除)。この記事を貼ったツイートの下書きも不採用になる。 */
export function DiscardForm({ id, title }: { id: string; title: string }) {
  const [state, action] = useFormState(discardContent, null);
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm(`「${title}」をボツにして削除しますか？元には戻せません。`)) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <Submit variant="destructive">ボツ</Submit>
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

/** 「今月変わったロンドン」の号の公開。予約はせず、押した時点で出る。 */
export function PublishIssueForm({ id }: { id: string }) {
  const [state, action] = useFormState(publishChangeIssue, null);
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm("この号をいま公開しますか？公開後は下書きに戻せません。")) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <Submit>承認していま公開</Submit>
      <Result state={state} />
    </form>
  );
}
