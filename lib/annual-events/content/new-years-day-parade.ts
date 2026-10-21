import type { EventGuide } from "../types";

const LONDON_PARADE = {
  label: "London Parade(公式)",
  url: "https://londonparade.com/",
};

export const newYearsDayParade: EventGuide = {
  slug: "new-years-day-parade",
  photo: {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/London_New_Year%27s_Day_Parade_2019_-_12.jpg/1280px-London_New_Year%27s_Day_Parade_2019_-_12.jpg",
    alt: "ニュー・イヤーズ・デー・パレードの、市松模様の衣装で行進する参加者(2019年)",
    credit: "garryknight / CC BY 2.0, via Wikimedia Commons",
    link: "https://commons.wikimedia.org/wiki/File:London_New_Year%27s_Day_Parade_2019_-_12.jpg",
  },
  title: "元日のロンドン・パレード",
  engName: "London Parade (London's New Year's Day Parade)",
  month: 1,
  usualTiming: "毎年1月1日の昼過ぎ",
  calendarTitles: ["London New Year's Day Parade", "London Parade"],
  lead: "元日の昼、ピカデリーからホワイトホールまでの約3kmを、世界各地のマーチングバンドやダンサーが練り歩きます。沿道で見るのは無料で、チケットも予約も要りません。要るのは、早めに場所を取ることと、寒さへの備えです。",
  description:
    "ロンドンの元日パレード(London Parade)は沿道なら無料。ピカデリーからホワイトホールまでのルート、出発の時刻、見る場所の選び方、有料の観覧席、通行止めと最寄駅、年越し花火の翌日に行くときの注意をまとめました。",
  titleSuffix: "ルート・時間・見る場所",
  keywords: [
    "ロンドン 元日 パレード",
    "ロンドン ニューイヤーズデー パレード",
    "London Parade",
    "ロンドン 1月1日",
    "ロンドン 元旦",
  ],
  facts: [
    { label: "チケット", value: "不要", sub: "沿道は無料。観覧席は有料" },
    { label: "ルート", value: "約3.2km", sub: "ピカデリー→ホワイトホール" },
    { label: "長さ", value: "約3時間半", sub: "先頭の出発から最後尾まで" },
  ],
  editions: [
    {
      year: 2026,
      dates: [{ date: "2026-01-01", time: "13:00に出発、16:30ごろ終了" }],
      notes: [
        "観覧席(グランドスタンド)の券は、前年の7月1日にTicketmasterで売り出された。",
      ],
      sources: [
        LONDON_PARADE,
        {
          label: "London Parade – 観覧席の発売(7月1日)",
          url: "https://londonparade.com/news/grandstand-vip-tickets-go-on-sale-1st-july-%F0%9F%8E%89/",
        },
      ],
      checkedAt: "2026-10-05",
    },
    {
      year: 2027,
      dates: [{ date: "2027-01-01", time: "2026年と同じなら13:00に出発" }],
      notes: ["出発の時刻と観覧席の値段は、公式サイトで確かめてください。"],
      sources: [LONDON_PARADE],
      checkedAt: "2026-10-05",
    },
  ],
  tickets: {
    summary:
      "沿道で見るだけなら要りません。座って見たい人のために、有料の観覧席があります。",
    items: [
      {
        title: "沿道は無料・予約なし",
        body: "ルート沿いのどこで見ても無料です。柵の前の列は早い者勝ちなので、出発の1〜2時間前には着いておくと安心です。",
      },
      {
        title: "観覧席(グランドスタンド)",
        body: "ピカデリーとホワイトホールに有料の観覧席が設けられ、前の年の夏から公式サイトとTicketmasterで売り出されます。場所取りが要らず、座ったまま全体を見られます。",
      },
    ],
  },
  places: {
    title: "見る場所",
    navLabel: "見る場所",
    intro:
      "パレードはピカデリーのリッツ・ホテルの近くを出て、ピカデリー・サーカス、リージェント・ストリート、パル・メル、トラファルガー広場、ホワイトホールを通り、パーラメント・スクエアで終わります。",
    items: [
      {
        name: "ピカデリー",
        meta: "出発地点の近く/最寄りはグリーン・パーク駅",
        body: "出発してすぐの区間です。どの団体も最初の勢いのまま通り、有料の観覧席もこのあたりにあります。",
      },
      {
        name: "トラファルガー広場",
        meta: "中盤/最寄りはチャリング・クロス駅",
        body: "広くて見通しがよいぶん、いちばん人が集まる場所です。遅く着いたなら、ここを避けたほうがかえって見やすいことがあります。",
        href: "/sightseeing/trafalgar-square",
      },
      {
        name: "ホワイトホール",
        meta: "終盤/最寄りはウェストミンスター駅",
        body: "官庁街の広い通りで、奥にビッグ・ベンが見えます。観覧席もこちらにあります。終点に近いので、最後尾が通るのは夕方です。",
      },
    ],
  },
  timeline: [
    {
      time: "11:00〜12:00",
      body: "沿道に人が集まり始めます。柵の前で見たいなら、このころまでに着いてください。",
    },
    {
      time: "13:00",
      body: "ピカデリーを出発。",
    },
    {
      time: "13:00〜16:30",
      body: "1万人近い出演者が順に通ります。1か所で見ていると、最後尾まで3時間ほどかかります。日の入りは16時ごろなので、後半は暗くなります。",
    },
    {
      time: "16:30ごろ",
      body: "パーラメント・スクエアで終了。通行止めが順に解けていきます。",
    },
  ],
  transport: [
    {
      title: "ルートの道は通行止め、バスは迂回",
      body: "ピカデリー、リージェント・ストリートの南側、パル・メル、トラファルガー広場、ホワイトホールは、元日の朝から夕方まで車が通れず、バスは迂回します。",
    },
    {
      title: "反対側へは簡単に渡れない",
      body: "パレードの最中は、ルートを横切れない場所がほとんどです。見る側を先に決めて、その側の駅から向かってください。",
    },
    {
      title: "沿道の駅は混む",
      body: "ピカデリー・サーカスなど沿道の駅は、混雑で入場が規制されることがあります。帰りは1〜2駅離れた駅まで歩くと早く乗れます。",
    },
  ],
  wear: {
    summary:
      "1月1日の昼でも気温は一桁で、2〜3時間じっと立っていると体の芯から冷えます。",
    items: [
      {
        title: "防寒",
        body: "1月の最高気温は平年で8℃ほどです。厚手のコート、手袋、帽子に、カイロ。足元から冷えるので底の厚い靴で。",
      },
      {
        title: "トイレと食事は先に",
        body: "元日は休む店も多く、沿道のカフェは混み合います。トイレと食事は、場所を取る前に済ませておいてください。",
      },
    ],
    banned: [],
  },
  mistakes: [
    {
      title: "年越し花火の翌日に、昼過ぎに起きる",
      body: "前の晩に年越し花火を見て遅く寝ると、昼の場所取りに間に合いません。両方行くなら、パレードは観覧席を買っておくと時間に余裕ができます。",
    },
    {
      title: "トラファルガー広場で見ようとして見えない",
      body: "人がいちばん集まる場所なので、遅く着くと人の頭しか見えません。ピカデリーやホワイトホールの空いている場所を探してください。",
    },
    {
      title: "途中で場所を変えようとする",
      body: "人で埋まった沿道は動きにくく、ルートを横切ることもできません。1か所で最後まで見るつもりで場所を選んでください。",
    },
  ],
  nonAttendees: {
    title: "見に行かない人へ",
    navLabel: "行かない人",
    items: [
      {
        title: "元日の昼は、ウェストエンドの南側を避ける",
        body: "ピカデリーからホワイトホールにかけては昼前から夕方まで人で埋まり、道を渡るのも難しくなります。この日の観光は、ルートから離れた地区を回る日にすると動きやすいです。",
      },
    ],
  },
  links: [
    { href: "/events/january", label: "1月のロンドン" },
    { href: "/events/new-years-eve-fireworks", label: "ロンドンの年越し花火" },
    { href: "/sightseeing/trafalgar-square", label: "トラファルガー広場" },
  ],
  sources: [LONDON_PARADE],
};
