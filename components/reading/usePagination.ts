"use client";

import { useEffect, useRef, useState } from "react";

/**
 * 書庫のページ送り。
 *
 * 絞り込みを変えたら1ページ目に戻す。3ページ目を見たまま絞り込むと、
 * 結果が2ページしか無いのに空の面が出るため。`items` は呼び出し側で
 * useMemo した配列なので、絞り込みが変わったときだけ参照が変わる。
 * 依存に並べるのがその配列1つで済むのは、そのおかげ。
 */
export function usePagination<T>(items: T[], pageSize: number) {
  const [page, setPage] = useState(1);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPage(1);
  }, [items]);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const current = Math.min(page, totalPages);
  const start = (current - 1) * pageSize;
  const pageItems = items.slice(start, start + pageSize);

  const goTo = (next: number) => {
    setPage(next);
    // 押した位置は一覧の下端なので、そのままだと次の面の途中から始まる。
    listRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return { current, totalPages, start, pageItems, goTo, listRef };
}
