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

export function visibleSections(
  sections: SectionLike[],
  facts: {
    priceAdult: string | null;
    durationText: string | null;
    nearestStation: string | null;
    openingHours: string | null;
  },
): SectionLike[] {
  return sections
    .filter((s) => (s.description ?? "").trim().length > 0)
    .filter((s) => {
      const t = s.title;

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
 * DB の displayOrder は「概要 → 歴史 → 見どころ → 実用情報」という
 * 入力時の順で、実用情報を抜いた後もそのまま使える。ただし「概要」は
 * summary と内容が重なることが多いので、重複が激しいものは落とす。
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
