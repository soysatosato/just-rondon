"use client";

import { useEffect } from "react";
import { useAuth } from "@clerk/nextjs";

import { setPlanSyncUser } from "./plan-sync";

/**
 * ログイン状態を旅行プランの同期(plan-sync.ts)へ渡すだけの部品。何も描かない。
 *
 * ルートレイアウトに置いているのは、プランが /plan の外でも変わるため。
 * スポットの詳細ページや一覧のカードで「プランに追加」を押した分も、
 * その場でアカウントへ送らないと、別の端末で開いたときに足りない。
 *
 * ページ本体はログイン状態を知らないまま(全員に同じHTML)で、ここは
 * 描画のあとに Clerk から状態を受け取る。
 */
export default function PlanSync() {
  const { isLoaded, userId } = useAuth();

  useEffect(() => {
    if (!isLoaded) return;
    setPlanSyncUser(userId ?? null);
  }, [isLoaded, userId]);

  return null;
}
