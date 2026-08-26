"use server";

import db from "../db";
import { unstable_cache } from "next/cache";

/**
 * お土産は seed スクリプトからしか更新されないので、
 * 一覧はビルド間で使い回せる。1日キャッシュする。
 */
export const fetchSouvenirs = unstable_cache(
  async () =>
    db.souvenir.findMany({
      orderBy: [{ displayOrder: "asc" }],
    }),
  ["souvenirs-all"],
  { revalidate: 60 * 60 * 24 },
);

export const fetchSouvenirSlugs = unstable_cache(
  async () => db.souvenir.findMany({ select: { slug: true } }),
  ["souvenir-slugs"],
  { revalidate: 60 * 60 * 24 },
);

/**
 * 詳細ページ用。1件だけ引く。
 * 一覧(fetchSouvenirs)と違ってキャッシュを噛ませないのは、
 * generateStaticParams でビルド時に全件描画されるため。
 */
export const fetchSouvenir = async (slug: string) =>
  db.souvenir.findUnique({
    where: { slug },
    include: { faqs: { orderBy: { displayOrder: "asc" } } },
  });
