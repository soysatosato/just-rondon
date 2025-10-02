"use client";

import { useFormState } from "react-dom";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { actionFunction } from "@/utils/types";

const initialState = null;

export default function FormContainer({
  action,
  children,
  onSuccess,
}: {
  action: actionFunction;
  children: React.ReactNode;
  onSuccess?: () => void;
}) {
  // createBookingAction は単なるサーバー関数なので、
  // そのままだとフォームの送信イベントに直接使えない
  // formAction は内部でフォームの送信イベントから FormData を受け取り、
  // それを createBookingAction に渡す処理をラップする
  const [state, formAction] = useFormState(action, initialState);
  const { toast } = useToast();
  useEffect(() => {
    if (state && "message" in state) {
      toast({ description: state.message });
      if (onSuccess) onSuccess();
    } else if (state && "error" in state) {
      toast({ description: state.error, variant: "destructive" });
    }
  }, [state, toast, onSuccess]);
  return <form action={formAction}>{children}</form>;
}
