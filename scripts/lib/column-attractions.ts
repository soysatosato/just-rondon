/**
 * コラム本文に出てくる観光スポットを探す・登録する共通処理。
 *
 * scripts/link-column-attractions.ts(既存コラムの候補出しと登録)と
 * scripts/create-column.ts(新規コラムの登録時)の両方から使う。
 *
 * 名前一致はあくまで候補出し。通りすがりの言及も拾うので、
 * 載せるかどうかは人が本文を読んで決める(ContentAttraction のコメント参照)。
 */
import db from "../../utils/db";

/**
 * 名前だけでは拾えない表記ゆれ。slug ごとに足す。
 *
 * 「・」や空白の有無は normalize() が吸収するので、ここには書かない
 * (「ビッグ・ベン」は「ビッグベン」と同じに扱われる)。書くのは
 * 別の呼び名・旧称・略称だけ。
 */
const EXTRA_ALIASES: Record<string, string[]> = {
  "big-ben": ["エリザベス・タワー"],
  "houses-of-parliament-self-guided-audio-tour": [
    "国会議事堂",
    "ウェストミンスター宮殿",
  ],
  "kew-gardens-london": ["キュー王立植物園"],
  "royal-observatory-greenwich": ["王立天文台"],
  "shakespeares-globe-guided-tour": ["グローブ座"],
  "hampton-court-palace": ["ハンプトン・コート"],
  "changing-the-guard-buckingham-palace": ["衛兵交代"],
  "harrods-london": ["ハロッズ"],
  "london-museum-smithfield": ["ロンドン博物館"],
  "churchill-war-rooms": ["内閣戦時執務室"],
  "st-pauls-cathedral": ["セント・ポール寺院"],
  "cutty-sark": ["カティーサーク"],
  "trafalgar-square": ["トラファルガー・スクエア"],
  // 「セント・パンクラス」単独は別名にしない。駅の北にある
  // セント・パンクラス旧教会(赤い電話ボックスの回に出てくる)に当たる。
  "st-pancras-international": ["セント・パンクラス・インターナショナル"],
  "regents-park": ["リージェント・パーク"],
  "royal-albert-hall": ["アルバート・ホール"],
  "old-royal-naval-college": ["旧王立海軍大学", "旧王立海軍学校"],
  "golden-hinde": ["ゴールデン・ハインド"],
  "sir-john-soanes-museum": ["ソーン美術館"],
  "wembley-stadium-tour": ["ウェンブリー・スタジアム"],
  "lords-cricket-ground": ["ローズ・グラウンド"],
  "arsenal-emirates-stadium-tour": ["エミレーツ・スタジアム"],
  "crystal-palace-dinosaurs": ["クリスタル・パレス"],
  "summit-alexandra-palace": ["アレクサンドラ・パレス"],
  "st-dunstan-in-the-east": ["セント・ダンスタン・イン・ザ・イースト"],
  "kings-gallery-buckingham-palace": ["クイーンズ・ギャラリー"],
  "portobello-road-market": ["ポートベロー・ロード"],
  "camden-lock-market": ["カムデン・マーケット"],
  "neals-yard-seven-dials": ["ニールズ・ヤード", "セブン・ダイヤルズ"],
  "bt-tower-london": ["ポスト・オフィス・タワー", "郵便局タワー"],
  "fortnum-and-mason": ["フォートナム&メイソン", "フォートナム・メイソン"],
  "paddington-bear-experience": ["パディントン・ベア"],
  "warner-bros-studio-tour-harry-potter": ["ワーナー・ブラザーズ・スタジオ"],
  "legoland-windsor": ["レゴランド"],
  "royal-academy-of-arts": ["ロイヤル・アカデミー"],
  // 括弧の中身のうち、それ自体がこのスポットを指すもの
  "postal-museum": ["メール・レール"],
  "chelsea-stamford-bridge-tour": ["スタンフォード・ブリッジ"],
  "twickenham-world-rugby-museum": ["ワールドラグビー博物館"],
  "guards-museum": ["ガーズ・ミュージアム"],
  "the-fourth-plinth-trafalgar-square": ["第四の台座", "第4の台座"],
  "ifs-cloud-cable-car-london": ["エミレーツ・エア・ライン", "ロンドン・ケーブルカー"],
  "harry-potter-shop-platform-934": ["9と3/4番線"],
  "the-gherkin-30-st-mary-axe": ["ガーキン", "30セント・メアリー・アックス"],
  "cartoon-museum": ["漫画博物館"],
  // 頭や末尾の「ロンドン」「ザ・」を外した略称
  "natural-history-museum": ["自然史博物館"],
  "madame-tussauds-london": ["マダム・タッソー"],
  "london-transport-museum": ["交通博物館"],
  "monument-to-the-great-fire-of-london": ["大火記念塔", "モニュメント"],
  "the-view-from-the-shard": ["シャード"],
};

/** これより短い別名は、別の語の一部として当たりやすいので使わない。 */
const MIN_ALIAS_LENGTH = 4;

/**
 * 表記ゆれを吸収した比較用の文字列にする。
 *
 * NFKC で全角英数・全角記号をそろえ、「・」と空白を落とす。
 * 本文側・名前側の両方に同じ処理をかけて比べる。
 */
function normalizeChar(c: string): string {
  return c
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[・･\s=＝]/g, "");
}

export function normalize(text: string): string {
  return Array.from(text).map(normalizeChar).join("");
}

/**
 * 正規化した文字列と、その各文字が元の文字列の何文字目から来たか。
 * 抜粋を元の表記のまま出すために使う。
 */
function normalizeWithMap(text: string): { norm: string; map: number[] } {
  let norm = "";
  const map: number[] = [];
  Array.from(text).forEach((c, i) => {
    const n = normalizeChar(c);
    for (const ch of n) {
      norm += ch;
      map.push(i);
    }
  });
  return { norm, map };
}

export type AttractionMatcher = {
  slug: string;
  name: string;
  aliases: string[];
};

function aliasesFor(a: {
  slug: string;
  name: string;
  engName: string | null;
}): string[] {
  const raw = new Set<string>([a.name, ...(EXTRA_ALIASES[a.slug] ?? [])]);

  // 「クイーンズ・ハウス（グリニッジ）」→「クイーンズ・ハウス」。
  // 括弧の中身は別名にしない。「チャイナタウン（ロンドン）」「ロイヤル・
  // ミューズ（バッキンガム宮殿）」のように、別のもっと広いものを指す
  // 語が入っていることが多い。使える中身は EXTRA_ALIASES に書く。
  const paren = a.name.match(/^(.*?)[（(].+?[）)]\s*$/);
  const base = paren ? paren[1].trim() : a.name;
  raw.add(base);

  // 頭の「ロンドン」「ザ・」を機械的に外すことはしない。
  // 「ロンドン・ミュージアム」が「ミュージアム」に、「グリップ・ロンドン」が
  // 「グリップ」になり、無関係な箇所に当たる。略称は EXTRA_ALIASES に書く。

  if (a.engName) raw.add(a.engName);

  const normalized = new Set<string>();
  for (const alias of raw) {
    const n = normalize(alias);
    if (n.length >= MIN_ALIAS_LENGTH) normalized.add(n);
  }
  return [...normalized];
}

/** 公開中のスポットすべてについて、照合用の別名を組み立てる。 */
export async function loadAttractionMatchers(): Promise<AttractionMatcher[]> {
  const rows = await db.attraction.findMany({
    where: { isPublished: true },
    select: { slug: true, name: true, engName: true },
  });
  return rows.map((a) => ({
    slug: a.slug,
    name: a.name,
    aliases: aliasesFor(a),
  }));
}

export type Mention = {
  slug: string;
  name: string;
  /** 本文中の出現回数(別名どうしの重なりは数えない) */
  count: number;
  /** 最初に出てくる位置。候補を本文の順に並べるのに使う。 */
  firstIndex: number;
  /** 最初の出現の前後。元の表記のまま。 */
  excerpt: string;
};

/**
 * 本文に出てくるスポットを、最初に出てくる順に返す。
 *
 * 同じ箇所に複数の別名が当たる(「ロンドン自然史博物館」に
 * 「自然史博物館」も当たる)ので、スポットごとに当たった区間を
 * まとめてから数える。
 */
export function findMentions(
  text: string,
  matchers: AttractionMatcher[],
): Mention[] {
  const { norm, map } = normalizeWithMap(text);
  const chars = Array.from(text);
  const mentions: Mention[] = [];

  for (const m of matchers) {
    const starts = new Set<number>();
    for (const alias of m.aliases) {
      let i = norm.indexOf(alias);
      while (i !== -1) {
        starts.add(i);
        i = norm.indexOf(alias, i + alias.length);
      }
    }
    if (starts.size === 0) continue;

    // 別名の当たり位置は重なりうる(「ロンドン自然史博物館」と
    // 「自然史博物館」)。近すぎる当たりは同じ1回として数える。
    const sorted = [...starts].sort((a, b) => a - b);
    let count = 0;
    let last = -Infinity;
    for (const s of sorted) {
      if (s - last > 8) count += 1;
      last = s;
    }

    const first = sorted[0];
    const at = map[first];
    const excerpt = chars
      .slice(Math.max(0, at - 30), at + 40)
      .join("")
      .replace(/\s+/g, " ");

    mentions.push({
      slug: m.slug,
      name: m.name,
      count,
      firstIndex: at,
      excerpt,
    });
  }

  return mentions.sort((a, b) => a.firstIndex - b.firstIndex);
}

/** コラム1本ぶんの本文を、表示される順に1本の文字列にする。 */
export function columnText(c: {
  title: string;
  summary?: string | null;
  mainText?: string | null;
  sections: {
    title: string;
    subtitle?: string | null;
    description?: string | null;
    displayOrder: number;
  }[];
}): string {
  return [
    c.title,
    c.summary ?? "",
    c.mainText ?? "",
    ...c.sections
      .slice()
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .map((s) => [s.title, s.subtitle ?? "", s.description ?? ""].join("\n")),
  ].join("\n");
}

/**
 * slug の並びを Attraction の id の並びに引き直す。
 *
 * 存在しない slug・非公開のスポット・重複はまとめてエラーにする。
 * 非公開のスポットを黙って通すと、表示側で伏せられてリンクが出ず、
 * 書いた本人が気づけない。
 */
export async function resolveAttractionSlugs(
  slugs: string[],
): Promise<string[]> {
  const dupes = slugs.filter((s, i) => slugs.indexOf(s) !== i);
  if (dupes.length > 0) {
    throw new Error(`Duplicate attraction slugs: ${[...new Set(dupes)].join(", ")}`);
  }
  if (slugs.length === 0) return [];

  const rows = await db.attraction.findMany({
    where: { slug: { in: slugs } },
    select: { id: true, slug: true, isPublished: true },
  });
  const bySlug = new Map(rows.map((r) => [r.slug, r]));

  const unknown = slugs.filter((s) => !bySlug.has(s));
  if (unknown.length > 0) {
    throw new Error(`Unknown attraction slugs: ${unknown.join(", ")}`);
  }
  const hidden = slugs.filter((s) => !bySlug.get(s)!.isPublished);
  if (hidden.length > 0) {
    throw new Error(`Unpublished attractions (link would not show): ${hidden.join(", ")}`);
  }

  return slugs.map((s) => bySlug.get(s)!.id);
}
