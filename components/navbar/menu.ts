/**
 * グローバルナビの定義。
 *
 * デスクトップとモバイルでリンクを二重に手書きしていた結果、片方だけ古いURLが
 * 残って404になっていたため、定義をここ一箇所に集約して両方から描画する。
 *
 * 区分はトップページの大区分と同じで、振り分けの基準もひとつだけ:
 *
 *   観光       = 見る(場所そのもの)。ロンドン市内。
 *   体験する   = する(体験)。ロンドン市内。
 *   旅の準備   = 旅行者の実務(ETA・日程・宿・交通)。
 *   住む・働く = 在住者の実務(ビザ・住まい・仕事)。
 *   コラム     = 読み物。
 *
 * Beyond London(ロンドン外の日帰り・小旅行)を追加するときは、
 * 「体験する」と「旅の準備」の間に NAV_SECTIONS の要素を1つ足す。
 * ロンドン外なら「見る」も「する」もそちらに入る。
 */

/** アクセント色はトップページのセクションと揃える。Tailwind が拾えるよう文字列で持つ。 */
export type NavAccent = {
  text: string;
  underline: string;
};

export const NAV_ACCENTS = {
  red: { text: "text-red-600", underline: "decoration-red-400" },
  amber: { text: "text-amber-600", underline: "decoration-amber-400" },
  sky: { text: "text-sky-600", underline: "decoration-sky-400" },
  emerald: { text: "text-emerald-600", underline: "decoration-emerald-400" },
  violet: { text: "text-violet-600", underline: "decoration-violet-400" },
  rose: { text: "text-rose-600", underline: "decoration-rose-400" },
  // Beyond London 用に確保。
  teal: { text: "text-teal-600", underline: "decoration-teal-400" },
} as const satisfies Record<string, NavAccent>;

export type NavLink = { href: string; label: string };

/** ドロップダウン内の小見出し付きリンク束。見出しは1束だけのときは省く。 */
export type NavGroup = { heading?: string; links: NavLink[] };

export type NavSection =
  | { kind: "link"; label: string; href: string; accent: NavAccent }
  | {
      kind: "menu";
      label: string;
      /** ドロップダウン左に出す英語の区分名。 */
      eyebrow: string;
      /** 区分そのもののハブページ。 */
      href: string;
      hubLabel: string;
      description: string;
      accent: NavAccent;
      groups: NavGroup[];
    };

export const NAV_SECTIONS: NavSection[] = [
  {
    kind: "menu",
    label: "観光",
    eyebrow: "Sightseeing",
    href: "/sightseeing",
    hubLabel: "ロンドン観光ナビ トップ",
    description:
      "ビッグベンやバッキンガム宮殿といった定番から、世界有数のコレクションを無料で公開する美術館まで。まずどこを見るかを決めるための区分です。",
    accent: NAV_ACCENTS.red,
    groups: [
      {
        heading: "観光スポット",
        links: [
          { href: "/sightseeing/must-see", label: "必見スポット" },
          { href: "/sightseeing/royal-london", label: "ロイヤル・ロンドン" },
          { href: "/sightseeing/all", label: "観光スポット一覧" },
        ],
      },
      {
        heading: "美術館・博物館",
        links: [
          { href: "/museums", label: "美術館ナビ" },
          {
            href: "/museums/best-10-museums",
            label: "絶対に行くべき美術館10選",
          },
          { href: "/museums/best-25-museums", label: "おすすめの美術館25選" },
          { href: "/museums/best-museums-for-kids", label: "キッズ向け美術館" },
          { href: "/museums/banksy-artworks", label: "街で見つかるバンクシー" },
          { href: "/museums/all-museums", label: "美術館一覧" },
        ],
      },
    ],
  },
  {
    kind: "menu",
    label: "体験する",
    eyebrow: "Things to Do",
    href: "/musicals",
    hubLabel: "ミュージカルナビ トップ",
    description:
      "ウエストエンドの観劇、パブでのイギリス料理、映画のロケ地めぐり。場所を訪れるだけでは終わらない、この街ならではの過ごし方。",
    accent: NAV_ACCENTS.amber,
    groups: [
      {
        heading: "観る",
        links: [
          { href: "/musicals", label: "ミュージカル一覧" },
          { href: "/musicals/west-end-tickets", label: "チケットの取り方" },
          { href: "/musicals/west-end-etiquette", label: "観劇のマナー" },
        ],
      },
      {
        heading: "食べる・買う",
        links: [
          { href: "/restaurants", label: "イギリス料理" },
          { href: "/brands", label: "イギリスのブランド" },
          { href: "/souvenirs", label: "ロンドンのお土産" },
        ],
      },
      {
        heading: "テーマで巡る",
        links: [
          { href: "/sightseeing/harry-potter", label: "ハリー・ポッター" },
          {
            href: "/sightseeing/film-locations",
            label: "映画・ドラマのロケ地巡り",
          },
          { href: "/sightseeing/stadium-tours", label: "スタジアムツアー" },
          { href: "/sightseeing/thames-cruise", label: "テムズ川クルーズ" },
          {
            href: "/sightseeing/kids-free-activities",
            label: "子どもと無料で楽しむ",
          },
          {
            href: "/sightseeing/christmas-markets",
            label: "クリスマスマーケット",
          },
          { href: "/events/calendar", label: "年間イベントカレンダー" },
        ],
      },
    ],
  },
  {
    kind: "menu",
    label: "旅の準備",
    eyebrow: "Traveller Info",
    href: "/sightseeing/travel-tips",
    hubLabel: "旅の実用情報",
    description:
      "出発前に済ませる手続きから、現地での移動と滞在まで。何日で何を回り、どこに泊まり、どう動くかを決めるための実務情報。",
    accent: NAV_ACCENTS.sky,
    groups: [
      {
        links: [
          {
            href: "/sightseeing/eta-uk-visa-guide",
            label: "ETA（電子渡航認証）",
          },
          { href: "/sightseeing/itinerary", label: "モデルコース（1〜5日）" },
          { href: "/sightseeing/hotels", label: "宿泊エリアの選び方" },
          {
            href: "/sightseeing/transport",
            label: "交通ガイド（地下鉄・バス・空港）",
          },
          { href: "/sightseeing/travel-tips", label: "旅の実用情報" },
          { href: "/events", label: "今週のロンドン（運休・ストライキ）" },
        ],
      },
    ],
  },
  {
    kind: "menu",
    label: "住む・働く",
    eyebrow: "Resident Info",
    href: "/visa",
    hubLabel: "英国ビザガイド トップ",
    description:
      "観光では終わらない人のために。滞在資格をどう取るか、部屋をどう借りるか、働き始めてから何を知っておくべきか。",
    accent: NAV_ACCENTS.emerald,
    groups: [
      {
        heading: "ビザ",
        links: [
          { href: "/visa", label: "英国ビザガイド トップ" },
          { href: "/visa/uk-visa-guide", label: "全ルート比較" },
          { href: "/visa/youth-mobility-scheme", label: "YMS（ワーホリ）" },
          { href: "/visa/skilled-worker", label: "Skilled Worker（就労）" },
          { href: "/visa/global-talent", label: "Global Talent（卓越人材）" },
          { href: "/visa/student", label: "Student／Graduate" },
          { href: "/visa/family", label: "家族・配偶者ビザ" },
          { href: "/visa/after-arrival", label: "渡英後の手続き" },
        ],
      },
      {
        heading: "住まい探し",
        links: [
          { href: "/housing", label: "住まい探しガイド トップ" },
          {
            href: "/housing/rightmove-zoopla-openrent",
            label: "物件サイトの使い分け",
          },
          { href: "/housing/spareroom", label: "フラットシェアを探す" },
          { href: "/housing/japanese-listings", label: "日系コミュニティ経由" },
          { href: "/housing/tenancy-types", label: "契約形態の地図" },
          {
            href: "/housing/deposits-and-fees",
            label: "初期費用と違法な手数料",
          },
          { href: "/housing/referencing", label: "審査を通す" },
          { href: "/housing/where-to-live", label: "住むエリアの選び方" },
          { href: "/housing/viewing", label: "内見チェックリスト" },
          { href: "/housing/noise", label: "騒音トラブル" },
          { href: "/housing/moving-out", label: "退去とデポジット返還" },
        ],
      },
      {
        heading: "働く・労働問題",
        links: [
          { href: "/jobs", label: "労働問題ガイド トップ" },
          { href: "/jobs/minimum-wage", label: "最低賃金・給与明細" },
          { href: "/jobs/employment-contract", label: "労働契約・就業規則" },
          { href: "/jobs/visa-and-work", label: "ビザと就労" },
          { href: "/jobs/workplace-harassment", label: "ハラスメント相談先" },
          {
            href: "/jobs/service-charges",
            label: "サービスチャージ完全ガイド",
          },
          {
            href: "/jobs/service-charges/case-story",
            label: "審判所申立ての実体験",
          },
          {
            href: "/jobs/service-charges/dashboard",
            label: "店舗別データベース",
          },
        ],
      },
    ],
  },
  {
    kind: "link",
    label: "今週のロンドン",
    href: "/events",
    accent: NAV_ACCENTS.sky,
  },
  {
    kind: "link",
    label: "コラム",
    href: "/column",
    accent: NAV_ACCENTS.violet,
  },
  {
    kind: "link",
    label: "イギリス英語",
    href: "/british-english",
    accent: NAV_ACCENTS.rose,
  },
];

/** ドロップダウンの列数と幅。Tailwind が静的に拾えるよう、動的生成せず対応表で持つ。 */
export const GROUP_COLS: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
};

// NavigationMenuContent は md 以上で md:w-auto が効くため、w-* ではなく min-w-* で指定する。
export const MENU_WIDTH: Record<number, string> = {
  1: "min-w-[520px]",
  2: "min-w-[680px]",
  3: "min-w-[900px]",
};
