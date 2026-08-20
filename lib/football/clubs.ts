/**
 * プレミアリーグ観戦に関わる価格・日程・クラブ情報を一元管理する。
 *
 * なぜ定数にするか:
 * サッカーの情報は「毎年必ず全部変わる」種類の情報でありながら、
 * 変わり方が項目ごとにバラバラで、記事に直接書くと確実に取りこぼす。
 *
 *   - 昇降格でロンドンのクラブの顔ぶれが毎年変わる
 *     (2026/27 はウェストハムが降格し、ロンドン勢は6クラブになった)
 *   - メンバーシップ価格とチケット価格は毎シーズン改定される
 *   - アウェイ £30 上限はリーグの決議で数年ごとに延長される
 *
 * 運用ルール:
 * 1. 記事から金額・日付を書くときは必ずここを参照する(`gbp(...)` の形)。
 * 2. シーズンが変わったらこのファイルと FOOTBALL_AS_OF /
 *    FOOTBALL_UPDATED_AT だけを更新する。
 * 3. 昇降格があったら LONDON_CLUBS を必ず見直す。降格したクラブを
 *    残すと「プレミアリーグの試合が見られる」という嘘になる。
 * 4. 出典は FOOTBALL_SOURCES に持つ。裏取りせずに数値を書き換えないこと。
 *
 * 金額はすべて GBP。2026年8月20日に各クラブ公式・premierleague.com で確認。
 */

/** 情報の基準時点。記事の dataAsOf バッジに出る。 */
export const FOOTBALL_AS_OF = "2026年8月";

/** ISO日付。記事の updatedAt(Article.dateModified)に出る。 */
export const FOOTBALL_UPDATED_AT = "2026-08-20";

/** 記事が対象にしているシーズン。 */
export const SEASON = "2026/27";

/**
 * シーズンの節目。
 *
 * 「いつ行けば試合があるのか」は旅行の日程そのものを左右するので、
 * 開幕・閉幕とオフシーズンは必ず書けるようにしておく。
 */
export const SEASON_DATES = {
  /** 開幕節の初日。 */
  opening: "2026-08-21",
  /** 最終節。 */
  finalDay: "2027-05-30",
  /** 試合が一切ない期間(旅行者がいちばん誤解する)。 */
  offSeason: "6月〜7月",
  /** 過密日程で平日開催が増える時期。 */
  busiestPeriod: "12月下旬〜1月上旬",
} as const;

/**
 * リーグ全体のルール。
 */
export const LEAGUE_RULES = {
  /** アウェイ席の価格上限。2027/28シーズン終了まで延長が決議済み。 */
  awayTicketCap: 30,
  /** 上限が保証されている最終シーズン。 */
  awayCapUntilSeason: "2027/28",
  /** 1シーズンの総試合数。 */
  totalMatches: 380,
  /** 各クラブのホーム開催数。 */
  homeMatchesPerClub: 19,
} as const;

/**
 * チケット転売の法規制。
 *
 * ここは金額ではなく法律なので滅多に変わらないが、記事の核心なので
 * 定数として持つ。読者が二次流通サイトで買って入場拒否される事故が
 * 実際に起きており、サイトとして最も強く警告すべき項目。
 */
export const RESALE_LAW = {
  /** 根拠法。 */
  act: "Criminal Justice and Public Order Act 1994",
  section: "第166条",
  /** 罰金の上限。 */
  maxFine: 5000,
  /** 2006年の改正法(「グッズにチケットが付属」の抜け穴を塞いだもの)。 */
  amendmentAct: "Violent Crime Reduction Act 2006",
} as const;

export type ClubSlug =
  | "arsenal"
  | "tottenham"
  | "chelsea"
  | "crystal-palace"
  | "fulham"
  | "brentford";

export type LondonClub = {
  slug: ClubSlug;
  /** 日本語のクラブ名。 */
  name: string;
  /** 英語の正式名。現地で通じる呼び方。 */
  engName: string;
  stadium: string;
  stadiumJa: string;
  capacity: number;
  /** 最寄り駅と路線。 */
  nearestStation: string;
  line: string;
  /** 最寄り駅からの徒歩分。 */
  walkMinutes: number;
  /** 会員にならずにチケットが取れる可能性。記事の中核になる評価。 */
  difficulty: "very-hard" | "hard" | "moderate" | "easy";
  /** 一般販売までたどり着ける見込みの説明。 */
  availability: string;
  /** 最も安いメンバーシップの年額。null は会員制度が実質不要なクラブ。 */
  membershipFrom: number | null;
  /** 大人1枚の実勢価格帯。 */
  ticketLow: number;
  ticketHigh: number;
  /** そのクラブならではの観戦体験。 */
  character: string;
  officialTickets: string;
};

/**
 * 2026/27シーズンにプレミアリーグを戦うロンドンのクラブ。
 *
 * 並びは「チケットの取りにくい順」。旅行者にとっての実用的な順序が
 * 順位表でもアルファベット順でもなく「取れるかどうか」だから。
 * 初めてロンドンで試合を観る人は、この配列の下から読むべき。
 *
 * ウェストハム・ユナイテッドは2025/26シーズンに降格したため、
 * このリストには入っていない(ロンドン・スタジアムでプレミアリーグの
 * 試合は開催されない)。復帰したら戻すこと。
 */
export const LONDON_CLUBS: LondonClub[] = [
  {
    slug: "arsenal",
    name: "アーセナル",
    engName: "Arsenal",
    stadium: "Emirates Stadium",
    stadiumJa: "エミレーツ・スタジアム",
    capacity: 60704,
    nearestStation: "Arsenal",
    line: "ピカデリー線",
    walkMinutes: 3,
    difficulty: "very-hard",
    availability:
      "一般販売はほぼ存在しません。会員(Red Membership)になっても、人気カードは開始数分で売り切れます。",
    membershipFrom: 40,
    ticketLow: 35,
    ticketHigh: 120,
    character:
      "前シーズンの王者。60,704人が入る大箱ですが、それでも需要が供給を大きく超えています。",
    officialTickets: "https://www.arsenal.com/tickets",
  },
  {
    slug: "tottenham",
    name: "トッテナム・ホットスパー",
    engName: "Tottenham Hotspur",
    stadium: "Tottenham Hotspur Stadium",
    stadiumJa: "トッテナム・ホットスパー・スタジアム",
    capacity: 62850,
    nearestStation: "Tottenham Hale / White Hart Lane",
    line: "ヴィクトリア線 / オーバーグラウンド",
    walkMinutes: 20,
    difficulty: "hard",
    availability:
      "One Hotspur 会員になれば、人気の低いカードは取れることがあります。ロンドン最大の収容力が効いています。",
    membershipFrom: 45,
    ticketLow: 38,
    ticketHigh: 109,
    character:
      "2019年開業のヨーロッパ最新鋭スタジアム。収容62,850人はロンドン最大で、設備は圧倒的です。",
    officialTickets: "https://www.tottenhamhotspur.com/tickets/",
  },
  {
    slug: "chelsea",
    name: "チェルシー",
    engName: "Chelsea",
    stadium: "Stamford Bridge",
    stadiumJa: "スタンフォード・ブリッジ",
    capacity: 40044,
    nearestStation: "Fulham Broadway",
    line: "ディストリクト線",
    walkMinutes: 5,
    difficulty: "hard",
    availability:
      "会員制＋ロイヤルティポイント制。2026/27からポイントは「来場」でしか貯まらなくなり、新規会員には一段と厳しくなりました。",
    membershipFrom: 15,
    ticketLow: 40,
    ticketHigh: 95,
    character:
      "中心部から地下鉄1本という圧倒的な立地。収容40,044人と小さめなので競争率は高めです。",
    officialTickets: "https://www.chelseafc.com/en/tickets",
  },
  {
    slug: "crystal-palace",
    name: "クリスタル・パレス",
    engName: "Crystal Palace",
    stadium: "Selhurst Park",
    stadiumJa: "セルハースト・パーク",
    capacity: 25194,
    nearestStation: "Selhurst / Norwood Junction",
    line: "ナショナル・レール(ロンドン・ブリッジ等から)",
    walkMinutes: 10,
    difficulty: "moderate",
    availability:
      "会員でなくても一般販売に回ることがあります。ただし収容25,194人と小さく、人気カードは即完売します。",
    membershipFrom: 35,
    ticketLow: 35,
    ticketHigh: 75,
    character:
      "プレミアリーグで最も雰囲気が良いと評されるスタジアム。ゴール裏のホルムズデール・エンドの応援は必見です。",
    officialTickets: "https://www.cpfc.co.uk/tickets/",
  },
  {
    slug: "fulham",
    name: "フラム",
    engName: "Fulham",
    stadium: "Craven Cottage",
    stadiumJa: "クレイヴン・コテージ",
    capacity: 27782,
    nearestStation: "Putney Bridge",
    line: "ディストリクト線",
    walkMinutes: 12,
    difficulty: "moderate",
    availability:
      "ロンドンでは比較的取りやすい部類です。強豪との対戦を避ければ、会員でも一般販売でも現実的に狙えます。",
    membershipFrom: 35,
    ticketLow: 30,
    ticketHigh: 75,
    character:
      "テムズ川のほとりに建つ英国最古級のスタジアム。木造の Grade II 指定建築が残る、観光そのものが目的になる場所です。",
    officialTickets: "https://www.fulhamfc.com/tickets",
  },
  {
    slug: "brentford",
    name: "ブレントフォード",
    engName: "Brentford",
    stadium: "Gtech Community Stadium",
    stadiumJa: "Gtech コミュニティ・スタジアム",
    capacity: 17250,
    nearestStation: "Brentford / Kew Bridge",
    line: "ナショナル・レール(ウォータールー等から)",
    walkMinutes: 8,
    difficulty: "moderate",
    availability:
      "収容17,250人とリーグ最小級ですが、需要も穏やかです。初めてロンドンで試合を観るなら現実的な選択肢になります。",
    membershipFrom: 30,
    ticketLow: 30,
    ticketHigh: 70,
    character:
      "2020年開業のコンパクトな新スタジアム。ピッチが近く、どの席からもよく見えます。パブ4軒に囲まれた立地も名物です。",
    officialTickets: "https://www.brentfordfc.com/en/tickets",
  },
];

export const DIFFICULTY_LABELS: Record<LondonClub["difficulty"], string> = {
  "very-hard": "非常に困難",
  hard: "困難",
  moderate: "現実的",
  easy: "容易",
};

export function getClub(slug: ClubSlug) {
  return LONDON_CLUBS.find((c) => c.slug === slug) ?? null;
}

/** 旅行者が現実的に狙えるクラブ。ハブと記事の両方で使う。 */
export const REALISTIC_CLUBS = LONDON_CLUBS.filter(
  (c) => c.difficulty === "moderate" || c.difficulty === "easy"
);

/**
 * ロンドンで観られるプレミアリーグ以外のサッカー。
 *
 * 「プレミアリーグのチケットが取れなかった」で終わらせないために置く。
 * 実際、下部リーグや女子サッカーのほうが体験として面白いことは多い。
 */
export const OTHER_FOOTBALL = {
  /** 女子スーパーリーグの一般的なチケット価格帯。 */
  wslLow: 10,
  wslHigh: 25,
  /** EFL(2部〜4部)の一般的なチケット価格帯。 */
  eflLow: 20,
  eflHigh: 40,
  /** ノンリーグ(5部以下)の一般的なチケット価格帯。 */
  nonLeagueLow: 12,
  nonLeagueHigh: 20,
} as const;

/** 金額を「£12.50」の形にする。整数のときは小数点を出さない。 */
export function gbp(amount: number) {
  return `£${Number.isInteger(amount) ? amount : amount.toFixed(2)}`;
}

/** ISO日付を「2026年8月21日」の形にする。 */
export function jpDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return `${y}年${m}月${d}日`;
}

/**
 * 出典。
 *
 * 価格と制度を書き換えるときは、必ずここのURLで裏を取ること。
 * まとめサイトや転売サイトの数字を根拠にしない。
 */
export const FOOTBALL_SOURCES = [
  {
    label: "Premier League — Tickets",
    url: "https://www.premierleague.com/en/tickets",
  },
  {
    label: "Premier League — 安全なチケットの買い方",
    url: "https://www.premierleague.com/en/tickets/safe-buying-tickets",
  },
  {
    label: "Premier League — アウェイチケット £30 上限の延長",
    url: "https://www.premierleague.com/en/news/4617247/premier-league-statement-on-30-pounds-cap-on-away-tickets",
  },
  {
    label: "Criminal Justice and Public Order Act 1994 s.166(転売規制)",
    url: "https://www.legislation.gov.uk/ukpga/1994/33/section/166",
  },
  {
    label: "Football Supporters' Association",
    url: "https://thefsa.org.uk/",
  },
] as const;
