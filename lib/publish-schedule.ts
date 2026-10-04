/**
 * 読み物の公開日時と予約公開。要件は docs/reading-scheduled-publishing.md。
 *
 * 公開の状態は Content.publishedAt の1列で表す。
 *
 *   null       下書き。管理ページ(/admin/reading)で承認されるまで出さない
 *   未来の時刻  予約中。その時刻まで出さない
 *   過去の時刻  公開済み
 *
 * createdAt は「書いた日時」のままで、画面に出す日付にも並び順にも使わない。
 *
 * 読者に見せるクエリは必ず publishedWhere() を where に混ぜること。
 * 一覧・詳細・前後の記事・ランキング・連載の全話・スポット側の関連コラム・
 * スタンプ帳のおすすめ・閲覧数の加算・sitemap のどこか1か所でも漏れると、
 * 下書きや予約中の記事がそこから先に出てしまう。
 *
 * 時刻が来たあと実際に画面へ出るのは、各ページの ISR(1時間)が切れたとき。
 * Vercel Hobby では cron を時刻に合わせて回せないので、最大1時間の遅れは
 * 許容している。
 */

/** 読み物のカテゴリ。どれも publishedAt で公開を判定する。 */
export const READING_CATEGORIES = [
  "column",
  "british-english",
  "modern-britain",
  "area",
] as const;

export type ReadingCategory = (typeof READING_CATEGORIES)[number];

/**
 * 管理ページで承認してから出すカテゴリと、その公開ルール。
 *
 * 時刻はロンドン時間。在住者の生活は現地の時計で動いていて、日本側は
 * 夏冬で1時間ずれても夕方〜夜に収まる。日英の両方が起きていて読めるのは
 * 「ロンドンの朝〜昼 = 日本の夕方〜夜」だけなので、3つともそこに置いた。
 *
 *   daily      承認するとそのセクションの次に空いている日に入る
 *   irregular  承認するときに日付を選ぶ
 *
 * 「ロンドンの街」(area)は伏せている間は対象にしない。作成スクリプトが
 * 即時に publishedAt を入れる。
 */
export const SCHEDULE_RULES = {
  "british-english": { label: "イギリス英語", hour: 7, minute: 0, cadence: "irregular" },
  "modern-britain": { label: "いまのイギリス", hour: 10, minute: 0, cadence: "irregular" },
  column: { label: "コラム", hour: 12, minute: 30, cadence: "daily" },
} as const;

export type ScheduledCategory = keyof typeof SCHEDULE_RULES;

export const SCHEDULED_CATEGORIES = Object.keys(
  SCHEDULE_RULES,
) as ScheduledCategory[];

export function isScheduledCategory(value: string): value is ScheduledCategory {
  return value in SCHEDULE_RULES;
}

const LONDON = "Europe/London";
const DAY_MS = 24 * 60 * 60 * 1000;

/** 公開済みの行だけに絞る条件。呼ぶたびに現在時刻で作る。null は比較で落ちる。 */
export function publishedWhere() {
  return { publishedAt: { lte: new Date() } };
}

/**
 * 画面に出す記事の日付。
 *
 * 読者向けのクエリは publishedWhere() で絞っているので publishedAt は必ずある。
 * null になるのは管理者が下書きをプレビューしているときだけで、そのときは
 * 書いた日時を仮に出す(ページ上部の帯で下書きだと分かる)。
 */
export function publishedDateOf(content: {
  publishedAt: Date | null;
  createdAt: Date;
}): Date {
  return content.publishedAt ?? content.createdAt;
}

/** その瞬間のロンドンの UTC からのずれ(ミリ秒。冬は0、夏は+1時間)。 */
function londonOffsetMs(at: Date): number {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: LONDON,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(at);
  const get = (type: string) =>
    Number(parts.find((p) => p.type === type)?.value);
  const asUtc = Date.UTC(
    get("year"),
    get("month") - 1,
    get("day"),
    get("hour"),
    get("minute"),
    get("second"),
  );
  return asUtc - Math.floor(at.getTime() / 1000) * 1000;
}

/** ロンドンでの日付 "2026-10-10"。 */
export function londonDate(at: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: LONDON,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(at);
}

/** "2026-10-10" の翌日。 */
function addDays(ymd: string, days: number): string {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d) + days * DAY_MS)
    .toISOString()
    .slice(0, 10);
}

/**
 * ロンドンの日付 "2026-10-10" の、そのセクションの公開時刻。形式が違えば null。
 *
 * 夏時間・冬時間はここで吸収する。公開時刻はどれも切り替わりの時間帯
 * (深夜1〜2時)から外れているので、その日のずれは一意に決まる。
 */
export function slotFor(category: ScheduledCategory, ymd: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd);
  if (!m) return null;
  const { hour, minute } = SCHEDULE_RULES[category];
  const asUtc = Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]), hour, minute);
  if (Number.isNaN(asUtc)) return null;
  const slot = new Date(asUtc - londonOffsetMs(new Date(asUtc)));
  // 2026-02-30 のような日付は Date.UTC が繰り上げるので、戻して照合する。
  return londonDate(slot) === ymd ? slot : null;
}

/**
 * まだ時刻が来ていない、いちばん近い公開枠の日付(ロンドン)。
 * 今日の枠が過ぎていれば明日。不定期のセクションで日付欄の初期値にする。
 */
export function nearestSlotDate(category: ScheduledCategory, now = new Date()): string {
  const today = londonDate(now);
  const slot = slotFor(category, today);
  return slot && slot.getTime() > now.getTime() ? today : addDays(today, 1);
}

/**
 * 毎日のセクションの、次に空いている公開枠。
 *
 * 予約・公開済みを問わず、そのセクションで最後に入っている記事の翌日以降で、
 * まだ時刻が来ていない最初の枠。
 */
export function nextDailySlot(
  category: ScheduledCategory,
  latest: Date | null,
  now = new Date(),
): Date {
  let day = nearestSlotDate(category, now);
  if (latest) {
    const afterLatest = addDays(londonDate(latest), 1);
    if (afterLatest > day) day = afterLatest;
  }
  return slotFor(category, day)!;
}

/** "10/10(土) 12:30" のような表記。 */
function formatIn(at: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("ja-JP", {
    timeZone,
    month: "numeric",
    day: "numeric",
    weekday: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(at);
}

export function formatLondon(at: Date): string {
  return formatIn(at, LONDON);
}

export function formatJst(at: Date): string {
  return formatIn(at, "Asia/Tokyo");
}
