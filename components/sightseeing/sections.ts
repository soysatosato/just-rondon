/**
 * 詳細ページ本文に出す AttractionSection の取捨選択。
 *
 * 料金・アクセス・開館時間などはファクトバーへ移したので、本文で
 * もう一度同じことを言う必要がない。ただし DB の sections は削っていない
 * (抽出が外れたときに情報が消えると困るため)ので、表示側で伏せる。
 *
 * 伏せるのは「ファクトバーに実際に値が入っている」ときだけにする。
 * 抽出できずファクトバーが空のまま本文も隠すと、そのページから
 * 料金の記載が丸ごと消えてしまう。
 */

export type SectionLike = {
  id: number;
  title: string;
  description: string | null;
  displayOrder: number;
};

/** ファクトバーに移した情報を含むセクションの見出し。 */
const PRICE_SECTION = /料金|チケット|入場料|価格/;
const ACCESS_SECTION = /アクセス|行き方|最寄|所在地|^場所/;
const HOURS_SECTION = /開館|開園|開場|営業|オープン|開閉/;
const DURATION_SECTION = /所要時間|滞在時間|見学時間/;

/** 「所要時間・年齢制限」のように、実用情報と他の話が同居する見出し。 */
const MIXED_SECTION = /年齢制限|注意|持ち物|服装|予約/;

/**
 * 「着いてからの歩き方」(visitFlow)と役割が重なる見出し。
 *
 * どちらも「何を見るか」を扱う。visitFlow が入っているページでは、
 * 見どころ節は同じ対象を名前だけ並べた劣化版になる——ウェストミンスター
 * 寺院なら、節が「ポエッツ・コーナー：チョーサー、シェイクスピア…」と
 * 列挙し、その200字ほど下で歩き方が同じ場所を「床石を踏まないと通れない
 * ほど密集している」と書く。読者は同じ話を2回読むことになる。
 *
 * そこで visitFlow を持つページでは、この見出しの節を伏せて歩き方に
 * 一本化する。isRedundantOverview が summary と「概要」に対してやって
 * いるのと同じ考え方で、対象が違うだけ。
 *
 * 伏せるのは visitFlow が実際に入っているときだけ。歩き方の無いページで
 * これを隠すと、見どころが本文から丸ごと消える。
 */
const VISIT_FLOW_SECTION =
  /見どころ|見られるもの|必見|ハイライト|展示されている|景観|体験内容|有名な展示|主な展示|現在開催中の展示/;

export function visibleSections(
  sections: SectionLike[],
  facts: {
    priceAdult: string | null;
    durationText: string | null;
    nearestStation: string | null;
    openingHours: string | null;
    /** 「着いてからの歩き方」のステップ数。0なら見どころ節を伏せない。 */
    visitFlowSteps?: number;
  },
): SectionLike[] {
  return sections
    .filter((s) => (s.description ?? "").trim().length > 0)
    .filter((s) => {
      const t = s.title;

      // 歩き方が入っているページでは、見どころ節は同じ対象の劣化版になる。
      // ここだけは MIXED_SECTION より先に判定する——「見どころ・注意点」の
      // ような複合見出しでも、歩き方があるなら歩き方を優先したいため。
      if (facts.visitFlowSteps && VISIT_FLOW_SECTION.test(t)) return false;

      // 実用情報以外の話も含む見出しは、隠すと本文が欠ける。常に残す。
      if (MIXED_SECTION.test(t)) return true;

      if (facts.priceAdult && PRICE_SECTION.test(t)) return false;
      if (facts.nearestStation && ACCESS_SECTION.test(t)) return false;
      if (facts.openingHours && HOURS_SECTION.test(t)) return false;
      // 所要時間だけのセクションは1行しかないことが多いので、
      // ファクトバーに出ていれば本文からは落とす。
      if (facts.durationText && DURATION_SECTION.test(t)) return false;

      return true;
    })
    .sort((a, b) => a.displayOrder - b.displayOrder);
}

/**
 * 読み物として面白い順に並べ替える。
 *
 * DB の displayOrder は入力時の順で、スポットごとにばらばら。実際には
 * 「見どころ」が7番目で「ショップ・飲食」が2番目、というページがある。
 * 読者がこのページに来た理由は見どころなので、そこを最初に出す。
 *
 * 見出しの表記ゆれ(「見どころ」「見どころ・体験内容」「体験内容」が
 * すべて同義)は正規表現で吸収する。どのグループにも当たらない見出しは
 * OTHER_RANK に落として、元の displayOrder で並べる。
 */
const READING_ORDER: { rank: number; pattern: RegExp }[] = [
  /*
    isRedundantOverview() をすり抜けた「概要」を先頭に戻さないための行。
    重複判定は6割一致と厳しめなので、summary を言い換えただけのものが
    残ることがある。残ってしまった以上は消せない(本文が減る)が、
    見どころより前に置く理由はないので後ろへ送る。
    .find() の先頭一致なので、この行は「展示」等より前に置くこと——
    「何が展示されているのか？」を rank 0 に取られる前に拾う必要はないが、
    「ロンドン塔とは？」が /歴史/ に当たらないよう明示しておく。
  */
  { rank: 2.6, pattern: /^概要|とは[？?]\s*$|について\s*$/ },

  { rank: 0, pattern: /見どころ|体験内容|展示|見学|ハイライト|有名な/ },
  { rank: 1, pattern: /歴史|豆知識|由来|建築/ },
  { rank: 2, pattern: /ショップ|飲食|食事|カフェ|レストラン|お土産/ },

  /*
    ファクトバーに値が無くて本文に残った実用情報(大英博物館の「アクセス」など)。
    読み物としては最後でよいが、「服装・持ち物」より前に置く。
  */
  { rank: 3, pattern: /アクセス|行き方|最寄|所在地|^場所|料金|チケット|入場料|開館|営業|所要時間/ },

  { rank: 4, pattern: /服装|持ち物|注意|年齢制限|予約|よくある質問/ },
];

/** どのグループにも当たらない見出しの順位。実用情報の手前に置く。 */
const OTHER_RANK = 2.5;

function readingRank(title: string): number {
  const hit = READING_ORDER.find((r) => r.pattern.test(title));
  return hit ? hit.rank : OTHER_RANK;
}

/**
 * 目次リンクと <h2 id> に使うアンカー。
 *
 * 見出しは日本語なので slug 化してもURLに出せる文字にならない。
 * section.id (DB の連番) を使えば一意で、ページ内で安定する。
 */
export function sectionAnchor(section: SectionLike): string {
  return `sec-${section.id}`;
}

/**
 * visibleSections() の結果を読み物順に並べ替える。
 * 同順位のときは元の displayOrder を保つ(安定ソート)。
 */
export function orderForReading(sections: SectionLike[]): SectionLike[] {
  return [...sections].sort((a, b) => {
    const diff = readingRank(a.title) - readingRank(b.title);
    return diff !== 0 ? diff : a.displayOrder - b.displayOrder;
  });
}

/**
 * 冒頭の summary と中身が重なる「概要」セクションかどうか。
 *
 * 133/135件が「概要」を持っていて、その多くが summary の言い換えになって
 * いる。同じ話を2回読ませると、情報量のわりに薄いページに見える。
 */
export function isRedundantOverview(
  section: SectionLike,
  summary: string | null,
): boolean {
  if (!summary) return false;
  // 「概要」「ロンドン塔とは？」「〜について」など、summary と同じ役割の見出し。
  // 「とは？」は語尾なので前方一致にしない(「ロンドン塔とは？」を拾うため)。
  if (!/^概要|とは[？?]\s*$|について\s*$/.test(section.title)) return false;

  const body = (section.description ?? "").replace(/\s|\*|#/g, "");
  const sum = summary.replace(/\s|\*|#/g, "");
  if (!body || !sum) return false;

  // 短いほうの6割が相手に含まれていれば重複とみなす。
  // 完全一致で判定すると、語尾だけ違う焼き直しを取りこぼす。
  const shorter = body.length < sum.length ? body : sum;
  const longer = body.length < sum.length ? sum : body;
  const probe = shorter.slice(0, Math.floor(shorter.length * 0.6));
  return probe.length > 20 && longer.includes(probe);
}
