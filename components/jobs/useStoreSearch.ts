"use client";

import { useEffect, useState } from "react";
import { searchStores, type StoreSearchResult } from "@/utils/actions/jobs";

/**
 * 店舗候補の検索。2文字から、打ち終わって300ms後に問い合わせる。
 *
 * アンケートの店舗欄とダッシュボードの入口で同じ振る舞いにするため、ここにまとめる。
 * 打ち続けたときに古い問い合わせの結果が後から届いて上書きしないよう、
 * 入力が変わった時点で前の結果は捨てる。
 *
 * enabled が false の間は問い合わせない。店舗を選んだあとに、選んだ店名で
 * 検索し直して候補が開き直すのを防ぐため。
 */
export function useStoreSearch(query: string, enabled = true) {
  const [results, setResults] = useState<StoreSearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const q = query.trim();
    if (!enabled || q.length < 2) {
      if (q.length < 2) setResults([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    const id = setTimeout(async () => {
      try {
        const found = await searchStores(q);
        if (!cancelled) setResults(found);
      } catch {
        if (!cancelled) setResults([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(id);
    };
  }, [query, enabled]);

  return { results, loading };
}
