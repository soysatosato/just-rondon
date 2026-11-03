import type { ContentPhoto } from "@/lib/content-photo";

export type MasterpieceSource = { label: string; url: string };

/**
 * 作品がいまどこにあるか。
 *
 * - on-display: 展示中。level と room は館内の表示どおりに書く
 *   ("Level 2"・"Room 43")。現地の案内板と照らし合わせるので日本式に直さない。
 * - not-on-display: 館にはあるが展示されていない(公式の表示 "Not on display")
 * - on-loan: 他の館へ貸し出し中。to は公式の表示の貸出先。
 */
export type Placement =
  | { state: "on-display"; level: string; room: string }
  | { state: "not-on-display" }
  | { state: "on-loan"; to: string };

/** 見るところ1点。heading は短い1句、body は1〜3文。 */
export type LookFor = { heading: string; body: string };

/**
 * 名作ページ1点分。作品ページ(/museums/<館>/artworks/<id>)のうち、
 * これがある作品だけを検索に載せる(lib/masterpieces/indexable.js)。
 *
 * 本文はプレーンテキストで書く(マークダウンは描画しない)。事実は
 * sources に挙げた資料で確かめたものだけにし、館の解説を引くときは
 * 誰の説明かを本文に書く。
 */
export type MasterpieceGuide = {
  /** Artwork.id。URL は作品ページのまま変えない(検索の評価を引き継ぐ)。 */
  artworkId: string;
  /** Museum.slug。作品がこの館のものかは scripts/check-masterpieces.ts が見る。 */
  museumSlug: string;
  /** 見出しと題に使う呼び名。「ゴッホ『ひまわり』」 */
  name: string;
  /**
   * 公式の作品ページ。ナショナル・ギャラリーはここを毎日読んで展示状況を
   * 出す(lib/masterpieces/national-gallery.ts)。参考資料にも出す。
   */
  officialUrl: string;
  /**
   * 最後に人が公式で確かめた展示状況と、その日("YYYY-MM-DD")。
   * 自動で読めない館と、読めなかった日はこちらを出す。
   */
  checked: { on: string; placement: Placement };
  /**
   * 冒頭の写真。Commons の原本1200px以上(lib/content-photo.ts)。
   * 作品なので切り抜かずに全体を出す。width・height は原本の実寸で、
   * 枠の縦横比を決めるのに使う(読み込み中に下の文がずれないように)。
   */
  photo: ContentPhoto & { width: number; height: number };
  /** meta description。1〜2文。 */
  description: string;
  /** 作者・制作年・技法と大きさ・所蔵の経緯。ラベルは短く。 */
  facts: { label: string; value: string }[];
  /** 作品の前で使う目安の分数。時間別の回り方の地点と揃える。 */
  minutes: number;
  /** 入口からの行き方。1〜3文。 */
  route: string;
  /** 見るところ。3点。 */
  lookFor: LookFor[];
  /** 作品について。段落ごとに1要素。 */
  about: string[];
  /** 展示の記録(最近の貸し出しなど)。新しい順。 */
  history?: { period: string; note: string }[];
  /** 同じ部屋の作品。href は作品ページ。 */
  sameRoom?: { label: string; href: string }[];
  sources: MasterpieceSource[];
};
