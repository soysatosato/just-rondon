"use client";

import type { ReactNode } from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

/**
 * 持ち時間の段を切り替えるタブ。
 *
 * 中身(panels)はサーバー側で描いたものを受け取り、選ばれていない段も
 * forceMount で HTML に残して CSS で隠す。Radix の既定のままだと
 * 選ばれていない段は描かれず、検索エンジンからは1時間の段しか見えなくなる。
 * 「◯◯ 所要時間」で来た人への答えは3つの段すべてなので、全部をページに置く。
 */
export default function TimeRouteTabs({
  labels,
  panels,
}: {
  labels: string[];
  panels: ReactNode[];
}) {
  return (
    <Tabs defaultValue="0">
      <TabsList className="h-auto w-full justify-start gap-1 overflow-x-auto">
        {labels.map((label, i) => (
          <TabsTrigger
            key={label}
            value={String(i)}
            className="flex-1 px-4 py-1.5 text-sm sm:flex-none"
          >
            {label}
          </TabsTrigger>
        ))}
      </TabsList>
      {panels.map((panel, i) => (
        <TabsContent
          key={labels[i]}
          value={String(i)}
          forceMount
          className="mt-5 data-[state=inactive]:hidden"
        >
          {panel}
        </TabsContent>
      ))}
    </Tabs>
  );
}
