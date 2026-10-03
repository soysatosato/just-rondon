import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { Prisma } from "@prisma/client";

import db from "@/utils/db";
import { ensureProfile } from "@/lib/profile";
import { parsePlanInput, type SavedPlan } from "@/lib/plan/saved";

/**
 * 旅行プランをアカウントに保存する API。
 *
 * /plan とサイト中の「プランに追加」ボタンは、プランをまずブラウザの
 * localStorage に書く。ログインしている読者の分だけ、
 * components/attractions/plan/plan-sync.ts がここへ写しを送り、
 * 別の端末ではここから読み戻す。
 *
 * どちらを残すかの判断(別の端末が先に書いていたとき)はブラウザ側で
 * 読者に選ばせる。ここは revision が合わない書き込みを断るだけで、
 * 中身を混ぜたり後勝ちにしたりはしない。
 */

const SELECT = {
  spots: true,
  startDate: true,
  startMinutes: true,
  revision: true,
} as const;

function unauthorized() {
  return NextResponse.json(
    { error: "ログインしてください", signedIn: false },
    { status: 401 },
  );
}

/**
 * Prisma の既知のエラーか。P2002 は一意制約違反(同じ人の1本目が2本同時に
 * 来た)、P2025 は条件に合う行が無かった(版が合わない)。
 */
function isPrismaError(error: unknown, code: "P2002" | "P2025"): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError && error.code === code
  );
}

/** 先に書かれていた。いまの中身を添えて断る。 */
function conflict(plan: SavedPlan | null) {
  return NextResponse.json({ conflict: true, plan }, { status: 409 });
}

/** 1本目を作る。別の端末(か別のタブ)が先に作っていたら断る。 */
async function create(
  userId: string,
  data: { spots: string; startDate: string | null; startMinutes: number },
) {
  try {
    const plan = await db.tripPlan.create({
      data: { profileId: userId, ...data },
      select: SELECT,
    });
    return NextResponse.json({ plan });
  } catch (error) {
    if (!isPrismaError(error, "P2002")) throw error;
    return conflict(
      await db.tripPlan.findUnique({
        where: { profileId: userId },
        select: SELECT,
      }),
    );
  }
}

/**
 * 保存しているプランを返す。まだ1度も保存していなければ plan: null。
 *
 * 未ログインでも 200 を返す。同期はログイン状態を見てから呼ぶので
 * 普段は来ないが、ログアウトと行き違ったときにコンソールを汚さない。
 */
export async function GET() {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ signedIn: false, plan: null });

  const plan = await db.tripPlan.findUnique({
    where: { profileId: userId },
    select: SELECT,
  });
  return NextResponse.json({ signedIn: true, plan });
}

/**
 * プランを書く。
 *
 * baseRevision は「この端末が最後に揃えた版」。null は「アカウントには
 * まだ何も無いはず」の意味で、そのときだけ新しく作る。DB 側が別の版に
 * 進んでいたら書かずに 409 といまの中身を返す。
 */
export async function PUT(req: NextRequest) {
  const { userId } = auth();
  if (!userId) return unauthorized();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "不正なリクエスト" }, { status: 400 });
  }

  const input = parsePlanInput(body);
  if (!input.ok) {
    return NextResponse.json({ error: "プランの形が不正です" }, { status: 400 });
  }

  const data = {
    spots: input.spots,
    startDate: input.startDate,
    startMinutes: input.startMinutes,
  };

  // TripPlan は Profile を外部キーで指す。プランを先に保存する読者は
  // スタンプ帳をまだ開いておらず、Profile が無いことがある。
  await ensureProfile(userId);

  if (input.baseRevision === null) return create(userId, data);

  // 版が合っているときだけ書き、書いた行をそのまま返す。条件付きの1文なので、
  // 読んでから書くまでの間に別の端末が書いても取り違えない。書いたあとで
  // 読み直すと、その間に入った別の端末の版を自分の版として返しかねない。
  try {
    const plan = await db.tripPlan.update({
      where: { profileId: userId, revision: input.baseRevision },
      data: { ...data, revision: { increment: 1 } },
      select: SELECT,
    });
    return NextResponse.json({ plan });
  } catch (error) {
    if (!isPrismaError(error, "P2025")) throw error;
  }

  // 版が合わなかった(別の端末が先に書いた)か、行そのものが無い。
  // 行が無いのはこの端末の覚えている版が古いだけなので、作れば済む。
  const current = await db.tripPlan.findUnique({
    where: { profileId: userId },
    select: SELECT,
  });
  if (current) return conflict(current);
  return create(userId, data);
}
