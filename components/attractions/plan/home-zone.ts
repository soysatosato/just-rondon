"use client";

import { useSyncExternalStore } from "react";

import { DEFAULT_HOME_ZONE, isHomeZone, type HomeZone } from "@/lib/plan/costs";

/**
 * 宿のゾーン(交通費の見積もりの前提)。このブラウザにだけ保存する。
 *
 * プラン本体(plan-store.ts)とは鍵を分けてある。プランは共有リンクで
 * 同行者に渡り、アカウントにも同期されるが、宿のゾーンは
 * 「この人がどこに泊まるか」の設定で、同行者のプランを開いたときに
 * 自分の宿の設定が上書きされては困る。全消しでも消さない。
 */

const STORAGE_KEY = "just-rondon-plan-home-zone-v1";

let zone: HomeZone = DEFAULT_HOME_ZONE;
let hydrated = false;
const listeners = new Set<() => void>();

function hydrate() {
  hydrated = true;
  try {
    const saved = Number(localStorage.getItem(STORAGE_KEY));
    if (isHomeZone(saved)) zone = saved;
  } catch {
    // プライベートモードなど。既定のまま動く。
  }
}

function subscribe(listener: () => void) {
  if (!hydrated) hydrate();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key !== STORAGE_KEY) return;
    hydrated = false;
    zone = DEFAULT_HOME_ZONE;
    hydrate();
    for (const listener of listeners) listener();
  });
}

export function useHomeZone(): HomeZone {
  return useSyncExternalStore(
    subscribe,
    () => zone,
    () => DEFAULT_HOME_ZONE,
  );
}

export function setHomeZone(next: HomeZone) {
  if (!isHomeZone(next) || next === zone) return;
  zone = next;
  try {
    localStorage.setItem(STORAGE_KEY, String(next));
  } catch {
    // 同上。この画面の中では選んだ値で動き続ける。
  }
  for (const listener of listeners) listener();
}
