import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { sameNamePages } from "@/lib/same-name-pages";

/**
 * 同じ店・同じ名前を扱うほかのページへの案内。lib/same-name-pages.ts の表から引く。
 * 表に無いページでは何も描かない。
 */
export default function SameNamePages({
  currentHref,
  className = "",
}: {
  currentHref: string;
  className?: string;
}) {
  const pages = sameNamePages(currentHref);
  if (pages.length === 0) return null;

  return (
    <nav
      aria-label="同じ名前を扱うほかのページ"
      className={`rounded-xl border border-slate-200 p-4 dark:border-slate-700 ${className}`}
    >
      <p className="text-xs font-semibold text-muted-foreground">
        この名前を扱うほかのページ
      </p>
      <ul className="mt-2 space-y-2">
        {pages.map((p) => (
          <li key={p.href}>
            <Link
              href={p.href}
              className="group flex items-start justify-between gap-3 text-sm"
            >
              <span className="min-w-0">
                <span className="font-semibold text-sky-800 group-hover:underline dark:text-sky-300">
                  {p.label}
                </span>
                <span className="block text-xs text-muted-foreground">
                  {p.role}
                </span>
              </span>
              <ArrowRight className="mt-0.5 h-4 w-4 flex-none text-muted-foreground transition group-hover:translate-x-0.5" />
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
