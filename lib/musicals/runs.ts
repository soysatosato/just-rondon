/**
 * ミュージカルの初日と千秋楽。発表済みのものだけを、確認日と出典つきで持つ。
 *
 * Musical.isOnShow は人が倒すまで true のまま残る。2026-11 の見直しでは、
 * 上演中としていた34作品のうち8作品が 2026/12/27〜2027/1/9 に終演すると
 * 発表済みで、うち3作品は本文にも終演日が無かった。呪いの子の上演時間
 * (二部制の210分が、一部制に変わったあとも残っていた)と同じで、
 * 予告された日付は期日が来ても誰も気づかない。
 *
 * そこで、
 *   - 作品ページの名前の下に「◯月◯日で終演」「◯月◯日開幕」を出す
 *     (components/musicals/MusicalRunBanner.tsx)
 *   - 一覧のカードに同じ日付をバッジで出す(MusicalHomePage)
 *   - 千秋楽を過ぎた作品は、DB が true のままでも上演中として扱わない
 *     (utils/actions/musicals.ts と theatres.ts の取得関数で重ねる)
 *
 * DB に列を足さずに静的ファイルにしたのは、日付と一緒に出典を持ちたいため
 * (lib/sightseeing/notices.ts と同じ理由)。読者に「どこで確かめた日付か」を
 * 示せないと、延長が発表されたときに古い日付のまま残る。
 *
 * ★ closes に入れるのは「千秋楽(final performance)」として発表された日だけ。
 *   「◯月◯日まで予約受付中(booking until)」は入れない。延長されるのが
 *   普通で、入れると上演中の作品を勝手に終演扱いにしてしまう。
 * ★ 延長が発表されたら closes を書き換えるか行を消す。千秋楽を過ぎたら
 *   isOnShow を false に倒し、ここからも消してよい(倒すまでの安全網)。
 * ★ ここで上演中に「戻す」ことはしない。再演の初日(opens)を過ぎても、
 *   上演中にするのは人が確かめて isOnShow を true にしたときだけ。
 */

export type MusicalRunSource = { label: string; url: string };

export type MusicalRun = {
  slug: string;
  /** 初日("YYYY-MM-DD"、ロンドンの日付)。この日より前は「開幕前」と出す。 */
  opens?: string;
  /** 千秋楽("YYYY-MM-DD")。この日を過ぎたら上演中として扱わない。 */
  closes?: string;
  /** 出典で確かめた日("YYYY-MM-DD")。 */
  checkedAt: string;
  sources: MusicalRunSource[];
};

export const MUSICAL_RUNS: readonly MusicalRun[] = [
  {
    slug: "stranger-things",
    closes: "2026-12-27",
    checkedAt: "2026-11-11",
    sources: [
      {
        label: "London Theatre Direct",
        url: "https://www.londontheatredirect.com/news/stranger-things-the-first-shadow-final-performance-date-announced",
      },
      {
        label: "Netflix Tudum",
        url: "https://www.netflix.com/tudum/articles/stranger-things-first-shadow-play-broadway-west-end-final-extension",
      },
    ],
  },
  {
    slug: "beetlejuice",
    closes: "2027-01-02",
    checkedAt: "2026-11-11",
    sources: [
      {
        label: "BroadwayWorld",
        url: "https://www.broadwayworld.com/article/BEETLEJUICE-West-End-Run-to-Close-Early-in-January-20260903",
      },
    ],
  },
  {
    slug: "avenue-q",
    closes: "2027-01-03",
    checkedAt: "2026-11-11",
    sources: [
      {
        label: "WhatsOnStage",
        url: "https://www.whatsonstage.com/news/original-avenue-q-west-end-cast-to-return-for-special-finale-performance_1730955/",
      },
      {
        label: "London Box Office",
        url: "https://www.londonboxoffice.co.uk/news/post/avenue-q-extends-until-january-2027",
      },
    ],
  },
  {
    // 2026-05 の発表では 2027-01-10 だったが、9月に1週間前倒しになった。
    slug: "my-neighbour-totoro",
    closes: "2027-01-03",
    checkedAt: "2026-11-11",
    sources: [
      {
        label: "WhatsOnStage",
        url: "https://www.whatsonstage.com/news/my-neighbour-totoro-announces-new-closing-date_1731683/",
      },
      {
        label: "Official London Theatre",
        url: "https://officiallondontheatre.com/show/neighbour-totoro-tickets-111433417/",
      },
    ],
  },
  {
    slug: "titanique",
    closes: "2027-01-03",
    checkedAt: "2026-11-11",
    sources: [
      {
        label: "WhatsOnStage",
        url: "https://www.whatsonstage.com/news/titanique-announces-final-performance-date-for-the-west-end_1731901/",
      },
    ],
  },
  {
    slug: "high-school-musical",
    closes: "2027-01-03",
    checkedAt: "2026-11-11",
    sources: [
      {
        label: "Wembley Park",
        url: "https://wembleypark.com/things-to-do/disney-high-school-musical-troubadour-wembley-park-theatre-guide/",
      },
    ],
  },
  {
    slug: "into-the-woods",
    closes: "2027-01-09",
    checkedAt: "2026-11-11",
    sources: [
      {
        label: "Delfont Mackintosh Theatres",
        url: "https://www.delfontmackintosh.co.uk/whats-on/into-the-woods",
      },
    ],
  },
  {
    slug: "jesus-christ-superstar",
    closes: "2027-01-09",
    checkedAt: "2026-11-11",
    sources: [
      {
        label: "London Box Office",
        url: "https://www.londonboxoffice.co.uk/news/post/jesus-christ-superstar-to-extend-at-theatre-royal-drury-lane",
      },
    ],
  },
  {
    // 3/14 は「予約受付がその日まで」で、千秋楽としては発表されていない。
    slug: "one-day-the-musical",
    opens: "2026-11-17",
    checkedAt: "2026-11-11",
    sources: [
      {
        label: "London Theatre",
        url: "https://www.londontheatre.co.uk/theatre-news/news/everything-you-need-to-know-about-one-day-the-musical-in-the-west-end",
      },
    ],
  },
  {
    // 2026年夏の公演は終わっていて isOnShow は false。再演の初日を過ぎたら
    // 人が確かめて true に戻す(ここでは戻さない)。
    // 日付は 2026-09-30 に Barbican の発表で確かめたもの(scripts/add-musicals-2026-09.ts)。
    slug: "death-note-the-musical",
    opens: "2027-03-23",
    closes: "2027-05-15",
    checkedAt: "2026-09-30",
    sources: [
      {
        label: "Barbican",
        url: "https://www.barbican.org.uk/our-story/press-room/death-note-the-musical-announces-new-2027-barbican-season",
      },
    ],
  },
];

const BY_SLUG = new Map(MUSICAL_RUNS.map((run) => [run.slug, run]));

export function musicalRunFor(slug: string): MusicalRun | null {
  return BY_SLUG.get(slug) ?? null;
}

/** today はロンドンの日付("YYYY-MM-DD")。千秋楽の当日はまだ上演中。 */
export function hasClosed(slug: string, today: string): boolean {
  const closes = BY_SLUG.get(slug)?.closes;
  return closes !== undefined && today > closes;
}

/**
 * DB の isOnShow に千秋楽を重ねた「いま上演中か」。
 * DB が false の作品を true にすることはない(上の ★ を参照)。
 */
export function onShowNow(slug: string, isOnShow: boolean, today: string): boolean {
  return isOnShow && !hasClosed(slug, today);
}

/**
 * まだ来ていない初日と千秋楽。一覧のカードと作品ページの知らせが使う。
 * 過ぎた日付は null にして返すので、表示側は日付の比較をしなくてよい。
 */
export function upcomingRunDates(
  slug: string,
  today: string,
): { opens: string | null; closes: string | null } {
  const run = BY_SLUG.get(slug);
  return {
    opens: run?.opens && today < run.opens ? run.opens : null,
    closes: run?.closes && today <= run.closes ? run.closes : null,
  };
}

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

/** "2027-01-03" → "2027年1月3日(日)" */
export function formatRunDate(ymd: string): string {
  const [y, m, d] = ymd.split("-").map(Number);
  const weekday = WEEKDAYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
  return `${y}年${m}月${d}日(${weekday})`;
}

/** "2027-01-03" → "1/3"。一覧のバッジ用。 */
export function formatRunDateShort(ymd: string): string {
  const [, m, d] = ymd.split("-").map(Number);
  return `${m}/${d}`;
}
