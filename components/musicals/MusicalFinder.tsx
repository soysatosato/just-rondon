"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Clock, Filter, Languages, RotateCcw, Users } from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  ENGLISH_FORM_LABELS,
  formatRuntime,
  isEnglishForm,
  type EnglishForm,
} from "./facts";
import type { BrowseMusical } from "./browse-types";

/**
 * 「どれを観るか」を絞り込む。
 *
 * 既存の検索欄が答えていたのは「作品名を知っている人」の問いだけだった。
 * 初めてロンドンで観劇する人の実際の問いは
 * 「英語が不安」「子どもと行く」「夕食まで2時間しかない」で、
 * どれも作品名を知らないところから始まる。その3つを軸にする。
 *
 * 未確認(null)の作品を「該当しない」として黙って落とさないこと。
 * 情報が無いことと条件に合わないことは違う。絞り込んだ結果、
 * 落ちた作品があれば件数で伝える。
 */

type RuntimeFilter = "any" | "under120" | "under150";
type EnglishFilter = "any" | "low" | "songLed";
type AgeFilter = "any" | "kids";

const RUNTIME_LABELS: Record<RuntimeFilter, string> = {
  any: "指定なし",
  under120: "2時間以内",
  under150: "2時間30分以内",
};

const ENGLISH_LABELS: Record<EnglishFilter, string> = {
  any: "指定なし",
  low: "台詞に頼らない",
  songLed: "歌が中心",
};

const AGE_LABELS: Record<AgeFilter, string> = {
  any: "指定なし",
  kids: "子どもと観られる",
};

/** 「子どもと観られる」の上限。これ以下の推奨年齢を子ども向けとみなす。 */
const KIDS_MAX_AGE = 8;

function matchesRuntime(m: BrowseMusical, filter: RuntimeFilter): boolean {
  if (filter === "any") return true;
  if (m.runtimeMinutes === null) return false;
  return m.runtimeMinutes <= (filter === "under120" ? 120 : 150);
}

function matchesEnglish(m: BrowseMusical, filter: EnglishFilter): boolean {
  if (filter === "any") return true;
  if (!isEnglishForm(m.englishForm)) return false;

  const form: EnglishForm = m.englishForm;
  // 「台詞に頼らない」は non-verbal のみ。sung-through を混ぜないのは、
  // 歌詞が聞き取れないと筋を見失う作品が含まれてしまうため。
  if (filter === "low") return form === "non-verbal";
  return form === "sung-through" || form === "non-verbal";
}

function matchesAge(m: BrowseMusical, filter: AgeFilter): boolean {
  if (filter === "any") return true;
  if (m.minAgeGuidance === null) return false;
  return m.minAgeGuidance <= KIDS_MAX_AGE;
}

export default function MusicalFinder({
  musicals,
}: {
  musicals: BrowseMusical[];
}) {
  const [runtime, setRuntime] = useState<RuntimeFilter>("any");
  const [english, setEnglish] = useState<EnglishFilter>("any");
  const [age, setAge] = useState<AgeFilter>("any");

  const isFiltering = runtime !== "any" || english !== "any" || age !== "any";

  const { matched, unknownCount } = useMemo(() => {
    const matched = musicals.filter(
      (m) =>
        matchesRuntime(m, runtime) &&
        matchesEnglish(m, english) &&
        matchesAge(m, age),
    );

    // 絞り込みに使った項目が未確認なせいで落ちた作品を数える。
    // 「条件に合わない」ではなく「情報が無い」ことを読者に伝えるため。
    const unknownCount = musicals.filter((m) => {
      if (matched.includes(m)) return false;
      const runtimeUnknown = runtime !== "any" && m.runtimeMinutes === null;
      const englishUnknown = english !== "any" && !isEnglishForm(m.englishForm);
      const ageUnknown = age !== "any" && m.minAgeGuidance === null;
      return runtimeUnknown || englishUnknown || ageUnknown;
    }).length;

    return { matched, unknownCount };
  }, [musicals, runtime, english, age]);

  const reset = () => {
    setRuntime("any");
    setEnglish("any");
    setAge("any");
  };

  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold sm:text-2xl">
            <Filter className="h-5 w-5 text-primary" />
            条件から作品を探す
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            英語が不安、子どもと行く、時間が限られている。
            当てはまるものを選ぶと候補が絞れます。
          </p>
        </div>
        {isFiltering && (
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground transition hover:bg-muted"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            条件をクリア
          </button>
        )}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
        <FilterGroup
          icon={Languages}
          label="英語のハードル"
          options={ENGLISH_LABELS}
          value={english}
          onChange={setEnglish}
        />
        <FilterGroup
          icon={Users}
          label="一緒に観る人"
          options={AGE_LABELS}
          value={age}
          onChange={setAge}
        />
        <FilterGroup
          icon={Clock}
          label="上演時間"
          options={RUNTIME_LABELS}
          value={runtime}
          onChange={setRuntime}
        />
      </div>

      {isFiltering && (
        <div className="mt-6 border-t border-border pt-5">
          <p className="text-sm text-muted-foreground">
            条件に合う作品：
            <span className="font-semibold text-foreground">
              {matched.length}件
            </span>
            {unknownCount > 0 && (
              <span className="ml-2 text-xs">
                （ほか{unknownCount}件は、絞り込みに使った情報が未確認のため
                除いています）
              </span>
            )}
          </p>

          {matched.length === 0 ? (
            <p className="mt-4 rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              条件に合う作品がありません。条件を減らしてお試しください。
            </p>
          ) : (
            <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {matched.map((m) => (
                <li key={m.id}>
                  <MatchCard musical={m} />
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}

function FilterGroup<T extends string>({
  icon: Icon,
  label,
  options,
  value,
  onChange,
}: {
  icon: React.ElementType;
  label: string;
  options: Record<T, string>;
  value: T;
  onChange: (v: T) => void;
}) {
  const entries = Object.entries(options) as [T, string][];

  return (
    <div>
      <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </p>
      <div className="mt-2.5 flex flex-wrap gap-2">
        {entries.map(([key, text]) => (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            aria-pressed={value === key}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
              value === key
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-transparent text-muted-foreground hover:bg-muted",
            )}
          >
            {text}
          </button>
        ))}
      </div>
    </div>
  );
}

function MatchCard({ musical }: { musical: BrowseMusical }) {
  const runtime = formatRuntime(
    musical.runtimeMinutes,
    musical.intervalMinutes,
  );
  const form = isEnglishForm(musical.englishForm) ? musical.englishForm : null;

  return (
    <Link
      href={`/musicals/${musical.slug}`}
      className="group flex h-full flex-col rounded-xl border border-border bg-background p-4 transition hover:border-primary hover:shadow-sm"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="font-semibold leading-snug">{musical.name}</span>
        {musical.mustSee && (
          <Badge className="shrink-0 border-transparent bg-rose-600 text-white">
            Must See
          </Badge>
        )}
      </div>
      <span className="mt-0.5 text-xs text-muted-foreground">
        {musical.engName}
      </span>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {runtime && (
          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-[11px] text-muted-foreground">
            <Clock className="h-3 w-3" />
            {runtime}
          </span>
        )}
        {musical.minAgeGuidance !== null && (
          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-[11px] text-muted-foreground">
            <Users className="h-3 w-3" />
            {musical.minAgeGuidance}歳〜
          </span>
        )}
        {form && (
          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-[11px] text-muted-foreground">
            <Languages className="h-3 w-3" />
            {ENGLISH_FORM_LABELS[form]}
          </span>
        )}
      </div>
    </Link>
  );
}
