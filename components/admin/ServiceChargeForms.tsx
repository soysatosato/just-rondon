"use client";

import { useFormState } from "react-dom";
import { Result, Submit } from "@/components/admin/ScheduleForms";
import { setServiceChargeCommentsApproved } from "@/utils/actions/service-charge-admin";

/** 自由記述の管理ページ(/admin/service-charges)の「載せる/伏せる」ボタン。 */
export function ApproveCommentsForm({
  id,
  approved,
}: {
  id: string;
  approved: boolean;
}) {
  const [state, action] = useFormState(setServiceChargeCommentsApproved, null);
  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="approve" value={approved ? "0" : "1"} />
      <Submit variant={approved ? "outline" : "default"}>
        {approved ? "伏せる" : "載せる"}
      </Submit>
      <Result state={state} />
    </form>
  );
}
