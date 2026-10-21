import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Content, ContentSection } from "@prisma/client";
import { CommentTargetType } from "@prisma/client";
import Breadcrumbs from "@/components/navigation/Breadcrumbs";
import AdSenseUnit from "@/components/ads/AdSenseUnit";
import ImageCredit from "@/components/shared/ImageCredit";
import { AD_SLOTS } from "@/lib/adsense";
import { tagLabel } from "@/lib/column-taxonomy";
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

const proseClass =
  "prose dark:prose-invert prose-base max-w-full";

type ColumnWithSections = Content & { sections: ContentSection[] };

export type SeriesEntry = {
  id: string;
  title: string;
  slug: string;
  seriesOrder: number | null;
};

export default function ColumnDetail({
  content,
  series = [],
  prev = null,
  next = null,
  spots = [],
  comments,
}: {
  content: ColumnWithSections;
  series?: SeriesEntry[];
  prev?: AdjacentContent | null;
  next?: AdjacentContent | null;
  /** 本文に出てくる観光スポット(ContentAttraction)。無ければ枠ごと出ない。 */
  spots?: RailSpot[];
  comments: PageCommentItem[];
}) {
  const sections = content.sections.slice().sort(
    (a, b) => a.displayOrder - b.displayOrder,
  );
  const sources = parseSources(content.sources);

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

  return (
    <div className="max-w-4xl mx-auto pt-4 pb-8 sm:px-4 md:pb-10 space-y-10">
      <Breadcrumbs path="/column" current={content.title} />

      <div>
        <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-2">
          {/* 署名。誰がどう作っているかは /about の編集方針に書いてある。
              資料で裏を取った記事は、末尾の参考資料欄へ飛べるようにする。 */}
          <p className="flex flex-wrap items-center gap-x-2 text-sm text-muted-foreground">
            <span>
              <ArticleDates content={content} />
            </span>
            <span aria-hidden className="text-muted-foreground/40">
              /
            </span>
            <span>
              <span className="mr-1 text-xs">文</span>
              <Link
                href={EDITORIAL_PATH}
                className="text-foreground/80 underline decoration-muted-foreground/30 underline-offset-4 transition-colors hover:text-foreground hover:decoration-current"
              >
                {EDITORIAL_NAME}
              </Link>
            </span>
            {sources.length > 0 && (
              <>
                <span aria-hidden className="text-muted-foreground/40">
                  /
                </span>
                <a
                  href="#sources"
                  className="underline decoration-muted-foreground/30 underline-offset-4 transition-colors hover:text-foreground hover:decoration-current"
                >
                  参考資料 {sources.length}件
                </a>
              </>
            )}
          </p>
          {content.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {content.tags.map((t) => (
                <span
                  key={t}
                  className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                >
                  {tagLabel(t)}
                </span>
              ))}
            </div>
          )}
        </div>
        {hasSeries && (
          <p className="mb-3 text-sm font-semibold text-amber-700 dark:text-amber-400">
            連載「{content.seriesName}」全 {series.length} 回 の第{" "}
            {content.seriesOrder ?? "–"} 回
          </p>
        )}
        <h1 className="text-2xl sm:text-4xl font-bold tracking-tight leading-snug mb-4">
          {content.title}
        </h1>
        {content.summary && (
          <div className={`text-muted-foreground ${proseClass}`}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {content.summary}
            </ReactMarkdown>
          </div>
        )}
      </div>

      {content.image && (
        <figure className="space-y-1.5">
          <div className="relative w-full h-56 sm:h-72 md:h-80 rounded-xl overflow-hidden">
            <img
              {...responsiveImage(content.image, IMAGE_SIZES.article)}
              alt={content.title}
              className="absolute inset-0 w-full h-full object-cover"
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

      {content.mainText && (
        <section className={proseClass}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {content.mainText}
          </ReactMarkdown>
        </section>
      )}

      <AdSenseUnit slot={AD_SLOTS.inArticle} />

      <div className="space-y-8">
        {sections.map((sec) => (
          <section
            key={sec.id}
            className="space-y-3 border-b border-slate-200 dark:border-slate-700 pb-6 last:border-b-0"
          >
            <h2 className="text-xl sm:text-2xl font-semibold">
              {sec.title}
            </h2>
            {sec.subtitle && (
              <p className="text-sm text-muted-foreground">{sec.subtitle}</p>
            )}
            {/* 挿絵。見出しとリード文で何の話か分かった直後に置き、
                本文はその下から読ませる。無い節はそのまま本文が続く。
                キャプションは写真の下。本文と違うものが写っていることが
                あるので、何の写真かはここで断っておく。 */}
            {sec.image && (
              <figure className="space-y-2">
                <div className="relative h-52 w-full overflow-hidden rounded-xl sm:h-64 md:h-72">
                  <img
                    {...responsiveImage(sec.image, IMAGE_SIZES.article)}
                    alt={sec.imageSummary || sec.title}
                    className="absolute inset-0 h-full w-full object-cover"
                    loading="lazy"
                    decoding="async"
                    fetchPriority="low"
                  />
                </div>
                {(sec.imageSummary || sec.imageCredit) && (
                  <figcaption className="space-y-0.5">
                    {sec.imageSummary && (
                      <p className="text-xs leading-relaxed text-muted-foreground">
                        {sec.imageSummary}
                      </p>
                    )}
                    <ImageCredit
                      source={sec.imageSource}
                      credit={sec.imageCredit}
                      link={sec.imageLink}
                    />
                  </figcaption>
                )}
              </figure>
            )}
            {sec.description && (
              <div className={proseClass}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {sec.description}
                </ReactMarkdown>
              </div>
            )}
          </section>
        ))}
      </div>

      {/* 本文の裏付け。本文の直後、ほかの記事やスポットへの導線より前に置く。
          資料で確かめていない記事には欄ごと出さない。 */}
      <ReadingSources sources={sources} checkedAt={content.sourcesCheckedAt} />

      {/* 本文に出てきた場所へ。読み終えた直後に置く。本文の途中に
          リンクを埋めると、読んでいる最中に記事の外へ連れ出すことになる。 */}
      <AttractionSpotRail
        heading="この記事に出てくる観光スポット"
        description="記事に登場した場所の見どころ・料金・アクセスは観光ガイドにまとめています。"
        spots={spots}
      />

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

      {/* 前後の回への移動(連載中のみ)。連載でない単発コラムは、
          代わりにコラム全体での前後記事ナビを出す。 */}
      {hasSeries ? (
        (seriesPrev || seriesNext) && (
          <nav className="grid gap-3 sm:grid-cols-2">
            {seriesPrev ? (
              <Link
                href={`/column/${seriesPrev.slug}`}
                className="group rounded-xl border border-slate-200 p-4 transition hover:border-sky-300 dark:border-slate-700 dark:hover:border-sky-700"
              >
                <p className="text-xs text-muted-foreground">
                  ← 第 {seriesPrev.seriesOrder ?? "–"} 回
                </p>
                <p className="mt-1 line-clamp-2 text-sm font-medium group-hover:text-sky-700 dark:group-hover:text-sky-300">
                  {seriesPrev.title}
                </p>
              </Link>
            ) : (
              <span aria-hidden />
            )}
            {seriesNext && (
              <Link
                href={`/column/${seriesNext.slug}`}
                className="group rounded-xl border border-slate-200 p-4 text-right transition hover:border-sky-300 dark:border-slate-700 dark:hover:border-sky-700"
              >
                <p className="text-xs text-muted-foreground">
                  第 {seriesNext.seriesOrder ?? "–"} 回 →
                </p>
                <p className="mt-1 line-clamp-2 text-sm font-medium group-hover:text-sky-700 dark:group-hover:text-sky-300">
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

      <p className="pt-4">
        <Link
          href="/column"
          className="text-sm font-medium text-sky-700 dark:text-sky-300 underline"
        >
          ← コラム一覧に戻る
        </Link>
      </p>
    </div>
  );
}
