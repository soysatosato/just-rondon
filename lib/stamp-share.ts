import { randomBytes } from "node:crypto";
import { Prisma } from "@prisma/client";

import db from "@/utils/db";
import {
  areaGuides,
  type AreaMeta,
} from "@/components/sightseeing/areas/areas";
import { attractionSlugForMuseum } from "@/lib/museum-attraction-pairs";
import { ensureProfile } from "@/lib/profile";
import { placeKey } from "@/lib/stamp-rallies";
import {
  stampTitleFor,
  stampType,
  STAMP_TYPES,
  type StampTitle,
  type StampType,
} from "@/lib/stamps";

/**
 * 旅のしおり。スタンプ帳を、これからロンドンへ行く友人向けの公開ページ
 * (/stamps/shiori/…)にする。サーバー側専用。
 *
 * スタンプ帳は「自分がどこまで来たか」を見る帳面で、台紙も称号も本人のための
 * もの。友人が知りたいのは「どこへ行けばいいか」なので、しおりでは同じ
 * スタンプを行き先として並べ直す。
 *
 * - 観光スポットはエリアガイドのエリアごとにまとめ、エリアガイドへ送る。
 *   同じエリアのものは半日で一緒に回れるので、そのまま予定の単位になる。
 * - 押した場所が出てくるコラムを添える(ContentAttraction)。
 *
 * ★ 押した日時と金のスタンプかどうかは、ここで DB から引きもしない。
 *   誰でも開けるページに「いつ・現地で」が並ぶと、新しい金のスタンプが
 *   増えたことで、いまロンドンのどこに居るかが知らない人にまで伝わる。
 *   並び順も押した順にはしない(いちばん新しいものが分かってしまう)。
 *
 * ★ 誰の操作かは、呼ぶ側が auth() で決めた clerkId だけを渡すこと
 *   (lib/stamp-friends.ts と同じ)。
 */

/** しおりのURL。 */
export function shioriPath(token: string): string {
  return `/stamps/shiori/${token}`;
}

/** リンクの値のバイト数。base64url で22文字になる(招待リンクと同じ長さ)。 */
const TOKEN_BYTES = 16;
const TOKEN_PATTERN = /^[A-Za-z0-9_-]{22}$/;

function newToken(): string {
  return randomBytes(TOKEN_BYTES).toString("base64url");
}

function isUniqueViolation(error: unknown, field: string): boolean {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError)) return false;
  if (error.code !== "P2002") return false;
  const target = error.meta?.target;
  return Array.isArray(target) && target.includes(field);
}

/* ------------------------------------------------------------------ *
 * リンク
 * ------------------------------------------------------------------ */

/** 公開中のしおりの token。公開していなければ null。 */
export async function findShareToken(me: string): Promise<string | null> {
  const row = await db.stampShare.findUnique({
    where: { profileId: me },
    select: { token: true },
  });
  return row?.token ?? null;
}

/** しおりを公開する。もう公開していれば、そのリンクをそのまま返す。 */
export async function publishShare(me: string): Promise<string> {
  const existing = await findShareToken(me);
  if (existing) return existing;

  // StampShare は Profile.clerkId を外部キーで指すので、先に行が要る。
  await ensureProfile(me);
  try {
    const created = await db.stampShare.create({
      data: { profileId: me, token: newToken() },
      select: { token: true },
    });
    return created.token;
  } catch (error) {
    // 同じ人のリクエストが同時に2本来て、もう片方が先に作った。
    if (isUniqueViolation(error, "profileId")) {
      const row = await db.stampShare.findUniqueOrThrow({
        where: { profileId: me },
        select: { token: true },
      });
      return row.token;
    }
    throw error;
  }
}

/**
 * リンクを作り直す。前のリンクはこの時点で開けなくなる。
 *
 * 渡した相手の一部にだけ見せるのをやめたいとき用。全員に見せるのを
 * やめるなら unpublishShare。
 */
export async function regenerateShare(me: string): Promise<string> {
  await ensureProfile(me);
  const token = newToken();
  await db.stampShare.upsert({
    where: { profileId: me },
    create: { profileId: me, token },
    update: { token, createdAt: new Date() },
  });
  return token;
}

/** 公開をやめる。リンクは開けなくなる。 */
export async function unpublishShare(me: string): Promise<void> {
  await db.stampShare.deleteMany({ where: { profileId: me } });
}

/** リンクを開いた人に見せる、しおりの持ち主。使えないリンクは null。 */
export async function findShareOwner(
  token: string,
): Promise<{ clerkId: string; username: string } | null> {
  if (!TOKEN_PATTERN.test(token)) return null;
  const row = await db.stampShare.findUnique({
    where: { token },
    select: { profile: { select: { clerkId: true, username: true } } },
  });
  return row?.profile ?? null;
}

/* ------------------------------------------------------------------ *
 * しおりの中身
 * ------------------------------------------------------------------ */

/** しおりに並べる場所1つ。 */
export type ShioriPlace = {
  /** placeKey。表示の key と、印面の傾きの種に使う。 */
  key: string;
  type: StampType;
  slug: string;
  name: string;
  engName: string;
  image: string;
  /** Attraction.category。美術館・ミュージカルは null。 */
  category: string | null;
  /** これから行けるか。上演が終わったミュージカルは false。 */
  bookable: boolean;
};

export type ShioriArea = {
  area: AreaMeta;
  places: ShioriPlace[];
  /** そのエリアで、まだ行っていない公開中の観光スポットの数。 */
  rest: number;
};

export type ShioriColumn = {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  image: string | null;
  seriesName: string | null;
  /** なぜこのコラムを並べたか。null はよく読まれているコラムで埋めた枠。 */
  reason: string | null;
};

export type ShioriData = {
  /** 押したスタンプの数。称号はスタンプ帳と同じくこの数で決まる。 */
  stampCount: number;
  title: StampTitle;
  /** しおりに並べた場所の、種別ごとの数。 */
  counts: Record<StampType, number>;
  /** 表紙に押す印。有名な場所から。 */
  highlights: ShioriPlace[];
  /** エリアガイドのエリアごと。areaGuides の順で、行った場所があるエリアだけ。 */
  areas: ShioriArea[];
  /** エリアに属さない観光スポット。 */
  otherAttractions: ShioriPlace[];
  /** エリアに属さない美術館・博物館。 */
  museums: ShioriPlace[];
  musicals: ShioriPlace[];
  columns: ShioriColumn[];
};

/** コラムの枠の数。 */
const COLUMN_LIMIT = 6;
/** 表紙に押す印の数。 */
const HIGHLIGHT_LIMIT = 5;

/** 並べ替えに使う、場所の有名さ。 */
type Renown = { mustSee: boolean; recommendLevel: number; views: number };

type Candidate = {
  place: ShioriPlace;
  renown: Renown;
  /** エリアガイドのエリア。美術館は対の観光スポットのエリアを借りる。 */
  area: string | null;
  /** この場所にあたる観光スポットの id。コラムを引くのと、エリアの残りを数えるのに使う。 */
  attractionId: string | null;
};

function byRenown(a: Candidate, b: Candidate): number {
  return (
    Number(b.place.bookable) - Number(a.place.bookable) ||
    Number(b.renown.mustSee) - Number(a.renown.mustSee) ||
    b.renown.recommendLevel - a.renown.recommendLevel ||
    b.renown.views - a.renown.views ||
    a.place.name.localeCompare(b.place.name, "ja")
  );
}

/**
 * スタンプを行き先の一覧にする。
 *
 * 大英博物館のように /sightseeing と /museums の両方にある館は、どちらで
 * 押しても同じ場所として1回だけ並べる(両方で押してあれば観光スポットの
 * ほうを残す)。美術館側で押したものも、対の観光スポットのエリアに入れる。
 * 友人から見ればテート・モダンはサウスバンクの一部で、美術館の欄に
 * 離して置くと、同じ半日で回れることが伝わらない。
 */
async function loadCandidates(
  profileId: string,
): Promise<{ stampCount: number; candidates: Candidate[] }> {
  const rows = await db.stamp.findMany({
    where: { profileId },
    // stampedAt と onSite はしおりに載せないので引かない(冒頭のコメント)。
    select: {
      attractionId: true,
      museumId: true,
      musicalId: true,
      attraction: {
        select: {
          id: true,
          slug: true,
          name: true,
          engName: true,
          image: true,
          category: true,
          area: true,
          mustSee: true,
          recommendLevel: true,
          views: true,
          isPublished: true,
        },
      },
      museum: {
        select: {
          id: true,
          slug: true,
          name: true,
          engName: true,
          image: true,
          recommendLevel: true,
          views: true,
        },
      },
      musical: {
        select: {
          id: true,
          slug: true,
          name: true,
          engName: true,
          image: true,
          mustSee: true,
          isOnShow: true,
          recommendLevel: true,
          views: true,
        },
      },
    },
  });

  const candidates: Candidate[] = [];
  const museums: NonNullable<(typeof rows)[number]["museum"]>[] = [];
  const stampedAttractions = new Set<string>();

  for (const row of rows) {
    const type = stampType(row);
    if (type === "attraction" && row.attraction) {
      const a = row.attraction;
      // 伏せたスポットは詳細ページが無く、並べてもリンク先が 404 になる。
      if (!a.isPublished) continue;
      stampedAttractions.add(a.id);
      candidates.push({
        place: {
          key: placeKey({ type, id: a.id }),
          type,
          slug: a.slug,
          name: a.name,
          engName: a.engName ?? a.name,
          image: a.image,
          category: a.category || null,
          bookable: true,
        },
        renown: {
          mustSee: a.mustSee,
          recommendLevel: a.recommendLevel ?? 0,
          views: a.views,
        },
        area: a.area,
        attractionId: a.id,
      });
    } else if (type === "museum" && row.museum) {
      museums.push(row.museum);
    } else if (type === "musical" && row.musical) {
      const m = row.musical;
      candidates.push({
        place: {
          key: placeKey({ type, id: m.id }),
          type,
          slug: m.slug,
          name: m.name,
          engName: m.engName,
          image: m.image,
          category: null,
          bookable: m.isOnShow,
        },
        renown: {
          mustSee: m.mustSee,
          recommendLevel: m.recommendLevel,
          views: m.views,
        },
        area: null,
        attractionId: null,
      });
    }
  }

  // 美術館は、対の観光スポットを引いてから並べる。
  const twinSlugs = museums
    .map((m) => attractionSlugForMuseum(m.slug))
    .filter((slug): slug is string => slug !== null);
  const twins =
    twinSlugs.length > 0
      ? await db.attraction.findMany({
          where: { slug: { in: twinSlugs }, isPublished: true },
          select: { id: true, slug: true, area: true },
        })
      : [];
  const twinBySlug = new Map(twins.map((t) => [t.slug, t]));

  for (const m of museums) {
    const twinSlug = attractionSlugForMuseum(m.slug);
    const twin = twinSlug ? twinBySlug.get(twinSlug) : undefined;
    if (twin && stampedAttractions.has(twin.id)) continue;
    candidates.push({
      place: {
        key: placeKey({ type: "museum", id: m.id }),
        type: "museum",
        slug: m.slug,
        name: m.name,
        engName: m.engName ?? m.name,
        image: m.image,
        category: null,
        bookable: true,
      },
      renown: {
        mustSee: false,
        recommendLevel: m.recommendLevel ?? 0,
        views: m.views,
      },
      area: twin?.area ?? null,
      attractionId: twin?.id ?? null,
    });
  }

  candidates.sort(byRenown);
  return { stampCount: rows.length, candidates };
}

type ColumnRow = Omit<ShioriColumn, "reason"> & { views: number };

const COLUMN_SELECT = {
  id: true,
  slug: true,
  title: true,
  summary: true,
  image: true,
  seriesName: true,
  views: true,
} as const;

/** 「ロンドン塔・大英博物館ほか」。理由の行が長くなりすぎないように2つまで。 */
function joinNames(names: string[]): string {
  const shown = names.slice(0, 2).join("・");
  return names.length > 2 ? `${shown}ほか` : shown;
}

/**
 * しおりに添えるコラム。次の順で COLUMN_LIMIT 本まで埋める。
 *
 * 1. 押した場所が出てくるコラム。出てくる場所が多いものから。
 * 2. 同じエリアのほかのスポットが出てくるコラム。
 * 3. よく読まれているコラム。
 *
 * コラムと観光スポットの対応(ContentAttraction)は人が選んだものだけで、
 * スポット全体の1割強にしか付いていない。1だけだと、多くのしおりで
 * 枠が空く。2と3は、読み物への入口を空けないための埋め草。
 */
async function loadColumns(candidates: Candidate[]): Promise<ShioriColumn[]> {
  const nameByAttraction = new Map<string, string>();
  const areas = new Set<string>();
  for (const c of candidates) {
    if (c.attractionId) nameByAttraction.set(c.attractionId, c.place.name);
    if (c.area) areas.add(c.area);
  }

  const picked: ShioriColumn[] = [];
  const pickedIds = new Set<string>();
  const pick = (column: ColumnRow, reason: string | null) => {
    if (pickedIds.has(column.id) || picked.length >= COLUMN_LIMIT) return;
    pickedIds.add(column.id);
    picked.push({
      id: column.id,
      slug: column.slug,
      title: column.title,
      summary: column.summary,
      image: column.image,
      seriesName: column.seriesName,
      reason,
    });
  };

  // 1. 押した場所が出てくるコラム
  if (nameByAttraction.size > 0) {
    const links = await db.contentAttraction.findMany({
      where: {
        attractionId: { in: [...nameByAttraction.keys()] },
        content: { category: "column" },
      },
      orderBy: { displayOrder: "asc" },
      select: { attractionId: true, content: { select: COLUMN_SELECT } },
    });
    const byColumn = new Map<string, { column: ColumnRow; names: string[] }>();
    for (const link of links) {
      const entry = byColumn.get(link.content.id) ?? {
        column: link.content,
        names: [],
      };
      const name = nameByAttraction.get(link.attractionId);
      if (name && !entry.names.includes(name)) entry.names.push(name);
      byColumn.set(link.content.id, entry);
    }
    [...byColumn.values()]
      .sort(
        (a, b) =>
          b.names.length - a.names.length || b.column.views - a.column.views,
      )
      .forEach(({ column, names }) => pick(column, `${joinNames(names)}が出てきます`));
  }

  // 2. 同じエリアのほかのスポットが出てくるコラム
  if (picked.length < COLUMN_LIMIT && areas.size > 0) {
    const links = await db.contentAttraction.findMany({
      where: {
        attraction: { area: { in: [...areas] }, isPublished: true },
        content: { category: "column", id: { notIn: [...pickedIds] } },
      },
      orderBy: [{ content: { views: "desc" } }, { displayOrder: "asc" }],
      select: {
        attraction: { select: { name: true } },
        content: { select: COLUMN_SELECT },
      },
    });
    for (const link of links) {
      pick(link.content, `同じエリアの${link.attraction.name}が出てきます`);
    }
  }

  // 3. よく読まれているコラム
  if (picked.length < COLUMN_LIMIT) {
    const popular = await db.content.findMany({
      where: { category: "column", id: { notIn: [...pickedIds] } },
      orderBy: [{ views: "desc" }, { createdAt: "desc" }],
      take: COLUMN_LIMIT - picked.length,
      select: COLUMN_SELECT,
    });
    for (const column of popular) pick(column, null);
  }

  return picked;
}

/** しおりのページが描くものを全部読む。 */
export async function loadShiori(profileId: string): Promise<ShioriData> {
  const { stampCount, candidates } = await loadCandidates(profileId);

  const visitedAreas = new Set(
    candidates.map((c) => c.area).filter((a): a is string => a !== null),
  );
  const [areaTotals, columns] = await Promise.all([
    visitedAreas.size > 0
      ? db.attraction.groupBy({
          by: ["area"],
          where: { area: { in: [...visitedAreas] }, isPublished: true },
          _count: { _all: true },
        })
      : Promise.resolve([]),
    loadColumns(candidates),
  ]);
  const totalOf = new Map(areaTotals.map((t) => [t.area, t._count._all]));

  const areas: ShioriArea[] = [];
  for (const area of areaGuides) {
    const inArea = candidates.filter((c) => c.area === area.slug);
    if (inArea.length === 0) continue;
    const covered = new Set(inArea.map((c) => c.attractionId)).size;
    areas.push({
      area,
      places: inArea.map((c) => c.place),
      rest: Math.max((totalOf.get(area.slug) ?? 0) - covered, 0),
    });
  }

  // エリアガイドに無いエリア(Attraction.area に古い値が残っている等)は、
  // エリアに属さないものとして扱う。
  const guided = new Set<string>(areas.map((a) => a.area.slug));
  const loose = candidates.filter((c) => !c.area || !guided.has(c.area));

  const counts = Object.fromEntries(STAMP_TYPES.map((t) => [t, 0])) as Record<
    StampType,
    number
  >;
  for (const c of candidates) counts[c.place.type] += 1;

  return {
    stampCount,
    title: stampTitleFor(stampCount).current,
    counts,
    highlights: candidates
      .filter((c) => c.place.bookable)
      .slice(0, HIGHLIGHT_LIMIT)
      .map((c) => c.place),
    areas,
    otherAttractions: loose
      .filter((c) => c.place.type === "attraction")
      .map((c) => c.place),
    museums: loose.filter((c) => c.place.type === "museum").map((c) => c.place),
    musicals: loose.filter((c) => c.place.type === "musical").map((c) => c.place),
    columns,
  };
}
