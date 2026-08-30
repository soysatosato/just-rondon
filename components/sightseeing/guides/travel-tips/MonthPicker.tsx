"use client";

import { useEffect, useState } from "react";
import { months } from "./content";

/**
 * 「行く月」を選んで1件だけ返す。
 *
 * 元は12行の GFM テーブルだった。読者に要るのは自分が行く月の1行だけ
 * なのに、MarkdownBody が表に min-w-[32rem] を掛けるため、スマホでは
 * 横スクロールしながら12行の中から自分の月を探すことになっていた。
 *
 * 未選択のあいだは12ヶ月ぶんをタイルで出す。JS が無い環境と
 * クローラーにも全月のデータが渡るようにするため。マウント後に
 * 今月を選ぶ(ビルド時の月を焼き込まないよう、サーバーでは選ばない)。
 */
export default function MonthPicker() {
  const [selected, setSelected] = useState<number | null>(null);

  useEffect(() => {
    setSelected(new Date().getMonth() + 1);
  }, []);

  const current = months.find((m) => m.month === selected) ?? null;

  return (
    <div>
      <div className="flex flex-wrap gap-1.5">
        {months.map((m) => {
          const active = m.month === selected;
          return (
            <button
              key={m.month}
              type="button"
              onClick={() => setSelected(active ? null : m.month)}
              aria-pressed={active}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                active
                  ? "bg-emerald-600 text-white"
                  : "border border-gray-300 text-gray-700 hover:border-emerald-400 dark:border-neutral-700 dark:text-gray-300"
              }`}
            >
              {m.month}月
            </button>
          );
        })}
      </div>

      {current ? (
        <div className="mt-4 rounded-xl border border-gray-200 bg-white p-5 dark:border-neutral-700 dark:bg-neutral-900">
          <div className="flex flex-wrap items-baseline gap-3">
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {current.month}月
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              最高{" "}
              <strong className="text-base font-bold text-gray-900 dark:text-gray-100">
                {current.high}℃
              </strong>
              {" / "}最低{" "}
              <strong className="text-base font-bold text-gray-900 dark:text-gray-100">
                {current.low}℃
              </strong>
            </p>
            {current.best && (
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                ベストシーズン
              </span>
            )}
          </div>

          <dl className="mt-4 space-y-2.5 text-sm">
            <div className="flex gap-3">
              <dt className="w-14 shrink-0 text-xs font-semibold text-gray-500 dark:text-gray-400">
                服装
              </dt>
              <dd className="font-medium text-gray-900 dark:text-gray-100">
                {current.wear}
              </dd>
            </div>
            <div className="flex gap-3">
              <dt className="w-14 shrink-0 text-xs font-semibold text-gray-500 dark:text-gray-400">
                特徴
              </dt>
              <dd className="text-gray-700 dark:text-gray-300">{current.note}</dd>
            </div>
            {current.daylight && (
              <div className="flex gap-3">
                <dt className="w-14 shrink-0 text-xs font-semibold text-gray-500 dark:text-gray-400">
                  日照
                </dt>
                <dd className="text-gray-700 dark:text-gray-300">
                  {current.daylight}
                </dd>
              </div>
            )}
          </dl>
        </div>
      ) : (
        /* 未選択(サーバー描画時とJS無効時)。全月をここで見せる。 */
        <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {months.map((m) => (
            <li
              key={m.month}
              className="rounded-lg border border-gray-200 p-3 dark:border-neutral-700"
            >
              <p className="flex items-baseline gap-2">
                <span className="text-base font-bold text-gray-900 dark:text-gray-100">
                  {m.month}月
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {m.high}℃ / {m.low}℃
                </span>
              </p>
              <p className="mt-1 text-xs leading-snug text-gray-600 dark:text-gray-400">
                {m.wear}
              </p>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
        平年値のおおよその目安です。正確な平年値と予報は Met Office（英国気象庁）でご確認ください。
      </p>
    </div>
  );
}
