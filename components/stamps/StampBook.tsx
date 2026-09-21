import Link from "next/link";
import { MapPin, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  formatStampDate,
  STAMP_META,
  STAMP_TYPES,
  type StampType,
} from "@/lib/stamps";

/**
 * スタンプ帳の中身。/stamps だけが使う表示。
 *
 * 種別ごとに区切って、それぞれ「押した数 / 掲載数」を出す。分母を出すのは、
 * 12個押した人に「あと172ある」と見せるため。数字を隠すと、スタンプ帳は
 * 貯まったものを眺めるだけの場所になり、次にどこへ行くかの話にならない。
 *
 * 押していないものを一覧に並べはしない。観光スポットだけで184件あり、
 * 未達のマスを全部出すと、押した12個がその中に埋もれる。行き先を探す
 * 機能は一覧ページ側が持っているので、そこへのリンクだけを添える。
 */

export type StampBookEntry = {
  id: string;
  type: StampType;
  slug: string;
  name: string;
  image: string;
  /** ISO 文字列。押した日時で、訪問日ではない。 */
  stampedAt: string;
  onSite: boolean;
};

function StampMark({ entry }: { entry: StampBookEntry }) {
  const meta = STAMP_META[entry.type];
  return (
    <Link
      href={meta.path(entry.slug)}
      className="group flex flex-col items-center gap-2 text-center"
    >
      <div
        className={cn(
          // 破線の二重丸で、押されたスタンプらしい見た目にする。
          "relative rounded-full border-2 border-dashed p-1 transition group-hover:scale-105",
          entry.onSite
            ? "border-amber-500 bg-amber-500/5"
            : "border-rose-500 bg-rose-500/5",
        )}
      >
        <img
          src={entry.image}
          alt=""
          className="h-16 w-16 rounded-full object-cover sm:h-20 sm:w-20"
          loading="lazy"
        />
        {entry.onSite && (
          <span
            className="absolute -right-1 -top-1 rounded-full bg-amber-500 p-1 text-white shadow"
            title={meta.onSiteLabel}
          >
            <Sparkles className="h-3 w-3" aria-hidden />
          </span>
        )}
      </div>
      <span className="line-clamp-2 text-xs font-medium leading-tight group-hover:underline">
        {entry.name}
      </span>
      <span className="text-[10px] text-muted-foreground">
        {formatStampDate(entry.stampedAt)}
      </span>
    </Link>
  );
}

function Section({
  type,
  entries,
  total,
}: {
  type: StampType;
  entries: StampBookEntry[];
  total: number;
}) {
  const meta = STAMP_META[type];
  const percent = total > 0 ? Math.round((entries.length / total) * 100) : 0;

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <h2 className="text-lg font-semibold">{meta.label}</h2>
        <p className="text-sm text-muted-foreground">
          <span className="text-base font-semibold text-foreground">
            {entries.length}
          </span>
          <span className="mx-0.5">/</span>
          {total}
        </p>
      </div>

      {/* 進捗。数字だけだと「184分の12」の位置が掴めない。 */}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-rose-500"
          style={{ width: `${percent}%` }}
        />
      </div>

      {entries.length > 0 ? (
        <div className="grid grid-cols-3 gap-x-3 gap-y-6 sm:grid-cols-4 md:grid-cols-6">
          {entries.map((entry) => (
            <StampMark key={entry.id} entry={entry} />
          ))}
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-border px-4 py-6 text-sm text-muted-foreground">
          {meta.emptyHint}
        </p>
      )}

      <Link
        href={meta.hubHref}
        className="inline-block text-xs font-semibold text-rose-600 hover:underline dark:text-rose-400"
      >
        {meta.label}の一覧を見る →
      </Link>
    </section>
  );
}

export default function StampBook({
  entries,
  totals,
}: {
  entries: StampBookEntry[];
  totals: Record<StampType, number>;
}) {
  const onSiteCount = entries.filter((e) => e.onSite).length;

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-2xl border border-border px-5 py-4">
        <p className="text-sm text-muted-foreground">
          スタンプ
          <span className="mx-1.5 text-2xl font-semibold text-foreground">
            {entries.length}
          </span>
          個
        </p>
        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Sparkles className="h-4 w-4 text-amber-500" aria-hidden />
          うち現地で押した金スタンプ
          <span className="mx-0.5 text-base font-semibold text-foreground">
            {onSiteCount}
          </span>
          個
        </p>
      </div>

      {STAMP_TYPES.map((type) => (
        <Section
          key={type}
          type={type}
          entries={entries.filter((e) => e.type === type)}
          total={totals[type]}
        />
      ))}

      <p className="flex items-start gap-2 border-t border-border pt-6 text-xs leading-relaxed text-muted-foreground">
        <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
        金のスタンプは、その場所の近くで位置情報を付けて押したときだけ付きます。
        先に押しておいた赤いスタンプも、現地で押し直せば金になります。
      </p>
    </div>
  );
}
