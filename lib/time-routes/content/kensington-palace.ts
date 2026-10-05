import type { TimeRouteGuide } from "../types";

/**
 * ケンジントン宮殿。美術館側のページが無いので、順路の本体は観光ページに出す。
 *
 * 2026-10-05 に確かめた事実(公式サイトはスクリプトからの取得を弾くので、
 * 検索結果に出る公式ページの本文で確認):
 * - 開いているのは水〜日曜。3〜10月は 10:00〜18:00(最終入場17:00)。
 *   11〜2月は閉館が早くなる。
 * - クイーンズ・ステート・アパートメントは改修のため 2026-06-15 から
 *   2027年春まで閉鎖。
 * - 見学は一方通行で、ジュエル・ルーム → ヴィクトリア:王室の子ども時代 →
 *   キングズ・ステート・アパートメント(王の階段、王のギャラリー、
 *   キューポラ・ルーム、謁見の間など)の順。
 * - 2026-03-26〜11-08 の入場券には『パンジャーブ最後の王女たち』展が含まれる。
 * - サンクン・ガーデンにはダイアナ元妃の像(2021年7月除幕)。
 */
export const kensingtonPalace: TimeRouteGuide = {
  attractionSlug: "kensington-palace",
  answer:
    "宮殿の順路を一巡するだけなら1時間、特別展とサンクン・ガーデンまでなら2時間、ケンジントン・ガーデンズを歩くなら半日です。",
  notes: [
    "開いているのは水〜日曜。3〜10月は10:00〜18:00(最終入場17:00)で、11〜2月は閉館が早くなります。",
    "クイーンズ・ステート・アパートメント(メアリー2世の居室)は改修のため、2027年春まで閉まっています。",
  ],
  routes: [
    {
      label: "1時間",
      minutes: 60,
      summary:
        "宝石の部屋から、ヴィクトリア女王が生まれ育った部屋、王の階段と居室へ。宮殿の一方通行の順路をそのまま一巡します。",
      stops: [
        {
          title: "ジュエル・ルーム",
          where: "石の階段を上がった先",
          minutes: 8,
          note: "ヴィクトリア女王のために作られた宝飾品などの展示です。",
        },
        {
          title: "ヴィクトリア:王室の子ども時代",
          where: "ヴィクトリアの子ども時代の部屋",
          minutes: 20,
          note: "1819年5月24日にこの宮殿で生まれた女王の、即位の日までを本人の日記でたどる展示です。",
        },
        {
          title: "王の階段(キングズ・ステアケース)",
          where: "王の居室の入口",
          minutes: 7,
          note: "ウィリアム・ケントが、ジョージ1世の宮廷の人々を壁一面に描いた階段室です。",
        },
        {
          title: "王の居室(キングズ・ステート・アパートメント)",
          where: "上階",
          minutes: 20,
          note: "謁見の間、キューポラ・ルーム、長い王のギャラリーと続く、ジョージ王朝の宮廷の部屋です。",
        },
      ],
    },
    {
      label: "2時間",
      minutes: 120,
      summary:
        "1時間の順路に、入場料に含まれる特別展と、ダイアナ元妃の像が立つサンクン・ガーデンを足します。",
      stops: [
        {
          title: "ジュエル・ルーム",
          where: "石の階段を上がった先",
          minutes: 10,
          note: "ヴィクトリア女王の宝飾品。",
        },
        {
          title: "ヴィクトリア:王室の子ども時代",
          where: "ヴィクトリアの子ども時代の部屋",
          minutes: 25,
          note: "本人の日記の言葉で、母親の厳しい監視の下で育った少女時代をたどります。",
        },
        {
          title: "王の階段と王の居室",
          where: "上階",
          minutes: 35,
          note: "ウィリアム・ケントの階段室から、キューポラ・ルーム、王のギャラリーへ。",
        },
        {
          title: "特別展",
          where: "宮殿内",
          minutes: 25,
          note: "その時期の特別展が入場料に含まれます。2026年11月8日までは『パンジャーブ最後の王女たち』展です。",
        },
        {
          title: "サンクン・ガーデン",
          where: "宮殿のすぐ脇",
          minutes: 15,
          note: "2021年に除幕されたダイアナ元妃の像が立つ沈床庭園です。",
        },
      ],
    },
    {
      label: "半日",
      minutes: 240,
      summary:
        "2時間の宮殿見学のあと、宮殿の前に広がるケンジントン・ガーデンズを歩きます。",
      stops: [
        {
          title: "宮殿の順路",
          where: "ジュエル・ルーム〜王の居室",
          minutes: 70,
          note: "宝石の部屋、ヴィクトリア女王の子ども時代、王の階段と居室。",
        },
        {
          title: "特別展",
          where: "宮殿内",
          minutes: 25,
          note: "2026年11月8日までは『パンジャーブ最後の王女たち』展。",
        },
        {
          title: "サンクン・ガーデン",
          where: "宮殿のすぐ脇",
          minutes: 15,
          note: "ダイアナ元妃の像。",
        },
        {
          title: "休憩",
          where: "宮殿のカフェ",
          minutes: 20,
          note: "宮殿の中と庭にカフェがあります。",
        },
        {
          title: "ケンジントン・ガーデンズ",
          where: "宮殿の前の公園",
          minutes: 90,
          note: "ピーター・パン像、イタリアン・ガーデン、アルバート記念碑を回ると1時間半ほどです。",
          href: "/sightseeing/kensington-gardens",
        },
      ],
    },
  ],
  map: {
    label: "公式の見学案内",
    url: "https://www.hrp.org.uk/kensington-palace/visit/",
  },
  sources: [
    {
      label: "Historic Royal Palaces – Kensington Palace opening times",
      url: "https://www.hrp.org.uk/kensington-palace/visit/opening-and-closing-times/",
    },
    {
      label: "Historic Royal Palaces – The King's State Apartments",
      url: "https://www.hrp.org.uk/kensington-palace/whats-on/the-kings-state-apartments/",
    },
    {
      label: "Historic Royal Palaces – The Queen's State Apartments",
      url: "https://www.hrp.org.uk/kensington-palace/whats-on/the-queen-s-state-apartments/",
    },
  ],
  checkedAt: "2026-10-05",
};
