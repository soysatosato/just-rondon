import { NextRequest, NextResponse } from "next/server";
import db from "@/utils/db";

/**
 * 閲覧の記録 API。
 *
 * 詳細ページ(観光スポット・美術館・ミュージカル・コラム・イギリス英語・
 * いまのイギリス)から、表示のたびにクライアントが叩く。数字自体は読者に
 * 出さず、「人気のスポット」「人気の記事」の並べ替えキーとして貯める。
 *
 * サーバーコンポーネントの本体で数えない理由:
 * 詳細ページは revalidate=3600 の ISR でキャッシュされるため、
 * 本体が動くのはキャッシュ再生成のときだけ。1ページあたり1時間に1回しか
 * 加算されず、閲覧数として意味を持たない。
 *
 * 取りこぼしは許容する設計。表示中の数字ではなく順位付けにしか使わないので、
 * 実数より少なめに出るほうが、ボットで水増しされるより望ましい。
 */

/**
 * 加算対象。キーはクライアントから来るので、ここに無い値は弾く。
 *
 * column / britishEnglish / modernBritain は、いずれも Content テーブルの
 * 1行を指す。値はその行の category に対応する。
 */
const TARGETS = {
  attraction: "attraction",
  museum: "museum",
  musical: "musical",
  column: "column",
  britishEnglish: "british-english",
  modernBritain: "modern-britain",
} as const;

type TargetType = keyof typeof TARGETS;

function isTargetType(value: unknown): value is TargetType {
  return (
    typeof value === "string" &&
    Object.prototype.hasOwnProperty.call(TARGETS, value)
  );
}

/**
 * 同一セッションから同じページへの連打を抑止する間隔。
 *
 * リロードや戻る操作で二重に数えないための下限。ここを短くすると
 * 「人気」がリロード癖のある読者に引きずられる。
 */
const DEDUPE_MS = 30 * 60 * 1000;

/**
 * クローラーの除外。
 *
 * 検索エンジンのクロールは実際の読者ではないので、ランキングに混ぜない。
 * User-Agent の自己申告に頼るため完全ではないが、素直に名乗る大手は
 * これで落ちる。名乗らないものまで追うと誤検知で実読者を落とすため、
 * ここでは深追いしない。
 */
const BOT_UA =
  /bot|crawler|spider|crawling|slurp|bingpreview|facebookexternalhit|headlesschrome|lighthouse|monitoring|preview|curl|wget|python-requests|axios|node-fetch/i;

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "不正なリクエストです" }, { status: 400 });
  }

  const { targetType, slug } = (body ?? {}) as Record<string, unknown>;

  if (!isTargetType(targetType)) {
    return NextResponse.json({ error: "対象の種類が不正です" }, { status: 400 });
  }

  if (typeof slug !== "string" || !slug.trim()) {
    return NextResponse.json({ error: "対象が不明です" }, { status: 400 });
  }

  const userAgent = req.headers.get("user-agent") || "";

  // ボットと UA 無しは、記録せず黙って正常終了する。
  // エラーにすると、クライアント側に「再送すべきか」の判断を持たせることになる。
  if (!userAgent || BOT_UA.test(userAgent)) {
    return ok();
  }

  // 閲覧の重複判定にだけ使う匿名の識別子。個人を特定する情報は入れない。
  let viewerId = req.cookies.get("viewerId")?.value;
  const isNewViewer = !viewerId;
  if (!viewerId) viewerId = crypto.randomUUID();

  const key = `${targetType}:${slug.trim()}`;

  // 直近に同じページを見ているかどうかを cookie 内の記録で判定する。
  // 専用テーブルを作らないのは、この判定に永続化する価値が無いため
  // (取りこぼしても困るのは二重計上の抑止だけで、実害が小さい)。
  const seen = parseSeen(req.cookies.get("viewedAt")?.value);
  const now = Date.now();
  const last = seen[key];
  const isDuplicate = typeof last === "number" && now - last < DEDUPE_MS;

  if (!isDuplicate) {
    try {
      await incrementView(targetType, slug.trim());
    } catch {
      // 存在しない slug やDBの一時的な失敗で、ページの表示を壊さない。
      // 閲覧記録は落としてよいデータなので、握りつぶして正常終了する。
      return ok();
    }
    seen[key] = now;
  }

  const res = ok();

  if (isNewViewer) {
    res.cookies.set("viewerId", viewerId, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
    });
  }

  res.cookies.set("viewedAt", serializeSeen(seen, now), {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24,
  });

  return res;
}

/**
 * 中身の無い正常応答。
 *
 * 204 ではなく 200 + 空 JSON を返す。204 は「本文を持たない」応答なので、
 * ここで付けた Set-Cookie が実際に落ちてしまい、連投抑止に使う
 * viewerId / viewedAt がクライアントに残らなかった。cookie が残らないと
 * リロードのたびに二重計上され、抑止の意味が無くなる。
 */
function ok() {
  return NextResponse.json({ ok: true });
}

/**
 * 閲覧を1件加算する。
 *
 * updateMany を使うのは、存在しない slug でも例外を投げずに0件で済ませるため。
 * 非公開(Attraction.isPublished=false)の行は加算しない——伏せたページが
 * ランキングに現れると、リンク先の無いカードを出すことになる。
 */
async function incrementView(targetType: TargetType, slug: string) {
  const data = { views: { increment: 1 }, lastViewedAt: new Date() };

  if (targetType === "attraction") {
    return db.attraction.updateMany({
      where: { slug, isPublished: true },
      data,
    });
  }
  if (targetType === "museum") {
    return db.museum.updateMany({ where: { slug }, data });
  }
  if (targetType === "musical") {
    return db.musical.updateMany({ where: { slug }, data });
  }

  /*
    読み物3種は Content テーブルを共有していて、slug は表全体では一意でない
    (category が違えば同じ slug があり得る)。category で絞らないと、
    別セクションの同名 slug に加算してしまう。
  */
  return db.content.updateMany({
    where: { slug, category: TARGETS[targetType] },
    data,
  });
}

/**
 * cookie に入れる「直近に見たページ」の記録。
 *
 * cookie の容量上限があるので、件数を絞って新しいものだけ残す。
 * 溢れた分は重複判定が効かず二重に数えるが、順位付けの用途では許容範囲。
 */
const MAX_SEEN = 40;

function parseSeen(raw: string | undefined): Record<string, number> {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    const out: Record<string, number> = {};
    for (const [k, v] of Object.entries(parsed as Record<string, unknown>)) {
      if (typeof v === "number" && Number.isFinite(v)) out[k] = v;
    }
    return out;
  } catch {
    return {};
  }
}

function serializeSeen(seen: Record<string, number>, now: number) {
  const fresh = Object.entries(seen)
    .filter(([, at]) => now - at < DEDUPE_MS)
    .sort((a, b) => b[1] - a[1])
    .slice(0, MAX_SEEN);
  return JSON.stringify(Object.fromEntries(fresh));
}
