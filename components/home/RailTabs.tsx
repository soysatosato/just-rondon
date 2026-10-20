"use client";

import { useId, useRef, useState, type KeyboardEvent } from "react";
import Link from "next/link";

import { RailList } from "@/components/home/PhotoRail";
import type { RailItem } from "@/utils/actions/home";

export type RailTab = {
  key: string;
  /** 切り替えの札。短く(「名所」「美術館」)。 */
  label: string;
  description: string;
  href: string;
  moreLabel: string;
  items: RailItem[];
};

/**
 * 写真の棚を、区分の切り替えで1本にまとめたもの。トップの「見る・する」で使う。
 *
 * 以前は名所・美術館・ミュージカル・料理・お土産の棚を5本縦に積んでいて、
 * スマホで3.2画面あった(2026-10-19)。どの棚も同じ形なので、読者が
 * 区分を選んでから中身を見る形にしても失うものは少ない。
 *
 * 選んでいない区分の棚も DOM には置き、hidden で隠す。リンクを検索エンジンから
 * 消さないため。写真は loading="lazy" なので、隠れているあいだは読み込まれない。
 *
 * 操作は WAI-ARIA のタブの型に合わせる(左右の矢印・Home・End で移動)。
 */
export default function RailTabs({
  title,
  tabs,
}: {
  title: string;
  tabs: RailTab[];
}) {
  const visible = tabs.filter((tab) => tab.items.length > 0);
  const [active, setActive] = useState(0);
  const baseId = useId();
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);

  if (visible.length === 0) return null;
  const current = Math.min(active, visible.length - 1);

  const select = (index: number) => {
    const next = (index + visible.length) % visible.length;
    setActive(next);
    buttons.current[next]?.focus();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "ArrowRight") select(current + 1);
    else if (event.key === "ArrowLeft") select(current - 1);
    else if (event.key === "Home") select(0);
    else if (event.key === "End") select(visible.length - 1);
    else return;
    event.preventDefault();
  };

  return (
    <div>
      <h3 className="text-xl font-bold tracking-tight sm:text-2xl">{title}</h3>

      <div
        role="tablist"
        aria-label={title}
        className="mt-3 flex flex-wrap gap-2"
      >
        {visible.map((tab, index) => {
          const selected = index === current;
          return (
            <button
              key={tab.key}
              ref={(el) => {
                buttons.current[index] = el;
              }}
              type="button"
              role="tab"
              id={`${baseId}-tab-${tab.key}`}
              aria-selected={selected}
              aria-controls={`${baseId}-panel-${tab.key}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(index)}
              onKeyDown={onKeyDown}
              className={`inline-flex h-10 items-center rounded-full border px-4 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                selected
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {visible.map((tab, index) => (
        <div
          key={tab.key}
          role="tabpanel"
          id={`${baseId}-panel-${tab.key}`}
          aria-labelledby={`${baseId}-tab-${tab.key}`}
          hidden={index !== current}
          className="mt-4"
        >
          <div className="flex items-end justify-between gap-4">
            <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
              {tab.description}
            </p>
            <Link
              href={tab.href}
              prefetch={false}
              className="hidden shrink-0 whitespace-nowrap text-xs font-semibold text-muted-foreground underline-offset-4 transition hover:text-foreground hover:underline sm:block"
            >
              {tab.moreLabel} →
            </Link>
          </div>
          <RailList
            title={`${title}(${tab.label})`}
            href={tab.href}
            moreLabel={tab.moreLabel}
            items={tab.items}
          />
        </div>
      ))}
    </div>
  );
}
