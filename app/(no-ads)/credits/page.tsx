import Link from "next/link";

import { SitePageHeader, SitePageShell } from "@/components/site/SitePageLayout";
import { areaPath } from "@/components/areas/jsonld";
import { britishEnglishPath } from "@/components/british-english/jsonld";
import { columnPath } from "@/components/column/jsonld";
import { modernBritainPath } from "@/components/modern-britain/jsonld";
import { museumPath } from "@/components/museums/jsonld";
import { publishedWhere } from "@/lib/publish-schedule";
import { eventMonthPath } from "@/lib/events";
import { getMonthGuide } from "@/lib/london-months/content";
import { allEventGuides, eventGuidePath } from "@/lib/annual-events";
import { buildPageMetadata } from "@/lib/seo";
import db from "@/utils/db";

// 画像の差し替えはスクリプトで DB に入るので、1日1回描き直せば足りる。
export const revalidate = 86400;

export const metadata = buildPageMetadata({
  path: "/credits",
  title: "画像クレジット",
  description:
    "ジャスト・ロンドンが Wikimedia Commons から借りている写真の作者とライセンスの一覧です。観光スポット・美術館・作品・読み物ごとに、掲載ページと元のファイルへのリンクを載せています。",
});

/*
 * 一覧カードやトップのモザイクは、写真の下に表記を入れる余白が無い。
 * 詳細ページでは写真の下に ImageCredit を出しているが、カードだけを
 * 見た読者にも出どころを辿れるよう、ここに全件を集める。CC BY 4.0 は
 * 「必要な情報を載せたページへのリンク」での表示を認めている(3(a)(2))。
 *
 * 歴史・近郊の街・ショッピングなど、コードに書いた特集の写真は
 * 本文中の写真の下に表記があるので、ここには載せない。ただし
 * 「◯月のロンドン」と年中行事ガイドの写真は og:image にも使い、
 * Discover や SNS のカードに表記なしで出るので、ここに集める。
 */

type CreditRow = {
  key: string;
  name: string;
  href: string;
  credit: string;
  link: string | null;
};

type CreditGroup = {
  title: string;
  rows: CreditRow[];
};

const READING_PATHS: Record<string, (slug: string) => string> = {
  column: columnPath,
  "british-english": britishEnglishPath,
  "modern-britain": modernBritainPath,
  area: areaPath,
};

async function fetchCreditGroups(): Promise<CreditGroup[]> {
  const commons = { imageSource: "commons", imageCredit: { not: null } };

  const [attractions, museums, artworks, readings, briefs, changeIssues] = await Promise.all([
    db.attraction.findMany({
      where: { ...commons, isPublished: true },
      select: { slug: true, name: true, imageCredit: true, imageLink: true },
      orderBy: { name: "asc" },
    }),
    db.museum.findMany({
      where: commons,
      select: { slug: true, name: true, imageCredit: true, imageLink: true },
      orderBy: { name: "asc" },
    }),
    db.artwork.findMany({
      where: commons,
      select: {
        id: true,
        title: true,
        imageCredit: true,
        imageLink: true,
        museum: { select: { slug: true } },
      },
      orderBy: { title: "asc" },
    }),
    db.content.findMany({
      where: {
        ...commons,
        ...publishedWhere(),
        category: { in: Object.keys(READING_PATHS) },
      },
      select: {
        slug: true,
        category: true,
        title: true,
        imageCredit: true,
        imageLink: true,
      },
      orderBy: { publishedAt: "desc" },
    }),
    // 号の写真。ページでは題字の下に表記があるが、Discover や SNS の
    // カードには表記が出ないので、ここにも集める。
    db.weeklyBrief.findMany({
      where: { ...commons, published: true },
      select: { slug: true, title: true, imageCredit: true, imageLink: true },
      orderBy: { weekStart: "desc" },
    }),
    db.monthlyChangeIssue.findMany({
      where: { ...commons, publishedAt: { lte: new Date() } },
      select: { slug: true, title: true, imageCredit: true, imageLink: true },
      orderBy: { monthStart: "desc" },
    }),
  ]);

  return [
    {
      title: "観光スポット",
      rows: attractions.map((a) => ({
        key: a.slug,
        name: a.name,
        href: `/sightseeing/${a.slug}`,
        credit: a.imageCredit!,
        link: a.imageLink,
      })),
    },
    {
      title: "美術館・博物館",
      rows: museums.map((m) => ({
        key: m.slug,
        name: m.name,
        href: museumPath(m.slug),
        credit: m.imageCredit!,
        link: m.imageLink,
      })),
    },
    {
      title: "作品",
      rows: artworks.map((a) => ({
        key: a.id,
        name: a.title,
        href: `/museums/${a.museum.slug}/artworks/${a.id}`,
        credit: a.imageCredit!,
        link: a.imageLink,
      })),
    },
    {
      title: "読み物",
      rows: readings.map((c) => ({
        key: `${c.category}/${c.slug}`,
        name: c.title,
        href: READING_PATHS[c.category](c.slug),
        credit: c.imageCredit!,
        link: c.imageLink,
      })),
    },
    {
      title: "今週のロンドン・今月変わったロンドン",
      rows: [
        ...briefs.map((b) => ({
          key: `week/${b.slug}`,
          name: b.title,
          href: `/events/week/${b.slug}`,
          credit: b.imageCredit!,
          link: b.imageLink,
        })),
        ...changeIssues.map((m) => ({
          key: `changes/${m.slug}`,
          name: m.title,
          href: `/changes/${m.slug}`,
          credit: m.imageCredit!,
          link: m.imageLink,
        })),
      ],
    },
    {
      title: "◯月のロンドン・年中行事ガイド",
      rows: guidePhotoRows(),
    },
  ].filter((group) => group.rows.length > 0);
}

/** コードに書いた月ページと行事ガイドの写真。書いた順(月、行事)。 */
function guidePhotoRows(): CreditRow[] {
  const months = Array.from({ length: 12 }, (_, i) => i + 1).flatMap((month) => {
    const photo = getMonthGuide(month)?.photo;
    return photo
      ? [
          {
            key: `month/${month}`,
            name: `${month}月のロンドン`,
            href: eventMonthPath(month),
            credit: photo.credit,
            link: photo.link,
          },
        ]
      : [];
  });
  const guides = allEventGuides().flatMap((guide) =>
    guide.photo
      ? [
          {
            key: `guide/${guide.slug}`,
            name: guide.title,
            href: eventGuidePath(guide),
            credit: guide.photo.credit,
            link: guide.photo.link,
          },
        ]
      : [],
  );
  return [...months, ...guides];
}

export default async function CreditsPage() {
  const groups = await fetchCreditGroups();

  return (
    <SitePageShell>
      <SitePageHeader
        kicker="Credits"
        title="画像クレジット"
        lede="当サイトの写真の多くは Wikimedia Commons から、それぞれのライセンスに従って借りています。各ページのメイン写真の作者とライセンスを、掲載ページごとにまとめました。"
      />

      <p className="mt-6 text-sm leading-7 text-neutral-600 dark:text-neutral-400">
        作者名のリンクから Commons のファイルページに移動できます。CC BY-SA
        の写真は、利用する人が同じライセンスで公開することを条件に、誰でも再利用できます。
        掲載に問題がある場合は
        <Link href="/contact" className="underline underline-offset-2">
          お問い合わせ
        </Link>
        からご連絡ください。
      </p>

      <div className="mt-12 divide-y divide-neutral-200 dark:divide-neutral-800">
        {groups.map((group) => (
          <section key={group.title} className="py-8 first:pt-0">
            <h2 className="text-lg font-bold tracking-tight md:text-xl">
              {group.title}
              <span className="ml-2 text-sm font-normal tabular-nums text-neutral-500 dark:text-neutral-400">
                {group.rows.length}件
              </span>
            </h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              {group.rows.map((row) => (
                <li key={row.key} className="leading-relaxed">
                  <Link
                    href={row.href}
                    className="font-medium underline-offset-2 hover:underline"
                  >
                    {row.name}
                  </Link>
                  <span className="block text-xs text-neutral-500 dark:text-neutral-400">
                    {row.link ? (
                      <a
                        href={row.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline underline-offset-2 hover:opacity-80"
                      >
                        {row.credit}
                      </a>
                    ) : (
                      row.credit
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </SitePageShell>
  );
}
