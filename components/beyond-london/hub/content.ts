/**
 * /beyond-london ハブの文言。
 *
 * 行き先の事実(駅・所要・運賃帯・現地の足)は destinations.ts と
 * lib/beyond-london/rates.ts が持つ。ここが持つのは、ハブでしか
 * 言わないこと——時間の枠の定義と、出発前に効く2つの前提だけ。
 *
 * 以前このページは「イントロ長文 → 同じ形のカード12枚」だった。
 * 全カードが同型だったので、11の行き先のあいだで何が違うのかが
 * 本文を読むまで判らない。読者がここでする仕事は読書ではなく、
 * 「自分の空き時間に入る行き先はどれか」の照合なので、
 * 時間の枠を最初の問いに置いて組み直している。
 */

import {
  BEYOND_FARE_BANDS,
  NIGHT_RIVIERA,
  OFF_PEAK_START,
  RAIL_AS_OF,
} from "@/lib/beyond-london/rates";
import type { BeyondTimeFit } from "../destinations";

export const HUB_TITLE = "Beyond London｜ロンドンから日帰り・週末で行く英国";

export const HUB_DESCRIPTION = `ロンドンから日帰りで行ける7つの行き先と、週末1泊で行ける4つの行き先を、行き方から書いたガイド。どの駅から何分で、片道いくらで、Oysterが使えるのか。空いている時間から行き先を絞り込めます。BritRail Passの損得判定つき。${RAIL_AS_OF}時点の情報です。`;

export const HUB_KEYWORDS = [
  "ロンドン 日帰り",
  "イギリス 日帰り旅行",
  "ロンドン 郊外",
  "ウィンザー 日帰り",
  "オックスフォード 日帰り",
  "コッツウォルズ 行き方",
  "BritRail Pass",
];

export const HUB_LEAD =
  "ロンドンに数日いると、イギリスの他の場所も見てみたくなります。ここは片道2時間以内の日帰り圏7か所と、1泊すれば届く4か所を、街の紹介ではなく「行き方」から書いたセクションです。";

/* -----------------------------------------------------
   出発前に効く2つの前提

   以前は BritRail Pass の記事カードが「ロンドンの外へ出る前に」
   という見出しの下に、行き先カードとまったく同じ形で並んでいた。
   型のコメントには「混ざると読者が BritRail Pass を地名だと
   誤読する」と書いてあるのに、見た目が同型では防げていない。

   実際には、どの行き先を選んでも先に効く事実が2つある。
   それを行き先の一覧より上に、カードとは別の形で置く。
----------------------------------------------------- */

export type Prerequisite = {
  id: string;
  /** 何が起きるか。読者の損得で書く。 */
  headline: string;
  body: string;
  link?: { href: string; label: string };
};

export const prerequisites: Prerequisite[] = [
  {
    id: "oyster",
    headline: "Oyster・タッチ決済は、11の行き先すべてで使えません",
    body: `使えるのは原則ロンドンのゾーン内(Zone 1–9)までです。ウィンザーもブライトンもオックスフォードも圏外で、改札は通れてしまうことがありますが、正しい切符にはなりません。出発前に目的地までの切符を買ってください。`,
    link: {
      href: "/sightseeing/transport/national-rail",
      label: "英国の鉄道切符の買い方",
    },
  },
  {
    id: "advance",
    headline: "当日券は Advance の3〜4倍になります",
    body: `同じ列車の同じ席でも、買う時期で運賃が変わります。ヨークなら${BEYOND_FARE_BANDS.york.advanceFrom}から${BEYOND_FARE_BANDS.york.onTheDay}まで、エディンバラなら${BEYOND_FARE_BANDS.edinburgh.advanceFrom}から${BEYOND_FARE_BANDS.edinburgh.onTheDay}まで開きます。日程が決まっているなら先に買うこと。当日買うなら平日は${OFF_PEAK_START.cities}以降の列車にすると運賃帯が下がります。`,
    link: {
      href: "/beyond-london/britrail-pass",
      label: "BritRail Pass は元が取れるのか",
    },
  },
];

/* -----------------------------------------------------
   時間の枠

   絞り込みの主軸。読者がこのページに来た時点で確定しているのは
   行き先ではなく、空いている時間のほうだから。

   「半日」を独立させているのは、7か所ある日帰り圏のうち
   午前中だけで往復できるのが2か所しかないため。日帰り圏を
   ひとまとめにすると、この2か所が埋もれる。
----------------------------------------------------- */

export type TimeBucket = {
  id: BeyondTimeFit;
  /** チップに出す短いラベル。 */
  label: string;
  /** 実際に何時間か。ラベルだけでは幅が伝わらない。 */
  hours: string;
  /** 選んだときに出す一文。何が削られ、何が残るのか。 */
  note: string;
};

export const timeBuckets: TimeBucket[] = [
  {
    id: "halfDay",
    label: "半日だけ空いている",
    hours: "4〜5時間",
    note: "午前に出て午後にはロンドンに戻る行程です。往復2時間以内で、現地で見るものが徒歩圏に収まる行き先に限られます。",
  },
  {
    id: "fullDay",
    label: "1日まるごと",
    hours: "8〜10時間",
    note: "朝出て夜に戻る、標準的な日帰りです。片道2時間までが現実的な範囲で、1日に回るのは1か所と考えてください。",
  },
  {
    id: "overnight",
    label: "週末に1泊",
    hours: "1泊2日",
    note: "日帰りでは削るものが多すぎる行き先。金曜の夜か土曜の朝に出て、日曜に戻る前提です。宿と夜の使い方まで各記事で扱っています。",
  },
];

/* -----------------------------------------------------
   一覧の下に置く注記
----------------------------------------------------- */

export const listNotes: readonly string[] = [
  "所要は片道の最速です。乗り換えや本数の少ない時間帯では長くなります。",
  `運賃は片道の目安で、${RAIL_AS_OF}時点のものです。Advance は枚数限定なので、安い枠から売り切れます。`,
  "1日に2か所を詰め込まないこと。移動に片道1〜2時間かかるため、どちらも中途半端になります。例外はバースとストーンヘンジで、これは現地発のツアーなら1日で回れます。",
  `ペンザンスだけは寝台列車(${NIGHT_RIVIERA.route})で行けます。${NIGHT_RIVIERA.runsNightly}の運行で、土曜の夜は走りません。`,
];

export const hubFaq = [
  {
    question: "ロンドンから日帰りできる範囲はどのくらいですか？",
    answer:
      "**片道2時間以内**が現実的な目安です。「1日まるごと」に並ぶ行き先はすべてこの範囲で、朝出て夜にはロンドンに戻れます。[ヨーク](/beyond-london/york)・[エディンバラ](/beyond-london/edinburgh)・[湖水地方](/beyond-london/lake-district)・[ペンザンス](/beyond-london/penzance)はそれ以上遠いので、1泊する前提で組んでください。",
  },
  {
    question: "半日しか空いていません。どこかへ行けますか？",
    answer:
      "**ウィンザーとカンタベリーなら往復できます**。ウィンザーは最短35分で城が駅の目の前、カンタベリーは片道1時間で見どころが城壁の内側に収まっています。この2か所以外は、往復だけで半日が終わります。",
  },
  {
    question: "1泊するなら、どこがいいですか？",
    answer:
      "**距離と目的で決まります**。最も近いのは[ヨーク](/beyond-london/york)（片道2時間）で、日帰りもできますが夜の街が泊まる理由になります。[エディンバラ](/beyond-london/edinburgh)は唯一の「別の国」で、制度も紙幣も変わります。[湖水地方](/beyond-london/lake-district)は自然、[ペンザンス](/beyond-london/penzance)は最も遠いかわりに寝台列車で行けます。",
  },
  {
    question: "宿泊税はかかりますか？",
    answer:
      "**エディンバラだけかかります**。2026年7月24日から宿泊費の5%が上乗せされる制度が始まりました（英国初）。ロンドンをはじめイングランドの都市にはまだありません。予約サイトの表示価格に含まれていないことがあるので、[エディンバラの記事](/beyond-london/edinburgh)で詳しく扱っています。",
  },
  {
    question: "切符はいつ買うのが安いですか？",
    answer:
      "**原則として早いほど安いです**。Advance（列車指定）は枚数限定で、安い枠から売り切れます。ただし列車を指定するため、乗り遅れると無効になります。天候で予定が変わる行き先（ブライトンなど）では、当日にOff-Peakを買うほうが合理的なこともあります。詳しくは[英国の鉄道切符の買い方](/sightseeing/transport/national-rail)へ。",
  },
  {
    question: "BritRail Pass は買ったほうがいいですか？",
    answer:
      "**ロンドンを拠点にした日帰り中心の旅程では、まず元が取れません**。日帰り圏は片道£10〜30程度で、パスの1日あたり単価に届かないためです。長距離を3回以上、かつ旅程が直前まで決まらない場合にだけ検討する価値があります。[BritRail Pass は元が取れるのか](/beyond-london/britrail-pass)で数字を出して判定しています。",
  },
  {
    question: "車がなくても回れますか？",
    answer:
      "**コッツウォルズ以外は回れます**。コッツウォルズは村が点在する田園地帯で、「コッツウォルズ駅」は存在しません。鉄道で行けるのはモートン・イン・マーシュなど一部の村だけなので、[ツアーかレンタカーを勧めています](/beyond-london/cotswolds)。ストーンヘンジも最寄り駅から離れており、[現地発のツアーが速い](/beyond-london/bath-stonehenge)という結論です。",
  },
];

export const hubRelatedLinks = [
  {
    href: "/sightseeing/transport/national-rail",
    label: "英国の鉄道切符の買い方｜Advance・Off-Peak・Anytimeの違い",
  },
  {
    href: "/sightseeing/itinerary",
    label: "モデルコース｜日帰りをどの日に入れるか",
  },
  { href: "/sightseeing/transport", label: "ロンドンの交通ガイド トップ" },
  { href: "/history", label: "イギリスの歴史｜訪ねる前に読む" },
];
