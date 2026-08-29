import Link from "next/link";
import JsonLd from "@/components/seo/JsonLd";
import Breadcrumbs from "@/components/navigation/Breadcrumbs";
import { breadcrumbListJsonLd, type BreadcrumbPath } from "@/components/navigation/tree";
import { absoluteUrl } from "@/lib/seo";

/**
 * ナビの大区分そのもののハブページ。現在の利用は /living のみ。
 *
 * パンくずを「Home > 大区分 > セクション」に揃えたことで、大区分は
 * 全ページの親としてリンクされるようになった。リンク先が無い区分が
 * 残ると押せないパンくずになるため、区分にも実ページを持たせている。
 *
 * 中身は配下セクションの索引に徹する。ここで解説を始めると各セクションの
 * トップと同じことを書くことになり、どちらを読ませたいのか分からなくなる。
 *
 * かつては /things-to-do も同じ索引で描いていたが、あちらは配下の実体が
 * すべて写真つきで DB にあり、索引にすると最も絵になる区分が最も文字だけの
 * ページになっていたため、専用の組みに移した(app/(with-ads)/things-to-do)。
 * ここが索引のままでよいのは、ビザ・住まい・口座に見せる写真が無く、
 * 読者も「どれを読むか」ではなく手続きを探して来るため。
 */

export type HubSection = {
  /** セクションのトップ。 */
  href: string;
  /** 英語ラベル。カードの上に小さく置く。 */
  eyebrow: string;
  label: string;
  /** そのセクションが何を扱うかの一文。他と役割が被らない書き方をする。 */
  blurb: string;
  /** よく読まれる下層ページへの近道。多くても4本まで。 */
  links?: { href: string; label: string }[];
};

export default function SectionHub({
  path,
  eyebrow,
  title,
  lead,
  sections,
  aside,
}: {
  path: BreadcrumbPath;
  eyebrow: string;
  title: string;
  lead: string;
  sections: HubSection[];
  /** 区分をまたぐ関連リンク。無ければ省く。 */
  aside?: { heading: string; note: string; links: { href: string; label: string }[] };
}) {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8 md:py-10">
      <JsonLd data={breadcrumbListJsonLd({ path })} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "@id": `${absoluteUrl(path)}#collection`,
          name: title,
          description: lead,
          inLanguage: "ja",
          url: absoluteUrl(path),
          hasPart: sections.map((section) => ({
            "@type": "WebPage",
            name: section.label,
            description: section.blurb,
            url: absoluteUrl(section.href),
          })),
        }}
      />

      <Breadcrumbs path={path} />

      <header className="mt-6 border-y-2 border-foreground/80 py-5">
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">
              {eyebrow}
            </p>
            <h1 className="mt-1.5 text-3xl font-bold leading-none tracking-tight md:text-5xl">
              {title}
            </h1>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
            {lead}
          </p>
        </div>
      </header>

      {/*
        カードを並べず、罫線で区切った索引にする。区分ハブに来る読者は
        「どれを読むか」をまだ決めていないので、写真より一覧性を優先する。
      */}
      <ol className="mt-2 divide-y divide-border">
        {sections.map((section, i) => (
          <li key={section.href} className="py-6">
            <div className="flex gap-4 sm:gap-6">
              <span className="mt-1 w-6 shrink-0 text-sm font-bold tabular-nums text-muted-foreground/60">
                {String(i + 1).padStart(2, "0")}
              </span>

              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  {section.eyebrow}
                </p>

                <h2 className="mt-1 text-xl font-bold tracking-tight md:text-2xl">
                  <Link
                    href={section.href}
                    className="underline-offset-4 hover:underline"
                  >
                    {section.label}
                  </Link>
                </h2>

                <p className="mt-2 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                  {section.blurb}
                </p>

                {section.links && section.links.length > 0 && (
                  <ul className="mt-3 flex flex-wrap gap-x-2 gap-y-2">
                    {section.links.map((link) => (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          className="inline-block rounded-full border border-border px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </li>
        ))}
      </ol>

      {aside && (
        <section className="mt-8 rounded-lg border border-border bg-muted/40 p-5">
          <h2 className="text-sm font-bold">{aside.heading}</h2>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            {aside.note}
          </p>
          <ul className="mt-3 flex flex-wrap gap-x-2 gap-y-2">
            {aside.links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="inline-block rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
