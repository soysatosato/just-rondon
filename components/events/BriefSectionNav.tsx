import { cn } from "@/lib/utils";

export interface BriefNavSection {
  anchor: string;
  label: string;
  count: number;
  chipClass: string;
}

/**
 * 号のセクションを飛べるナビ。
 *
 * 1号は縦に長くなるので、狭い画面ではスクロールだけで目当ての情報に辿り着けない。
 * 件数を添えることで、開く前に「今週は注意が何件あるか」が分かるようにもしている。
 * ページ内リンクだけなのでクライアントJSは要らない。
 */
export default function BriefSectionNav({
  sections,
}: {
  sections: BriefNavSection[];
}) {
  if (sections.length < 2) return null;

  return (
    <nav
      aria-label="この号の内容"
      className="sticky top-0 z-30 -mx-4 mb-8 border-y border-border bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75 dark:border-neutral-800"
    >
      {/* 狭い画面では横スクロールさせ、折り返して2段になるのを避ける。 */}
      <ul className="flex snap-x gap-2 overflow-x-auto px-4 py-2.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {sections.map((section) => (
          <li key={section.anchor} className="snap-start">
            <a
              href={`#${section.anchor}`}
              className={cn(
                "inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors hover:opacity-80",
                section.chipClass
              )}
            >
              {section.label}
              <span className="tabular-nums opacity-70">{section.count}</span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
