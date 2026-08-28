/**
 * 特集ページ(/sightseeing 配下のテーマ別まとめ)の型。
 *
 * harry-potter / royal-london / thames-cruise / stadium-tours /
 * kids-free-activities / christmas-markets の6本は、もともと同じ
 * 「中央寄せの見出し + 目次 + カード」テンプレートを手でコピーして
 * 作られていた。コピー後にそれぞれ別々に触られた結果、h1 が
 * text-xl / text-2xl / text-blue-200 に割れ、コンテナが max-w-4xl と
 * max-w-5xl に割れ、カードの背景が bg-white/60 と dark:bg-white/20 に
 * 割れていた。同じものを6回書いている限り、この差は開き続ける。
 *
 * そこで TravelGuideLayout / FootballGuideLayout / HousingGuideLayout と
 * 同じやり方に寄せ、型と描画を1箇所に集める。ページ側に残すのは
 * 「何を載せるか」だけにする。
 */

/** 特集の中の1項目。 */
export type FeatureItem = {
  /**
   * ページ内アンカーのID。特集の中で一意であること。
   *
   * 旧データは詳細ページを持たない項目に "-" を入れていた。結果、
   * ハリー・ポッターのページには id="-" の要素が6つ並び、目次の
   * リンクはすべて最初の1つへ飛んでいた。ここでは必ず実体のある
   * 文字列を入れる。
   */
  slug: string;
  title: string;
  engTitle?: string | null;
  summary?: string | null;
  /** 本文(markdown)。詳細ページを持たない項目では、これが唯一の本文になる。 */
  mainText?: string | null;
  image?: string | null;
  /** 公式サイト。外部リンクとして出す。 */
  website?: string | null;

  /**
   * 詳細ページへのリンク先。
   *
   * 省略時は「/sightseeing/{slug} に公開中のスポットがあればそこへ、
   * 無ければリンクしない」を DB 照合で決める(FeatureLayout の facts)。
   * ミュージカルなど /sightseeing の外へ送る項目や、christmas-markets の
   * ように専用の詳細ルートを持つ特集は、ここに明示する。
   */
  href?: string | null;

  /** 項目に添える小見出し付きの補足。旧データの sections。 */
  sections?: { title: string; description?: string | null }[] | null;

  /**
   * カードに1行で出す事実(会期・場所など)。
   *
   * 通常は DB の料金・所要時間・最寄駅を出すが、クリスマスマーケットの
   * ように DB に対応するスポットが無い特集では、そこが空欄になる。
   * 会期はカードで最も知りたい情報なので、データ側から渡せるようにする。
   * DB から事実が引けた場合はそちらを優先する。
   */
  factsText?: string | null;
};

/** 項目一覧の前に置く、特集全体への補足。 */
export type FeatureNote = {
  title: string;
  description: string;
};

/** 末尾の「あわせて読みたい」。 */
export type FeatureRelated = {
  href: string;
  label: string;
  note?: string;
};

/** 特集1本ぶん。 */
export type FeatureArticle = {
  /** 特集の slug。features.ts の FEATURES のキーと一致させる。 */
  slug: string;
  title: string;
  engTitle?: string | null;
  /** 導入。1要素=1段落。 */
  intro: string[];
  items: FeatureItem[];
  notes?: FeatureNote[];
  related?: FeatureRelated[];
  /**
   * 項目カードに料金・所要時間・最寄駅を出すか。
   *
   * クリスマスマーケットのように DB のスポットと対応しない特集では、
   * 照合しても何も出ないので問い合わせ自体を省く。
   */
  lookupFacts?: boolean;
};
