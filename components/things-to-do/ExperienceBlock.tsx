import Link from "next/link";

import type { RailItem } from "@/utils/actions/home";
import PhotoTile from "@/components/shared/PhotoTile";

export type Experience = {
  /** セクションのトップ。 */
  href: string;
  /** 英語ラベル。番号の隣に小さく置く。 */
  eyebrow: string;
  /**
   * 見出しは動詞で書く。区分名(ミュージカル・買い物)を見出しにすると
   * ナビの複製になり、5枚が同じ重さの兄弟に見える。ここで読者が決めるのは
   * 「どの区分を読むか」ではなく「何をするか」なので、動詞のほうが速い。
   */
  verb: string;
  /** 動詞だけでは行き先が分からないので、区分名はリンクの側に出す。 */
  label: string;
  blurb: string;
  /** よく読まれる下層ページへの近道。多くても4本まで。 */
  links?: { href: string; label: string }[];
};

/**
 * 「体験する」ハブの1ブロック。
 *
 * 幅の広い wide と、2つ並べる compact の2形。ミュージカル・食事・買い物は
 * 単独で1ブロック、ブランドとお土産は横並びにしている。5つを同じ幅で
 * 縦に積むと、数週間前に予約しないと成立しない観劇と、当日ぶらっと見る
 * お土産が同じ重さで並ぶ。並び順(予約が要る順)は形にも出す。
 */
export default function ExperienceBlock({
  index,
  experience,
  items,
  variant = "wide",
}: {
  index: number;
  experience: Experience;
  items: RailItem[];
  variant?: "wide" | "compact";
}) {
  const { href, eyebrow, verb, label, blurb, links } = experience;

  const head = (
    <>
      <p className="flex items-center gap-2.5 text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
        <span className="text-amber-600 tabular-nums dark:text-amber-500">
          {String(index).padStart(2, "0")}
        </span>
        <span className="h-3 w-px shrink-0 bg-amber-500/60" />
        {eyebrow}
      </p>

      <h2
        className={`mt-2 font-bold tracking-tight ${
          variant === "wide" ? "text-2xl sm:text-3xl" : "text-xl sm:text-2xl"
        }`}
      >
        <Link href={href} className="underline-offset-4 hover:underline">
          {verb}
        </Link>
      </h2>

      <p className="mt-2.5 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
        {blurb}
      </p>

      <Link
        href={href}
        className="mt-3 inline-block text-xs font-bold text-amber-700 underline-offset-4 hover:underline dark:text-amber-500"
      >
        {label} をすべて見る →
      </Link>

      {links && links.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-2">
          {links.map((link) => (
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
    </>
  );

  if (variant === "compact") {
    return (
      <section className="border-t pt-7">
        {head}
        {/* 2列の格子。棚(横スクロール)にすると、横に2つ並べたときに
            スクロール領域が2つ隣り合って、どちらを触っているか分からなくなる。 */}
        {items.length > 0 && (
          <ul className="mt-5 grid grid-cols-2 gap-2.5">
            {items.slice(0, 4).map((item) => (
              <li key={item.href} className="aspect-[4/3]">
                <PhotoTile item={item} className="h-full w-full" />
              </li>
            ))}
          </ul>
        )}
      </section>
    );
  }

  return (
    <section className="border-t pt-8">
      <div className="grid gap-6 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-4">{head}</div>

        {items.length > 0 && (
          /*
            コンテナの左右パディングぶん外に出してから同じだけ内側に戻す。
            こうしないと横スクロールの右端が本文の右端で切れて、
            「まだ続きがある」ことが見えなくなる。
          */
          <div className="-mx-4 overflow-x-auto px-4 pb-1 lg:col-span-8 lg:mx-0 lg:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <ul className="flex snap-x snap-mandatory gap-2.5 sm:gap-3">
              {items.map((item) => (
                <li
                  key={item.href}
                  className="aspect-[3/4] w-[136px] shrink-0 snap-start sm:w-[158px]"
                >
                  <PhotoTile item={item} className="h-full w-full" />
                </li>
              ))}
              <li className="w-[136px] shrink-0 snap-start sm:w-[158px]">
                <Link
                  href={href}
                  className="group flex h-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed text-center transition hover:border-foreground/40 hover:bg-muted/50"
                >
                  <span className="px-3 text-xs font-semibold leading-snug">
                    {label}をすべて見る
                  </span>
                  <span className="text-lg text-muted-foreground transition group-hover:translate-x-0.5">
                    →
                  </span>
                </Link>
              </li>
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
