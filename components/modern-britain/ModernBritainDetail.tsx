import { Fragment } from "react";
import Link from "next/link";
import type { Content, ContentSection } from "@prisma/client";
import Breadcrumbs from "@/components/navigation/Breadcrumbs";
import { modernBritainTagLabel } from "@/lib/modern-britain-taxonomy";
import AdSenseUnit from "@/components/ads/AdSenseUnit";
import ImageCredit from "@/components/shared/ImageCredit";
import { AD_SLOTS } from "@/lib/adsense";
import AdjacentContentNav from "@/components/content/AdjacentContentNav";
import type { AdjacentContent } from "@/utils/actions/contents";
import ArticleDates from "@/components/reading/ArticleDates";
import { IMAGE_SIZES, responsiveImage } from "@/lib/wikimedia-image";
import { EDITORIAL_NAME, EDITORIAL_PATH } from "@/lib/seo";
import { publishedDateOf } from "@/lib/publish-schedule";
import { readingMinutes } from "@/lib/reading-time";
import type { RelatedCandidate } from "@/lib/reading-related";
import type { ReadingLink } from "@/lib/reading-topics";
import ReadingMarkdown from "@/components/reading/article/ReadingMarkdown";
import KeyPoints from "@/components/reading/article/KeyPoints";
import ReadingToc, {
  sectionAnchor,
} from "@/components/reading/article/ReadingToc";
import ArticleSection from "@/components/reading/article/ArticleSection";
import RelatedReading from "@/components/reading/article/RelatedReading";
import SiteLinks from "@/components/reading/article/SiteLinks";

type ModernBritainWithSections = Content & { sections: ContentSection[] };

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

/**
 * 英国のいまの記事ページ。
 *
 * 記事は「1節目=ニュースの紹介」「2節目以降=論考」の2部構成。事実の紹介と
 * 書き手の主張が地続きに見えないよう、見出しの上の札で「ニュース」「論考」を
 * 分ける。以前は節ごとに色の違うカードを立てていたが、短い記事を枠で刻むと
 * かえって読みにくいので、札と余白だけにした。
 *
 * ニュースは時間が経つと事情が変わる。何月何日時点の話かを、題のすぐ下で断る。
 */
export default function ModernBritainDetail({
  content,
  prev = null,
  next = null,
  links = [],
  related = [],
}: {
  content: ModernBritainWithSections;
  prev?: AdjacentContent | null;
  next?: AdjacentContent | null;
  links?: readonly ReadingLink[];
  related?: RelatedCandidate[];
}) {
  const sections = content.sections
    .slice()
    .sort((a, b) => a.displayOrder - b.displayOrder);
  const minutes = readingMinutes([
    content.summary,
    content.mainText,
    ...sections.map((s) => s.description),
  ]);
  const adAfter = Math.min(1, sections.length - 1);

  return (
    <article
      data-page-main
      className="mx-auto max-w-3xl pt-4 pb-8 sm:px-4 md:pb-10"
    >
      <Breadcrumbs path="/modern-britain" current={content.title} />

      <header className="mt-6">
        <p className="text-xs font-bold tracking-[0.14em] text-indigo-700 dark:text-indigo-400">
          英国のいま
        </p>
        <h1 className="mt-2 text-[1.55rem] font-bold leading-[1.4] tracking-tight text-neutral-950 dark:text-white sm:text-[2rem]">
          {content.title}
        </h1>
        {content.summary && (
          <ReadingMarkdown
            accent="modern-britain"
            className="mt-4 text-neutral-600 dark:text-neutral-300"
          >
            {content.summary}
          </ReadingMarkdown>
        )}

        <p className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-neutral-500 dark:text-neutral-400">
          <span>
            <ArticleDates content={content} />
          </span>
          <span aria-hidden className="text-neutral-300 dark:text-neutral-600">
            /
          </span>
          <span>
            文{" "}
            <Link
              href={EDITORIAL_PATH}
              className="text-neutral-700 underline decoration-neutral-300 underline-offset-4 hover:decoration-current dark:text-neutral-300 dark:decoration-neutral-600"
            >
              {EDITORIAL_NAME}
            </Link>
          </span>
          <span aria-hidden className="text-neutral-300 dark:text-neutral-600">
            /
          </span>
          <span>約{minutes}分で読めます</span>
        </p>
        <p className="mt-2 text-[13px] leading-relaxed text-neutral-500 dark:text-neutral-400">
          {formatDate(publishedDateOf(content))}
          時点の報道と公式発表をもとに書いています。出典は本文のリンク先です。
        </p>

        {content.tags.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="テーマ">
            {content.tags.map((tag) => (
              <li
                key={tag}
                className="rounded-full border border-neutral-200 px-2.5 py-0.5 text-xs text-neutral-600 dark:border-neutral-700 dark:text-neutral-300"
              >
                {modernBritainTagLabel(tag)}
              </li>
            ))}
          </ul>
        )}
      </header>

      {content.image && (
        <figure className="mt-7 space-y-1.5">
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-800">
            <img
              {...responsiveImage(content.image, IMAGE_SIZES.article)}
              alt={content.title}
              className="absolute inset-0 h-full w-full object-cover"
              // 冒頭の写真は PC では最初の画面に入る(LCP の候補)。
              loading="eager"
              decoding="async"
            />
          </div>
          {/* Commons の CC 画像は作者名とライセンスの表示が利用の条件。 */}
          <ImageCredit
            source={content.imageSource}
            credit={content.imageCredit}
            link={content.imageLink}
          />
        </figure>
      )}

      <div className="mt-8 space-y-5">
        <KeyPoints
          markdown={content.description}
          title="この記事の要点"
          accent="modern-britain"
        />
        <ReadingToc
          accent="modern-britain"
          items={sections.map((s, i) => ({
            id: sectionAnchor(i),
            title: s.title,
          }))}
        />
      </div>

      {content.mainText && (
        <ReadingMarkdown accent="modern-britain" className="mt-9">
          {content.mainText}
        </ReadingMarkdown>
      )}

      <div className="mt-12 space-y-14">
        {sections.map((sec, i) => (
          <Fragment key={sec.id}>
            <ArticleSection
              section={sec}
              index={i}
              accent="modern-britain"
              label={i === 0 ? "ニュース" : "論考"}
            />
            {i === adAfter && <AdSenseUnit slot={AD_SLOTS.inArticle} />}
          </Fragment>
        ))}
      </div>

      <div className="mt-14 space-y-12">
        <SiteLinks links={links} />

        <RelatedReading items={related} />

        <AdjacentContentNav
          basePath="/modern-britain"
          prev={prev}
          next={next}
          accent="indigo"
        />

        <p>
          <Link
            href="/modern-britain"
            className="text-sm font-medium text-link underline underline-offset-2"
          >
            ← 英国のいまの一覧に戻る
          </Link>
        </p>
      </div>
    </article>
  );
}
