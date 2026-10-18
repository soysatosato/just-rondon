import Link from "next/link";

import { SitePageHeader, SitePageShell } from "@/components/site/SitePageLayout";
import { areaPath } from "@/components/areas/jsonld";
import { britishEnglishPath } from "@/components/british-english/jsonld";
import { columnPath } from "@/components/column/jsonld";
import { modernBritainPath } from "@/components/modern-britain/jsonld";
import { museumPath } from "@/components/museums/jsonld";
import { publishedWhere } from "@/lib/publish-schedule";
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
 * 本文中の写真の下に表記があるので、ここには載せない。
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

  const [attractions, museums, artworks, readings] = await Promise.all([
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
  ].filter((group) => group.rows.length > 0);
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

      <p className="mt-6 text-sm leading-7 text-gray-600 dark:text-gray-400">
        作者名のリンクから Commons のファイルページに移動できます。CC BY-SA
        の写真は、利用する人が同じライセンスで公開することを条件に、誰でも再利用できます。
        掲載に問題がある場合は
        <Link href="/contact" className="underline underline-offset-2">
          お問い合わせ
        </Link>
        からご連絡ください。
      </p>

      <div className="mt-12 divide-y divide-gray-200 dark:divide-neutral-800">
        {groups.map((group) => (
          <section key={group.title} className="py-8 first:pt-0">
            <h2 className="text-lg font-bold tracking-tight md:text-xl">
              {group.title}
              <span className="ml-2 text-sm font-normal tabular-nums text-gray-500 dark:text-gray-400">
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
                  <span className="block text-xs text-gray-500 dark:text-gray-400">
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
