"use client";

import { useEffect, useRef, useState } from "react";

export type GuideNavSection = {
  /** 対応するセクションの DOM id。 */
  id: string;
  /** ナビに出す短いラベル。横一列に収めるので長くしないこと。 */
  navLabel: string;
};

/**
 * スクロール追従の節ナビ。
 *
 * 冒頭に目次を1つ置くだけでは足りない記事のために作った。ETA も
 * 実用情報も、読者は「手順 → 対訳 → 対処」「服装 → 電源 → 治安」と
 * 節をまたいで往復する。そのたびに10節ぶん遡らせないための部品。
 *
 * スマホでは横スクロールさせる。縦に折り返すと、ナビだけで画面の
 * 3割を占めてしまうため。現在地のチップは可視域へ寄せる。
 */
export default function GuideSectionNav({
  sections,
}: {
  sections: readonly GuideNavSection[];
}) {
  const [activeId, setActiveId] = useState<string>(sections[0]?.id ?? "");
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const targets = sections
      .map((s) => document.getElementById(s.id))
      .filter((el): el is HTMLElement => el !== null);
    if (targets.length === 0) return;

    /*
      交差した節をすべて覚えておき、その中で最も上にあるものを現在地とする。
      「最後に交差したもの」にすると、上へスクロールしたときに
      見えていない下の節が選ばれたままになる。
    */
    const visible = new Set<string>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        }
        const first = sections.find((s) => visible.has(s.id));
        if (first) setActiveId(first.id);
      },
      // 上端はナビの高さぶん、下端は「節の頭が入ったら切り替える」ため深く取る。
      { rootMargin: "-88px 0px -55% 0px", threshold: 0 }
    );

    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [sections]);

  // 現在地のチップが画面外に出たままにならないよう、横スクロールを追従させる。
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const chip = list.querySelector<HTMLElement>(`[data-id="${activeId}"]`);
    if (!chip) return;

    const listBox = list.getBoundingClientRect();
    const chipBox = chip.getBoundingClientRect();
    if (chipBox.left < listBox.left || chipBox.right > listBox.right) {
      list.scrollTo({
        left: chip.offsetLeft - list.clientWidth / 2 + chip.clientWidth / 2,
        behavior: "smooth",
      });
    }
  }, [activeId]);

  return (
    <nav
      aria-label="このページの目次"
      className="sticky top-0 z-30 -mx-1 mb-8 border-b border-gray-200 bg-white/90 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/90 sm:-mx-4"
    >
      <ul
        ref={listRef}
        className="flex gap-1 overflow-x-auto px-1 py-2 [scrollbar-width:none] sm:px-4 [&::-webkit-scrollbar]:hidden"
      >
        {sections.map((section, i) => {
          const active = section.id === activeId;
          return (
            <li key={section.id} className="shrink-0">
              <a
                href={`#${section.id}`}
                data-id={section.id}
                aria-current={active ? "true" : undefined}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition ${
                  active
                    ? "bg-emerald-600 text-white"
                    : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-neutral-800"
                }`}
              >
                <span
                  className={
                    active
                      ? "text-emerald-200"
                      : "text-gray-400 dark:text-neutral-600"
                  }
                >
                  {i + 1}
                </span>
                {section.navLabel}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
