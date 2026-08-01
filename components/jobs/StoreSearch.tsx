"use client";

import { useEffect, useRef, useState } from "react";
import { searchStores, StoreSearchResult } from "@/utils/actions/jobs";

export type SelectedStore =
  | { mode: "matched"; store: StoreSearchResult }
  | { mode: "manual"; name: string; address: string };

type Props = {
  onSelect: (selection: SelectedStore | null) => void;
};

export default function StoreSearch({ onSelect }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<StoreSearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [manualMode, setManualMode] = useState(false);
  const [manualName, setManualName] = useState("");
  const [manualAddress, setManualAddress] = useState("");
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (manualMode) return;
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    const id = setTimeout(async () => {
      const r = await searchStores(query);
      setResults(r);
      setOpen(true);
    }, 300);
    return () => clearTimeout(id);
  }, [query, manualMode]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function pickStore(store: StoreSearchResult) {
    setSelectedLabel(`${store.name} / ${store.address}`);
    setQuery(store.name);
    setOpen(false);
    onSelect({ mode: "matched", store });
  }

  function toggleManual() {
    const next = !manualMode;
    setManualMode(next);
    setOpen(false);
    setSelectedLabel(null);
    if (next) {
      onSelect(
        manualName.trim().length >= 2
          ? { mode: "manual", name: manualName, address: manualAddress }
          : null,
      );
    } else {
      onSelect(null);
      setQuery("");
    }
  }

  function updateManualName(v: string) {
    setManualName(v);
    onSelect(
      v.trim().length >= 2
        ? { mode: "manual", name: v, address: manualAddress }
        : null,
    );
  }

  function updateManualAddress(v: string) {
    setManualAddress(v);
    onSelect(
      manualName.trim().length >= 2
        ? { mode: "manual", name: manualName, address: v }
        : null,
    );
  }

  if (manualMode) {
    return (
      <div className="space-y-2">
        <input
          type="text"
          placeholder="店舗名（必須）"
          value={manualName}
          autoComplete="off"
          onChange={(e) => updateManualName(e.target.value)}
          className="w-full rounded-md border px-3 py-2 bg-background"
        />
        <input
          type="text"
          placeholder="住所（任意）"
          value={manualAddress}
          autoComplete="off"
          onChange={(e) => updateManualAddress(e.target.value)}
          className="w-full rounded-md border px-3 py-2 bg-background"
        />
        <p className="text-xs text-muted-foreground">
          リスト未登録の店舗として送信されます。確認され次第マスタに反映されるため、それまでダッシュボードには表示されない場合があります。
        </p>
        <button
          type="button"
          onClick={toggleManual}
          className="text-xs text-muted-foreground underline"
        >
          リストから検索する
        </button>
      </div>
    );
  }

  return (
    <div className="relative space-y-1" ref={containerRef}>
      <input
        type="text"
        placeholder="店舗名を検索"
        value={query}
        autoComplete="off"
        onChange={(e) => {
          setQuery(e.target.value);
          setSelectedLabel(null);
          onSelect(null);
        }}
        onFocus={() => results.length > 0 && setOpen(true)}
        className="w-full rounded-md border px-3 py-2 bg-background"
      />

      {open && results.length > 0 && (
        <ul className="absolute z-20 mt-1 w-full rounded-md border bg-popover shadow-md max-h-64 overflow-auto">
          {results.map((r) => (
            <li key={r.id}>
              <button
                type="button"
                onClick={() => pickStore(r)}
                className="w-full text-left px-3 py-2 text-sm hover:bg-muted"
              >
                <div className="font-medium">{r.name}</div>
                <div className="text-xs text-muted-foreground">
                  {r.address}
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}

      {selectedLabel && (
        <p className="text-xs text-muted-foreground">選択中: {selectedLabel}</p>
      )}

      <button
        type="button"
        onClick={toggleManual}
        className="text-xs text-muted-foreground underline"
      >
        リストにない場合はこちら
      </button>
    </div>
  );
}
