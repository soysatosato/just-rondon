/**
 * 年中行事の「参加・観戦の実務ガイド」(/events/<slug>)。
 *
 * 書くのは、チケット・並び方・当日の流れ・交通規制・服装といった
 * 「行くための実務」だけ。行事の由来や文化の話は冒頭の1〜2文までにする。
 * 文化の読み物(英国の暦)は別の企画として見送っており、ここはその代わりではない。
 *
 * 年ごとに変わる事実(日程・値段・発売日)は editions に年ごとに持ち、
 * 出典と確認日を添える。本文(それ以外のすべて)には、来年もそのまま
 * 通用することだけを書く。「今年は〜」「2026年の〜」を本文に書かないこと。
 * 毎年の更新は editions に1行足すだけで済むようにしてある。
 *
 * マークダウンにはしない。「◯月のロンドン」(lib/london-months)と同じく、
 * 太字が CommonMark の規則で崩れる問題(CLAUDE.md)を避けるため。
 */

export type GuideSource = { label: string; url: string };

/** 見出しと本文の組。本文は1〜3文。 */
export type GuideItem = { title: string; body: string };

/** 「ひと目で」欄の1枠。value は短く(全角10字ほど)。 */
export type GlanceItem = { label: string; value: string; sub?: string };

/** 1年分の開催。 */
export type GuideEdition = {
  /** 開催年。年越しの行事は12月31日の側の年。 */
  year: number;
  /**
   * 日程。会場や曜日で分かれる行事は行を分け、label に会場名を入れる。
   * 日付は "YYYY-MM-DD"(ロンドンの日付)。
   */
  dates: {
    label?: string;
    date: string;
    endDate?: string;
    /** 「20:00開門・24:00花火」のような時刻の補足。 */
    time?: string;
  }[];
  /** その年に限った事実(値段・発売日・未発表のこと)。1要素1文。 */
  notes: string[];
  /**
   * 「ひと目で」欄に足す、その年の値(値段・発売日など)。
   * 未発表なら value を「未発表」にして、sub に前回の値を書く。
   */
  glance?: GlanceItem[];
  sources: GuideSource[];
  /** この年の情報を最後に確かめた日("YYYY-MM-DD")。ページに出す。 */
  checkedAt: string;
};

/** 会場・観覧場所の1つ。年に依存しない性格だけを書く(日程と値段は editions)。 */
export type GuidePlace = {
  name: string;
  /** 最寄駅など、名前の下に小さく出す1行。 */
  meta?: string;
  body: string;
  /** サイト内に詳しいページがあるとき。 */
  href?: string;
};

export type EventGuide = {
  /** URL は /events/<slug>。月名(january 等)と重ならないこと。 */
  slug: string;
  /** h1。年は入れない(年はページが editions から足す)。 */
  title: string;
  engName: string;
  /** 一覧の並びと、月ページからの導線に使う。 */
  month: number;
  /** 年に依存しない言い方の時期。「毎年12月31日の24時」。 */
  usualTiming: string;
  /**
   * 年間カレンダー(Event テーブル)のどの行がこの行事か。title の前方一致。
   * 月ページやカレンダーのカードから、このガイドへリンクするために使う。
   * Event の行は年ごとに作り直すので、id ではなく題で結ぶ。
   */
  calendarTitles: string[];
  /** h1 の下の2〜3文。この行事に行くには何が要るか、を先に言う。 */
  lead: string;
  /** meta description。全角120字以内。 */
  description: string;
  /** title タグの「｜」のあとに続ける語。検索で探される実務の語を並べる。 */
  titleSuffix: string;
  keywords: string[];
  /**
   * 「ひと目で」欄の、年に依存しない枠。日程の枠はページが editions から
   * 先頭に足し、その年の値段などは editions の glance が足す。
   */
  facts: GlanceItem[];
  /** 古い年から順に。 */
  editions: GuideEdition[];
  tickets: {
    /** 「結局、チケットは要るのか」への一文の答え。 */
    summary: string;
    items: GuideItem[];
  };
  /** 会場の選び方・見る場所。行事によって無い。 */
  places?: {
    title: string;
    navLabel: string;
    intro?: string;
    items: GuidePlace[];
  };
  /** 当日の流れ。time は「20:00」「夕方」のような目安。 */
  timeline: { time: string; body: string }[];
  transport: GuideItem[];
  wear: {
    summary: string;
    items: GuideItem[];
    /** 持ち込めないもの。主催者が明示しているものだけ。 */
    banned: string[];
  };
  /** よくある失敗。 */
  mistakes: GuideItem[];
  /**
   * チケットが取れなかった人・見に行かない人へ。代わりの見方と、
   * 避けたい規制や混雑。見出しは行事に合わせて書く。
   */
  nonAttendees?: { title: string; navLabel: string; items: GuideItem[] };
  links: { href: string; label: string }[];
  /** 年に依存しない出典(公式サイトのトップ・TfL など)。 */
  sources: GuideSource[];
};
