"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import clsx from "clsx";

const categories = [
  "entertainment",
  "tour",
  "shop",
  "garden",
  "loyal",
  "historic",
];

export default function AttractionFilterBar() {
  const router = useRouter();
  const params = useSearchParams();

  const updateParam = (key: string, value: string | null) => {
    const newParams = new URLSearchParams(params.toString());
    if (value === null) newParams.delete(key);
    else newParams.set(key, value);
    router.push(`?${newParams.toString()}`);
  };

  const toggleBoolean = (key: string) => {
    const current = params.get(key);
    updateParam(key, current === "true" ? null : "true");
  };

  const toggleCategory = (cat: string) => {
    const current = params.get("category");
    const list = current ? current.split(",") : [];
    if (list.includes(cat)) {
      const next = list.filter((c) => c !== cat);
      updateParam("category", next.length ? next.join(",") : null);
    } else {
      updateParam("category", [...list, cat].join(","));
    }
  };

  const currentSort = params.get("sort") || "";
  const activeCategories = (params.get("category") || "").split(",");

  return (
    <div className="w-full bg-white/80 dark:bg-neutral-900/60 backdrop-blur-md p-5 rounded-xl shadow-sm border">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 左：並び順 + おすすめ度 */}
        <div className="space-y-4">
          {/* 並び順 */}
          <div>
            <h3 className="text-sm font-semibold mb-2 text-muted-foreground tracking-wide">
              並び順
            </h3>
            <div className="flex flex-wrap gap-2">
              {[
                { key: "name_asc", label: "名前昇順" },
                { key: "name_desc", label: "名前降順" },
                { key: "recommend_desc", label: "おすすめ順" },
              ].map((item) => (
                <Button
                  key={item.key}
                  variant={currentSort === item.key ? "default" : "secondary"}
                  size="sm"
                  className={clsx(
                    "px-3",
                    currentSort === item.key &&
                      "bg-blue-600 text-white dark:bg-blue-500"
                  )}
                  onClick={() =>
                    updateParam(
                      "sort",
                      currentSort === item.key ? null : item.key
                    )
                  }
                >
                  {item.label}
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          {/* おすすめ度 */}
          <div>
            <h3 className="text-sm font-semibold mb-2 text-muted-foreground tracking-wide">
              おすすめ度
            </h3>
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 4, 5].map((lv) => (
                <Badge
                  key={lv}
                  onClick={() =>
                    updateParam(
                      "rec",
                      params.get("rec") === String(lv) ? null : String(lv)
                    )
                  }
                  className={clsx(
                    "cursor-pointer px-3 py-1 text-sm border",
                    params.get("rec") === String(lv)
                      ? "bg-blue-600 text-white border-blue-600 dark:bg-blue-500"
                      : "bg-white text-gray-600 dark:text-white dark:bg-neutral-800"
                  )}
                >
                  ★ {lv}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* 右：Boolean + カテゴリ */}
        <div className="space-y-4">
          {/* Boolean */}
          <div>
            <h3 className="text-sm font-semibold mb-2 text-muted-foreground tracking-wide">
              特徴
            </h3>
            <div className="flex flex-wrap gap-2">
              {[
                { key: "mustSee", label: "Must See" },
                { key: "kids", label: "子供向け" },
                { key: "free", label: "無料" },
              ].map((item) => (
                <Button
                  key={item.key}
                  variant={
                    params.get(item.key) === "true" ? "default" : "outline"
                  }
                  size="sm"
                  className={clsx(
                    "px-3",
                    params.get(item.key) === "true" &&
                      "bg-blue-600 text-white dark:bg-blue-500 "
                  )}
                  onClick={() => toggleBoolean(item.key)}
                >
                  {item.label}
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          {/* カテゴリ */}
          <div>
            <h3 className="text-sm font-semibold mb-2 text-muted-foreground tracking-wide">
              カテゴリ
            </h3>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <Badge
                  key={cat}
                  onClick={() => toggleCategory(cat)}
                  className={clsx(
                    "cursor-pointer px-3 py-1 text-sm rounded-full border capitalize",
                    activeCategories.includes(cat)
                      ? "bg-blue-600 text-white border-blue-600 dark:bg-blue-500"
                      : "bg-white  text-gray-600 dark:text-white dark:bg-neutral-800"
                  )}
                >
                  {cat}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
