/**
 * スタンプ帳のつながり(旅仲間)の、URL と上限の数。
 *
 * クライアントコンポーネントからも読むので、DB と node:crypto に触るものは
 * ここに置かない(それは lib/stamp-friends.ts)。lib/username.ts と
 * lib/profile.ts の分け方と同じ。
 */

/** 招待リンクの有効期限(日)。旅行の相談をしている間は切れない長さ。 */
export const INVITE_TTL_DAYS = 7;

/**
 * 1人がつながれる人数の上限。
 *
 * 一緒に旅行を組む相手が30人を超えることはまず無い。上限を置くのは、
 * /stamps/together の切り替えチップと /stamps の一覧が画面に収まる数に
 * しておくため。
 */
export const MAX_FRIENDS = 30;

/**
 * /stamps/together で一度に重ねられる旅仲間の数(自分を除く)。
 *
 * 誰が行ったかを色の丸で示すので、見分けられる色の数で決まる
 * (components/stamps/friends/MemberDot.tsx の MEMBER_COLORS は自分を含めて6色)。
 */
export const MAX_TOGETHER = 5;

/** 旅仲間と比べるページ。 */
export const TOGETHER_HREF = "/stamps/together";

/** 招待を受け取るページ。 */
export function invitePath(token: string): string {
  return `/stamps/invite/${token}`;
}

/** 比べる相手(つながりの id)を指定した /stamps/together の URL。 */
export function togetherHref(friendIds: readonly string[]): string {
  if (friendIds.length === 0) return TOGETHER_HREF;
  return `${TOGETHER_HREF}?with=${friendIds.map(encodeURIComponent).join(",")}`;
}
