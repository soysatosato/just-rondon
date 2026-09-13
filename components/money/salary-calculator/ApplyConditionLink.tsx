"use client";

import type { ReactNode } from "react";

/** 計算機に条件を流し込むイベント。detail はクエリ文字列(? なし)。 */
export const APPLY_CONDITION_EVENT = "take-home:apply";

/** 計算機を包む要素の id。早見表から戻るスクロール先。 */
export const CALCULATOR_ANCHOR_ID = "calculator";

/**
 * 早見表の「£30,000」を押したとき、その条件で計算機を開き直すリンク。
 *
 * 同じページ内のリンクを next/link で張ると、ページは作り直されず
 * 計算機は最初に読んだ URL の条件のまま動かない。かといって普通の
 * 再読み込みにすると、表を見比べながら押すたびに画面が白くなる。
 * そこで、クリックは計算機へのイベントに変えて上へスクロールし、
 * href は残して「新しいタブで開く」と JavaScript なしの閲覧に備える。
 */
export default function ApplyConditionLink({
  href,
  className,
  children,
  label,
}: {
  href: string;
  className?: string;
  children: ReactNode;
  /** 読み上げ用。表のセルの数字だけでは何のリンクか分からないため。 */
  label?: string;
}) {
  return (
    <a
      href={href}
      aria-label={label}
      className={className}
      onClick={(e) => {
        if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
          return;
        }
        e.preventDefault();
        const query = href.includes("?") ? href.slice(href.indexOf("?") + 1) : "";
        window.dispatchEvent(new CustomEvent(APPLY_CONDITION_EVENT, { detail: query }));
        document
          .getElementById(CALCULATOR_ANCHOR_ID)
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      }}
    >
      {children}
    </a>
  );
}
