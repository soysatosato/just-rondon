import type { SeasonSource } from "./types";

/**
 * 「ハリー・ポッターの冬」の、その年だけの事実(新しい店、ドラマの配信)。
 *
 * スタジオツアーの冬の催し(ホグワーツ・イン・ザ・スノー)とオックスフォード・
 * ストリートの灯りは happenings.ts と lights.ts が持つ。ここにはそのどちらにも
 * 入らない、日付つきの出来事だけを置く。season のシーズンにだけ出る。
 */

export type HpWinterFact = {
  title: string;
  /** 2〜3文。年に依存する事実なので、年を書いてよい。 */
  body: string;
  season: number;
  href?: string;
  source: SeasonSource;
  checkedAt: string;
};

export const HP_WINTER_FACTS: HpWinterFact[] = [
  {
    title: "オックスフォード・ストリートに英国最大の公式店",
    body: "2026年11月4日、オックスフォード・ストリート134〜140番地(ザ・リボン)に、英国でいちばん大きいハリー・ポッターの公式ショップが開きます。2フロアにわたってダイアゴン横丁を思わせる造りで、バタービールを出す飲食の一角もあります。公式の店は、キングス・クロス駅の店に次いで英国で2つめです。",
    season: 2026,
    source: {
      label: "Express & Star(PA)– UK's largest Harry Potter shop to open in central London",
      url: "https://www.expressandstar.com/uk-news/uks-largest-harry-potter-shop-to-open-in-central-london-8899383",
    },
    checkedAt: "2026-10-19",
  },
  {
    title: "ドラマ版がクリスマスに始まる",
    body: "HBOのドラマ『ハリー・ポッター』の第1シーズン(全8話)は、2026年12月25日に配信が始まると報じられています。英国でどこが放送・配信するかは、まだ発表されていません。",
    season: 2026,
    source: {
      label: "TechRadar – HBO Max Harry Potter TV show release date",
      url: "https://www.techradar.com/streaming/hbo-max/hbo-max-dropped-the-harry-potter-tv-show-trailer-after-its-uk-launch-and-the-shows-magical-release-date-will-delight-potterheads",
    },
    checkedAt: "2026-10-19",
  },
];
