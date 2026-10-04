/**
 * サービスチャージ未払いの申立て期限の目安。相談フォーム
 * (/jobs/service-charges/consult)で、入力した日付からその場で出す。
 *
 * 返信を待っている間に期限が過ぎるのがいちばん取り返しがつかないので、
 * 相談を受け付ける前に読者自身が日付を知っている状態にしておく。
 *
 * 期限は請求の根拠によって2つある(サービスチャージ・ガイドの本文と同じ):
 *  - 未払い賃金(unlawful deduction)として請求する: 3か月−1日
 *  - Tipping Act にもとづく不公正な分配: 12か月
 * どちらで申し立てるかは事案次第で、読者が自分で決めるのは難しい。
 * 短いほうに間に合わせておけば両方とも守れるので、そちらを主に出す。
 *
 * 日付は "YYYY-MM-DD" の文字列のまま扱う。Date に時刻を持たせると、
 * ブラウザのタイムゾーン次第で1日ずれる。
 */

export type AcasStatus = "not_yet" | "started" | "certificate";

export const ACAS_EARLY_CONCILIATION_URL =
  "https://www.acas.org.uk/early-conciliation";

/** 返信の目安(1週間)より余裕が無ければ、返信を待たずに動いてもらう。 */
const URGENT_DAYS = 14;

const DAY_MS = 24 * 60 * 60 * 1000;

function parseDate(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [y, m, d] = value.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  // 2026-02-31 のような存在しない日は、Date.UTC が翌月に繰り越すので弾く。
  if (date.getUTCMonth() !== m - 1) return null;
  return date;
}

function toIso(date: Date) {
  return date.toISOString().slice(0, 10);
}

/**
 * start を含む months か月間の末日。nか月後の同じ日の前日になる。
 * 同じ日が無い月(11月30日の3か月後など)は、その月の末日。
 */
function periodEnd(start: Date, months: number) {
  const y = start.getUTCFullYear();
  const m = start.getUTCMonth() + months;
  const d = start.getUTCDate();
  const lastDay = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
  return d > lastDay
    ? new Date(Date.UTC(y, m, lastDay))
    : new Date(Date.UTC(y, m, d - 1));
}

/** ロンドンの今日。サーバーもブラウザも、ロンドンの日付で数える。 */
export function londonToday() {
  // en-CA は YYYY-MM-DD で出る。
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/London",
  }).format(new Date());
}

/** "2027-01-09" → "2027年1月9日" */
export function formatJaDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return `${y}年${m}月${d}日`;
}

/**
 * 入力欄の値として受け付けられる日付か。未来の日付は給与日として
 * ありえないので弾く(タイプミスで期限が実際より遅く出るのを防ぐ)。
 */
export function isValidLastPaidOn(value: string, today = londonToday()) {
  return parseDate(value) !== null && value <= today;
}

export type DeadlineAdvice = {
  tone: "ok" | "urgent" | "past";
  headline: string;
  body: string;
};

/** 日付が入っていないときの案内。確認メールと受付完了画面で使う。 */
export const GENERIC_DEADLINE_ADVICE: DeadlineAdvice = {
  tone: "ok",
  headline: "期限は、最後に給与を受け取った日から数えます",
  body: "未払い賃金として請求する場合、Acasへの連絡は最後の給与日から3か月−1日以内です（Tipping Actにもとづく請求なら12か月以内）。どちらになるかは事案によるので、早いほうに間に合わせてください。",
};

/**
 * 期限についての案内文。フォームの表示・確認メール・受付完了画面で同じ文面を使う。
 * 日付が無い・読めないときは null(案内を出さない)。
 */
export function deadlineAdvice(
  lastPaidOn: string | null | undefined,
  acas: AcasStatus | null | undefined,
  today = londonToday(),
): DeadlineAdvice | null {
  // Acas の手続き中は期限の進行が止まり、certificate 発行後に残りが動く。
  // 起算点からの単純計算では出せないので、確かめる先だけ伝える。
  if (acas === "started" || acas === "certificate") {
    return {
      tone: "ok",
      headline: "期限はcertificateの日付で確認してください",
      body: "Acasの手続き中は期限の進行が止まり、certificateが発行されたあとに残りの期間が動き出します（受け取ってから最低でも1か月はあります）。certificateに書かれた日付から、ET1の提出期限を確かめてください。",
    };
  }

  if (!lastPaidOn) return null;
  const start = parseDate(lastPaidOn);
  const now = parseDate(today);
  if (!start || !now || lastPaidOn > today) return null;

  const short = toIso(periodEnd(start, 3));
  const long = toIso(periodEnd(start, 12));
  const daysLeft = Math.round(
    (parseDate(short)!.getTime() - now.getTime()) / DAY_MS,
  );

  if (daysLeft < 0) {
    if (long >= today) {
      return {
        tone: "past",
        headline: `3か月−1日の期限（${formatJaDate(short)}）は過ぎています`,
        body: `Tipping Actにもとづく請求であれば、${formatJaDate(long)}まで間に合う可能性があります。返信を待たずに、すぐAcasに連絡してください。`,
      };
    }
    return {
      tone: "past",
      headline: "どちらの期限も過ぎている可能性があります",
      body: `3か月−1日の期限は${formatJaDate(short)}、Tipping Actにもとづく12か月の期限は${formatJaDate(long)}でした。例外が認められることもあるので、まずAcasに相談してください。`,
    };
  }

  const remaining = daysLeft === 0 ? "今日まで" : `あと${daysLeft}日`;
  const note = `未払い賃金として請求する場合の期限です。Tipping Actにもとづく請求なら${formatJaDate(long)}までですが、どちらになるかは事案によるので、早いほうに間に合わせてください。`;

  if (daysLeft <= URGENT_DAYS) {
    return {
      tone: "urgent",
      headline: `Acasへの連絡は${formatJaDate(short)}までに（${remaining}）`,
      body: `返信を待たずに、いますぐAcasに連絡してください。${note}`,
    };
  }

  return {
    tone: "ok",
    headline: `Acasへの連絡は${formatJaDate(short)}までに（${remaining}）`,
    body: note,
  };
}
