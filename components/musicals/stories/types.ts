import type { GuideFaqItem } from "@/components/guides/types";

/**
 * あらすじ専用ページ(/musicals/[slug]/story)の原稿の型。
 *
 * 作品ページ(/musicals/[slug])が持つ storyHook / description /
 * storyEnding とは別に、ここだけの原稿を静的ファイルで持つ。
 * DB に入れなかった理由は2つある。
 *
 * 1. 作品ページの3層は「観るかどうかを決める」ための短い原稿で、
 *    このページは「筋を最後まで知る」ための長い原稿。同じカラムに
 *    両方を入れると、片方を伸ばすともう片方が壊れる。
 * 2. 本文が DB にしか無い状態を増やさないため。過去にコラム本文が
 *    DB とともに消えた事故があり、投入用 JSON を必ずコミットする
 *    運用にしてある。最初から git で持てる原稿は git で持つ。
 *
 * ★ 作品ごとに人手で書く。DB のカラムを並べ替えただけのページを
 *   全31作品ぶん生やしてはいけない。それは artworks 490本・
 *   songs 108本を noindex に追い込んだ「薄い自動生成ページ」と
 *   同じ形で、AdSense の低品質判定を自分から作りにいくことになる。
 *   registry に載せた作品だけがページを持ち、載せていない作品は
 *   404 になる(app/(with-ads)/musicals/[slug]/story/page.tsx)。
 */

/** 幕の中の一場面。見出しと散文でひとかたまり。 */
export type MusicalStoryScene = {
  /** 場面の見出し。「工場を追われる」のように、何が起きるかを書く。 */
  title: string;
  /**
   * 場面の本文(markdown)。1〜3段落。
   *
   * 箇条書きにしないこと。作品ページ側が既に箇条書きのシーン運びを
   * 持っており、それと同じものを長くしても読者には二度目でしかない。
   * このページの価値は「なぜそうなるのか」が続けて読める地の文にある。
   */
  body: string;
  /**
   * その場面で歌われる主な曲(英題)。無ければ省略。
   *
   * 歌詞は載せない。曲名だけを場面の目印として置く。
   */
  songs?: string[];
};

/** 幕。第一幕・第二幕の2つが基本。 */
export type MusicalStoryAct = {
  /** 目次アンカー。kebab-case でページ内一意。 */
  id: string;
  /** 「第一幕」。 */
  label: string;
  /** その幕が扱う年と場所。「1815年 トゥーロン 〜 1832年 パリ」。 */
  period: string;
  /** 幕全体を1〜2文で。目次から飛んできた読者が最初に読む。 */
  lede: string;
  scenes: MusicalStoryScene[];
};

/** 登場人物。作品ページの MusicalCharacter より詳しい。 */
export type MusicalStoryPerson = {
  name: string;
  /** 英語表記。プログラムやキャストボードと突き合わせるために出す。 */
  engName: string;
  /** 「主人公」「その追手」など、立ち位置を示す短い語。 */
  role: string;
  /** 2〜4文。何を抱えている人物かを書く。筋の説明はしない。 */
  body: string;
};

/** 「よくある誤解」1件。 */
export type MusicalStoryMisconception = {
  /** 誤解のほうを見出しにする。「フランス革命の話である」。 */
  title: string;
  /** 何が正しいのかを、根拠(年・史実・原作)とともに書く。 */
  body: string;
};

export type MusicalStory = {
  /** Musical.slug と一致させる。ページのURLもこれで決まる。 */
  slug: string;
  /**
   * 検索結果のタイトルに使う作品名。
   *
   * DB の name をそのまま使わないのは、「ハリー・ポッターと呪いの子」の
   * ように長い作品で「あらすじ」が34字の外へ落ちるため。
   * 実際に検索される表記を選ぶこと。
   */
  searchName: string;
  /** meta description の素。全角120字以内で書く。 */
  description: string;
  /** 「一行で言うと」。ページ冒頭に大きく出す1文。 */
  oneLine: string;
  /**
   * 導入の地の文(markdown、2〜4段落)。
   *
   * 結末は書かない。ここで読者が引き返せるようにしておく。
   */
  intro: string;
  /** 時代背景。作品を読み違えないために要る前提だけを置く。 */
  background: { title: string; body: string }[];
  people: MusicalStoryPerson[];
  acts: MusicalStoryAct[];
  /**
   * 結末(markdown)。折りたたみの中にだけ出す。
   *
   * ページのタイトルは「ネタバレ」を名乗るが、開くまでは見せない。
   * 「結末まで知りたい」と「筋だけ知りたい」が同じ検索語で来るため。
   */
  ending: string;
  misconceptions: MusicalStoryMisconception[];
  /** 観る前に知っておくと見え方が変わること。1項目1文〜2文。 */
  beforeYouGo: string[];
  faqs: GuideFaqItem[];
  /** 原稿を最後に書き直した日(YYYY-MM-DD)。表示に出す。 */
  updatedAt: string;
};
