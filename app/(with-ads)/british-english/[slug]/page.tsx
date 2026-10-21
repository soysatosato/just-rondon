export const revalidate = 60 * 60;

import { notFound } from "next/navigation";
import {
  fetchAdjacentContents,
  fetchBritishEnglishBySlug,
  fetchPublishedReadingSlugs,
} from "@/utils/actions/contents";
import { buildPageMetadata, truncateDescription } from "@/lib/seo";
import { britishEnglishOgImage, readingPhotoOgImage } from "@/lib/og";
import JsonLd from "@/components/seo/JsonLd";
import ViewTracker from "@/components/analytics/ViewTracker";
import {
  britishEnglishArticleJsonLd,
  britishEnglishPath,
} from "@/components/british-english/jsonld";
import BritishEnglishDetail from "@/components/british-english/BritishEnglishDetail";
import { breadcrumbListJsonLd } from "@/components/navigation/tree";
import { modifiedDateOf, publishedDateOf } from "@/lib/publish-schedule";
import PreviewBanner from "@/components/admin/PreviewBanner";

interface Props {
  params: {
    slug: string;
  };
}

// ビルド時に描いておく。generateStaticParams が無い動的ルートは、Next 14 では
// ISR のキャッシュに載らず、revalidate を書いても毎回描画になる。
// 下書き・予約中の記事は公開後に初めて開かれたときに描く。
export async function generateStaticParams() {
  return fetchPublishedReadingSlugs("british-english");
}

export async function generateMetadata({ params }: Props) {
  const content = await fetchBritishEnglishBySlug(params.slug);

  if (!content) {
    return {
      title: "イギリス英語 | ジャスト・ロンドン",
      description: "イギリス英語ならではの単語・言い回し・スラングを紹介します。",
      robots: { index: false, follow: false },
    };
  }

  const text = content.summary || content.mainText || "";
  const trimmed = truncateDescription(text.replace(/[#>*_\-`]/g, ""));

  return buildPageMetadata({
    path: `/british-english/${params.slug}`,
    // このセクションに来る検索語は、GSCで見るかぎりほぼ全部が
    // 「<単語> 意味」「<単語> 語源」の形をしている。日本語の検索結果で
    // 読めるのは全角30字ほどなので、その語を切られる前の位置に置く。
    //
    // つかみ側にも単語が入っていて見た目は重複するが、それは許容する。
    // 先頭の「<単語>」を機械的に剥がす案は却下した。25本中11本は
    // 単語が文頭に無く、残り14本も剥がすと「は褒め言葉。なのに…」と
    // 助詞から始まる壊れた日本語になるため。
    title: content.engTitle
      ? `${content.engTitle} の意味 ｜ ${content.title}`
      : content.title,
    // SNSカードは検索語の接頭辞を外し、つかみだけを出す。
    ogTitle: content.title,
    description: trimmed || `${content.title}についてのイギリス英語解説です。`,
    type: "article",
    publishedTime: publishedDateOf(content).toISOString(),
    modifiedTime: modifiedDateOf(content).toISOString(),
    // X の共有画像は、その単語を大きく置いた生成カード。挿絵は任意項目で
    // 無い記事が多く、あってもテーマの写真なので、タイムライン上では
    // 何の記事か分からない。
    //
    // ただし挿絵のある記事の og:image は挿絵だけの 16:9 にする。Google は
    // Discover と検索結果の画像に og:image を使い、文字の多い画像を避けるよう
    // 求めている。LINE と Facebook は画像の下に題を出すので、語はそこで読める。
    ...(content.image
      ? {
          images: [readingPhotoOgImage("british-english", content)],
          twitterImages: [britishEnglishOgImage(content)],
        }
      : { images: [britishEnglishOgImage(content)] }),
  });
}

export default async function BritishEnglishDetailPage({ params }: Props) {
  const content = await fetchBritishEnglishBySlug(params.slug);

  if (!content) return notFound();

  const { prev, next } = await fetchAdjacentContents("british-english", {
    id: content.id,
    publishedAt: content.publishedAt,
  });

  return (
    <>
      <PreviewBanner publishedAt={content.publishedAt} />
      <JsonLd
        data={breadcrumbListJsonLd({
          path: "/british-english",
          current: content.title,
          currentHref: britishEnglishPath(content.slug),
        })}
      />
      <JsonLd data={britishEnglishArticleJsonLd(content)} />
      <BritishEnglishDetail content={content} prev={prev} next={next} />

      {/* 閲覧の記録(内部データ)。何も描画しない。 */}
      <ViewTracker targetType="britishEnglish" slug={content.slug} />
    </>
  );
}
