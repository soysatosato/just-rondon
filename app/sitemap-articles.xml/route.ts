import db from "@/utils/db";
import { SITE_URL } from "@/lib/seo";
import { modifiedDateOf, publishedWhere } from "@/lib/publish-schedule";
import { fetchCurrentBriefs } from "@/utils/actions/weekly";

/**
 * 公開の時刻が決まっている読み物・週報・月次号の sitemap。
 *
 * ほかの URL は next-sitemap がビルドの後に public/sitemap-0.xml へ書き出す。
 * あちらはデプロイのときにしか作られないので、予約しておいた記事が公開の
 * 時刻を過ぎても、次のデプロイまで sitemap に載らなかった(2026-10-27 には、
 * 10/25〜26 に公開した3本が抜けていた)。ここは ISR で1時間ごとに作り直す。
 * 記事ページ自体も ISR(1時間)で出るので、遅れは同じ程度に収まる。
 *
 * 索引(sitemap.xml)には next-sitemap.config.js の additionalSitemaps で
 * 載せている。ここに出す URL は、あちらの exclude で二重に載らないようにしてある。
 */
export const revalidate = 3600;

/**
 * ここに出す読み物。「ロンドンの街」(area)は伏せていて noindex なので入れない。
 */
const READING_BASES = {
  column: "/column",
  "british-english": "/british-english",
  "modern-britain": "/modern-britain",
} as const;

type ReadingCategory = keyof typeof READING_BASES;

const isReadingCategory = (value: string): value is ReadingCategory =>
  value in READING_BASES;

const escapeXml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

export async function GET() {
  const now = new Date();
  const [reading, briefs, issues, { brief: shownOnEvents }] = await Promise.all(
    [
      db.content.findMany({
        where: {
          category: { in: Object.keys(READING_BASES) },
          ...publishedWhere(),
        },
        select: {
          category: true,
          slug: true,
          publishedAt: true,
          createdAt: true,
          revisedAt: true,
        },
        orderBy: { publishedAt: "desc" },
      }),
      db.weeklyBrief.findMany({
        where: { published: true },
        select: { slug: true, updatedAt: true },
        orderBy: { weekStart: "desc" },
      }),
      db.monthlyChangeIssue.findMany({
        where: { publishedAt: { lte: now } },
        select: { slug: true, updatedAt: true },
        orderBy: { monthStart: "desc" },
      }),
      fetchCurrentBriefs(),
    ],
  );

  const entries: { path: string; lastmod: Date }[] = [];

  // 記事の日付と同じ値(lib/publish-schedule.ts の modifiedDateOf)。
  for (const c of reading) {
    if (!isReadingCategory(c.category)) continue;
    entries.push({
      path: `${READING_BASES[c.category]}/${c.slug}`,
      lastmod: modifiedDateOf(c),
    });
  }

  // /events に出ている号は canonical を /events に向けているので載せない
  // (判定は号のページと同じ fetchCurrentBriefs)。
  for (const b of briefs) {
    if (b.slug === shownOnEvents?.slug) continue;
    entries.push({ path: `/events/week/${b.slug}`, lastmod: b.updatedAt });
  }

  // 週次と違って月次のハブは号の本文を持たないので、最新号も自分の URL を正とする。
  for (const issue of issues) {
    entries.push({ path: `/changes/${issue.slug}`, lastmod: issue.updatedAt });
  }

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries.map(
      (e) =>
        `<url><loc>${escapeXml(`${SITE_URL}${e.path}`)}</loc><lastmod>${e.lastmod.toISOString()}</lastmod></url>`,
    ),
    "</urlset>",
  ].join("\n");

  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
