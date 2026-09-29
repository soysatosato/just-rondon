import { createHash, randomBytes } from "node:crypto";
import { Prisma } from "@prisma/client";

import db from "@/utils/db";
import { ensureProfile } from "@/lib/profile";
import { INVITE_TTL_DAYS, MAX_FRIENDS } from "@/lib/stamp-friends-shared";

/**
 * スタンプ帳のつながり(旅仲間)と招待リンクを読み書きする。サーバー側専用。
 *
 * パートナーや友人とスタンプ帳をつなぐと、互いに押した場所が見えるようになり、
 * /stamps/together で「まだ誰も行っていない場所」を並べて予定を立てられる。
 * データの持ち方と、向きを持たない理由は schema.prisma の StampFriend。
 *
 * つながる手段は招待リンクだけ。リンクは1人ぶんで、使った時点で消える。
 * URL と上限の数はクライアントからも読むので lib/stamp-friends-shared.ts に置いた。
 *
 * ★ 誰の操作かは、呼ぶ側が auth() で決めた clerkId だけを渡すこと。
 *   クライアントから来た clerkId をここに通すと、他人の名前でつながれる。
 */

/**
 * 1人が同時に持てる、まだ使われていない招待リンクの数。
 *
 * これを超えて作ると、古いものから使えなくなる。グループの全員に1本ずつ
 * 送っても足りる数にしてある。
 */
const MAX_OPEN_INVITES = 10;

const DAY_MS = 24 * 60 * 60 * 1000;

/** 招待の値のバイト数。base64url で22文字になる。 */
const TOKEN_BYTES = 16;
const TOKEN_PATTERN = /^[A-Za-z0-9_-]{22}$/;

/**
 * 2人の clerkId を StampFriend の並び(小さいほうが lowId)にする。
 *
 * 比べ方は JavaScript の文字列比較(UTF-16 のコード単位順)。DB の
 * CHECK 制約はこれに合わせてバイト順(COLLATE "C")で比べている。
 * Clerk の ID は ASCII なので、2つの順序は一致する。
 */
function orderedPair(a: string, b: string): { lowId: string; highId: string } {
  return a < b ? { lowId: a, highId: b } : { lowId: b, highId: a };
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function isUniqueViolation(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  );
}

/** 自分が入っているつながりを引く where 句。 */
function involving(clerkId: string): Prisma.StampFriendWhereInput {
  return { OR: [{ lowId: clerkId }, { highId: clerkId }] };
}

/* ------------------------------------------------------------------ *
 * つながりの一覧
 * ------------------------------------------------------------------ */

export type StampFriend = {
  /** つながり(StampFriend)の id。URL と解除に使う。 */
  id: string;
  /**
   * 相手の clerkId。スタンプを引くためにサーバー側でだけ使う。
   * クライアントコンポーネントに渡さないこと(相手の Clerk のIDは見せる必要が無い)。
   */
  clerkId: string;
  username: string;
  /** 相手が押したスタンプの数。 */
  stampCount: number;
  /** つながった日時。 */
  linkedAt: Date;
};

/** つながっている相手を、新しくつながった順に返す。 */
export async function listFriends(me: string): Promise<StampFriend[]> {
  const rows = await db.stampFriend.findMany({
    where: involving(me),
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      createdAt: true,
      low: { select: { clerkId: true, username: true } },
      high: { select: { clerkId: true, username: true } },
    },
  });
  if (rows.length === 0) return [];

  const others = rows.map((row) =>
    row.low.clerkId === me ? row.high : row.low,
  );
  const counts = await db.stamp.groupBy({
    by: ["profileId"],
    where: { profileId: { in: others.map((o) => o.clerkId) } },
    _count: { _all: true },
  });
  const countOf = new Map(counts.map((c) => [c.profileId, c._count._all]));

  return rows.map((row, i) => ({
    id: row.id,
    clerkId: others[i].clerkId,
    username: others[i].username,
    stampCount: countOf.get(others[i].clerkId) ?? 0,
    linkedAt: row.createdAt,
  }));
}

/** つながりを解除する。どちらの側からでも消せる。消せたら true。 */
export async function unlinkFriend(
  me: string,
  friendId: string,
): Promise<boolean> {
  const { count } = await db.stampFriend.deleteMany({
    where: { id: friendId, ...involving(me) },
  });
  return count > 0;
}

/* ------------------------------------------------------------------ *
 * 招待リンク
 * ------------------------------------------------------------------ */

export type CreateInviteResult =
  | { ok: true; token: string; expiresAt: Date }
  | { ok: false; reason: "full" };

/**
 * 招待リンクを1本作る。
 *
 * 返した token は URL に載せる値そのもので、DB には SHA-256 しか残らない。
 * 同じリンクをあとから出し直すことはできないので、見失ったら作り直してもらう。
 */
export async function createInvite(me: string): Promise<CreateInviteResult> {
  await ensureProfile(me);

  const friendCount = await db.stampFriend.count({ where: involving(me) });
  if (friendCount >= MAX_FRIENDS) return { ok: false, reason: "full" };

  const now = new Date();
  // 期限切れの招待は誰のものでも要らない。専用の掃除の仕組みを
  // 持たずに済むよう、作るついでにまとめて消す。
  await db.stampInvite.deleteMany({ where: { expiresAt: { lte: now } } });

  const open = await db.stampInvite.findMany({
    where: { profileId: me },
    orderBy: { createdAt: "desc" },
    select: { id: true },
  });
  if (open.length >= MAX_OPEN_INVITES) {
    await db.stampInvite.deleteMany({
      where: {
        id: { in: open.slice(MAX_OPEN_INVITES - 1).map((invite) => invite.id) },
      },
    });
  }

  const token = randomBytes(TOKEN_BYTES).toString("base64url");
  const expiresAt = new Date(now.getTime() + INVITE_TTL_DAYS * DAY_MS);
  await db.stampInvite.create({
    data: { tokenHash: hashToken(token), profileId: me, expiresAt },
  });
  return { ok: true, token, expiresAt };
}

export type InviteView = {
  /** 招待した人の clerkId。サーバー側での判定にだけ使う。 */
  inviterId: string;
  inviterUsername: string;
  expiresAt: Date;
};

/** 招待リンクを開いたときの表示用。使えないリンクは null。 */
export async function findInvite(token: string): Promise<InviteView | null> {
  if (!TOKEN_PATTERN.test(token)) return null;
  const invite = await db.stampInvite.findUnique({
    where: { tokenHash: hashToken(token) },
    select: {
      expiresAt: true,
      profile: { select: { clerkId: true, username: true } },
    },
  });
  if (!invite || invite.expiresAt <= new Date()) return null;
  return {
    inviterId: invite.profile.clerkId,
    inviterUsername: invite.profile.username,
    expiresAt: invite.expiresAt,
  };
}

/** me と other がもうつながっていれば、そのつながりの id。 */
export async function findFriendship(
  me: string,
  other: string,
): Promise<string | null> {
  if (me === other) return null;
  const row = await db.stampFriend.findUnique({
    where: { lowId_highId: orderedPair(me, other) },
    select: { id: true },
  });
  return row?.id ?? null;
}

export type AcceptInviteResult =
  | { ok: true; friendId: string }
  | {
      ok: false;
      /**
       * gone: 期限切れ・使用済み・存在しない。
       * self: 自分が作ったリンク。
       * full: どちらかがつながれる上限に達している。
       */
      reason: "gone" | "self" | "full";
    };

/**
 * 招待を受け取ってつながる。
 *
 * 先に招待の行を消してから、つながりを作る。消せなかった(同じリンクを
 * 別の人が一瞬先に使った)ら、そこで止める。1本のリンクで2人が
 * つながることは、この順序で防いでいる。
 *
 * すでにつながっている相手の招待なら、リンクは使わずにそのつながりを返す。
 * 同じ相手からリンクが2回届いただけで、2本目を無駄にする理由が無い。
 */
export async function acceptInvite(
  me: string,
  token: string,
): Promise<AcceptInviteResult> {
  if (!TOKEN_PATTERN.test(token)) return { ok: false, reason: "gone" };

  const now = new Date();
  const invite = await db.stampInvite.findUnique({
    where: { tokenHash: hashToken(token) },
    select: { id: true, profileId: true, expiresAt: true },
  });
  if (!invite || invite.expiresAt <= now) return { ok: false, reason: "gone" };
  if (invite.profileId === me) return { ok: false, reason: "self" };

  const existing = await findFriendship(me, invite.profileId);
  if (existing) return { ok: true, friendId: existing };

  // StampFriend は Profile.clerkId を外部キーで指すので、受け取る側に
  // 行が無いままではつながれない。登録してすぐ招待を開いた人はここで名前が付く。
  await ensureProfile(me);

  const [mine, theirs] = await Promise.all([
    db.stampFriend.count({ where: involving(me) }),
    db.stampFriend.count({ where: involving(invite.profileId) }),
  ]);
  if (mine >= MAX_FRIENDS || theirs >= MAX_FRIENDS) {
    return { ok: false, reason: "full" };
  }

  const consumed = await db.stampInvite.deleteMany({
    where: { id: invite.id, expiresAt: { gt: now } },
  });
  if (consumed.count === 0) return { ok: false, reason: "gone" };

  const pair = orderedPair(me, invite.profileId);
  try {
    const created = await db.stampFriend.create({
      data: pair,
      select: { id: true },
    });
    return { ok: true, friendId: created.id };
  } catch (error) {
    // 同じ2人が互いのリンクを同時に開いた。つながれてはいるので成功として返す。
    if (isUniqueViolation(error)) {
      const row = await db.stampFriend.findUnique({
        where: { lowId_highId: pair },
        select: { id: true },
      });
      if (row) return { ok: true, friendId: row.id };
    }
    throw error;
  }
}
