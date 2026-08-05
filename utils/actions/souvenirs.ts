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
