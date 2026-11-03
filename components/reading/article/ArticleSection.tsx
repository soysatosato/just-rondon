import type { ContentSection } from "@prisma/client";
import { cn } from "@/lib/utils";
import ImageCredit from "@/components/shared/ImageCredit";
import { IMAGE_SIZES, responsiveImage } from "@/lib/wikimedia-image";
import { ARTICLE_ACCENT, type ArticleAccentName } from "./accent";
import ReadingMarkdown from "./ReadingMarkdown";
import { sectionAnchor } from "./ReadingToc";

/**
 * 読み物の1節。見出し(h2)に目次からのアンカーを持たせる。
 *
 * 以前は節ごとに枠・色の縦棒・番号の丸を付けたカードにしていた
 * (イギリス英語・英国のいま)。1万字の本文を枠で刻むと、読み物ではなく
 * 設定画面のように見えるので、見出しと余白だけで区切る。
 *
 * subtitle は見出しの下に1行で添える。英国のいまでは「ニュース」「論考」の
 * 別を label で上に出す(報道の要約と書き手の主張を読み分けさせるため)。
 */
export default function ArticleSection({
  section,
  index,
  accent: accentName,
  label,
}: {
  section: Pick<
    ContentSection,
    | "title"
    | "subtitle"
    | "description"
    | "image"
    | "imageSummary"
    | "imageSource"
    | "imageCredit"
    | "imageLink"
  >;
  index: number;
  accent: ArticleAccentName;
  /** 見出しの上の小さな札。無ければ節の番号。 */
  label?: string;
}) {
  const accent = ARTICLE_ACCENT[accentName];

  return (
    <section className="scroll-mt-24" id={sectionAnchor(index)}>
      <p
        className={cn(
          "text-xs font-bold tracking-[0.14em] tabular-nums",
          accent.label,
        )}
      >
        {label ?? String(index + 1).padStart(2, "0")}
      </p>
      <h2 className="mt-1.5 text-[1.35rem] font-bold leading-snug tracking-tight text-neutral-950 dark:text-white sm:text-[1.6rem]">
        {section.title}
      </h2>
      {section.subtitle && (
        <p className="mt-2 text-[15px] leading-relaxed text-neutral-500 dark:text-neutral-400">
          {section.subtitle}
        </p>
      )}

      {/* 挿絵。見出しで何の話か分かった直後に置き、本文はその下から読ませる。
          キャプションは本文と違うものが写っていることがあるので、何の写真かを
          ここで断る。 */}
      {section.image && (
        <figure className="mt-5 space-y-2">
          <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-800">
            <img
              {...responsiveImage(section.image, IMAGE_SIZES.article)}
              alt={section.imageSummary || section.title}
              className="absolute inset-0 h-full w-full object-cover"
              loading="lazy"
              decoding="async"
              fetchPriority="low"
            />
          </div>
          {(section.imageSummary || section.imageCredit) && (
            <figcaption className="space-y-0.5">
              {section.imageSummary && (
                <p className="text-[13px] leading-relaxed text-neutral-500 dark:text-neutral-400">
                  {section.imageSummary}
                </p>
              )}
              <ImageCredit
                source={section.imageSource}
                credit={section.imageCredit}
                link={section.imageLink}
              />
            </figcaption>
          )}
        </figure>
      )}

      {section.description && (
        <ReadingMarkdown accent={accentName} className="mt-5">
          {section.description}
        </ReadingMarkdown>
      )}
    </section>
  );
}
