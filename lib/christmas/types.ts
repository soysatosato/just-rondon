/**
 * ロンドンのクリスマス特集の型。
 *
 * 特集のハブ(/events/christmas)、イルミネーション(/sightseeing/christmas-lights)、
 * マーケット比較(/sightseeing/christmas-markets)、観光スポットと美術館の
 * ページに出す季節の帯は、すべて lib/christmas のデータを読む。会期を
 * 1か所に持つのは、同じ催しの日付がページごとに食い違わないようにするため
 * (2026年10月には、年間カレンダーのリージェント・ストリートの点灯日が
 * 前の年の日付のまま残っていた)。
 *
 * 年ごとに変わる事実(会期・時間・料金・発売)は editions に年ごとに持ち、
 * 主催者の公式発表で確かめたものだけを入れる。予想の日程は入れない。
 * 本文(summary など)には、来年もそのまま通用することだけを書く。
 * 年中行事ガイド(lib/annual-events)と同じ分け方。
 *
 * マークダウンにはしない。太字が CommonMark の規則で崩れる問題
 * (CLAUDE.md)を避けるため。
 */

export type SeasonSource = { label: string; url: string };

/** 予約と発売の状況。 */
export type BookingInfo = {
  /** 1行。「9月25日から発売中」「発売日は未発表」。 */
  status: string;
  /** 公式の予約先。 */
  url?: string;
};

/** 1シーズン分の開催。公式発表で確かめたものだけ。 */
export type SeasonEdition = {
  /** 開幕する年。年をまたぐ会期も開幕側の年で持つ。 */
  year: number;
  /**
   * "YYYY-MM-DD"(ロンドンの日付)。開催は発表されたが日程がまだ出ていない
   * ときは省く(画面には「日程は未発表」と出る)。
   */
  start?: string;
  /** 終わりの日が発表されていなければ省く。 */
  end?: string;
  /** 会期の前に付ける語。「点灯は」「スケートリンクは」など。 */
  label?: string;
  /** 営業時間。1行で。 */
  hours?: string;
  /** 12月25日。公式に書かれていなければ省く。 */
  christmasDay?: "closed" | "open";
  /** 会期中の休み(12月25日を除く)。"YYYY-MM-DD"。 */
  closedDates?: string[];
  /**
   * 会期のうち、この日にしか開かないもの(公演が3回だけの舞台など)。
   * "YYYY-MM-DD"。あれば start〜end の間でもこれ以外の日は休みとして扱う。
   */
  onlyDates?: string[];
  /** 料金。1行で。 */
  price?: string;
  /** 予約が要るもの。 */
  booking?: BookingInfo;
  /** その年に限った事実。1要素1文。 */
  notes?: string[];
  sources: SeasonSource[];
  /** 最後に確かめた日("YYYY-MM-DD")。 */
  checkedAt: string;
};

/**
 * 特集の中での分類。暦の段と、状態の数え方に使う。
 *
 *   lights  通りの灯りと飾り(コヴェント・ガーデンのように屋台を出さない所を含む)
 *   market  屋台の並ぶマーケット
 *   rink    スケートリンク
 *   event   入場の要る季節の催し(光の小道、テーマパーク、映画のセットなど)
 *   show    クリスマスの時期の舞台(パント、バレエ、芝居)
 */
export type SeasonKind = "lights" | "market" | "rink" | "event" | "show";

/** 季節の帯を出すページと、そのページから見た関係。 */
export type SeasonPlace = {
  /** /sightseeing/<spot> */
  spot?: string;
  /** /museums/<museum> */
  museum?: string;
  /** here = その場所で開かれる / nearby = すぐ近くで開かれる */
  relation: "here" | "nearby";
};

/** 特集に載せる1件。 */
export type SeasonItem = {
  /** 特集の中で一意。マーケットはマーケット比較の slug と同じ。 */
  slug: string;
  kind: SeasonKind;
  title: string;
  /** 暦と表の行見出し。短く。 */
  shortTitle: string;
  engTitle: string;
  /** 年に依存しない1〜2文。 */
  summary: string;
  station: string;
  /** 詳しい案内があるサイト内のページ(#付きでもよい)。 */
  href: string;
  /** 見物・入場が無料か(中の遊具や飲食は別)。 */
  free: boolean;
  /** 入場の短い言い方。「無料」「日時指定の予約制」。 */
  entry: string;
  /** 発表が無いときに出す、年に依存しない時期。 */
  usualTiming: string;
  /** 古い年から順に。 */
  editions: SeasonEdition[];
  places?: SeasonPlace[];
};

/**
 * 年末年始の休みと営業。公式サイトに書かれていることだけを載せる。
 *
 * 多くは「12月24〜26日は休館」のように毎年同じ決まりとして書かれていて、
 * その場合は season を省く。その年の案内としてだけ出ているもの(市場の
 * 年末の営業など)は season にシーズン年を入れ、ほかの年には使わない。
 */
export type VenueClosure = {
  id: string;
  name: string;
  /** 早見表の段。 */
  group: "museum" | "sight" | "shop";
  /** 休む日。"MM-DD"。 */
  closed: string[];
  /**
   * 公式の案内が「◯日以外は毎日開く」と書いているとき true。早見表で、
   * 休みでない日を「開」にしてよい根拠になる。書かれていなければ、休みで
   * ない日は「記載なし」のまま出す(開くとは言い切らない)。
   */
  openOtherDays?: boolean;
  /** 短縮営業など、その日だけの時間。day は "MM-DD"。 */
  hours?: { day: string; text: string }[];
  /** 観光の見学はできず、礼拝のためだけに開く日。"MM-DD"。 */
  worshipOnly?: string[];
  /** その年の案内なら、そのシーズン年。毎年の決まりなら省く。 */
  season?: number;
  /** 改修などの長期休館。"YYYY-MM-DD" から(再開日が分かれば reopens)。 */
  closedFrom?: string;
  reopens?: string;
  /** 補足。1要素1文。 */
  notes?: string[];
  places: SeasonPlace[];
  source: SeasonSource;
  checkedAt: string;
};
