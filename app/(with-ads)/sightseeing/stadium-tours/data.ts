export type StadiumTourSection = {
  id: number;
  title: string;
  description: string | null;
  displayOrder: number;
};

export type StadiumTour = {
  slug: string;
  title: string;
  summary: string | null;
  mainText: string | null;
  image: string | null;
  website: string | null;
  sections: StadiumTourSection[];
};

export const stadiumTours: StadiumTour[] = [
  {
    slug: "fulham-craven-cottage-tour",
    title: "フラムFC クレイヴン・コテージ ツアー",
    summary: "テムズ川沿いの英国最古級スタジアム。クラシックな雰囲気が渋い！",
    mainText: `
**フラムFC**のホーム、**クレイヴン・コテージ**はロンドン最古級の歴史あるスタジアム。

クラブレジェンド **ジョニー・ヘインズ像**から始まり、バーやロッカー、トンネルを巡るツアーです。

モダンではなく **クラシックなフットボール文化**が味わえる場所！
      `,
    image:
      "https://upload.wikimedia.org/wikipedia/commons/1/17/Johnny_Haynes_Stand.JPG",
    website: "https://www.fulhamfc.com/tours",
    sections: [
      {
        id: 0,
        title: "場所",
        description:
          "[London, SW6 6HH](https://www.google.com/maps?q=London+SW6+6HH)",
        displayOrder: 0,
      },
      {
        id: 1,
        title: "価格",
        description: "From **£28.00**",
        displayOrder: 0,
      },
    ],
  },
  {
    slug: "london-stadium-tour",
    title: "ロンドン・スタジアム ツアー",
    summary:
      "元オリンピックスタジアム。現在はウェストハムの本拠地＆陸上競技場として活躍中。",
    mainText: `
2012年ロンドン五輪のメイン会場として建てられた **ロンドン・スタジアム**。

現在は **ウェストハム・ユナイテッド** のホームとしても使用されています(2026/27シーズンはチャンピオンシップ＝2部に所属)。

陸上用トラックやロッカールームも見学でき、複合スタジアムならではの魅力を体験できます。
      `,
    image:
      "https://upload.wikimedia.org/wikipedia/commons/3/34/London_Olympic_Stadium_West_Ham.jpg",
    website: "https://www.london-stadium.com/tours",
    sections: [
      {
        id: 0,
        title: "場所",
        description:
          "[London Stadium, E20 2ST](https://www.google.com/maps?q=London+E20+2ST)",
        displayOrder: 0,
      },
      {
        id: 1,
        title: "価格",
        description: "From **£22.00**",
        displayOrder: 0,
      },
    ],
  },
  {
    slug: "tottenham-hotspur-stadium-tour",
    title: "トッテナム・ホットスパー スタジアム ツアー",
    summary: "最新鋭のハイブリッドスタジアム。NFL兼用の珍しい構造が見どころ。",
    mainText: `
北ロンドンの新ホーム **トッテナム・ホットスパー・スタジアム** は、最新技術の塊。

**90分のガイドツアー**で、選手エリアやメディアセンターを巡り、チームの歴史にも触れられます。

NFLロンドンゲームの開催地として知られる、**可動式ピッチ**も注目！
      `,
    image:
      "https://upload.wikimedia.org/wikipedia/commons/b/be/London_Tottenham_Hotspur_Stadium.jpg",
    website: "https://www.tottenhamhotspur.com/tours",
    sections: [
      {
        id: 0,
        title: "場所",
        description:
          "[Lilywhite House, 782 High Road, London N17 0BX](https://www.google.com/maps?q=London+N17+0BX)",
        displayOrder: 0,
      },
      {
        id: 1,
        title: "価格",
        description: "From **£32.00**",
        displayOrder: 0,
      },
    ],
  },
  {
    slug: "chelsea-stamford-bridge-tour",
    title: "チェルシーFC スタンフォード・ブリッジ ツアー",
    summary:
      "西ロンドンの強豪チェルシーFC。レジェンドと一緒のプレミアムツアーも選べる！",
    mainText: `
スタンフォード・ブリッジはチェルシーFCの歴史の舞台。

**元チェルシー選手が案内する特別ツアー**も選択でき、チームの栄光や舞台裏に迫る話を聞くことができます。

ベンチ、トンネル、ロッカーなどはもちろん、**チェルシーFC博物館**への入場もセット。
      `,
    image:
      "https://upload.wikimedia.org/wikipedia/commons/8/8f/London_Stamford_Bridge.jpg",
    website: "https://www.chelseafc.com/en/stadium-tours-museum",
    sections: [
      {
        id: 0,
        title: "場所",
        description:
          "[Stamford Bridge, London SW6 1HS](https://www.google.com/maps?q=Stamford+Bridge+SW6+1HS)",
        displayOrder: 0,
      },
      {
        id: 1,
        title: "価格",
        description: "From **£32.00**",
        displayOrder: 0,
      },
    ],
  },
  {
    slug: "wembley-stadium-tour",
    title: "ウェンブリー・スタジアム ツアー",
    summary:
      "世界的なサッカーの聖地。選手トンネルからロイヤルボックスまで体験できる大型ガイドツアー。",
    mainText: `
**イングランド代表の本拠地**として知られる、あのウェンブリー。

巨大アーチの下で行われるツアーでは、ロッカールーム、プレスルーム、選手トンネル、そして **FAカップが待つロイヤルボックス**まで巡ることができます。

象徴的なスタジアムの裏側を目の当たりにする迫力満点の体験です。
      `,
    image:
      "https://upload.wikimedia.org/wikipedia/commons/d/d2/London_Wembley.jpg",
    website: "https://www.wembleystadium.com/tours",
    sections: [
      {
        id: 0,
        title: "場所",
        description:
          "[Wembley Stadium, HA9 0WS](https://www.google.com/maps?q=Wembley+HA9+0WS)",
        displayOrder: 0,
      },
      {
        id: 1,
        title: "価格",
        description: "From **£25.00**",
        displayOrder: 0,
      },
    ],
  },
  {
    slug: "arsenal-emirates-stadium-tour",
    title: "アーセナル エミレーツ・スタジアム ツアー",
    summary:
      "アーセナルFCの本拠地。ロッカールームや選手トンネル、監督席まで体験できる人気ツアー。",
    mainText: `
エミレーツ・スタジアムは、北ロンドンのプレミアリーグクラブ **アーセナルFC** のホーム。

**オーディオガイド付きツアー**では、選手たちが実際に座るロッカールームや、ドキドキのトンネルウォーク、試合を見守るディレクターズボックスなどを自由に見学できます。

また、**元アーセナル選手によるガイドツアー（90分）** もあり、ファンにはたまらない裏話も聞けます。

ツアー料金には **アーセナル博物館**の入場も含まれています。
      `,
    image:
      "https://upload.wikimedia.org/wikipedia/commons/2/29/London_Emirates_Stadium_arsenal.jpg",
    website: "https://www.arsenal.com/tours",
    sections: [
      {
        id: 0,
        title: "場所",
        description:
          "[Emirates Stadium, London N7 7AJ](https://www.google.com/maps?q=Emirates+Stadium+N7+7AJ)",
        displayOrder: 0,
      },
      {
        id: 1,
        title: "価格",
        description: "From **£35.00**",
        displayOrder: 0,
      },
    ],
  },
];
