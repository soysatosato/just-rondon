import { cn } from "@/lib/utils";

export interface BriefNavSection {
  anchor: string;
  label: string;
  count: number;
  /** 見出しの色を丸で示す。塗りのチップより静かで、罫の並びに馴染む。 */
  dotClass: string;
}

/**
 * 号のセクションを飛べるナビ。
 *
 * 1号は縦に長くなるので、狭い画面ではスクロールだけで目当ての情報に辿り着けない。
 * 件数を添えることで、開く前に「今週は注意が何件あるか」が分かるようにもしている。
 * ページ内リンクだけなのでクライアントJSは要らない。
 *
 * 以前は色で塗った丸いチップを並べていた。項目側のチップと同じ形だったため、
 * ナビなのか内容なのかが形から区別できなかった。ここは細罫で区切った
 * 文字の並びにして、目次であることを形で示す。
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
      className="sticky top-0 z-30 -mx-4 mb-10 border-b border-foreground/15 bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75"
    >
      {/* 狭い画面では横スクロールさせ、折り返して2段になるのを避ける。 */}
      <ul className="flex snap-x items-stretch overflow-x-auto px-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <li className="hidden shrink-0 items-center pr-5 sm:flex">
          <span className="font-serif text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Contents
          </span>
        </li>
        {sections.map((section) => (
          <li key={section.anchor} className="shrink-0 snap-start">
            <a
              href={`#${section.anchor}`}
              className="flex h-full items-center gap-2 border-l border-border px-4 py-3 text-xs font-bold transition-colors hover:bg-muted/60 dark:border-neutral-800 dark:hover:bg-neutral-900"
            >
              <span
                aria-hidden
                className={cn(
                  "inline-block h-1.5 w-1.5 shrink-0 rounded-full",
                  section.dotClass
                )}
              />
              <span className="whitespace-nowrap dark:text-gray-200">
                {section.label}
              </span>
              <span className="font-serif text-sm tabular-nums text-muted-foreground">
                {section.count}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
