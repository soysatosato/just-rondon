"use client";

import { useMemo, useState } from "react";
import { needLabel, type NeedId } from "./content";

export type AreaCard = {
  id: string;
  name: string;
  needs: readonly NeedId[];
  /** サーバーで描画済みのカード。中身の markdown はここには入ってこない。 */
  node: React.ReactNode;
};

/**
 * 目的・空港・予算の3つの問いから宿泊エリアを絞り込む。
 *
 * 以前は9つの目的を1列のボタンに並べていた。性質の違う問い(何をしに行くか /
 * どの空港に着くか / 予算)が同じ列に混ざると、読者は自分に関係のある
 * ボタンを探すところから始めることになる。問いごとに分けて並べる。
 *
 * 絞り込みの規則は以前と同じ。選んだ条件のどれかに当てはまるエリアを出し
 * (OR。AND にすると2つ選んだ時点でほぼ空になる)、一致した数の多い順に並べる。
 * 答えたら、上位のエリアを名前で先に示す(カードを全部読まなくても答えが分かる)。
 *
 * カードの中身はサーバーで描画したものを node として受け取る。
 * このコンポーネントの中で MarkdownBody を呼ぶと react-markdown ごと
 * クライアントバンドルに載り、初回読み込みが 50kB ほど増える。
 */
const QUESTIONS: { id: string; label: string; options: NeedId[] }[] = [
  {
    id: "purpose",
    label: "何をしに行きますか",
    options: ["first", "kids", "theatre", "quiet", "weekend", "daytrip"],
  },
  { id: "airport", label: "どの空港に着きますか", options: ["heathrow", "gatwick"] },
  { id: "budget", label: "予算は", options: ["budget"] },
];

export default function AreaChooser({
  cards,
  map,
}: {
  cards: AreaCard[];
  /** 問いとカードの間に置く地図(サーバーで用意したもの)。 */
  map?: React.ReactNode;
}) {
  const [selected, setSelected] = useState<NeedId[]>([]);

  const toggleNeed = (id: NeedId) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((n) => n !== id) : [...prev, id],
    );

  const ranked = useMemo(() => {
    if (selected.length === 0) return cards;
    const score = (c: AreaCard) =>
      c.needs.filter((n) => selected.includes(n)).length;
    return cards
      .filter((c) => score(c) > 0)
      .sort((a, b) => score(b) - score(a));
  }, [cards, selected]);

  return (
    <div>
      <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-5 dark:border-neutral-700 dark:bg-neutral-900">
        <div className="space-y-4">
          {QUESTIONS.map((q) => (
            <fieldset key={q.id}>
              <legend className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                {q.label}
              </legend>
              <ul className="mt-2 flex flex-wrap gap-2">
                {q.options.map((id) => {
                  const active = selected.includes(id);
                  return (
                    <li key={id}>
                      <button
                        type="button"
                        onClick={() => toggleNeed(id)}
                        aria-pressed={active}
                        className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
                          active
                            ? "bg-emerald-700 text-white"
                            : "border border-neutral-300 bg-white text-neutral-700 hover:border-emerald-400 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                        }`}
                      >
                        {needLabel(id)}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </fieldset>
          ))}
        </div>

        {selected.length > 0 && (
          <div className="mt-4 border-t border-neutral-200 pt-3 dark:border-neutral-700">
            {ranked.length > 0 ? (
              <p className="text-sm text-neutral-800 dark:text-neutral-200">
                合うエリア:
                {ranked.slice(0, 3).map((c, i) => (
                  <a
                    key={c.id}
                    href={`#${c.id}`}
                    className="ml-1.5 font-semibold text-emerald-800 underline underline-offset-2 dark:text-emerald-300"
                  >
                    {c.name.split("／")[0]}
                    {i < Math.min(ranked.length, 3) - 1 ? "、" : ""}
                  </a>
                ))}
                {ranked.length > 3 && (
                  <span className="ml-1 text-xs text-neutral-500 dark:text-neutral-400">
                    ほか{ranked.length - 3}エリア
                  </span>
                )}
              </p>
            ) : null}
            <button
              type="button"
              onClick={() => setSelected([])}
              className="mt-2 text-xs text-neutral-500 underline underline-offset-2 dark:text-neutral-400"
            >
              条件をクリア
            </button>
          </div>
        )}
      </div>

      {map && <div className="mt-5">{map}</div>}

      <ul className="mt-5 space-y-3">
        {ranked.map((card) => (
          <li key={card.id}>{card.node}</li>
        ))}
      </ul>

      {ranked.length === 0 && (
        <p className="mt-5 rounded-lg border border-neutral-200 p-5 text-sm text-neutral-600 dark:border-neutral-700 dark:text-neutral-400">
          その組み合わせに当てはまるエリアはありません。条件を減らしてみてください。
        </p>
      )}
    </div>
  );
}
