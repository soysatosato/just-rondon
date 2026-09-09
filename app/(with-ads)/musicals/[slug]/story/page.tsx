import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/navigation/Breadcrumbs";
import { breadcrumbListJsonLd } from "@/components/navigation/tree";
import JsonLd from "@/components/seo/JsonLd";
import AdSenseUnit from "@/components/ads/AdSenseUnit";
import { AD_SLOTS } from "@/lib/adsense";
import { faqPageJsonLd } from "@/lib/jsonld";
import { absoluteUrl } from "@/lib/seo";
import MusicalStoryArticle from "@/components/musicals/stories/MusicalStoryArticle";
import {
  buildMusicalStoryMetadata,
  getMusicalStory,
  musicalStoryPath,
  musicalStorySlugs,
} from "@/components/musicals/stories/stories";
import { fetchMusicalStoryFacts } from "@/utils/actions/musicals";

export const revalidate = 60 * 60 * 24;

/**
 * あらすじ専用ページ。
 *
 * 作品ページ(/musicals/[slug])から切り出した理由は GSC の実測にある。
 * 「レミゼラブル あらすじ」594表示・21位、「レミゼラブル 内容」326表示・
 * 28位、「レミゼラブル ネタバレ」262表示・33位、「レミゼラブル 結末」
 * 127表示・36位（2026-06-10〜09-07）で、受けていた作品ページは
 * 2,478表示に対し15クリック（CTR 0.6%）だった。作品ページは上演時間・
 * 劇場・チケット・英語の難易度も背負うので、あらすじだけを求める
 * 検索に対して最良の答えにはなれない。本文の字面を「あらすじ」に
 * 寄せる修正(MusicalSceneDescription)は既に入れてあり、それでも
 * 順位が動かなかったため、URLごと分けている。
 *
 * ★ 全作品には生やさない。原稿を人が書いた作品だけが
 *   components/musicals/stories/stories.ts の登録簿に載り、
 *   それ以外の slug は 404 になる。DB のカラムを並べ替えただけの
 *   ページを31本出すのは、artworks・songs を noindex に追い込んだ
 *   低品質判定を自分から作りにいく行為でしかない。
 */
export function generateStaticParams() {
  return musicalStorySlugs.map((slug) => ({ slug }));
}

// 登録簿に無い slug は 404。作品ページは全作品ぶんあるので、
// ここで動的に生やすと「中身の薄いあらすじページ」が31本できてしまう。
export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const story = getMusicalStory(params.slug);
  if (!story) {
    return {
      title: "あらすじが見つかりません | ジャスト・ロンドン",
      description: "指定された作品のあらすじページはまだありません。",
      robots: { index: false, follow: false },
    };
  }
  return buildMusicalStoryMetadata(story);
}

export default async function MusicalStoryPage({
  params,
}: {
  params: { slug: string };
}) {
  const story = getMusicalStory(params.slug);
  if (!story) notFound();

  // 上演時間・劇場・推奨年齢は DB を正とする。原稿に書き写すと、
  // 演出改訂で上演時間が変わったときに片方だけが古くなる。
  const facts = await fetchMusicalStoryFacts(params.slug);
  if (!facts) notFound();

  const path = musicalStoryPath(params.slug);

  return (
    <>
      <JsonLd
        data={breadcrumbListJsonLd({
          path: "/musicals",
          trail: [{ label: facts.name, href: `/musicals/${params.slug}` }],
          current: "あらすじ",
          currentHref: path,
        })}
      />
      {story.faqs.length > 0 && (
        <JsonLd data={faqPageJsonLd(story.faqs, absoluteUrl(path))} />
      )}

      <Breadcrumbs
        path="/musicals"
        trail={[{ label: facts.name, href: `/musicals/${params.slug}` }]}
        current="あらすじ"
      />

      <MusicalStoryArticle
        story={story}
        facts={{
          name: facts.name,
          engName: facts.engName,
          slug: params.slug,
          theatreName: facts.theatreName,
          theatreSlug: facts.theatre?.slug ?? null,
          runtimeMinutes: facts.runtimeMinutes,
          intervalMinutes: facts.intervalMinutes,
          minAgeGuidance: facts.minAgeGuidance,
          isOnShow: facts.isOnShow,
          songsCount: facts._count.songs,
        }}
      />

      <div className="mx-auto max-w-3xl px-4 pb-10">
        <AdSenseUnit slot={AD_SLOTS.inArticle} />
      </div>
    </>
  );
}
