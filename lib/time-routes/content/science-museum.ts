import type { TimeRouteGuide } from "../types";

/**
 * サイエンス・ミュージアム。
 *
 * 2026-10-05 に公式サイトの各展示室ページと館内図で確かめた。
 * - Level 0: エナジー・ホール、Space(West Hall、IMAXの隣)、
 *   Making the Modern World。Space ではアポロ10号の司令船とソユーズを
 *   並べて展示している(館は「世界で初めて」としている)。
 *   Making the Modern World は 2026-06-30 から一部の区画が閉まっている。
 * - Level 1: Medicine: The Wellcome Galleries。
 * - Level 2: Mathematics: The Winton Gallery、Information Age。
 * - Level 3: Flight(無料)、Wonderlab(有料、£13.50〜)。
 *
 * スティーヴンソンのロケット号は2018年にロンドンを離れ、2026年はヨークの
 * 国立鉄道博物館にある。以前このサイトはロケット号をここの見どころに
 * 挙げていたので、順路には入れていない(scripts/fix-time-route-facts-2026-10.ts
 * で本文も直した)。
 */
export const scienceMuseum: TimeRouteGuide = {
  attractionSlug: "science-museum",
  museumSlug: "science-museum",
  answer:
    "地上階の宇宙と蒸気機関だけなら1時間、上の階から下りて主な展示を回るなら2〜3時間、有料のワンダーラボまで入るなら半日です。",
  notes: [
    "入場は無料ですが、無料チケットの事前予約が必要です。",
    "開館は10:00〜18:00(最終入場17:15)。",
    "有料なのはワンダーラボ(Level 3)、IMAX、一部の企画展です。展示室は保守のために閉まる日があるので、公式サイトで確かめてください。",
  ],
  routes: [
    {
      label: "1時間",
      minutes: 60,
      summary:
        "地上階(Level 0)だけで回ります。蒸気機関のエナジー・ホール、アポロ10号の司令船とソユーズが並ぶSpace、近代の発明品の展示の3か所です。",
      stops: [
        {
          title: "エナジー・ホール",
          where: "Level 0",
          minutes: 10,
          note: "入ってすぐの大空間。ジェームズ・ワットの回転式蒸気機関など、産業革命を動かした実物が並びます。",
        },
        {
          title: "宇宙の展示 Space",
          where: "Level 0(West Hall、IMAXの隣)",
          minutes: 25,
          note: "実際に人を乗せて飛んだアポロ10号の司令船とソユーズ宇宙船を並べた展示。英国人で初めて宇宙へ行ったヘレン・シャーマンの宇宙服もあります。",
        },
        {
          title: "Making the Modern World",
          where: "Level 0",
          minutes: 15,
          note: "バベッジの階差機関1号、蒸気機関車パッフィング・ビリー、ワトソンとクリックのDNA模型など、250年分の発明品。2026年6月30日から一部の区画が閉まっています。",
        },
      ],
    },
    {
      label: "2〜3時間",
      minutes: 150,
      summary:
        "エレベーターでLevel 3まで上がり、飛行機、数学、通信、医学と下りてきて、最後に地上階の宇宙と蒸気機関へ。",
      stops: [
        {
          title: "フライト",
          where: "Level 3",
          minutes: 20,
          note: "1919年に初めて大西洋を無着陸で渡ったヴィッカース・ヴィミーや、エイミー・ジョンソンのジプシー・モスが天井から吊られています。無料。",
        },
        {
          title: "数学 ウィントン・ギャラリー",
          where: "Level 2",
          minutes: 15,
          note: "ザハ・ハディドの事務所が設計した展示室。中央に吊られた飛行機『ガグナンク』の周りの気流を、天井の曲面で表しています。",
        },
        {
          title: "Information Age",
          where: "Level 2",
          minutes: 15,
          note: "電信から現代までの通信と情報の展示。ジョン・ロジー・ベアードが1926年の公開実験で使ったテレビ受像機もあります。",
        },
        {
          title: "医学 ウェルカム・ギャラリー",
          where: "Level 1",
          minutes: 25,
          note: "世界初のMRIスキャナーや、フレミングのペニシリンの培養など、医学の歴史をたどる展示です。",
        },
        {
          title: "宇宙の展示 Space",
          where: "Level 0(West Hall、IMAXの隣)",
          minutes: 25,
          note: "アポロ10号の司令船とソユーズ宇宙船が並んでいます。",
        },
        {
          title: "エナジー・ホール",
          where: "Level 0",
          minutes: 10,
          note: "産業革命期の蒸気機関。",
        },
        {
          title: "Making the Modern World",
          where: "Level 0",
          minutes: 15,
          note: "バベッジの階差機関1号やDNA模型。一部の区画は閉まっています(2026年6月30日から)。",
        },
      ],
      tip: "多くの人が下の階から順に上がるので、上から下りてくると同じ展示を空いた状態で見られます。",
    },
    {
      label: "半日",
      minutes: 240,
      summary:
        "2〜3時間の順路の前に、有料の体験型展示ワンダーラボを1時間半ほど足します。子ども連れ向けです。",
      stops: [
        {
          title: "ワンダーラボ(有料)",
          where: "Level 3",
          minutes: 90,
          note: "光や力、電気を体を動かして確かめる体験型の展示と、実演のショー。料金は£13.50からで、先に買うほうが安くなります。館は1〜2時間を目安にしています。",
        },
        {
          title: "フライト",
          where: "Level 3",
          minutes: 20,
          note: "ワンダーラボと同じ階。初期の飛行機の実物が並びます。",
        },
        {
          title: "数学とInformation Age",
          where: "Level 2",
          minutes: 25,
          note: "ザハ・ハディドの事務所が設計した数学の展示室と、通信の歴史。",
        },
        {
          title: "医学 ウェルカム・ギャラリー",
          where: "Level 1",
          minutes: 25,
          note: "世界初のMRIスキャナーなど。",
        },
        {
          title: "休憩",
          where: "Level 0のカフェ",
          minutes: 20,
          note: "Level 0にSpace CaféとEnergy Caféがあります。",
        },
        {
          title: "宇宙の展示、エナジー・ホール、Making the Modern World",
          where: "Level 0",
          minutes: 50,
          note: "最後に地上階をまとめて。",
        },
      ],
    },
  ],
  map: {
    label: "公式の館内図(PDF)",
    url: "https://www.sciencemuseum.org.uk/sites/default/files/2024-12/24143MKT-SMMapRedesign-Digital-AW.pdf",
  },
  sources: [
    {
      label: "Science Museum – Visit us",
      url: "https://www.sciencemuseum.org.uk/visit-us",
    },
    {
      label: "Science Museum – Space",
      url: "https://www.sciencemuseum.org.uk/see-and-do/space",
    },
    {
      label: "Science Museum – Making the Modern World",
      url: "https://www.sciencemuseum.org.uk/see-and-do/making-modern-world",
    },
    {
      label: "Science Museum – Flight",
      url: "https://www.sciencemuseum.org.uk/see-and-do/flight",
    },
    {
      label: "Science Museum – Wonderlab",
      url: "https://www.sciencemuseum.org.uk/see-and-do/wonderlab-equinor-gallery",
    },
  ],
  checkedAt: "2026-10-05",
};
