import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { Prisma } from "@prisma/client";

import db from "@/utils/db";
import {
  isOnSite,
  isStampType,
  STAMP_FOREIGN_KEY,
  type Position,
  type StampType,
} from "@/lib/stamps";

/**
 * スタンプの読み書き API。
 *
 * 詳細ページ(観光スポット・美術館・ミュージカル)のスタンプボタンから
 * 叩かれる。ページ本体ではなく API 越しにしているのは、詳細ページが
 * ISR でキャッシュされるため。ログイン状態をHTMLに混ぜると、
 * 押した状態のHTMLが他人にも配られることになる。
 *
 * ★ 金スタンプ(現地で押した印)の判定はここでしか行わない。
 *   クライアントから来るのは端末が報告した座標と誤差までで、
 *   「現地です」という主張は受け取らない。
 */

/** ログイン必須の操作を弾く。 */
function unauthorized() {
  return NextResponse.json(
    { error: "ログインしてください", signedIn: false },
    { status: 401 },
  );
}

/** クライアントから来た種別とidの組を検証する。 */
function readTarget(type: unknown, id: unknown) {
  if (!isStampType(type)) return null;
  if (typeof id !== "string" || id.length === 0 || id.length > 64) return null;
  return { type, id };
}

/** その種別の外部キー1本だけを見る where 句。 */
function targetWhere(profileId: string, type: StampType, id: string) {
  return { profileId, [STAMP_FOREIGN_KEY[type]]: id };
}

/**
 * 対象の座標を引く。存在しない id はここで null になる。
 *
 * ミュージカルは劇場の座標を優先する。作品側の lat/lng は劇場紐付けが
 * 済むまでの控えで、移転や劇場変更のあとも古い座標が残りうる
 * (詳細ページの地図も同じ順で参照している)。
 */
async function fetchTargetCoords(
  type: StampType,
  id: string,
): Promise<{ lat: number; lng: number } | null> {
  if (type === "attraction") {
    return db.attraction.findUnique({
      where: { id },
      select: { lat: true, lng: true },
    });
  }
  if (type === "museum") {
    return db.museum.findUnique({
      where: { id },
      select: { lat: true, lng: true },
    });
  }
  const musical = await db.musical.findUnique({
    where: { id },
    select: { lat: true, lng: true, theatre: { select: { lat: true, lng: true } } },
  });
  if (!musical) return null;
  return musical.theatre ?? { lat: musical.lat, lng: musical.lng };
}

/**
 * Profile の行が無ければ、Clerk のアカウントから作る。
 *
 * サインアップ時ではなく最初にスタンプを押した瞬間に作る。Stamp から
 * Profile.clerkId へ外部キーが張ってあるので、行が無いままでは押せない。
 *
 * username は Profile 側で一意なのに、Clerk では未設定でも構わない列。
 * メールアドレスの @ より前を種にして、衝突したら連番を足す。
 * 読者に名前を決めさせる画面は挟まない——スタンプを押そうとした人に
 * 別のフォームを見せると、そこで半分が帰る。
 */
async function ensureProfile(clerkId: string): Promise<void> {
  const existing = await db.profile.findUnique({
    where: { clerkId },
    select: { id: true },
  });
  if (existing) return;

  const user = await currentUser();
  const email = user?.emailAddresses?.[0]?.emailAddress ?? "";
  const base =
    (user?.username || email.split("@")[0] || "traveller")
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, "")
      .slice(0, 20) || "traveller";

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const username = attempt === 0 ? base : `${base}-${attempt + 1}`;
    try {
      await db.profile.create({
        data: {
          clerkId,
          username,
          email,
          profileImage: user?.imageUrl ?? "",
        },
      });
      return;
    } catch (error) {
      // P2002 = 一意制約違反。username か、並行リクエストによる clerkId の
      // 二重作成。clerkId で衝突したなら行はもう在るので、そのまま抜ける。
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        const fields = (error.meta?.target ?? []) as string[];
        if (fields.includes("clerkId")) return;
        continue;
      }
      throw error;
    }
  }
  // 5回試して username が空かないのは、同じメールの持ち主が5人居るとき
  // くらいしか起きない。最後は乱数で必ず通す。
  await db.profile.create({
    data: {
      clerkId,
      username: `${base}-${Math.random().toString(36).slice(2, 8)}`,
      email: "",
      profileImage: "",
    },
  });
}

/**
 * 押した/押していないを返す。
 *
 * 未ログインでも 200 を返す。ボタンは記事ページに常に出ているので、
 * 読むだけの読者のコンソールに毎ページ 401 を積むのは筋が違う。
 */
export async function GET(req: NextRequest) {
  const target = readTarget(
    req.nextUrl.searchParams.get("type"),
    req.nextUrl.searchParams.get("id"),
  );
  if (!target) {
    return NextResponse.json({ error: "対象が不正です" }, { status: 400 });
  }

  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ signedIn: false, stamped: false });
  }

  const stamp = await db.stamp.findFirst({
    where: targetWhere(userId, target.type, target.id),
    select: { stampedAt: true, onSite: true },
  });

  return NextResponse.json({
    signedIn: true,
    stamped: Boolean(stamp),
    onSite: stamp?.onSite ?? false,
    stampedAt: stamp?.stampedAt?.toISOString() ?? null,
  });
}

/**
 * スタンプを押す。
 *
 * 位置情報(lat/lng/accuracy)は任意。付いていて、かつ施設から
 * ON_SITE_RADIUS_KM 以内なら金スタンプになる。
 *
 * 既に押してある場所にもう一度押せるようにしてあるのは、家で押した
 * 赤いスタンプを現地で金に上げるため。金から赤へは下げない。
 */
export async function POST(req: NextRequest) {
  const { userId } = auth();
  if (!userId) return unauthorized();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "不正なリクエスト" }, { status: 400 });
  }

  const { type: rawType, id: rawId, lat, lng, accuracy } = (body ?? {}) as {
    type?: unknown;
    id?: unknown;
    lat?: unknown;
    lng?: unknown;
    accuracy?: unknown;
  };

  const target = readTarget(rawType, rawId);
  if (!target) {
    return NextResponse.json({ error: "対象が不正です" }, { status: 400 });
  }

  const coords = await fetchTargetCoords(target.type, target.id);
  if (!coords) {
    return NextResponse.json({ error: "対象が見つかりません" }, { status: 404 });
  }

  const position: Position | null =
    typeof lat === "number" && typeof lng === "number"
      ? { lat, lng, accuracy: typeof accuracy === "number" ? accuracy : null }
      : null;
  const onSite = isOnSite(coords, position);

  const where = targetWhere(userId, target.type, target.id);
  const existing = await db.stamp.findFirst({
    where,
    select: { id: true, onSite: true, stampedAt: true },
  });

  if (existing) {
    // 現地で押し直したときだけ金に上げる。日時は最初に押した日のまま。
    // ここを更新すると、旅行中に押し直すたびにスタンプ帳の並びが変わる。
    if (onSite && !existing.onSite) {
      const upgraded = await db.stamp.update({
        where: { id: existing.id },
        data: { onSite: true },
        select: { stampedAt: true },
      });
      return NextResponse.json({
        signedIn: true,
        stamped: true,
        onSite: true,
        upgraded: true,
        stampedAt: upgraded.stampedAt.toISOString(),
      });
    }
    return NextResponse.json({
      signedIn: true,
      stamped: true,
      onSite: existing.onSite,
      upgraded: false,
      stampedAt: existing.stampedAt.toISOString(),
      // 現地で押そうとして届かなかったことは、押した本人に伝える必要がある。
      // 黙って赤のままにすると「金にならない」理由が分からない。
      outOfRange: Boolean(position) && !onSite,
    });
  }

  await ensureProfile(userId);

  try {
    const created = await db.stamp.create({
      data: {
        profileId: userId,
        [STAMP_FOREIGN_KEY[target.type]]: target.id,
        onSite,
      },
      select: { stampedAt: true },
    });
    return NextResponse.json({
      signedIn: true,
      stamped: true,
      onSite,
      upgraded: false,
      stampedAt: created.stampedAt.toISOString(),
      outOfRange: Boolean(position) && !onSite,
    });
  } catch (error) {
    // 連打で2回同時に届いたときの一意制約違反。1個押せていれば目的は
    // 達しているので、失敗として返さない。
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      const stamp = await db.stamp.findFirst({
        where,
        select: { onSite: true, stampedAt: true },
      });
      return NextResponse.json({
        signedIn: true,
        stamped: true,
        onSite: stamp?.onSite ?? onSite,
        upgraded: false,
        stampedAt: stamp?.stampedAt?.toISOString() ?? null,
      });
    }
    throw error;
  }
}

/**
 * スタンプを取り消す。
 *
 * 押し間違い(隣の館のページで押した、作品を勘違いした)を直せないと、
 * スタンプ帳が「行っていない場所」を含んだまま残り、記録として信用できなくなる。
 */
export async function DELETE(req: NextRequest) {
  const { userId } = auth();
  if (!userId) return unauthorized();

  const target = readTarget(
    req.nextUrl.searchParams.get("type"),
    req.nextUrl.searchParams.get("id"),
  );
  if (!target) {
    return NextResponse.json({ error: "対象が不正です" }, { status: 400 });
  }

  await db.stamp.deleteMany({
    where: targetWhere(userId, target.type, target.id),
  });

  return NextResponse.json({ signedIn: true, stamped: false, onSite: false });
}
