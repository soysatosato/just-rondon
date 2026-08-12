import Link from "next/link";
import { ArrowRight } from "lucide-react";

/**
 * 同じ館を扱うもう片方のページへの導線。
 *
 * /museums と /sightseeing に同じ館のページが2本あるため、片方だけを読んだ
 * 読者がもう片方の情報（観光側は周辺スポットとの組み立て、美術館側は
 * 注目作品・所要時間・開館時間）を取りこぼさないようにする。
 *
 * 何が向こうにあるのかを書く。「関連ページ」とだけ置くと、読者は
 * 同じ内容の焼き直しだと判断して踏まない。
 */
export default function CrossSectionLink({
  href,
  eyebrow,
  title,
  description,
}: {
  href: string;
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-4 rounded-2xl border border-border
        bg-gradient-to-br from-indigo-50 via-background to-sky-50 p-5
        transition hover:border-neutral-400 hover:shadow-md
        dark:from-indigo-950/30 dark:via-background dark:to-sky-950/20"
    >
      <div className="min-w-0 flex-1 space-y-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {eyebrow}
        </p>
        <p className="text-base font-semibold tracking-tight group-hover:underline">
          {title}
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
      <ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1" />
    </Link>
  );
}
