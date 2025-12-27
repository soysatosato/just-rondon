"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

export default function HeroSearch() {
  const [value, setValue] = useState("");

  return (
    <div className="mx-auto flex max-w-xl items-center rounded-full bg-white/95 dark:bg-slate-900/90 p-1.5 shadow-lg shadow-slate-900/20 dark:shadow-black/40 backdrop-blur">
      <Select value={value} onValueChange={setValue}>
        <SelectTrigger className="border-none bg-transparent text-sm text-slate-900 dark:text-slate-100 focus-visible:ring-0 w-full px-2 py-1 [&>svg]:hidden">
          <SelectValue placeholder="選択してください…" />
        </SelectTrigger>

        <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
          <SelectItem value="sightseeing">観光スポットを探す</SelectItem>
          <SelectItem value="sightseeing/all?category=tour">
            ツアーを見る
          </SelectItem>
          <SelectItem value="museums">美術館を探す</SelectItem>
          <SelectItem value="musicals">ミュージカルを探す</SelectItem>
          <SelectItem value="chatboard">掲示板を見る</SelectItem>
          <SelectItem value="news">ニュースを見る</SelectItem>
          <SelectItem value="jobs/service-charges">
            サービスチャージについて調べる
          </SelectItem>
        </SelectContent>
      </Select>

      {value ? (
        <Button
          asChild
          className="ml-1 rounded-full px-5 text-xs font-semibold"
        >
          <Link href={`/${value}`}>Go</Link>
        </Button>
      ) : (
        <Button
          disabled
          className="ml-1 rounded-full px-5 text-xs font-semibold opacity-40 dark:opacity-30"
        >
          Go
        </Button>
      )}
    </div>
  );
}
