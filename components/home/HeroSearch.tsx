"use client";

import { useState } from "react";
import Link from "next/link";
import {
  MapPin,
  Ticket,
  Landmark,
  Drama,
  Stamp,
  KeyRound,
  BriefcaseBusiness,
  Newspaper,
  History,
  Radio,
  MessageSquareText,
  Search,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectLabel,
  SelectItem,
  SelectSeparator,
} from "@/components/ui/select";

export default function HeroSearch() {
  const [value, setValue] = useState("");

  return (
    <div className="mx-auto flex max-w-xl items-center gap-1.5 rounded-full border bg-white/95 dark:bg-slate-900/90 p-1.5 shadow-lg shadow-slate-900/10 dark:shadow-black/40 backdrop-blur">
      <Search className="ml-3 h-4 w-4 shrink-0 text-muted-foreground" />

      <Select value={value} onValueChange={setValue}>
        <SelectTrigger className="h-9 border-none bg-transparent text-sm text-slate-900 dark:text-slate-100 focus-visible:ring-0 w-full px-2 py-1 [&>svg]:hidden">
          <SelectValue placeholder="行き先やジャンルを選んで探す…" />
        </SelectTrigger>

        <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
          <SelectGroup>
            <SelectLabel className="text-[10px] uppercase tracking-wider text-muted-foreground">
              観光を探す
            </SelectLabel>
            <SelectItem value="sightseeing">
              <span className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-red-600" />
                観光スポットを探す
              </span>
            </SelectItem>
            <SelectItem value="sightseeing/all?category=tour">
              <span className="flex items-center gap-2">
                <Ticket className="h-3.5 w-3.5 text-red-600" />
                ツアーを見る
              </span>
            </SelectItem>
            <SelectItem value="museums">
              <span className="flex items-center gap-2">
                <Landmark className="h-3.5 w-3.5 text-red-600" />
                美術館を探す
              </span>
            </SelectItem>
            <SelectItem value="musicals">
              <span className="flex items-center gap-2">
                <Drama className="h-3.5 w-3.5 text-red-600" />
                ミュージカルを探す
              </span>
            </SelectItem>
          </SelectGroup>

          <SelectSeparator />

          <SelectGroup>
            <SelectLabel className="text-[10px] uppercase tracking-wider text-muted-foreground">
              旅の準備
            </SelectLabel>
            <SelectItem value="sightseeing/eta-uk-visa-guide">
              <span className="flex items-center gap-2">
                <Stamp className="h-3.5 w-3.5 text-sky-600" />
                ETA（電子渡航認証）
              </span>
            </SelectItem>
          </SelectGroup>

          <SelectSeparator />

          <SelectGroup>
            <SelectLabel className="text-[10px] uppercase tracking-wider text-muted-foreground">
              住む・働く
            </SelectLabel>
            <SelectItem value="visa">
              <span className="flex items-center gap-2">
                <Stamp className="h-3.5 w-3.5 text-emerald-600" />
                ビザガイド トップ
              </span>
            </SelectItem>
            <SelectItem value="housing">
              <span className="flex items-center gap-2">
                <KeyRound className="h-3.5 w-3.5 text-emerald-600" />
                住まい探しガイド トップ
              </span>
            </SelectItem>
            <SelectItem value="jobs">
              <span className="flex items-center gap-2">
                <BriefcaseBusiness className="h-3.5 w-3.5 text-emerald-600" />
                労働問題ガイド トップ
              </span>
            </SelectItem>
          </SelectGroup>

          <SelectSeparator />

          <SelectGroup>
            <SelectLabel className="text-[10px] uppercase tracking-wider text-muted-foreground">
              英国を読む
            </SelectLabel>
            <SelectItem value="column">
              <span className="flex items-center gap-2">
                <Newspaper className="h-3.5 w-3.5 text-violet-600" />
                コラム
              </span>
            </SelectItem>
            <SelectItem value="modern-britain">
              <span className="flex items-center gap-2">
                <Radio className="h-3.5 w-3.5 text-violet-600" />
                いまのイギリス
              </span>
            </SelectItem>
            <SelectItem value="history">
              <span className="flex items-center gap-2">
                <History className="h-3.5 w-3.5 text-violet-600" />
                イギリスの歴史
              </span>
            </SelectItem>
            <SelectItem value="british-english">
              <span className="flex items-center gap-2">
                <MessageSquareText className="h-3.5 w-3.5 text-violet-600" />
                イギリス英語
              </span>
            </SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>

      {value ? (
        <Button
          asChild
          className="mr-0.5 rounded-full px-5 text-xs font-semibold"
        >
          <Link href={`/${value}`}>Go</Link>
        </Button>
      ) : (
        <Button
          disabled
          className="mr-0.5 rounded-full px-5 text-xs font-semibold opacity-40 dark:opacity-30"
        >
          Go
        </Button>
      )}
    </div>
  );
}
