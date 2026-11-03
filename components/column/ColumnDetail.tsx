import { Fragment } from "react";
import Link from "next/link";
import type { Content, ContentSection } from "@prisma/client";
import { CommentTargetType } from "@prisma/client";
import Breadcrumbs from "@/components/navigation/Breadcrumbs";
import AdSenseUnit from "@/components/ads/AdSenseUnit";
import ImageCredit from "@/components/shared/ImageCredit";
import { AD_SLOTS } from "@/lib/adsense";
import { isKnownTag, tagLabel } from "@/lib/column-taxonomy";
import AdjacentContentNav from "@/components/content/AdjacentContentNav";
import type { AdjacentContent } from "@/utils/actions/contents";
import PageCommentSection, {
  type PageCommentItem,
} from "@/components/comments/PageCommentSection";
import AttractionSpotRail, {
  type RailSpot,
} from "@/components/sightseeing/AttractionSpotRail";
import { parseSources } from "@/lib/reading-sources";
import { EDITORIAL_NAME, EDITORIAL_PATH } from "@/lib/seo";
import ReadingSources from "@/components/reading/ReadingSources";
import ArticleDates from "@/components/reading/ArticleDates";
import { IMAGE_SIZES, responsiveImage } from "@/lib/wikimedia-image";
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

type ColumnWithSections = Content & { sections: ContentSection[] };

export type SeriesEntry = {
  id: string;
  title: string;
  slug: string;
  seriesOrder: number | null;
};

/**
 * コラムの記事ページ。
 *
 * 並びは「答え → 地図 → 本文 → 裏付け → 次の行き先」。
 *
 *   1. 題・リード・署名。リード(summary)は検索結果の説明文にもなる。
 *   2. 要点(Content.description)。結論を先に渡す。検索から来た読者の
 *      多くは1つの問いの答えを探していて、1万字の最後まで読まない。
 *   3. 目次。節が3つ以上あるとき。
 *   4. 本文。字は16〜17px・行送り1.9、1行40字前後の幅(max-w-3xl)。
 *      以前は max-w-4xl で1行50字を超えていた。
 *   5. 参考資料 → 記事の舞台(観光スポット)→ つながるページ(ブランド・
 *      料理・美術館・ガイド)→ 連載の全話 → 関連する読み物 → 前後の記事。
 */
export default function ColumnDetail({
  content,
  series = [],
  prev = null,
  next = null,
  spots = [],
  links = [],
  related = [],
  comments,
}: {
  content: ColumnWithSections;
  series?: SeriesEntry[];
  prev?: AdjacentContent | null;
  next?: AdjacentContent | null;
  /** 本文に出てくる観光スポット(ContentAttraction)。無ければ枠ごと出ない。 */
  spots?: RailSpot[];
  /** 観光以外のサイト内のページ(lib/reading-topics.ts)。 */
  links?: readonly ReadingLink[];
  related?: RelatedCandidate[];
  comments: PageCommentItem[];
}) {
  const sections = content.sections
    .slice()
    .sort((a, b) => a.displayOrder - b.displayOrder);
  const sources = parseSources(content.sources);
  const minutes = readingMinutes([
    content.summary,
    content.mainText,
    ...sections.map((s) => s.description),
  ]);

  // 連載が2本以上あるときだけ回送ナビを出す（1本しか無い連載は実質単発）
  const hasSeries = Boolean(content.seriesName) && series.length > 1;
  const currentIndex = hasSeries
    ? series.findIndex((s) => s.slug === content.slug)
    : -1;
  const seriesPrev = currentIndex > 0 ? series[currentIndex - 1] : null;
  const seriesNext =
    currentIndex >= 0 && currentIndex < series.length - 1
      ? series[currentIndex + 1]
      : null;

  // 本文の途中の広告は2節目のあと。冒頭(要点・目次の直後)に置くと、
  // 本文に入る前に広告を挟むことになる。
  const adAfter = Math.min(1, sections.length - 1);

  return (
    <article
      data-page-main
      className="mx-auto max-w-3xl pt-4 pb-8 sm:px-4 md:pb-10"
    >
      <Breadcrumbs path="/column" current={content.title} />

      <header className="mt-6">
        <p className="text-xs font-bold tracking-[0.14em] text-amber-700 dark:text-amber-400">
          コラム
          {hasSeries && (
            <span className="ml-2 font-semibold tracking-normal">
              連載「{content.seriesName}」第{content.seriesOrder ?? "–"}回(全
              {series.length}回)
            </span>
          )}
        </p>
        <h1 className="mt-2 text-[1.6rem] font-bold leading-[1.4] tracking-tight text-neutral-950 dark:text-white sm:text-[2.05rem]">
          {content.title}
        </h1>
        {content.summary && (
          <ReadingMarkdown
            accent="column"
            className="mt-4 text-neutral-600 dark:text-neutral-300"
          >
            {content.summary}
          </ReadingMarkdown>
        )}

        {/* 署名。誰がどう作っているかは /about の編集方針に書いてある。
            資料で裏を取った記事は、末尾の参考資料欄へ飛べるようにする。 */}
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
          {sources.length > 0 && (
            <>
              <span
                aria-hidden
                className="text-neutral-300 dark:text-neutral-600"
              >
                /
              </span>
              <a
                href="#sources"
                className="underline decoration-neutral-300 underline-offset-4 hover:text-neutral-800 hover:decoration-current dark:decoration-neutral-600 dark:hover:text-neutral-200"
              >
                参考資料 {sources.length}件
              </a>
            </>
          )}
        </p>
        {content.tags.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="テーマ">
            {content.tags.map((t) => (
              <li key={t}>
                {isKnownTag(t) ? (
                  <Link
                    href={`/column?tag=${t}`}
                    className="inline-block rounded-full border border-neutral-200 px-2.5 py-0.5 text-xs font-medium text-neutral-600 transition-colors hover:border-amber-300 hover:text-amber-800 dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-amber-800 dark:hover:text-amber-300"
                  >
                    {tagLabel(t)}
                  </Link>
                ) : (
                  <span className="inline-block rounded-full border border-neutral-200 px-2.5 py-0.5 text-xs text-neutral-600 dark:border-neutral-700 dark:text-neutral-300">
                    {tagLabel(t)}
                  </span>
                )}
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
              // 冒頭の写真は PC では最初の画面に入る(LCP の候補)。遅延読み込みと
              // 低い優先度を付けると、ページで最後に読み込まれていた。
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
          accent="column"
        />
        <ReadingToc
          accent="column"
          items={sections.map((s, i) => ({
            id: sectionAnchor(i),
            title: s.title,
          }))}
        />
      </div>

      {content.mainText && (
        <ReadingMarkdown accent="column" className="mt-9">
          {content.mainText}
        </ReadingMarkdown>
      )}

      <div className="mt-12 space-y-14">
        {sections.map((sec, i) => (
          <Fragment key={sec.id}>
            <ArticleSection section={sec} index={i} accent="column" />
            {i === adAfter && <AdSenseUnit slot={AD_SLOTS.inArticle} />}
          </Fragment>
        ))}
      </div>

      <div className="mt-14 space-y-12">
        {/* 本文の裏付け。本文の直後、ほかの記事やスポットへの導線より前に置く。
            資料で確かめていない記事には欄ごと出さない。 */}
        <ReadingSources
          sources={sources}
          checkedAt={content.sourcesCheckedAt}
        />

        {/* 本文に出てきた場所へ。読み終えた直後に置く。本文の途中に
            リンクを埋めると、読んでいる最中に記事の外へ連れ出すことになる。 */}
        <AttractionSpotRail
          heading="この記事の舞台を訪ねる"
          description="記事に出てきた場所の見どころ・料金・アクセスは観光ガイドにまとめています。"
          spots={spots}
        />

        <SiteLinks links={links} />

        {/* 連載の全話リスト。どの回からでも他の回に飛べるようにする */}
        {hasSeries && (
          <section className="rounded-2xl border border-amber-200 bg-amber-50/50 p-5 dark:border-amber-900/40 dark:bg-amber-950/10">
            <h2 className="mb-4 text-base font-bold tracking-tight sm:text-lg">
              連載「{content.seriesName}」全 {series.length} 回
            </h2>
            <ol className="space-y-2">
              {series.map((entry) => {
                const isCurrent = entry.slug === content.slug;
                const inner = (
                  <>
                    <span
                      className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                        isCurrent
                          ? "bg-slate-400 text-white dark:bg-slate-600"
                          : "bg-amber-700 text-white"
                      }`}
                    >
                      {entry.seriesOrder ?? "–"}
                    </span>
                    <span className="text-sm font-medium leading-relaxed">
                      {entry.title}
                      {isCurrent && (
                        <span className="ml-2 text-xs text-muted-foreground">
                          （この記事）
                        </span>
                      )}
                    </span>
                  </>
                );

                return (
                  <li key={entry.id}>
                    {isCurrent ? (
                      <div
                        aria-current="page"
                        className="flex items-start gap-3 rounded-xl bg-slate-100 px-4 py-3 dark:bg-slate-800/60"
                      >
                        {inner}
                      </div>
                    ) : (
                      <Link
                        href={`/column/${entry.slug}`}
                        className="group flex items-start gap-3 rounded-xl bg-white/80 px-4 py-3 transition hover:bg-white dark:bg-slate-900/60 dark:hover:bg-slate-900"
                      >
                        {inner}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ol>
          </section>
        )}

        <RelatedReading items={related} />

        {/* 前後の回への移動(連載中のみ)。連載でない単発コラムは、
            代わりにコラム全体での前後記事ナビを出す。 */}
        {hasSeries ? (
          (seriesPrev || seriesNext) && (
            <nav className="grid gap-3 sm:grid-cols-2" aria-label="連載の前後の回">
              {seriesPrev ? (
                <Link
                  href={`/column/${seriesPrev.slug}`}
                  className="group rounded-xl border border-slate-200 p-4 transition hover:border-amber-300 dark:border-slate-700 dark:hover:border-amber-800"
                >
                  <p className="text-xs text-muted-foreground">
                    ← 第 {seriesPrev.seriesOrder ?? "–"} 回
                  </p>
                  <p className="mt-1 line-clamp-2 text-sm font-medium group-hover:underline">
                    {seriesPrev.title}
                  </p>
                </Link>
              ) : (
                <span aria-hidden />
              )}
              {seriesNext && (
                <Link
                  href={`/column/${seriesNext.slug}`}
                  className="group rounded-xl border border-slate-200 p-4 text-right transition hover:border-amber-300 dark:border-slate-700 dark:hover:border-amber-800"
                >
                  <p className="text-xs text-muted-foreground">
                    第 {seriesNext.seriesOrder ?? "–"} 回 →
                  </p>
                  <p className="mt-1 line-clamp-2 text-sm font-medium group-hover:underline">
                    {seriesNext.title}
                  </p>
                </Link>
              )}
            </nav>
          )
        ) : (
          <AdjacentContentNav
            basePath="/column"
            prev={prev}
            next={next}
            accent="sky"
          />
        )}

        <PageCommentSection
          targetType={CommentTargetType.COLUMN}
          targetKey={content.slug}
          prompt="この記事を読んだ感想や、関連して知っていることがあれば教えてください。"
          heading="感想・コメント"
          placeholder="感想やご意見をお聞かせください"
          initialComments={comments}
        />

        <p>
          <Link
            href="/column"
            className="text-sm font-medium text-link underline underline-offset-2"
          >
            ← コラム一覧に戻る
          </Link>
        </p>
      </div>
    </article>
  );
}
