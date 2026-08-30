"use client";

import { useMemo, useState } from "react";
import { needs, type NeedId } from "./content";

export type AreaCard = {
  id: string;
  needs: readonly NeedId[];
  /** サーバーで描画済みのカード。中身の markdown はここには入ってこない。 */
  node: React.ReactNode;
};

/**
 * 目的から宿泊エリアを絞り込む。
 *
 * 以前は「早見表(5列のGFMテーブル) + 詳細8セクション + その他5件の箇条書き」
 * という3箇所に同じエリアが散っていた。読者の仕事は13から1つ選ぶことなのに、
 * 比較対象を順番に読む形になっていて、しかも表はスマホで横スクロールだった。
 *
 * カードの中身はサーバーで描画したものを node として受け取る。
 * このコンポーネントの中で MarkdownBody を呼ぶと react-markdown ごと
 * クライアントバンドルに載り、初回読み込みが 50kB ほど増える。
 * 絞り込みに必要なのは id と needs だけなので、本文は運ばせない。
 *
 * 目的チップは複数選択。AND にすると2つ選んだ時点でほぼ空になるので、
 * OR で広く出したうえで、一致した数の多い順に並べて上へ寄せる。
 */
export default function AreaChooser({ cards }: { cards: AreaCard[] }) {
  const [selected, setSelected] = useState<NeedId[]>([]);

  const toggleNeed = (id: NeedId) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((n) => n !== id) : [...prev, id]
    );

  const ranked = useMemo(() => {
    if (selected.length === 0) return cards;
    const score = (c: AreaCard) =>
      c.needs.filter((n) => selected.includes(n)).length;
    return cards.filter((c) => score(c) > 0).sort((a, b) => score(b) - score(a));
  }, [cards, selected]);

  return (
    <div>
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-5 dark:border-neutral-700 dark:bg-neutral-900">
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          何を優先しますか（複数選べます）
        </p>
        <ul className="mt-3 flex flex-wrap gap-2">
          {needs.map((n) => {
            const active = selected.includes(n.id);
            return (
              <li key={n.id}>
                <button
                  type="button"
                  onClick={() => toggleNeed(n.id)}
                  aria-pressed={active}
                  className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
                    active
                      ? "bg-emerald-600 text-white"
                      : "border border-gray-300 bg-white text-gray-700 hover:border-emerald-400 dark:border-neutral-700 dark:bg-neutral-800 dark:text-gray-300"
                  }`}
                >
                  {n.label}
                </button>
              </li>
            );
          })}
        </ul>
        {selected.length > 0 && (
          <p className="mt-3 flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
            <span>{ranked.length}エリアが該当</span>
            <button
              type="button"
              onClick={() => setSelected([])}
              className="underline underline-offset-2"
            >
              条件をクリア
            </button>
          </p>
        )}
      </div>

      <ul className="mt-5 space-y-3">
        {ranked.map((card) => (
          <li key={card.id}>{card.node}</li>
        ))}
      </ul>

      {ranked.length === 0 && (
        <p className="mt-5 rounded-lg border border-gray-200 p-5 text-sm text-gray-600 dark:border-neutral-700 dark:text-gray-400">
          その組み合わせに当てはまるエリアはありません。条件を減らしてみてください。
        </p>
      )}
    </div>
  );
}
