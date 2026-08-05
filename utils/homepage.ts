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
        title: "映画・ドラマのロケ地巡り",
        description:
          "SHERLOCK、ブリジャートン、ダウントン・アビーの撮影地を作品別に",
        href: "/sightseeing/film-locations",
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
  /**
   * ビザは「コラム」の一項目ではなく独立セクションにしている。
   * 読み物ではなく手続きのための情報で、読者の緊急度も動機もまったく違うため。
   * 並びは components/visa/guides/guides.ts の visaGuides と一致させること。
   */
  {
    id: "visa",
    title: "ビザ",
    items: [
      {
        title: "ビザガイド トップ",
        description:
          "観光・就労・留学・家族。自分に必要な英国ビザを、目的と期間から絞り込めます。",
        href: "/visa",
      },
      {
        title: "ETA（電子渡航認証）の取得",
        description:
          "日本国籍も取得必須。£20・10分で終わる申請を、英語しかないアプリ画面の日本語対訳付きで手順どおりに案内します。",
        href: "/sightseeing/eta-uk-visa-guide",
      },
      {
        title: "全ルート比較",
        description:
          "日本人が実際に使う9ルートの費用・滞在期間・永住までの距離を一覧で比較します。",
        href: "/visa/uk-visa-guide",
      },
      {
        title: "YMS（ワーホリ）の申請方法",
        description:
          "18〜30歳ならスポンサー不要で最長2年。却下の最大要因である資金証明の通し方を詳しく解説します。",
        href: "/visa/youth-mobility-scheme",
      },
      {
        title: "Skilled Worker（就労ビザ）",
        description:
          "2025年7月に学士相当へ引き上げられ、約180職種が対象外に。今も取れる職種と年収の壁を整理しました。",
        href: "/visa/skilled-worker",
      },
      {
        title: "Student／Graduate ビザ",
        description:
          "留学の資金証明額、週20時間の数え方、卒業後2年の使い方。2027年からの18ヶ月短縮も解説。",
        href: "/visa/student",
      },
      {
        title: "家族・配偶者ビザ",
        description:
          "最低所得£29,000の証明方法と、関係の真実性をどう立証するか。審査に約12週間かかります。",
        href: "/visa/family",
      },
      {
        title: "渡英後の手続き",
        description:
          "eVisa、share code、NINo、GP登録、銀行口座。パスポート更新時の旅券番号更新を怠ると搭乗拒否されます。",
        href: "/visa/after-arrival",
      },
    ],
  },
  {
    id: "column",
    title: "コラム",
    items: [
      {
        title: "コラムトップ",
        description:
          "イギリスの歴史・文化・伝統・制度を深掘りする読み物コラム。",
        href: "/column",
      },
    ],
  },
  // {
  //   id: "news",
  //   title: "News",
  //   items: [
  //     {
  //       title: "最新ニュース",
  //       description: "こちらでロンドンの最新ニュース・情報を確認できます。",
  //       href: "/news",
  //     },
  //   ],
  // },
  // {
  //   id: "chatboard",
  //   title: "掲示板",
  //   items: [
  //     {
  //       title: "ジャスト・ロンドン掲示板",
  //       description:
  //         "カフェやバーの話、仕事や趣味、イベント情報…何でも自由に書き込んで、誰かの新しい発見につなげよう！",
  //       href: "/chatboard",
  //     },
  //   ],
  // },
];
