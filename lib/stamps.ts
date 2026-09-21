import type { Prisma } from "@prisma/client";

import { distanceKm } from "@/lib/sightseeing/geo";

/**
 * スタンプ機能の定義を1か所に集めたファイル。
 *
 * 対象は観光スポット・美術館・ミュージカルの3種。この3つで
 * 「読者が実際に足を運ぶ場所」をほぼ覆う。レストランや店舗を入れて
 * いないのは、1回行ったかどうかより通うものだからで、同じ器に混ぜると
 * スタンプ帳が「行った記録」でも「好きな店」でもなくなる。
 *
 * ここに置くのは、種別ごとの文言・URL・進捗の分母のように
 * API・ボタン・スタンプ帳の3か所が同じ答えを必要とするものだけ。
 * 表示の見た目は components/stamps 側に置く。
 */

/* ------------------------------------------------------------------ *
 * 対象の種別
 * ------------------------------------------------------------------ */

/** クライアントから来る種別。Stamp の外部キー3本と1:1に対応する。 */
export const STAMP_TYPES = ["attraction", "museum", "musical"] as const;

export type StampType = (typeof STAMP_TYPES)[number];

export function isStampType(value: unknown): value is StampType {
  return (
    typeof value === "string" && STAMP_TYPES.includes(value as StampType)
  );
}

type StampTypeMeta = {
  /** スタンプ帳の見出し。 */
  label: string;
  /** 一覧ハブのURL。まだ1個も押していない人をここへ送る。 */
  hubHref: string;
  /** 詳細ページのURLを作る。 */
  path: (slug: string) => string;
  /** 押す前のボタン文言。 */
  actionLabel: string;
  /** 押したあとの状態表示。 */
  doneLabel: string;
  /** 現地で押したときの状態表示。 */
  onSiteLabel: string;
  /** 「まだ0個」のときの誘い文句。 */
  emptyHint: string;
};

/**
 * 種別ごとの文言。
 *
 * ミュージカルだけ「観た」で通しているのは、劇場へ行ったことより
 * 作品を観たことが記録の中身だから。「ロンドン・パラディウムに訪問済み」では
 * 何を観たのか分からない。
 */
export const STAMP_META: Record<StampType, StampTypeMeta> = {
  attraction: {
    label: "観光スポット",
    hubHref: "/sightseeing/all",
    path: (slug) => `/sightseeing/${slug}`,
    actionLabel: "スタンプを押す",
    doneLabel: "訪問済み",
    onSiteLabel: "現地で押した",
    emptyHint: "行った場所のページで「スタンプを押す」を押すと、ここに並びます。",
  },
  museum: {
    label: "美術館・博物館",
    hubHref: "/museums/all-museums",
    path: (slug) => `/museums/${slug}`,
    actionLabel: "スタンプを押す",
    doneLabel: "訪問済み",
    onSiteLabel: "現地で押した",
    emptyHint: "入った館のページで「スタンプを押す」を押すと、ここに並びます。",
  },
  musical: {
    label: "ミュージカル",
    hubHref: "/musicals",
    path: (slug) => `/musicals/${slug}`,
    actionLabel: "観たスタンプを押す",
    doneLabel: "観劇済み",
    onSiteLabel: "劇場で押した",
    emptyHint: "観た作品のページで「観たスタンプを押す」を押すと、ここに並びます。",
  },
};

/** Stamp の3本の外部キーのうち、その種別が使う列名。 */
export const STAMP_FOREIGN_KEY = {
  attraction: "attractionId",
  museum: "museumId",
  musical: "musicalId",
} as const satisfies Record<StampType, keyof Prisma.StampWhereInput>;

/**
 * 1行のスタンプがどの種別か。外部キーの埋まり方から決める。
 *
 * 種別を列として持たせていないのは、外部キーと食い違った行が
 * 作れてしまうため(「museumId が入っているのに種別は観光スポット」)。
 * DB 側の CHECK 制約で必ず1本だけ埋まることは保証されているので、
 * 3本を見れば種別は一意に決まる。
 */
export function stampType(row: {
  attractionId: string | null;
  museumId: string | null;
  musicalId: string | null;
}): StampType | null {
  if (row.attractionId) return "attraction";
  if (row.museumId) return "museum";
  if (row.musicalId) return "musical";
  return null;
}

/* ------------------------------------------------------------------ *
 * 現地判定(金のスタンプ)
 * ------------------------------------------------------------------ */

/**
 * 施設からこの距離以内なら「現地で押した」と認める(km)。
 *
 * 1kmは広い。狭くできない理由が2つある。
 *
 * 1. DB が持つ座標は施設ごとに1点しかない。ハイド・パークやグリニッジの
 *    ような広い対象では、正規の入口に立っていても代表点から1km近く
 *    離れることがある。
 * 2. 高い建物に囲まれたシティやウエストエンドでは、GPS が数百m平気で
 *    ずれる。屋内に入ればなおさらで、大英博物館の中で押せない金スタンプは
 *    機能として成り立たない。
 *
 * ごまかしの余地は残るが、ホテルやまして日本からは絶対に届かない。
 * 「本当にそこへ行った人だけが押せる」の線はこれで引ける。
 */
export const ON_SITE_RADIUS_KM = 1;

/**
 * 位置情報の誤差がこれより大きい報告は、現地とみなさない(m)。
 *
 * 端末が GPS を掴めないと、ブラウザは IP やモバイル基地局から推定した
 * 座標を「誤差数km」として返す。それを受け入れると、ロンドン市内に
 * 居るだけで都心のスポットが全部現地判定になってしまう。
 *
 * 一方で屋内の測位は 100〜500m ずれることが普通にあるので、
 * 厳しくしすぎると館内で押せなくなる。1.5km はその間を取った値。
 */
export const ON_SITE_MAX_ACCURACY_M = 1500;

export type Position = {
  lat: number;
  lng: number;
  /** navigator.geolocation が返す誤差半径(m)。 */
  accuracy?: number | null;
};

/**
 * 現地で押したと認めてよいか。
 *
 * ★ 呼ぶのはサーバー側だけにすること。クライアントから来た「現地です」を
 *    そのまま信じて金スタンプを付けるなら、赤と金を分けている意味が無い。
 */
export function isOnSite(
  target: { lat: number; lng: number },
  position: Position | null,
): boolean {
  if (!position) return false;
  if (!Number.isFinite(position.lat) || !Number.isFinite(position.lng)) {
    return false;
  }
  const accuracy = position.accuracy;
  if (
    typeof accuracy === "number" &&
    Number.isFinite(accuracy) &&
    accuracy > ON_SITE_MAX_ACCURACY_M
  ) {
    return false;
  }
  return (
    distanceKm(
      { lat: target.lat, lng: target.lng },
      { lat: position.lat, lng: position.lng },
    ) <= ON_SITE_RADIUS_KM
  );
}

/* ------------------------------------------------------------------ *
 * 表示
 * ------------------------------------------------------------------ */

/** 「2026年9月21日」。スタンプに押された日付として出す。 */
export function formatStampDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

/** スタンプ帳のURL。ボタンからの導線と navbar で同じ値を使う。 */
export const STAMP_BOOK_HREF = "/stamps";
