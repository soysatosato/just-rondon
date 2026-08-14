"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import LiveBadge from "@/components/live/LiveBadge";
import type { LineStatus, SeverityLevel, TflStatusResult } from "@/lib/tfl/status";

/**
 * 地下鉄・DLR・エリザベス線・オーバーグラウンドの運行状況。
 *
 * クライアント側で取得している理由:
 * このページは静的生成されるので、サーバーで取ると「ビルドした時点の
 * 運行状況」が永久に貼り付く。それは無いより悪い。マウント時に
 * 実際に取りに行き、取得できなければ何も出さない。
 *
 * 平常運転の路線は既定で畳んでいる。旅行者が知りたいのは
 * 「今日どこが止まっているか」だけで、全11路線の平常運転を
 * 読み下したい人はいない。
 */

const LEVEL_STYLE: Record<SeverityLevel, { dot: string; text: string }> = {
  good: {
    dot: "bg-emerald-500",
    text: "text-emerald-700 dark:text-emerald-300",
  },
  minor: {
    dot: "bg-amber-500",
    text: "text-amber-700 dark:text-amber-300",
  },
  severe: {
    dot: "bg-red-500",
    text: "text-red-700 dark:text-red-300",
  },
};

function StatusRow({ line }: { line: LineStatus }) {
  const style = LEVEL_STYLE[line.level];

  return (
    <li className="flex flex-col gap-1 py-2.5">
      <div className="flex items-center gap-2.5">
        <span
          aria-hidden="true"
          className={`size-2.5 shrink-0 rounded-full ${style.dot}`}
        />
        <span className="font-medium text-gray-900 dark:text-gray-100">
          {line.name}
        </span>
        <span className={`ml-auto text-sm font-semibold ${style.text}`}>
          {line.label}
        </span>
      </div>
      {line.reason && (
        <p className="pl-[1.25rem] text-xs leading-relaxed text-gray-600 dark:text-gray-400">
          {line.reason}
        </p>
      )}
    </li>
  );
}

export default function TflStatusWidget() {
  const [data, setData] = useState<TflStatusResult | null>(null);
  const [failed, setFailed] = useState(false);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    let alive = true;

    fetch("/api/tfl-status")
      .then((res) => {
        if (!res.ok) throw new Error(String(res.status));
        return res.json();
      })
      .then((json: TflStatusResult) => {
        if (alive) setData(json);
      })
      .catch(() => {
        if (alive) setFailed(true);
      });

    // アンマウント後に setState しないためのフラグ。
    return () => {
      alive = false;
    };
  }, []);

  // 取得に失敗したらウィジェットごと消す。
  // 「運行状況を取得できません」という空箱を出しても読者の役に立たない。
  if (failed) return null;

  if (!data) {
    return (
      <Card className="border-gray-200 dark:border-gray-800">
        <CardContent className="p-5">
          <div className="h-5 w-40 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
          <div className="mt-4 space-y-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-4 w-full animate-pulse rounded bg-gray-100 dark:bg-gray-900"
              />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const disrupted = data.lines.filter((l) => l.level !== "good");
  const normal = data.lines.filter((l) => l.level === "good");
  const visible = showAll ? data.lines : disrupted;

  return (
    <Card className="border-gray-200 dark:border-gray-800">
      <CardContent className="p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">
            現在の運行状況
          </h2>
          <LiveBadge fetchedAt={data.fetchedAt} />
        </div>

        {disrupted.length === 0 ? (
          <p className="mt-3 flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-300">
            <span
              aria-hidden="true"
              className="size-2.5 shrink-0 rounded-full bg-emerald-500"
            />
            全路線が平常運転です。
          </p>
        ) : (
          <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
            {disrupted.length}路線に乱れが出ています。
          </p>
        )}

        {visible.length > 0 && (
          <ul className="mt-2 divide-y divide-gray-100 dark:divide-gray-800">
            {visible.map((line) => (
              <StatusRow key={line.id} line={line} />
            ))}
          </ul>
        )}

        {normal.length > 0 && (
          <button
            type="button"
            onClick={() => setShowAll((v) => !v)}
            className="mt-3 text-sm font-medium text-blue-700 underline-offset-2 hover:underline dark:text-blue-400"
          >
            {showAll
              ? "乱れている路線だけ表示"
              : `平常運転の${normal.length}路線も表示`}
          </button>
        )}

        <p className="mt-4 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
          出典:{" "}
          <a
            href="https://tfl.gov.uk/tube-dlr-overground/status/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2"
          >
            Transport for London
          </a>
          。数分ごとに更新しています。駅の閉鎖や当日の詳細は必ず公式でも確認してください。
        </p>
      </CardContent>
    </Card>
  );
}
