export interface ThamesCruiseSection {
  title: string;
  description: string | null;
}

export interface ThamesCruiseItem {
  title: string;
  engTitle: string | null;
  slug: string;
  summary: string | null;
  mainText: string | null;
  image: string | null;
  website: string | null;
  sections: ThamesCruiseSection[];
}

export const thamesCruises: ThamesCruiseItem[] = [
  {
    title: "シティクルーズ・フレキシブル・リバーパス",
    engTitle: "City Cruises flexible river pass",
    slug: "city-cruises-flexible-river-pass",
    summary:
      "24時間テムズ川ボートに乗り放題。ロンドン中心部の名所を自分のペースで巡れるパス。",
    mainText:
      "**24時間乗り放題のリバーパス**で、テムズ川沿いの観光スポットを自由にホップオン・ホップオフできるプラン。ウェストミンスター、ロンドン塔、ロンドン・アイ周辺など、主要な観光エリアをボートでつなげます。\n\n船からは**ロンドン・アイ、国会議事堂、セント・ポール大聖堂、ロンドン塔**が見え、ルートによっては**タワーブリッジの下をくぐります**。\n\n価格は **£13.95〜**。\n\nこの24時間パスは**ロンドンパス（Go City オールインクルーシブ）の対象**です。パスを持っていれば、この券を別に買わずに乗れます。ただしパスそのものが元を取れる条件は狭いので、買うかどうかは[観光パスは元が取れるのか](/sightseeing/passes)で確かめてから決めてください。",
    image: null,
    website:
      "https://www.cityexperiences.com/london/city-cruises/24h-hop-on-hop-off-river-pass/",
    sections: [
      { title: "所要時間", description: "24時間パス（乗り放題）" },
      {
        title: "場所",
        description:
          "[Victoria Embankment, Westminster, London SW1A 2JH](https://www.google.com/maps?q=Victoria+Embankment,+Westminster,+London+SW1A+2JH)",
      },
      {
        title: "見どころ",
        description:
          "ロンドン・アイ、国会議事堂、セント・ポール大聖堂、ロンドン塔、タワーブリッジの下を通過するルートなど。",
      },
    ],
  },
  {
    title: "ロンドン・アイ＋リバークルーズ パッケージ",
    engTitle: "London Eye river cruise package",
    slug: "london-eye-river-cruise-package",
    summary:
      "ロンドン・アイの乗車と40分のリバークルーズがセットになったパッケージ。",
    mainText:
      "**ロンドン・アイ乗車**と**テムズ川クルーズ（約40分）** がセットになったパッケージです。\n\nクルーズはロンドン・アイのピアから出発し、**ロンドン・アイ、国会議事堂、セント・ポール大聖堂、ロンドン塔**などを回って戻る周遊ルートです。\n\n価格は **£46.00〜**。",
    image: null,
    website: "https://www.londoneye.com/tickets-and-prices/river-cruise/",
    sections: [
      {
        title: "所要時間",
        description: "リバークルーズ約40分（＋ロンドン・アイ乗車）",
      },
      {
        title: "場所",
        description:
          "[London Eye Pier, London SE1 7PB](https://www.google.com/maps?q=SE1+7PB)",
      },
      {
        title: "見どころ",
        description:
          "ロンドン・アイ、国会議事堂、セント・ポール大聖堂、ロンドン塔など、テムズ川沿いの主要スポット。",
      },
    ],
  },
  {
    title: "ロンドン塔リバークルーズ",
    engTitle: "Tower of London river cruise",
    slug: "tower-of-london-river-cruise",
    summary:
      "歴史とユーモアを織り交ぜた40分の周遊クルーズ。ロンドン塔を中心に20以上の名所を船上から解説。",
    mainText:
      "**Tower of London River Cruise** は、歴史をテーマにした約40分の周遊クルーズ。**Historic Royal Palaces** が監修し、BBC『Ghosts』の共同制作者による脚本とライブガイドが、ロンドンの過去と名所をユーモアも交えて紹介してくれます。\n\nコース上では、**ロンドン塔、セント・ポール大聖堂、ロンドン・アイ、ビッグ・ベン** など、20以上のランドマークを一気に眺めることができます。\n\n料金は大人約 **£18.50〜**、子どもは約 **£14.00〜**。",
    image: null,
    website:
      "https://www.goldentours.com/river-thames-attractions/tower-of-london-river-cruise",
    sections: [
      { title: "所要時間", description: "約40分" },
      {
        title: "場所",
        description:
          "[Tower Pier, London EC3N 4DT](https://www.google.com/maps?q=Tower+Pier,+London+EC3N+4DT)",
      },
      {
        title: "見どころ",
        description:
          "ロンドン塔、セント・ポール大聖堂、ロンドン・アイ、ビッグ・ベンなど、20以上のランドマークを周遊。",
      },
    ],
  },
  {
    title: "Uber Boat by Thames Clippers フレキシブルチケット",
    engTitle: "Uber Boat by Thames Clippers flexible tickets",
    slug: "uber-boat-by-thames-clippers-flexible",
    summary:
      "通勤ボートとしても使われる高速船で、1日テムズ川を自由に移動できるチケット。",
    mainText:
      "**Uber Boat by Thames Clippers** は、ロンドン市民にも日常的に使われている高速リバーボート。**リバーローマー**チケットを使えば、1日乗り降り自由でテムズ川沿いを自在に移動できます。\n\nルート上では、**国会議事堂、タワーブリッジ、バタシー発電所、チェルシーハーバー、カナリー・ワーフ、グリニッジ**などを水上から見られます。\n\n価格は **£10.80〜** で、このページの船の中ではいちばん安い券です。",
    image: null,
    website: "https://www.thamesclippers.com/",
    sections: [
      { title: "所要時間", description: "1日（リバーローマー有効期間）" },
      {
        title: "場所",
        description:
          "[London Bridge City Pier, London SE1 2QE](https://www.google.com/maps?q=London+Bridge+City+Pier,+SE1+2QE)",
      },
      {
        title: "見どころ",
        description:
          "国会議事堂、タワーブリッジ、バタシー発電所、チェルシーハーバー、カナリー・ワーフ、グリニッジ周辺など。",
      },
    ],
  },
  {
    title: "テムズ川ジャズ・ディナークルーズ",
    engTitle: "Jazz dinner cruise on the Thames",
    slug: "jazz-dinner-cruise",
    summary: "ジャズの生演奏と3コースディナーを楽しむ、大人向けのナイトクルーズ。",
    mainText:
      "**ジャズの生演奏＋3コースディナー＋夜景**のテムズ川ディナークルーズです。乗船時にはグラス・スパークリングがサービスされ、その後はコース料理とともに、ライブジャズの演奏が続きます。\n\n出発はウェストミンスター・ピア付近から。航路では**ロンドン・アイ、タワーブリッジ、カナリー・ワーフの高層ビル群**の夜景が見えます。\n\n所要時間は約3時間、価格は **£94.00〜**。",
    image: null,
    website:
      "https://www.cityexperiences.com/london/city-cruises/jazz-cruise-river-thames/",
    sections: [
      { title: "所要時間", description: "約3時間" },
      {
        title: "場所",
        description:
          "[Westminster Pier, London SW1A 2JH](https://www.google.com/maps?q=Westminster+Pier,+SW1A+2JH)",
      },
      {
        title: "見どころ",
        description:
          "ロンドン・アイ、タワーブリッジ、カナリー・ワーフの夜景など、テムズ川沿いのライトアップされた景色。",
      },
    ],
  },
  {
    title: "テムズ川イブニングクルーズ（カナッペ＆ドリンク付き）",
    engTitle: "Evening cruise with canapes on the river Thames",
    slug: "evening-cruise-with-canapes",
    summary:
      "夜景を眺めながら、カナッペとスパークリングを楽しむ2時間のイブニングクルーズ。",
    mainText:
      "**カナッペとグラス・スパークリングが付くイブニングクルーズ**です。上階のオープンデッキか窓際の席から、ライトアップされた街並みを見られます。\n\n見える主な夜景は**ロンドン・アイ、タワーブリッジ、ビッグ・ベン**で、船内では生演奏があります。\n\n所要時間は約2時間、価格は **£49.00〜**。",
    image: null,
    website:
      "https://www.cityexperiences.com/london/city-cruises/evening-cruise-river-thames/",
    sections: [
      { title: "所要時間", description: "約2時間" },
      {
        title: "場所",
        description:
          "[London, EC3N 4DT](https://www.google.com/maps?q=London+EC3N+4DT)",
      },
      {
        title: "見どころ",
        description:
          "ライトアップされたロンドン・アイ、タワーブリッジ、ビッグ・ベンなどの夜景。",
      },
    ],
  },
  {
    title: "テムズ川アフタヌーンティー・クルーズ",
    engTitle: "Thames afternoon tea river cruise",
    slug: "thames-afternoon-tea-river-cruise",
    summary:
      "伝統的なアフタヌーンティーを楽しみながら、テムズ川からロンドンの名所を眺める90分のクルーズ。",
    mainText:
      "スコーン、クロテッドクリーム、ジャム、フィンガーサンドイッチ、ケーキの**アフタヌーンティー**を船内でとりながら、テムズ川を回るクルーズです。\n\n窓から**ロンドン塔、ザ・シャード、国会議事堂、ビッグ・ベン、ロンドン・アイ**が見えます。\n\n所要時間は約90分で、席は屋内です。価格は**大人1名あたり約£69.01〜**。",
    image: null,
    website:
      "https://www.cityexperiences.com/london/city-cruises/afternoon-tea-cruise-river-thames/",
    sections: [
      { title: "所要時間", description: "約90分" },
      {
        title: "場所",
        description:
          "[London, EC3N 4DT](https://www.google.com/maps?q=London+EC3N+4DT)",
      },
      {
        title: "見どころ",
        description:
          "ロンドン塔、ザ・シャード、国会議事堂、ビッグ・ベン、ロンドン・アイなど、テムズ川沿いの主要ランドマーク。",
      },
    ],
  },
  {
    title: "テムズ川ディナークルーズ（音楽＆スパークリング付き）",
    engTitle: "Thames dinner cruise with live music and bubbly",
    slug: "thames-dinner-cruise-live-music",
    summary:
      "生演奏と4コースディナー、スパークリングワインを楽しめる3時間のナイトクルーズ。",
    mainText:
      "**シティクルーズのディナークルーズ**です。乗船すると**グラス・スパークリングワイン**が出て、続いて4コースのディナーになります。\n\nメインが出てくる頃には船は**タワーブリッジの下**をくぐり、その後はカナリー・ワーフの高層ビル群へ向かって進みます。食後はデザートとコーヒーが出て、生演奏に合わせて踊れるダンスフロアもあります。\n\n所要時間は約3時間で、価格は **£65.00〜**。",
    image: null,
    website:
      "https://www.cityexperiences.com/london/city-cruises/dinner-cruise-river-thames/",
    sections: [
      { title: "所要時間", description: "約3時間" },
      {
        title: "場所",
        description:
          "[City Cruises London Dinner Cruise, SW1A 2JH](https://www.google.com/maps?q=SW1A+2JH)",
      },
      {
        title: "見どころ",
        description:
          "タワーブリッジの下をくぐり、カナリー・ワーフ方面へ向かう夜景クルーズ。",
      },
    ],
  },
  {
    title: "イルミネーテッド・リバー公式ボートツアー",
    engTitle: "Illuminated river official boat tour",
    slug: "illuminated-river-official-boat-tour",
    summary:
      "芸術家レオ・ヴィラリアルによる“光の橋プロジェクト”を船上から眺める40分のナイトツアー。",
    mainText:
      "**Illuminated River** は、アーティスト **Leo Villareal** によってデザインされたライトアートプロジェクトで、ロンドンの橋を光で彩る長期インスタレーション。その公式ボートツアーでは、テムズ川を進みながら、**9つの橋の光の演出**と、その裏にあるストーリーを鑑賞できます。\n\n途中で**ビッグ・ベン、タワーブリッジ、ザ・シャード**のライトアップも見えます。\n\n所要時間は約40分、価格は **£14.70〜**。",
    image: null,
    website:
      "https://www.goldentours.com/river-thames-attractions/illuminated-river-boat-tour",
    sections: [
      { title: "所要時間", description: "約40分" },
      {
        title: "場所",
        description:
          "[London, EC3N 4DT](https://www.google.com/maps?q=London+EC3N+4DT)",
      },
      {
        title: "見どころ",
        description:
          "レオ・ヴィラリアルによるライトアップが施された9つの橋、ビッグ・ベン、タワーブリッジ、ザ・シャードなど夜景スポット。",
      },
    ],
  },
  {
    title: "テムズ川ランチクルーズ",
    engTitle: "River Thames lunch cruise",
    slug: "river-thames-lunch-cruise",
    summary: "2コースのランチ付きで、テムズ川沿いを約1時間45分かけて回るクルーズ。",
    mainText:
      "船内で**2コースのランチ**をとりながら、テムズ川沿いを回るクルーズです。食後はデッキに出られます。\n\n**ロンドン塔、ロンドン・ブリッジ、ビッグ・ベン、ロンドン・アイ、サウスバンク**が見えます。\n\n所要時間は約1時間45分、料金は大人 **£49.00〜**、子どもは **£39.00〜**。",
    image: null,
    website:
      "https://www.cityexperiences.com/london/city-cruises/lunch-cruise-river-thames/",
    sections: [
      { title: "所要時間", description: "約1時間45分" },
      {
        title: "場所",
        description:
          "[London, EC3N 4DT](https://www.google.com/maps?q=London+EC3N+4DT)",
      },
      {
        title: "見どころ",
        description:
          "ロンドン塔、ロンドン・ブリッジ、ビッグ・ベン、ロンドン・アイ、サウスバンクの景色。",
      },
    ],
  },
  {
    title: "Uber Boat＋IFSクラウド・ケーブルカー セット",
    engTitle: "Thames Clipper and IFS Cloud Cable Car",
    slug: "thames-clipper-and-ifs-cloud-cable-car",
    summary:
      "リバーボートの1日券と、ノース・グリニッジのケーブルカーがセットになった券。",
    mainText:
      "**Uber Boat by Thames Clippers** のリバーローマーチケットでテムズ川を移動しつつ、ノース・グリニッジから **IFS Cloud Cable Car** にも乗れる、セットの券です。\n\nケーブルカーからは、**クイーン・エリザベス・オリンピックパーク、The O2、シティのスカイライン**が見えます。ボート移動では、**タワーピア、ロンドン・アイ、グリニッジ**など、川沿いの名所を巡ることができます。\n\nボートの券が1日有効なので、1日の予定として組みます。価格は **£22.80〜**。",
    image: null,
    website:
      "https://www.thamesclippers.com/tickets-and-fares/joint-tickets/cable-car-combo",
    sections: [
      { title: "所要時間", description: "1日（ボート＋ケーブルカー）" },
      {
        title: "場所",
        description:
          "[North Greenwich / IFS Cloud Cable Car, London SE10 0FR](https://www.google.com/maps?q=SE10+0FR)",
      },
      {
        title: "見どころ",
        description:
          "タワーピア、ロンドン・アイ、グリニッジ、The O2、クイーン・エリザベス・オリンピックパーク、シティのスカイライン。",
      },
    ],
  },
  {
    title: "テムズ川観光クルーズ（ホップオン・ホップオフ）",
    engTitle: "Thames river sightseeing cruise",
    slug: "thames-river-sightseeing-cruise",
    summary:
      "ウェストミンスター〜グリニッジ間を結ぶ観光クルーズ。1日または2日パスで乗り降り自由。",
    mainText:
      "ウェストミンスターとグリニッジを結ぶ観光クルーズで、**ホップオン・ホップオフ形式**で利用できるプラン。1日または2日有効のパスで、好きなピアで乗り降りできます。\n\n船上からは**タワーブリッジ、ビッグ・ベン、ロンドン・アイ**が見えます。多言語のオーディオガイドが付く便もあります。\n\n料金は **£16.50〜**。",
    image: null,
    website:
      "https://www.goldentours.com/river-thames-attractions/24-hours-thames-river-cruise-pass",
    sections: [
      { title: "所要時間", description: "1日または2日パス" },
      {
        title: "場所",
        description:
          "[Westminster Pier 周辺, London SW1A 2JH](https://www.google.com/maps?q=SW1A+2JH)",
      },
      {
        title: "見どころ",
        description:
          "ウェストミンスター〜グリニッジ間のテムズ川沿い。タワーブリッジ、ビッグ・ベン、ロンドン・アイなど。",
      },
    ],
  },
  {
    title: "テムズ川スピードボートツアー",
    engTitle: "Thames speedboat tours",
    slug: "thames-speedboat-tours",
    summary:
      "高速ボートでテムズ川を走る、約50〜80分のツアー。",
    mainText:
      "**Thames Rockets** などが運航する、高速ボートのツアーです。音楽を流しながら、川を高速で走ります。\n\nツアーによって、**ビッグ・ベン、タワーブリッジ、HMSベルファスト、テート・モダン、テムズ・バリア、カナリー・ワーフ**などを回ります。\n\n所要時間は約50〜80分、料金は **£64.95〜**。",
    image: null,
    website: "https://thamesrockets.com/",
    sections: [
      { title: "所要時間", description: "約50〜80分" },
      {
        title: "場所",
        description:
          "[London, SE1 7PB](https://www.google.com/maps?q=London+SE1+7PB)",
      },
      {
        title: "見どころ",
        description:
          "テムズ・バリア、ビッグ・ベン、タワーブリッジ、HMSベルファスト、テート・モダン、カナリー・ワーフなど（ルートにより異なる）。",
      },
    ],
  },
];
