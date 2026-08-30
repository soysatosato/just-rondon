"use client";

import { useState } from "react";
import { tiers, type TierId } from "./content";

/**
 * 積算モデル。読者が属する予算帯は1つなので、1つだけ出す。
 *
 * 以前は節約・標準・ゆとりの3モデルが3枚の GFM テーブルとして
 * 縦に並んでいた。自分に関係のない2枚を読み飛ばさせる形だったうえ、
 * MarkdownBody の min-w-[32rem] で3枚とも横スクロールだった。
 *
 * 3帯ぶんとも DOM に描画したうえで、選択中のもの以外を hidden で伏せる。
 * 選択中の1枚だけを描画すると、残り2帯の内訳がプリレンダー結果に出ず、
 * JS 無効では1帯しか読めなくなる。切り替えは表示の制御だけにとどめる。
 */
export default function BudgetModels() {
  const [active, setActive] = useState<TierId>("standard");

  return (
    <div>
      <div
        role="tablist"
        aria-label="予算帯"
        className="flex gap-1 rounded-lg bg-gray-100 p-1 dark:bg-neutral-800"
      >
        {tiers.map((t) => {
          const on = t.id === active;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => setActive(t.id)}
              className={`flex-1 rounded-md px-3 py-2 text-sm font-semibold transition ${
                on
                  ? "bg-white text-gray-900 shadow-sm dark:bg-neutral-950 dark:text-gray-100"
                  : "text-gray-600 hover:text-gray-900 dark:text-gray-400"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {tiers.map((tier) => (
        <div
          key={tier.id}
          hidden={tier.id !== active}
          className="mt-4 rounded-xl border border-gray-200 bg-white p-5 dark:border-neutral-700 dark:bg-neutral-900"
        >
          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {tier.total}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              1日あたり約 {tier.perDay}
            </p>
          </div>
          <p className="mt-0.5 text-sm text-emerald-700 dark:text-emerald-400">
            {tier.blurb}
          </p>

          <ul className="mt-4 divide-y divide-gray-200 dark:divide-neutral-800">
            {tier.rows.map((r) => (
              <li
                key={r.item}
                className="flex items-baseline justify-between gap-4 py-2.5 text-sm"
              >
                <span className="text-gray-700 dark:text-gray-300">{r.item}</span>
                <span className="shrink-0 font-mono font-semibold text-gray-900 dark:text-gray-100">
                  {r.amount}
                </span>
              </li>
            ))}
            <li className="flex items-baseline justify-between gap-4 border-t-2 border-gray-300 py-3 dark:border-neutral-600">
              <span className="font-bold text-gray-900 dark:text-gray-100">
                合計
              </span>
              <span className="shrink-0 font-mono text-lg font-bold text-gray-900 dark:text-gray-100">
                約 {tier.total}
              </span>
            </li>
          </ul>

          <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
            {tier.closing}
          </p>
        </div>
      ))}
    </div>
  );
}
