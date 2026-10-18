"use client";

import { create } from "zustand";

/**
 * サイト内検索の開閉。検索の画面(SearchDialog)はルートレイアウトに1つだけ置き、
 * ヘッダー・トップのヒーロー・404 のどこからでもここを通して開く。
 */
type SearchState = {
  open: boolean;
  /** 開いたときに入力欄へ入れておく語。トップの「例:」から開くときに使う。 */
  query: string;
  openSearch: (query?: string) => void;
  setOpen: (open: boolean) => void;
  setQuery: (query: string) => void;
};

export const useSearchStore = create<SearchState>((set) => ({
  open: false,
  query: "",
  openSearch: (query) =>
    set((state) => ({ open: true, query: query ?? state.query })),
  setOpen: (open) => set({ open }),
  setQuery: (query) => set({ query }),
}));
