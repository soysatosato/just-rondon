type Section = {
  id: string;
  title: string;
  items: {
    title: string;
    description: string;
    href: string;
  }[];
};

export const sections: Section[] = [
  {
    id: "sightseeing",
    title: "観光特集",
    items: [
      {
        title: "ロンドン観光ナビ",
        description: "主要スポットをまとめてチェック",
        href: "/sightseeing",
      },
      {
        title: "ロンドン観光施設一覧",
        description:
          "初めての旅行でも迷わない、ロンドン定番スポットをわかりやすく一覧化",
        href: "/sightseeing/all",
      },
      {
        title: "ハリー・ポッター聖地巡礼ガイド",
        description: "映画ロケ地から魔法の世界まで完全紹介",
        href: "/sightseeing/harry-potter",
      },
      {
        title: "子どもと無料で楽しめるスポット",
        description: "家族でお得に巡れるロンドンの無料名所",
        href: "/sightseeing/kids-free-activities",
      },
      {
        title: "絶対に外せないロンドン観光",
        description: "初めてでも迷わない必見スポット特集",
        href: "/sightseeing/must-see",
      },
      {
        title: "ロイヤル・ロンドン特集",
        description: "王室ゆかりの地や宮殿を巡るロイヤル旅",
        href: "/sightseeing/royal-london",
      },
      {
        title: "クリスマスマーケット特集",
        description: "冬だけの特別なマーケットを徹底ガイド",
        href: "/sightseeing/christmas-markets",
      },
    ],
  },
  {
    id: "museums",
    title: "美術館特集",
    items: [
      {
        title: "美術館ナビ",
        description: "ロンドン中の美術館を一覧でチェック",
        href: "/museums",
      },
      {
        title: "絶対に行くべき美術館10選",
        description: "迷ったらここ！押さえておきたいトップ10",
        href: "/museums/best-10-museums",
      },
      {
        title: "キッズ向け美術館",
        description: "子どもと一緒に楽しめるおすすめスポット",
        href: "/museums/best-museums-for-kids",
      },
      {
        title: "街で見つかるバンクシー",
        description: "ストリートアートの名作を探索",
        href: "/museums/vanksy",
      },
    ],
  },
  {
    id: "theatre",
    title: "劇場・ミュージカル",
    items: [
      {
        title: "人気劇場ガイド",
        description: "ロンドンの主要ミュージカル劇場を徹底紹介",
        href: "/musicals",
      },
    ],
  },
  {
    id: "column",
    title: "コラム",
    items: [
      {
        title: "ビザ取得方法",
        description:
          "渡航目的に応じたビザの種類や申請手順、必要書類についてわかりやすく解説しています。",
        href: "/visa/uk-visa-guide-2025",
      },
      {
        title: "ETA（電子渡航認証）の取得",
        description:
          "イギリスへの短期渡航で必要な電子渡航認証（ETA）の取得方法や注意点を紹介。",
        href: "/sightseeing/eta-uk-visa-guide",
      },
      {
        title: "ワーホリビザの申請方法",
        description:
          "ワーホリの申請手順、必要書類についてわかりやすく解説しています。",
        href: "/visa/uk-youth-mobility-visa",
      },
    ],
  },
  {
    id: "news",
    title: "News",
    items: [
      {
        title: "最新ニュース",
        description: "こちらでロンドンの最新ニュース・情報を確認できます。",
        href: "/news",
      },
    ],
  },
  {
    id: "chatboard",
    title: "掲示板",
    items: [
      {
        title: "ジャスト・ロンドン掲示板",
        description:
          "カフェやバーの話、仕事や趣味、イベント情報…何でも自由に書き込んで、誰かの新しい発見につなげよう！",
        href: "/chatboard",
      },
    ],
  },
];
