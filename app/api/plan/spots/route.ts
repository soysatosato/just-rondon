import { NextRequest, NextResponse } from "next/server";

import db from "@/utils/db";
import { MAX_SPOTS } from "@/lib/plan";
import { PLAN_SPOT_SELECT, toPlanSpot } from "@/utils/plan-spots";

/**
 * /plan のスポット一覧(1時間キャッシュ)に無い slug を引き直す。
 *
 * 一覧はページと一緒にキャッシュされるので、公開を切り替えた直後は
 * 実際の DB と食い違う。以前の /plan は一覧に無い slug を「非公開になった」
 * とみなしてプランから消していたが、それだと新しく載せたスポットを詳細ページ
 * から足した読者が、/plan を開いた瞬間にそれを失う。そこで /plan は
 * 知らない slug を消さずにここへ問い合わせ、公開中なら行として足し、
 * 伏せたものなら名前を添えて「掲載していません」と出す。
 *
 * 伏せた行の名前を返すのは、終わった催しをプランに残している読者に
 * 何が外れたのかを伝えるため。返すのは名前だけで、本文は返さない。
 */

const SLUG_PATTERN = /^[a-z0-9-]+$/;

export async function GET(req: NextRequest) {
  const slugs = [
    ...new Set(
      (req.nextUrl.searchParams.get("slugs") ?? "")
        .split(",")
        .filter((slug) => SLUG_PATTERN.test(slug)),
    ),
  ].slice(0, MAX_SPOTS);

  if (slugs.length === 0) {
    return NextResponse.json({ spots: [], hidden: [] });
  }

  const rows = await db.attraction.findMany({
    where: { slug: { in: slugs } },
    select: { ...PLAN_SPOT_SELECT, isPublished: true },
  });

  const spots = rows
    .filter((row) => row.isPublished)
    .map(({ isPublished: _published, ...row }) => toPlanSpot(row));
  const hidden = rows
    .filter((row) => !row.isPublished)
    .map((row) => ({ slug: row.slug, name: row.name }));

  return NextResponse.json(
    { spots, hidden },
    // 公開の切り替えは日に数回なので、同じ問い合わせは CDN に5分持たせる。
    { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } },
  );
}
