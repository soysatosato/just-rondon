import db from "@/utils/db";
import { stampType, STAMP_TYPES, type StampType } from "@/lib/stamps";

/**
 * 旅仲間とスタンプ帳を重ねる(/stamps/together)。サーバー側専用。
 *
 * 自分と相手(複数可)のスタンプを場所ごとに突き合わせ、
 * 「全員が行った / 誰かが行った / まだ誰も行っていない」に分ける。
 * 予定を立てるのに効くのは後ろの2つで、
 *
 * - まだ誰も行っていない場所は、一緒に行く候補そのもの。
 * - 誰かだけが行った場所は、行った人が案内役になれる。
 *
 * ★ 呼ぶ側は memberIds に、auth() で決めた自分と、自分とつながっていることを
 *   確かめた相手(lib/stamp-friends.ts の listFriends の結果)だけを入れること。
 *   ここでは確かめない。任意の clerkId を通すと、つながっていない人の
 *   スタンプが見えてしまう。
 */

export type TogetherVisit = {
  /** 押した人。memberIds の添字。 */
  member: number;
  onSite: boolean;
};

export type TogetherPlace = {
  type: StampType;
  slug: string;
  name: string;
  image: string;
  /** 観光スポットのエリア(Attraction.area)。美術館とミュージカルは null。 */
  area: string | null;
  /** 定番(観光スポットとミュージカルの mustSee)。 */
  mustSee: boolean;
  /** 押した人。memberIds の順に並ぶ。押した日時は相手に見せないので持たない。 */
  visits: TogetherVisit[];
  /**
   * これから一緒に行けるか。上演が終わったミュージカルは false で、
   * 「まだ誰も行っていない」には出さない(観た人の記録としては残す)。
   */
  bookable: boolean;
  /** 並べ替えに使う閲覧数。読者がよく見ている順を「行きたい順」の代わりにする。 */
  views: number;
};

const PLACE_SELECT = { id: true, slug: true, name: true, image: true, views: true } as const;

/**
 * 重ねる材料を引く。
 *
 * 観光スポットは公開中のものだけ。伏せたスポットは詳細ページが無く、
 * 押してあってもリンク先が 404 になる。
 */
export async function loadTogetherPlaces(
  memberIds: readonly string[],
): Promise<TogetherPlace[]> {
  const [stamps, attractions, museums, musicals] = await Promise.all([
    db.stamp.findMany({
      where: { profileId: { in: [...memberIds] } },
      select: {
        profileId: true,
        onSite: true,
        attractionId: true,
        museumId: true,
        musicalId: true,
      },
    }),
    db.attraction.findMany({
      where: { isPublished: true },
      select: { ...PLACE_SELECT, area: true, mustSee: true },
    }),
    db.museum.findMany({ select: PLACE_SELECT }),
    db.musical.findMany({
      select: { ...PLACE_SELECT, mustSee: true, isOnShow: true },
    }),
  ]);

  const memberIndex = new Map(memberIds.map((id, i) => [id, i]));
  const visitsByPlace = new Map<string, TogetherVisit[]>();
  for (const stamp of stamps) {
    const type = stampType(stamp);
    const member = memberIndex.get(stamp.profileId);
    if (!type || member === undefined) continue;
    const id = stamp.attractionId ?? stamp.museumId ?? stamp.musicalId;
    const key = `${type}:${id}`;
    const visits = visitsByPlace.get(key) ?? [];
    visits.push({ member, onSite: stamp.onSite });
    visitsByPlace.set(key, visits);
  }

  const place = (
    type: StampType,
    row: { id: string; slug: string; name: string; image: string; views: number },
    extra: { area?: string | null; mustSee?: boolean; bookable?: boolean },
  ): TogetherPlace => ({
    type,
    slug: row.slug,
    name: row.name,
    image: row.image,
    area: extra.area ?? null,
    mustSee: extra.mustSee ?? false,
    visits: (visitsByPlace.get(`${type}:${row.id}`) ?? []).sort(
      (a, b) => a.member - b.member,
    ),
    bookable: extra.bookable ?? true,
    views: row.views,
  });

  return [
    ...attractions.map((a) =>
      place("attraction", a, { area: a.area, mustSee: a.mustSee }),
    ),
    ...museums.map((m) => place("museum", m, {})),
    ...musicals.map((m) =>
      place("musical", m, { mustSee: m.mustSee, bookable: m.isOnShow }),
    ),
  ].sort(comparePlaces);
}

/** 定番を先に、次に読者がよく見ている順。同じなら名前順。 */
function comparePlaces(a: TogetherPlace, b: TogetherPlace): number {
  if (a.mustSee !== b.mustSee) return a.mustSee ? -1 : 1;
  if (a.views !== b.views) return b.views - a.views;
  return a.name.localeCompare(b.name, "ja");
}

export type TogetherOverlap = {
  /** まだ誰も行っていない、これから行ける場所。 */
  nobody: TogetherPlace[];
  /** 誰かが行った(全員ではない)場所。 */
  some: TogetherPlace[];
  /** 全員が行った場所。 */
  everyone: TogetherPlace[];
};

/** 重なり方で3つに分ける。それぞれ loadTogetherPlaces の並び順を保つ。 */
export function splitByOverlap(
  places: readonly TogetherPlace[],
  memberCount: number,
): TogetherOverlap {
  const result: TogetherOverlap = { nobody: [], some: [], everyone: [] };
  for (const p of places) {
    if (p.visits.length === 0) {
      if (p.bookable) result.nobody.push(p);
    } else if (p.visits.length >= memberCount) {
      result.everyone.push(p);
    } else {
      result.some.push(p);
    }
  }
  return result;
}

/** 種別ごとに分ける。STAMP_TYPES の順。 */
export function groupByType(
  places: readonly TogetherPlace[],
): { type: StampType; places: TogetherPlace[] }[] {
  return STAMP_TYPES.map((type) => ({
    type,
    places: places.filter((p) => p.type === type),
  })).filter((group) => group.places.length > 0);
}

/** 各人が押した数。memberIds の順。 */
export function countByMember(
  places: readonly TogetherPlace[],
  memberCount: number,
): number[] {
  const counts = Array.from({ length: memberCount }, () => 0);
  for (const p of places) {
    for (const v of p.visits) counts[v.member] += 1;
  }
  return counts;
}
