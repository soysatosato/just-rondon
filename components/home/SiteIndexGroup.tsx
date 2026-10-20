"use client";

import { useEffect, useId, useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

/**
 * トップ最下部の索引「このサイトにあるもの」の1区分。
 *
 * スマホでは区分ごとに畳む。札が約100枚あり、全部開いていると索引だけで
 * 3.2画面あった(2026-10-19)。PC は横幅があって数段に収まるので、今までどおり
 * 開いたまま、押しても何も起きない見出しにする。
 *
 * サーバーでは開いた状態で描く。PC で一瞬閉じて見えることがなく、JS が
 * 動かない環境や検索エンジンにも全部のリンクが見える。スマホでは読み込み後に
 * 畳む。索引はページの最下部なので、最初の画面が動くことはない。
 *
 * リンクは先読みしない。画面に入るたびに約100ページを読み込んでいた。
 */
const MOBILE = "(max-width: 639px)";

export default function SiteIndexGroup({
  label,
  stripe,
  links,
}: {
  label: string;
  /** 区分の色の細い罫(menu.ts の accent.stripe)。 */
  stripe: string;
  links: { href: string; label: string }[];
}) {
  const [isMobile, setIsMobile] = useState(false);
  const [open, setOpen] = useState(true);
  const listId = useId();

  useEffect(() => {
    const query = window.matchMedia(MOBILE);
    const apply = () => {
      setIsMobile(query.matches);
      setOpen(!query.matches);
    };
    apply();
    query.addEventListener("change", apply);
    return () => query.removeEventListener("change", apply);
  }, []);

  const heading = (
    <span className="flex items-center gap-2 text-sm font-bold">
      <span aria-hidden className={`h-3.5 w-0.5 shrink-0 rounded-full ${stripe}`} />
      {label}
    </span>
  );

  return (
    <div className="grid gap-x-8 gap-y-3 border-b border-border/70 py-3 sm:grid-cols-[10rem_minmax(0,1fr)] sm:py-6">
      <div className="min-w-0">
        {isMobile ? (
          <button
            type="button"
            aria-expanded={open}
            aria-controls={listId}
            onClick={() => setOpen((value) => !value)}
            className="flex min-h-11 w-full items-center justify-between gap-3 text-left"
          >
            {heading}
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              {links.length}件
              <ChevronDown
                aria-hidden
                className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
              />
            </span>
          </button>
        ) : (
          <p className="py-0.5">{heading}</p>
        )}
      </div>
      <ul
        id={listId}
        className={open ? "flex flex-wrap content-start gap-2 pb-2 sm:pb-0" : "hidden"}
      >
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              prefetch={false}
              className="inline-block rounded-full border border-border bg-background px-3 py-2 text-sm leading-none text-muted-foreground transition hover:border-foreground/30 hover:bg-card hover:text-foreground"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
