/**
 * category は DB 上 "historic" のような英字スラッグなので、そのまま出すと
 * 読者には意味が伝わらない。リンク先(フィルタ)はスラッグのまま、
 * 表示だけ日本語の短いラベルに置き換える。
 *
 * スポット詳細のチップと無料スポット一覧の見出しで共用する。
 */
export const categoryChipMap: Record<string, string> = {
  entertainment: "エンタメ・体験",
  tour: "ツアー・街歩き",
  garden: "庭園・公園",
  royal: "王室・宮殿",
  shop: "ショッピング",
  architecture: "建築・街並み",
  historic: "歴史・文化",
  seasonal: "季節限定",
  museum: "美術館・博物館",
};

export function categoryLabel(category: string): string {
  return categoryChipMap[category] ?? category;
}

/**
 * 一覧(/sightseeing/all)の章立て。
 *
 * categoryChipMap がラベルの対応表なのに対し、こちらは「どの順に読ませるか」と
 * 「その区分に何を期待して入るべきか」を持つ。順番は初訪問者の関心順で、
 * 定番の名所 → 王室 → 美術館 → 体験もの → 公園、と落としている。
 * 件数順ではないので、エンタメ(38件)が先頭には来ない。
 *
 * ここに無い category は一覧の最後に「その他」としてまとまる。
 */
export type CategoryMeta = {
  slug: string;
  /** カードのチップや見出しに出す短いラベル。 */
  label: string;
  /** 見出しの上に出す英字。 */
  eyebrow: string;
  blurb: string;
};

export const CATEGORY_SECTIONS: CategoryMeta[] = [
  {
    slug: "historic",
    label: "歴史・文化",
    eyebrow: "Historic",
    blurb:
      "ロンドン塔もセント・ポールも、写真で見た姿のまま建っています。多くは有料で、料金も安くはありませんが、行列と滞在時間さえ読めれば1日に2つは回れます。",
  },
  {
    slug: "royal",
    label: "王室・宮殿",
    eyebrow: "Royal",
    blurb:
      "宮殿は公開期間が決まっているものが多く、夏だけ、あるいは特定の曜日だけ入れる場所があります。衛兵交代のように無料で見られる行事も、開催日が日によって変わります。",
  },
  {
    slug: "museum",
    label: "美術館・博物館",
    eyebrow: "Museums",
    blurb:
      "主要館は常設展が無料で予約も不要です。ここには代表的なものだけを置いています。全館をジャンルや所要時間で絞りたいときは、美術館専用の一覧のほうが早く辿り着けます。",
  },
  {
    slug: "entertainment",
    label: "エンタメ・体験",
    eyebrow: "Experience",
    blurb:
      "展望台、観覧車、体験型の施設。この区分がいちばん数が多く、料金の幅も広く、£40を超えるものが集まっているのもここです。予約で安くなる場所が多いので、行くと決めたら先に押さえてください。",
  },
  {
    slug: "garden",
    label: "庭園・公園",
    eyebrow: "Parks",
    blurb:
      "ほとんどが無料で、開いている時間も長い。予定が崩れたときの受け皿として強く、雨が上がった30分をここで使えます。",
  },
  {
    slug: "architecture",
    label: "建築・街並み",
    eyebrow: "Architecture",
    blurb:
      "中に入るというより、建物そのものを見に行く場所です。滞在時間が短いので、近くの目的地とまとめて組めます。",
  },
  {
    slug: "tour",
    label: "ツアー・街歩き",
    eyebrow: "Tours",
    blurb:
      "クルーズ、ウォーキングツアー、周遊バス、観光パス。移動そのものが目的になるものと、複数施設をまとめて安くするものが混ざっています。",
  },
  {
    slug: "shop",
    label: "ショッピング",
    eyebrow: "Shopping",
    blurb:
      "デパートとマーケット。買わなくても建物と品揃えを見るだけで時間が使えます。マーケットは曜日で規模が大きく変わるので、開催日を確かめてから向かってください。",
  },
  {
    slug: "seasonal",
    label: "季節限定",
    eyebrow: "Seasonal",
    blurb:
      "会期のある催しです。時期が合えば強い一方、外れていると行っても何もありません。訪問時期と会期を必ず突き合わせてください。",
  },
];

export const CATEGORY_ORDER = CATEGORY_SECTIONS.map((c) => c.slug);
