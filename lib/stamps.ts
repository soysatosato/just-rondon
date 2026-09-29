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
  /** 数えるときの単位。「あと2館」「あと1作」。 */
  unit: string;
  /** 一覧ハブのURL。まだ1個も押していない人をここへ送る。 */
  hubHref: string;
  /** 詳細ページのURLを作る。 */
  path: (slug: string) => string;
  /** 押す前にボタンの上に出す誘い文句。 */
  invite: string;
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
    unit: "か所",
    hubHref: "/sightseeing/all",
    path: (slug) => `/sightseeing/${slug}`,
    invite: "行った場所にスタンプを",
    actionLabel: "スタンプを押す",
    doneLabel: "訪問済み",
    onSiteLabel: "現地で押した",
    emptyHint: "行った場所のページで「スタンプを押す」を押すと、ここに並びます。",
  },
  museum: {
    label: "美術館・博物館",
    unit: "館",
    hubHref: "/museums/all-museums",
    path: (slug) => `/museums/${slug}`,
    invite: "入った館にスタンプを",
    actionLabel: "スタンプを押す",
    doneLabel: "訪問済み",
    onSiteLabel: "現地で押した",
    emptyHint: "入った館のページで「スタンプを押す」を押すと、ここに並びます。",
  },
  musical: {
    label: "ミュージカル",
    unit: "作",
    hubHref: "/musicals",
    path: (slug) => `/musicals/${slug}`,
    invite: "観た作品にスタンプを",
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
 * 称号
 * ------------------------------------------------------------------ */

export type StampTitle = {
  /** 押した数がこれ以上で付く。 */
  min: number;
  title: string;
  eng: string;
  /** 称号に添える一言。 */
  note: string;
};

/**
 * 押した数で上がっていく称号。観光客からロンドナーになり、その先は叙勲と叙爵。
 *
 * 「レベル12」のような数字にしないのは、次の段に名前があるほうが
 * 「あと3個で男爵」と目標として口に出せるから。
 *
 * 刻みは序盤ほど細かい。旅行1回ぶん(10〜20個)の間に4〜5回上がり、
 * どこで押しても次の称号が近くに見えるようにしてある。後半が粗いのは、
 * 100個に届くのはロンドンに住んでいる人で、旅行者の目標ではないから。
 *
 * note に事実を書くときは確かなことだけにすること。読者はこれも
 * サイトの文として読む。
 */
export const STAMP_TITLES: readonly StampTitle[] = [
  { min: 0, title: "旅支度中", eng: "Packing", note: "最初の1個を押すと、ロンドンに入国です。" },
  { min: 1, title: "ツーリスト", eng: "Tourist", note: "ようこそロンドンへ。" },
  { min: 3, title: "トラベラー", eng: "Traveller", note: "地下鉄を「チューブ」と呼びはじめる頃。" },
  { min: 6, title: "ロンドン通", eng: "Connoisseur", note: "エスカレーターでは右側に立つ。" },
  { min: 10, title: "ロンドナー", eng: "Londoner", note: "天気の話で会話を始められる。" },
  { min: 15, title: "ナイト", eng: "Knight", note: "男性ならサー、女性ならデイムと呼ばれる身分。" },
  { min: 25, title: "男爵", eng: "Baron", note: "爵位のいちばん下の段。ここからは貴族です。" },
  { min: 35, title: "子爵", eng: "Viscount", note: "英語の読みはヴァイカウント。s は発音しません。" },
  { min: 50, title: "伯爵", eng: "Earl", note: "サンドイッチ伯爵やグレイ伯爵(アールグレイ)と同じ位。" },
  { min: 70, title: "侯爵", eng: "Marquess", note: "爵位の上から2番目。残るは公爵だけです。" },
  { min: 100, title: "公爵", eng: "Duke", note: "爵位の最上位。この先は、全部押し切るだけです。" },
];

/** 押した数に対する今の称号と、次の称号(最上位なら null)。 */
export function stampTitleFor(count: number): {
  index: number;
  current: StampTitle;
  next: StampTitle | null;
} {
  let index = 0;
  STAMP_TITLES.forEach((title, i) => {
    if (count >= title.min) index = i;
  });
  return {
    index,
    current: STAMP_TITLES[index],
    next: STAMP_TITLES[index + 1] ?? null,
  };
}

/* ------------------------------------------------------------------ *
 * 表示
 * ------------------------------------------------------------------ */

/**
 * 日付はロンドン時間で切る。
 *
 * スタンプ帳はサーバー(UTC)で、ボタンはブラウザ(多くは日本時間)で
 * 描くので、端末の時刻に任せると同じスタンプの日付が画面によって
 * 1日ずれる。どちらでも同じ答えになるよう、押した場所の暦に固定する。
 */
const LONDON_DATE = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Europe/London",
  year: "numeric",
  month: "numeric",
  day: "numeric",
});

function londonDate(
  date: Date | string,
): { year: number; month: number; day: number } | null {
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return null;
  const parts = LONDON_DATE.formatToParts(d);
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((p) => p.type === type)?.value);
  return { year: part("year"), month: part("month"), day: part("day") };
}

/** 「2026年9月21日」。スタンプに押された日付として出す。 */
export function formatStampDate(date: Date | string): string {
  const d = londonDate(date);
  return d ? `${d.year}年${d.month}月${d.day}日` : "";
}

const POSTMARK_MONTHS = [
  "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
  "JUL", "AUG", "SEP", "OCT", "NOV", "DEC",
];

/** 「21 SEP 2026」。スタンプの印面に彫る日付。 */
export function formatPostmarkDate(date: Date | string): string {
  const d = londonDate(date);
  return d ? `${d.day} ${POSTMARK_MONTHS[d.month - 1]} ${d.year}` : "";
}

/** スタンプ帳のURL。ボタンからの導線と navbar で同じ値を使う。 */
export const STAMP_BOOK_HREF = "/stamps";
