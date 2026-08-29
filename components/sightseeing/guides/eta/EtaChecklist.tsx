"use client";

import { useEffect, useState } from "react";
import { etaChecklist } from "./content";

const STORAGE_KEY = "eta-checklist";

/**
 * 出発前チェックリスト。
 *
 * 以前は markdown の `- [ ]` で書いていたが、remark-gfm が吐くのは
 * disabled のチェックボックスなので、押しても何も起きなかった。
 * 「アプリは途中保存しないから始める前に全部揃えろ」という節なのに、
 * 揃えた印を付けられないのでは意味がない。
 *
 * localStorage に残すのは、準備が数日にまたがるため。航空券を取った日に
 * パスポートを確認して、NFC の確認は別の日、という読まれ方をする。
 */
export default function EtaChecklist() {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  // サーバー描画とずれるので、読み込むまでは件数を出さない。
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setChecked(JSON.parse(saved));
    } catch {
      // プライベートモードや保存拒否。チェックが残らないだけで実害はない。
    }
    setLoaded(true);
  }, []);

  const toggle = (id: string) => {
    setChecked((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // 同上。
      }
      return next;
    });
  };

  const all = etaChecklist.flatMap((g) => g.items);
  const done = all.filter((i) => checked[i.id]).length;
  const complete = loaded && done === all.length;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div
          className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-200 dark:bg-neutral-800"
          role="progressbar"
          aria-valuenow={done}
          aria-valuemin={0}
          aria-valuemax={all.length}
          aria-label="準備の進み具合"
        >
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              complete ? "bg-emerald-500" : "bg-emerald-400/70"
            }`}
            style={{ width: loaded ? `${(done / all.length) * 100}%` : "0%" }}
          />
        </div>
        <span className="shrink-0 text-xs font-semibold tabular-nums text-gray-500 dark:text-gray-400">
          {loaded ? `${done} / ${all.length}` : `0 / ${all.length}`}
        </span>
      </div>

      {complete && (
        <p className="rounded-lg bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
          準備できています。<a href="#steps" className="underline underline-offset-2">申請6ステップへ進む</a>
        </p>
      )}

      <div className="space-y-5">
        {etaChecklist.map((group) => (
          <div key={group.id}>
            <p className="text-xs font-bold tracking-wide text-gray-500 dark:text-gray-400">
              {group.label}
            </p>
            <ul className="mt-2 space-y-1">
              {group.items.map((item) => {
                const on = checked[item.id] ?? false;
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => toggle(item.id)}
                      aria-pressed={on}
                      className="flex w-full items-start gap-3 rounded-lg px-2 py-2 text-left transition hover:bg-gray-50 dark:hover:bg-neutral-800/60"
                    >
                      <span
                        aria-hidden
                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition ${
                          on
                            ? "border-emerald-500 bg-emerald-500 text-white"
                            : "border-gray-300 dark:border-neutral-600"
                        }`}
                      >
                        {on && (
                          <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none">
                            <path
                              d="M3.5 8.5l3 3 6-7"
                              stroke="currentColor"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </span>
                      <span className="min-w-0">
                        <span
                          className={`block text-sm leading-snug transition ${
                            on
                              ? "text-gray-400 line-through dark:text-gray-500"
                              : "font-medium text-gray-900 dark:text-gray-100"
                          }`}
                        >
                          {item.label}
                        </span>
                        {item.hint && (
                          <span className="mt-0.5 block text-xs leading-snug text-gray-500 dark:text-gray-400">
                            {item.hint}
                          </span>
                        )}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
