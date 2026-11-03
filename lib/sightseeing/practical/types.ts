/**
 * 観光スポットの「行く前に要ること」——チケットの取り方、入口と行き方、
 * 当日の決まり。公式で確かめた事実だけを、確認日と出典つきで持つ。
 *
 * なぜ DB ではなくコードか:
 * 「時間別の回り方」(lib/time-routes)・「◯月のロンドン」と同じで、
 * 確認日と出典を本文の隣に置き、差分で読めるようにするため。
 * ここに書くのは改定のたびに確かめ直すべき事実で、git の履歴が
 * そのまま「いつ何を確かめたか」の記録になる。
 *
 * 料金の金額はここに書かない。金額は Attraction.priceAdult / priceChild が
 * 持ち、旅程の費用計算(/plan)も同じ列を読む。ここにも書くと、月次の
 * 改定(add-monthly-changes)のたびに2か所を直すことになり、片方が取り残される。
 * ここで言うのは「当日券があるか」「オンラインのほうが安いか」「いつ売り出すか」
 * のような、買い方の事実だけにする。
 *
 * 推測で埋めない。公式で確かめられなかった項目は書かずに省く
 * (表示側は無い項目を出さない)。マークダウンは使わない。
 */

export type PracticalSource = { label: string; url: string };

/**
 * チケットの取り方の型。早わかりの色分けに使う。
 *
 * - timed: 日時指定の券を前もって買う。当日券が無い・ほぼ無い。
 * - advance: 当日も買えるが、前もって買うほうが安い・確実。
 * - walk-in: 予約なしで入れる(有料でも窓口で買えば済む)。
 * - free-booking: 無料だが予約が要る。
 * - closed: いまは中を見学できない。
 */
export type TicketLevel =
  | "timed"
  | "advance"
  | "walk-in"
  | "free-booking"
  | "closed";

export type SpotTickets = {
  level: TicketLevel;
  /**
   * 早わかりに出す一言。20字前後。
   * 例:「日時指定。当日券もある」「予約不要」
   */
  short: string;
  /** 1要素1〜2文。どこで、いつ、どう買うか。3つまで。 */
  points: string[];
  /** 公式の購入ページ。 */
  url?: string;
};

/** 行き方の選択肢1つ。最寄駅以外の駅、入口、ロンドンからの電車。 */
export type AccessRoute = {
  /** 「Hyde Park Corner駅」「ロンドンから電車で」 */
  label: string;
  /** 1〜2文。どの入口に出るか、何分か。 */
  text: string;
};

export type SpotPractical = {
  /** Attraction の slug。 */
  slug: string;
  /** 公式で最後に確かめた日("YYYY-MM-DD")。ページに出す。 */
  checkedAt: string;
  sources: PracticalSource[];
  tickets?: SpotTickets;
  /** 最寄駅(Attraction.nearestStation)のほかの行き方。 */
  access?: AccessRoute[];
  /** 当日の決まり(荷物検査・持ち込み・年齢制限)。1要素1〜2文、4つまで。 */
  onSite?: string[];
};
