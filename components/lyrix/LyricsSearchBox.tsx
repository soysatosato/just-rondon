"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export function SearchBox({ href = "/search" }: { href?: string }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    if (!query.trim()) {
      e.preventDefault();
      setOpen(true);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-white dark:bg-slate-900">
          <DialogHeader>
            <DialogTitle>検索ワードが必要です</DialogTitle>
            <DialogDescription>
              曲名やアーティスト名を入力してください。
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      <form
        action={href}
        method="GET"
        onSubmit={onSubmit}
        className="flex flex-row gap-3 w-full items-center"
      >
        {/* 入力フォームエリア: 最大幅 */}
        <div
          className="flex flex-1 items-center gap-2 rounded-xl px-3 py-2
          border border-gray-300 bg-white/70 
          text-gray-700 placeholder:text-gray-500
          dark:border-slate-700/70 dark:bg-slate-950/60 dark:text-slate-50 dark:placeholder:text-slate-500"
        >
          <Search className="h-5 w-5 text-gray-500 dark:text-slate-400" />
          <Input
            name="q"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="曲名やアーティスト名を入力..."
            className="w-full border-0 bg-transparent px-0 text-sm
            focus-visible:ring-0
            text-gray-700 placeholder:text-gray-500 
            dark:text-slate-50 dark:placeholder:text-slate-500"
          />
        </div>

        {/* ボタン: 高さ揃える */}
        <Button
          type="submit"
          className="h-full px-4
          bg-blue-600 text-white hover:bg-blue-700
          dark:bg-sky-600 dark:hover:bg-sky-500"
        >
          Explore
        </Button>
      </form>
    </>
  );
}
