import { Fragment } from "react";
import Link from "next/link";
import type { Content, ContentSection } from "@prisma/client";
import Breadcrumbs from "@/components/navigation/Breadcrumbs";
import AdSenseUnit from "@/components/ads/AdSenseUnit";
import ImageCredit from "@/components/shared/ImageCredit";
import { AD_SLOTS } from "@/lib/adsense";
import AdjacentContentNav from "@/components/content/AdjacentContentNav";
import type { AdjacentContent } from "@/utils/actions/contents";
import ArticleDates from "@/components/reading/ArticleDates";
import { IMAGE_SIZES, responsiveImage } from "@/lib/wikimedia-image";
import { EDITORIAL_NAME, EDITORIAL_PATH } from "@/lib/seo";
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

type BritishEnglishWithSections = Content & { sections: ContentSection[] };

/**
 * イギリス英語の記事ページ。
 *
 * 検索から来る読者の問いはほぼ全部「chuffed 意味」「posh 語源」の形をしている
 * (Search Console)。以前は大きな語の下に「つかみ」の題と体験談が続き、
 * 意味は最初の節の途中まで出てこなかった。10位前後に出ていてもクリックが
 * ほぼ無かった。
 *
 * 並びを「語 → 意味の答え(リード)→ 早わかり(意味・場面・形の表)→ 本文」に
 * する。読み物としての面白さ(由来・使い分け・誤解)は本文で続ける。
 * h1 は語と題を1つにまとめ、検索語(英語の語)が見出しの先頭に来るようにする。
 */
export default function BritishEnglishDetail({
  content,
  prev = null,
  next = null,
  links = [],
  related = [],
}: {
  content: BritishEnglishWithSections;
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
    content.description,
    content.mainText,
    ...sections.map((s) => s.description),
  ]);
  const adAfter = sections.length >= 3 ? 1 : 0;

  return (
    <article
      data-page-main
      className="mx-auto max-w-3xl pt-4 pb-8 sm:px-4 md:pb-10"
    >
      <Breadcrumbs path="/british-english" current={content.title} />

      <header className="mt-6">
        <p className="text-xs font-bold tracking-[0.14em] text-rose-700 dark:text-rose-400">
          イギリス英語
        </p>
        <h1 className="mt-2">
          {content.engTitle && (
            <span
              lang="en-GB"
              className="block break-words text-[2.5rem] font-extrabold leading-[1.1] tracking-tight text-rose-700 dark:text-rose-400 sm:text-6xl"
            >
              {content.engTitle}
            </span>
          )}
          <span
            className={`block text-xl font-bold leading-snug tracking-tight text-neutral-950 dark:text-white sm:text-[1.65rem] ${
              content.engTitle ? "mt-3" : ""
            }`}
          >
            {content.title}
          </span>
        </h1>

        {content.summary && (
          <ReadingMarkdown
            accent="british-english"
            className="mt-4 text-neutral-700 dark:text-neutral-200"
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
      </header>

      <div className="mt-7 space-y-5">
        <KeyPoints
          markdown={content.description}
          title="早わかり"
          accent="british-english"
        />
        <ReadingToc
          accent="british-english"
          items={sections.map((s, i) => ({
            id: sectionAnchor(i),
            title: s.title,
          }))}
        />
      </div>

      {content.image && (
        <figure className="mt-8 space-y-1.5">
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-800">
            <img
              {...responsiveImage(content.image, IMAGE_SIZES.article)}
              alt={content.title}
              className="absolute inset-0 h-full w-full object-cover"
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

      {content.mainText && (
        <ReadingMarkdown accent="british-english" className="mt-9">
          {content.mainText}
        </ReadingMarkdown>
      )}

      <div className="mt-12 space-y-14">
        {sections.map((sec, i) => (
          <Fragment key={sec.id}>
            <ArticleSection section={sec} index={i} accent="british-english" />
            {i === adAfter && <AdSenseUnit slot={AD_SLOTS.inArticle} />}
          </Fragment>
        ))}
      </div>

      <div className="mt-14 space-y-12">
        <SiteLinks links={links} />

        <RelatedReading items={related} />

        <AdjacentContentNav
          basePath="/british-english"
          prev={prev}
          next={next}
          accent="rose"
        />

        <nav
          aria-label="イギリス英語の一覧"
          className="grid gap-3 sm:grid-cols-2"
        >
          <Link
            href="/british-english"
            className="group rounded-xl border border-rose-200 bg-rose-50/50 p-4 transition-colors hover:border-rose-300 dark:border-rose-900/50 dark:bg-rose-950/20 dark:hover:border-rose-800"
          >
            <p className="text-sm font-bold group-hover:underline">
              イギリス英語の一覧
            </p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              単語・言い回し・スラングをA〜Zとテーマで引けます。
            </p>
          </Link>
          <Link
            href="/british-english/scenes"
            className="group rounded-xl border border-rose-200 bg-rose-50/50 p-4 transition-colors hover:border-rose-300 dark:border-rose-900/50 dark:bg-rose-950/20 dark:hover:border-rose-800"
          >
            <p className="text-sm font-bold group-hover:underline">
              場面別フレーズ集
            </p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              パブ・店・交通で、言いたいことから引く逆引き。
            </p>
          </Link>
        </nav>
      </div>
    </article>
  );
}
