import Link from "next/link";
import type { Content } from "@prisma/client";
import { areaFacts, areaTagLabel } from "@/lib/area-taxonomy";

/**
 * 街1本ぶんのカード。
 *
 * 一覧で読者が探しているのは「自分が調べている街の名前」なので、
 * 英語名を見出しの上に置いて字を立てる。日本語タイトルは頭が
 * カタカナの街名で始まる約束(.claude/skills/add-area/SKILL.md)なので、
 * 英語名と合わせて「ここだ」と1秒で分かる。
 *
 * 上端の色帯は slug から決める。並び順やページ送りで色が変わらないように
 * するためで、意味は持たせていない。
 */

const ACCENTS = [
  {
    stripe: "bg-indigo-500",
    wrap: "hover:border-indigo-300 dark:hover:border-indigo-800",
    more: "text-indigo-600 dark:text-indigo-400",
  },
  {
    stripe: "bg-cyan-500",
    wrap: "hover:border-cyan-300 dark:hover:border-cyan-800",
    more: "text-cyan-600 dark:text-cyan-400",
  },
  {
    stripe: "bg-teal-500",
    wrap: "hover:border-teal-300 dark:hover:border-teal-800",
    more: "text-teal-600 dark:text-teal-400",
  },
  {
    stripe: "bg-sky-500",
    wrap: "hover:border-sky-300 dark:hover:border-sky-800",
    more: "text-sky-600 dark:text-sky-400",
  },
];

/** slug から色を選ぶ。並び順が変わっても街の色が変わらないようにするだけ。 */
function accentOf(slug: string) {
  let sum = 0;
  for (let i = 0; i < slug.length; i++) sum = (sum + slug.charCodeAt(i)) % 1000;
  return ACCENTS[sum % ACCENTS.length];
}

export default function AreaCard({ item }: { item: Content }) {
  const accent = accentOf(item.slug);
  const facts = areaFacts(item);
  const meta = [facts.zone ? `ゾーン${facts.zone}` : null, facts.borough]
    .filter(Boolean)
    .join(" ・ ");

  return (
    <Link
      href={`/areas/${item.slug}`}
      className={`group flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900/70 ${accent.wrap}`}
    >
      <div className={`h-1.5 w-full shrink-0 ${accent.stripe}`} />

      {item.image && (
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
          <img
            src={item.image}
            alt=""
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            loading="lazy"
            decoding="async"
            fetchPriority="low"
          />
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col px-5 pb-5 pt-4">
        {item.engTitle && (
          <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            {item.engTitle}
          </p>
        )}

        <h3 className="mt-1.5 line-clamp-4 text-[15px] font-bold leading-snug tracking-tight text-foreground">
          {item.title}
        </h3>

        {meta && (
          <p className="mt-2 text-[11px] text-muted-foreground">{meta}</p>
        )}

        {item.summary && (
          <p className="mt-2.5 line-clamp-3 text-xs leading-relaxed text-muted-foreground">
            {item.summary}
          </p>
        )}

        {item.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {item.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
              >
                {areaTagLabel(tag)}
              </span>
            ))}
          </div>
        )}

        <p
          className={`mt-auto pt-4 text-right text-xs font-semibold transition-transform duration-200 group-hover:translate-x-0.5 ${accent.more}`}
        >
          この街を読む →
        </p>
      </div>
    </Link>
  );
}
