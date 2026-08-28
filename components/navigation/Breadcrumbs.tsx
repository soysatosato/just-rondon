import Link from "next/link";
import { cn } from "@/lib/utils";
import { resolveCrumbs, type BreadcrumbSpec } from "./tree";

/**
 * サイト共通のパンくず。階層は components/navigation/tree.ts が持つ。
 *
 *   <Breadcrumbs path="/column" />                     Home > 英国を読む > コラム
 *   <Breadcrumbs path="/column" current={title} />     …> コラム > 記事タイトル
 *
 * 折り返さず横スクロールさせる。日本語のタイトルは長く、旧実装の
 * flex-wrap ではスマホで3行に膨らんで記事の見出しを押し下げていた。
 * 各項目は CSS で省略する。呼び出し側で name.slice(0, 7) + "..." のような
 * 切り詰めを書かないこと(文字数が合わず途中で切れる場所がばらついていた)。
 */
export default function Breadcrumbs({
  className,
  ...spec
}: BreadcrumbSpec & { className?: string }) {
  const crumbs = resolveCrumbs(spec);

  return (
    <nav
      aria-label="パンくずリスト"
      className={cn(
        "-mx-1 overflow-x-auto px-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        className
      )}
    >
      <ol className="flex w-max items-center gap-1.5 text-xs leading-6 text-muted-foreground sm:gap-2 sm:text-[13px]">
        {crumbs.map((crumb, i) => {
          const isCurrent = i === crumbs.length - 1;

          return (
            <li key={`${crumb.label}-${i}`} className="flex items-center gap-1.5 sm:gap-2">
              {i > 0 && (
                <span aria-hidden className="select-none text-muted-foreground/40">
                  /
                </span>
              )}

              {isCurrent || !crumb.href ? (
                <span
                  aria-current={isCurrent ? "page" : undefined}
                  className="inline-block max-w-[11rem] truncate align-bottom font-medium text-foreground sm:max-w-[20rem]"
                >
                  {crumb.label}
                </span>
              ) : (
                <Link
                  href={crumb.href}
                  className="inline-block max-w-[8rem] truncate align-bottom underline-offset-4 transition-colors hover:text-foreground hover:underline sm:max-w-[14rem]"
                >
                  {crumb.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
