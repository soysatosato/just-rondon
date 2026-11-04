/**
 * 観光スポットのページの冒頭に出す知らせ。閉館の予定、移転、休止など、
 * 行く前に知らないと無駄足になることだけを書く。
 *
 * 2026-11 の見直しで、閉館・移転・休止の扱いをユーザーと決めた。
 * 閉館や休止は早わかりの欄(休みの曜日・開館時間)にも出るが、
 * 「そもそもいま行けるか」は欄の1行より前、名前の下で言い切る。
 *
 * 公式で確かめた事実だけを、確認日と出典つきで書く。until を過ぎた知らせは
 * 出さない(開業日の告知のように、その日を過ぎれば要らなくなるもの)。
 * 閉館したスポットは知らせを出し続けるのではなく、Attraction.isPublished を
 * false にして非公開にする(2027年1月のモノポリーなど)。
 */

export type SpotNoticeTone = "closed" | "closing" | "moving";

export type SpotNotice = {
  slug: string;
  tone: SpotNoticeTone;
  /** 1行。「2027年1月に閉館」 */
  title: string;
  /** 1〜2文。 */
  body: string;
  /** 公式で確かめた日("YYYY-MM-DD")。 */
  checkedAt: string;
  sources: { label: string; url: string }[];
  /** この日(ロンドンの日付、"YYYY-MM-DD")を過ぎたら出さない。 */
  until?: string;
};

export const SPOT_NOTICES: readonly SpotNotice[] = [
  {
    slug: "monopoly-lifesized-london",
    tone: "closing",
    title: "2027年1月に閉館",
    body: "公式サイトが「2027年1月に閉館」と告知しています(報道では1月3日が最終日)。",
    checkedAt: "2026-11-05",
    sources: [{ label: "Monopoly Lifesized", url: "https://monopolylifesized.com/" }],
  },
  {
    slug: "phantom-peak",
    tone: "moving",
    title: "2026年12月4日にストラットフォードの新会場で開業",
    body: "ウェストフィールド・ストラットフォード・シティの新しい会場で、12月4日に開業します。公式サイトの案内は新会場だけになっていて、このページの住所と最寄駅も新会場のものです。",
    checkedAt: "2026-11-05",
    sources: [
      { label: "Phantom Peak – Stratford", url: "https://www.phantompeak.com/stratford/" },
      { label: "Phantom Peak – Where to find us", url: "https://www.phantompeak.com/help-faqs/where-to-find-us/" },
    ],
    until: "2026-12-04",
  },
  {
    slug: "lambeth-palace",
    tone: "closed",
    title: "いまは中に入れない",
    body: "定期の見学ツアーは休止中で、再開は公式サイトで告知されます。2026年は5〜8月に月1回、金曜の公開日がありました。",
    checkedAt: "2026-11-05",
    sources: [
      {
        label: "Archbishop of Canterbury – Visit Lambeth Palace",
        url: "https://www.archbishopofcanterbury.org/about/lambeth-palace/visit-lambeth-palace",
      },
      {
        label: "South Bank London – Lambeth Palace open days",
        url: "https://southbank.london/whats-on/lambeth-palace-open-days",
      },
    ],
  },
  {
    slug: "clarence-house-london",
    tone: "closed",
    title: "いまは見学を受け付けていない",
    body: "公開を担う Royal Collection Trust は、2026年11月時点で見学を受け付けておらず、再開の案内もありません。以前は毎年8月にガイドツアーで公開していました。",
    checkedAt: "2026-11-05",
    sources: [{ label: "Royal Collection Trust – Clarence House", url: "https://www.rct.uk/visit/clarence-house" }],
  },
  {
    slug: "peter-harrison-planetarium-greenwich",
    tone: "closed",
    title: "長期休館中",
    body: "プラネタリウムは2025年9月8日から閉まっていて、再開日は発表されていません。王立天文台も改修のため休館しています(公式)。",
    checkedAt: "2026-11-05",
    sources: [
      { label: "Royal Museums Greenwich – Royal Observatory", url: "https://www.rmg.co.uk/royal-observatory" },
      {
        label: "Royal Museums Greenwich – Peter Harrison Planetarium",
        url: "https://www.rmg.co.uk/see-do/peter-harrison-planetarium",
      },
    ],
  },
];

const BY_SLUG = new Map(SPOT_NOTICES.map((n) => [n.slug, n]));

/** today はロンドンの日付("YYYY-MM-DD")。until を過ぎた知らせは返さない。 */
export function spotNoticeFor(slug: string, today: string): SpotNotice | null {
  const notice = BY_SLUG.get(slug);
  if (!notice) return null;
  if (notice.until && today > notice.until) return null;
  return notice;
}
