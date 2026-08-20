/**
 * グローバルナビの定義。
 *
 * デスクトップとモバイルでリンクを二重に手書きしていた結果、片方だけ古いURLが
 * 残って404になっていたため、定義をここ一箇所に集約して両方から描画する。
 *
 * 区分はトップページの大区分と同じで、振り分けの基準もひとつだけ:
 *
 *   観光             = 見る(場所そのもの)。ロンドン市内。
 *   体験する         = する(体験)。ロンドン市内。
 *   ロンドンの外へ   = ロンドン外の目的地。市内かどうかだけで決まるので、
 *                      ロンドン外なら「見る」も「する」もこちらに入る。
 *   旅の準備         = 旅行者の実務(ETA・日程・宿・交通)。
 *   住む・働く       = 在住者の実務(ビザ・住まい・仕事)。
 *   英国を読む       = 読み物(コラム・時事論考・歴史・英語表現)。
 *
 * 鉄道切符の買い方だけは /sightseeing/transport 配下に置いている。
 * 券種の話はロンドン市内と地続きの運賃制度で、transport ハブの
 * basics(運賃と空港)に収まるため。一方 BritRail Pass は
 * 非居住者専用で「周遊する人」だけが必要なので Beyond London に置く。
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
  // Beyond London(ロンドンの外へ)。
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
          { href: "/sightseeing/areas", label: "エリア別ガイド（街区で歩く）" },
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
          { href: "/museums/best-museums-for-kids", label: "子どもと行く博物館" },
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
          { href: "/restaurants/pub-etiquette", label: "パブの作法" },
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
          {
            href: "/sightseeing/football",
            label: "プレミアリーグ観戦",
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
    label: "ロンドンの外へ",
    eyebrow: "Beyond London",
    href: "/beyond-london",
    hubLabel: "Beyond London トップ",
    description:
      "ロンドンを拠点にしたまま、朝出て夜には戻れる範囲へ。街の紹介より先に「どの駅から何分で、往復いくらで、Oysterが使えるのか」を書いています。",
    accent: NAV_ACCENTS.teal,
    groups: [
      {
        heading: "出る前に",
        links: [
          {
            href: "/sightseeing/transport/national-rail",
            label: "鉄道切符の買い方",
          },
          {
            href: "/beyond-london/britrail-pass",
            label: "BritRail Pass の損得",
          },
        ],
      },
      {
        heading: "日帰りで行ける",
        links: [
          { href: "/beyond-london/windsor", label: "ウィンザー" },
          { href: "/beyond-london/oxford", label: "オックスフォード" },
          { href: "/beyond-london/cambridge", label: "ケンブリッジ" },
          {
            href: "/beyond-london/bath-stonehenge",
            label: "バースとストーンヘンジ",
          },
          { href: "/beyond-london/cotswolds", label: "コッツウォルズ" },
          {
            href: "/beyond-london/brighton",
            label: "ブライトンとセブンシスターズ",
          },
          { href: "/beyond-london/canterbury", label: "カンタベリー" },
        ],
      },
      {
        heading: "週末に1泊で",
        links: [
          { href: "/beyond-london/york", label: "ヨーク" },
          { href: "/beyond-london/edinburgh", label: "エディンバラ" },
          { href: "/beyond-london/lake-district", label: "湖水地方" },
          {
            href: "/beyond-london/penzance",
            label: "ペンザンス（寝台列車）",
          },
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
          {
            href: "/sightseeing/transport/national-rail",
            label: "鉄道切符の買い方（ロンドン外へ）",
          },
          { href: "/sightseeing/travel-tips", label: "旅の実用情報" },
          { href: "/trouble", label: "トラブル対応（盗難・紛失）" },
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
      "観光では終わらない人のために。滞在資格をどう取るか、部屋をどう借りるか、口座をどう開くか、体調を崩したらどこに行くか。",
    accent: NAV_ACCENTS.emerald,
    groups: [
      {
        heading: "ビザ",
        links: [
          { href: "/visa", label: "英国ビザガイド トップ" },
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
        ],
      },
      {
        heading: "お金・銀行",
        links: [
          { href: "/money", label: "お金・銀行ガイド トップ" },
          { href: "/money/opening-an-account", label: "渡英直後に開ける口座" },
        ],
      },
      {
        heading: "医療・NHS",
        links: [
          { href: "/health", label: "医療・NHS ガイド トップ" },
          { href: "/health/gp-registration", label: "GP に登録する" },
        ],
      },
      {
        heading: "食費を抑える",
        links: [{ href: "/food", label: "食費を抑えるコツ トップ" }],
      },
      {
        heading: "働く・労働問題",
        links: [
          { href: "/jobs", label: "労働問題ガイド トップ" },
          {
            href: "/jobs/service-charges",
            label: "サービスチャージ完全ガイド",
          },
        ],
      },
      {
        // 「旅の準備」にも同じリンクを置いている。トラブルは旅行者と在住者の
        // どちらにも起きるうえ、被害直後の人は区分を選んでから探す余裕がない。
        // 重複を許してでも、両方の導線から1クリックで届くようにしている。
        heading: "トラブル対応",
        links: [
          { href: "/trouble", label: "トラブル対応ガイド トップ" },
          { href: "/trouble/police-report", label: "警察に届け出る" },
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
    kind: "menu",
    label: "英国を読む",
    eyebrow: "Read",
    href: "/column",
    hubLabel: "コラム トップ",
    description:
      "実務情報の先にある、じっくり読むコンテンツ。イギリスの歴史や言葉の面白さを、旅の合間や暮らしのなかで。",
    accent: NAV_ACCENTS.violet,
    groups: [
      {
        links: [
          { href: "/column", label: "コラム" },
          { href: "/modern-britain", label: "英国のいまを論じる" },
          { href: "/history", label: "イギリスの歴史" },
          { href: "/british-english", label: "イギリス英語" },
        ],
      },
    ],
  },
];

/**
 * ドロップダウンの列数と幅。Tailwind が静的に拾えるよう、動的生成せず対応表で持つ。
 *
 * 4以上は3列に丸める。「住む・働く」のように束が増えた区分で1列に落ちると、
 * ドロップダウンが縦に伸びて画面に収まらなくなるため。
 * 参照側の `?? GROUP_COLS[1]` は 0 件のときだけ効くフォールバックとして残す。
 */
export const GROUP_COLS: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-2",
  5: "grid-cols-3",
  6: "grid-cols-3",
  7: "grid-cols-3",
  8: "grid-cols-3",
};

// NavigationMenuContent は md 以上で md:w-auto が効くため、w-* ではなく min-w-* で指定する。
export const MENU_WIDTH: Record<number, string> = {
  1: "min-w-[520px]",
  2: "min-w-[680px]",
  3: "min-w-[900px]",
  4: "min-w-[680px]",
  5: "min-w-[900px]",
  6: "min-w-[900px]",
  7: "min-w-[900px]",
  8: "min-w-[900px]",
};
