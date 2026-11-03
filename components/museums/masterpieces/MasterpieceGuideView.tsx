import Link from "next/link";
import ImageCredit from "@/components/shared/ImageCredit";
import MasterpieceStatus from "@/components/museums/masterpieces/MasterpieceStatus";
import {
  formatCheckedOn,
  masterpieceMuseumNote,
  type MasterpieceGuide,
} from "@/lib/masterpieces";
import type { LivePlacementResult } from "@/lib/masterpieces/national-gallery";
import { TIME_ROUTE_ANCHOR, timeRouteForMuseum } from "@/lib/time-routes";
import { responsiveImage } from "@/lib/wikimedia-image";

/**
 * 名作ページの本文。作品ページ(app/museums/[slug]/artworks/[id])のうち、
 * lib/masterpieces に本文がある作品だけがこれで描かれる。
 *
 * 並びは読者の問いの順。「どこにあるか・いま見られるか」→ 写真 →
 * 行き方 → 何を見るか → 背景。本文はプレーンテキスト(マークダウンは描かない)。
 */

const sectionClass = "rounded-xl border border-border bg-card p-5";
const headingClass =
  "mb-3 border-b border-border pb-2 text-lg font-bold tracking-tight md:text-xl";
const linkClass =
  "font-medium text-link underline underline-offset-2 hover:opacity-80 dark:text-blue-400";

/** 写真の枠の幅(max-w-3xl の本文の列いっぱい、縦長の絵は高さで抑える)。 */
const PHOTO_SIZES = "(min-width: 800px) 640px, 100vw";

export default function MasterpieceGuideView({
  guide,
  museumName,
  engTitle,
  live,
}: {
  guide: MasterpieceGuide;
  museumName: string;
  engTitle: string | null;
  live: LivePlacementResult | null;
}) {
  const museumHref = `/museums/${guide.museumSlug}`;
  const timeRoute = timeRouteForMuseum(guide.museumSlug);

  return (
    <article className="space-y-5">
      <header className="text-center">
        {engTitle && (
          <p className="text-sm italic text-muted-foreground">{engTitle}</p>
        )}
        <h1 className="mt-1 font-serif text-2xl font-bold md:text-3xl">
          {guide.name}
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          <Link href={museumHref} className={linkClass}>
            {museumName}
          </Link>
          の名作
        </p>
      </header>

      <MasterpieceStatus
        guide={guide}
        museumName={museumName}
        live={live}
        note={masterpieceMuseumNote(guide.museumSlug)}
      />

      <figure className="space-y-1.5">
        <div
          className="relative mx-auto w-full max-w-xl overflow-hidden rounded-lg bg-muted"
          style={{ aspectRatio: `${guide.photo.width} / ${guide.photo.height}` }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            {...responsiveImage(guide.photo.url, PHOTO_SIZES)}
            alt={guide.photo.alt}
            className="absolute inset-0 h-full w-full object-contain"
            // 冒頭の写真はスマホでも最初の画面に入りうる(LCP の候補)。
            loading="eager"
            decoding="async"
          />
        </div>
        <ImageCredit
          source="commons"
          credit={guide.photo.credit}
          link={guide.photo.link}
          className="text-center"
        />
      </figure>

      <section className={sectionClass} aria-labelledby="masterpiece-facts">
        <h2 id="masterpiece-facts" className={headingClass}>
          基本の情報
        </h2>
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
          {guide.facts.map((fact) => (
            <div key={fact.label} className="contents">
              <dt className="whitespace-nowrap text-muted-foreground">
                {fact.label}
              </dt>
              <dd>{fact.value}</dd>
            </div>
          ))}
          <dt className="whitespace-nowrap text-muted-foreground">
            見る時間の目安
          </dt>
          <dd>{guide.minutes}分ほど</dd>
        </dl>
      </section>

      <section className={sectionClass} aria-labelledby="masterpiece-route">
        <h2 id="masterpiece-route" className={headingClass}>
          入口からの行き方
        </h2>
        <p className="text-sm leading-relaxed">{guide.route}</p>
        {timeRoute && (
          <p className="mt-3 text-sm">
            館全体の回り方は
            <Link
              href={`${museumHref}#${TIME_ROUTE_ANCHOR}`}
              className={linkClass}
            >
              {museumName}の時間別の回り方
            </Link>
            にあります。
          </p>
        )}
      </section>

      <section className={sectionClass} aria-labelledby="masterpiece-look">
        <h2 id="masterpiece-look" className={headingClass}>
          見るところ
        </h2>
        <ol className="space-y-4">
          {guide.lookFor.map((point, i) => (
            <li key={point.heading} className="flex gap-3">
              <span
                className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-800 dark:bg-amber-900/50 dark:text-amber-300"
                aria-hidden
              >
                {i + 1}
              </span>
              <div>
                <h3 className="font-semibold">{point.heading}</h3>
                <p className="mt-1 text-sm leading-relaxed">{point.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className={sectionClass} aria-labelledby="masterpiece-about">
        <h2 id="masterpiece-about" className={headingClass}>
          この作品について
        </h2>
        <div className="space-y-4 text-sm leading-relaxed">
          {guide.about.map((paragraph) => (
            <p key={paragraph.slice(0, 24)}>{paragraph}</p>
          ))}
        </div>
      </section>

      {guide.history && guide.history.length > 0 && (
        <section className={sectionClass} aria-labelledby="masterpiece-history">
          <h2 id="masterpiece-history" className={headingClass}>
            展示の記録
          </h2>
          <p className="mb-3 text-sm text-muted-foreground">
            展覧会への貸し出しなどで、いつもの部屋に無かった期間です。
          </p>
          <ul className="space-y-2 text-sm">
            {guide.history.map((entry) => (
              <li key={entry.period}>
                <span className="font-medium">{entry.period}</span>
                <span className="block text-muted-foreground">{entry.note}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {guide.sameRoom && guide.sameRoom.length > 0 && (
        <section className={sectionClass} aria-labelledby="masterpiece-same-room">
          <h2 id="masterpiece-same-room" className={headingClass}>
            同じ部屋の作品
          </h2>
          <ul className="space-y-1.5 text-sm">
            {guide.sameRoom.map((work) => (
              <li key={work.href}>
                <Link href={work.href} className={linkClass}>
                  {work.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className={sectionClass} aria-labelledby="masterpiece-sources">
        <h2 id="masterpiece-sources" className={headingClass}>
          参考資料
        </h2>
        <ul className="space-y-1.5 text-sm">
          {guide.sources.map((source) => (
            <li key={source.url}>
              <a
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className={linkClass}
              >
                {source.label}
              </a>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-muted-foreground">
          本文は{formatCheckedOn(guide.checked.on)}に上の資料で確かめました。
        </p>
      </section>
    </article>
  );
}
