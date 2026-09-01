/**
 * 旅行プランに実際の日付を割り当てるための処理。
 *
 * 「1日目」だけでは分からないことが2つある。衛兵交代式のように
 * 実施日が曜日で決まるもの、そして月曜休館の施設。出発日を1つ
 * もらえば、あとは日数を足すだけでどちらも判定できる。
 *
 * 曜日は 0=月 〜 6=日 で持つ。JavaScript の Date.getDay() は
 * 0=日 なので、境目をここ1箇所に閉じ込めて外へ出さない。
 */

export const WEEKDAY_LABELS = ["月", "火", "水", "木", "金", "土", "日"] as const;

/** 曜日の並び順そのものを文字列にしたもの。indexOf で番号に直すのに使う。 */
const DAY_CHARS = "月火水木金土日";

/* ------------------------------------------------------------------ *
 * 日付
 * ------------------------------------------------------------------ */

/**
 * 出発日は "YYYY-MM-DD" で持つ。Date をそのまま保存しないのは、
 * localStorage を経由すると UTC の文字列になり、時差で1日ずれるため。
 */
export type IsoDate = string;

const ISO_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/**
 * 文字列を現地時間の午前0時として読む。
 *
 * new Date("2026-10-03") は UTC の午前0時と解釈されるので、日本や
 * 英国の時間帯で読み戻すと前日になることがある。年月日を分解して
 * ローカルのコンストラクタに渡し、その解釈をさせない。
 */
export function parseIsoDate(value: string | null | undefined): Date | null {
  if (!value || !ISO_PATTERN.test(value)) return null;
  const [y, m, d] = value.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  // 「2026-02-31」のような実在しない日付は、Date が3月に繰り上げる。
  // 入れた値と出てきた値が違うなら、それは日付ではなかったということ。
  if (
    date.getFullYear() !== y ||
    date.getMonth() !== m - 1 ||
    date.getDate() !== d
  ) {
    return null;
  }
  return date;
}

export function toIsoDate(date: Date): IsoDate {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** 出発日から数えて day 日目(1始まり)の日付。 */
export function dateForDay(startDate: string | null, day: number): Date | null {
  const start = parseIsoDate(startDate);
  if (!start) return null;
  const date = new Date(start);
  date.setDate(date.getDate() + day - 1);
  return date;
}

/** 0=月 〜 6=日。Date.getDay() は 0=日 なのでここで詰め替える。 */
export function weekdayIndex(date: Date): number {
  return (date.getDay() + 6) % 7;
}

/** 「10月3日(金)」。年は出さない——旅程の中で年が変わることはまず無い。 */
export function formatPlanDate(date: Date): string {
  return `${date.getMonth() + 1}月${date.getDate()}日(${WEEKDAY_LABELS[weekdayIndex(date)]})`;
}

/* ------------------------------------------------------------------ *
 * 開館曜日
 * ------------------------------------------------------------------ */

/**
 * openingHours の文言から休館曜日を読み取る。
 *
 * openingHours は表示用の自由文字列で、曜日に触れているのは144件中12件しかない。
 * 曜日の列を別に持てば確実だが、原文と二重管理になってずれる。原文が
 * はっきり書いているぶんだけを拾い、書いていないものは「分からない」を
 * 返す方針にした。推測で「月曜休館です」と出すと、開いている日に
 * 読者を来させないことになる。読み取れない側に倒すのが常に安全。
 *
 * 拾うのは次の3通りだけ:
 *   「月休」「月火休」          — 休みの曜日が名指ししてある
 *   「火〜日 10:00〜18:00」    — 開館曜日の範囲。裏返して休館日を出す
 *   「日曜のみ」               — その曜日だけ開く
 *
 * 誤読しやすいものは先に落とす。日本語には曜日でない「日」「月」が多い:
 *
 *   「平日 10:00 / 土日 11:00」 スカイガーデンは毎日開いている。「平日」の
 *                              日を日曜と読むと「月〜金休館」になる
 *   「12月25日休」             クリスマス休館であって日曜休館ではない
 *   「3か月先を発売」          発売の話で、開館日ではない
 *   「土 9:30 ほか平日の一部」  実際の開館日は原文からは決まらない
 *
 * @returns 休館曜日の番号(0=月)。読み取れなければ null。
 */
export function parseClosedDays(openingHours: string | null): number[] | null {
  if (!openingHours) return null;

  // 曜日でない「日」「月」を含む語を先に伏せる。曜日文字を含まない
  // 記号に置き換えるので、後段の走査には引っかからなくなる。
  const text = openingHours
    .replace(/(?:第\s*\d+|毎週|隔週)\s*[月火水木金土日]曜?/g, "・")
    // 「平日」「週末」は曜日そのもの。消すと開館日の情報まで落ちる
    // (スカイガーデンが「月〜金休館」になった)ので、範囲に翻訳して残す。
    .replace(/平日/g, "月〜金")
    .replace(/週末/g, "土〜日")
    .replace(
      /休日|祝日|祭日|半日|終日|毎日|連日|翌日|当日|本日|前日|全日|初日|最終日|開催日|公開日|実施日|定休日|営業日|開館日|閉館日|数日|後日|同日|日程|日本/g,
      "・",
    )
    // 「12月」「25日」「3か月」。数字やカ・か・ヶ に続くものは曜日ではない。
    .replace(/[0-9０-９]\s*(?:か|カ|ヶ|ケ|箇)?\s*[月日]/g, "・");

  // ここまで伏せても曜日の読みが定まらない書き方。黙るほうを選ぶ。
  if (/ほか|他|一部|など|等|ほぼ|不定|変動|前後/.test(text)) return null;

  const closed = new Set<number>();
  const open = new Set<number>();
  let openKnown = false;

  const addAll = (run: string, into: Set<number>) => {
    for (const ch of run) into.add(DAY_CHARS.indexOf(ch));
  };

  // 「月休」「月火休」「月曜休館」。
  for (const m of text.matchAll(/([月火水木金土日]+)\s*曜?\s*休/g)) {
    addAll(m[1], closed);
  }

  const only = text.match(/([月火水木金土日])曜?のみ/);
  if (only) {
    openKnown = true;
    open.add(DAY_CHARS.indexOf(only[1]));
  } else {
    // 「火〜日」。「木〜月」のように週をまたぐ範囲があるので巡回で埋める。
    for (const m of text.matchAll(
      /([月火水木金土日])曜?\s*[〜～ー-]\s*([月火水木金土日])曜?/g,
    )) {
      openKnown = true;
      const from = DAY_CHARS.indexOf(m[1]);
      const to = DAY_CHARS.indexOf(m[2]);
      for (let i = 0; i < 7; i++) {
        const d = (from + i) % 7;
        open.add(d);
        if (d === to) break;
      }
    }
    // 「/ 土日 11:00〜21:00」のように、範囲の外に単独で足された曜日。
    // 曜日の連なりは丸ごと拾う。ここで前方に .? を置くと、その .? が
    // 先頭の曜日を食って「土日」が「日」になる。
    for (const m of text.matchAll(
      /([月火水木金土日]+)\s*曜?\s*\d{1,2}\s*[:：]/g,
    )) {
      openKnown = true;
      addAll(m[1], open);
    }
  }

  if (openKnown) {
    for (let d = 0; d < 7; d++) if (!open.has(d)) closed.add(d);
  }

  // 全曜日が休みという読み取りは、解釈を誤ったとき以外に起きない。
  if (closed.size === 0 || closed.size >= 7) return null;
  return [...closed].sort((a, b) => a - b);
}

/** 休館曜日の一覧を「月・火」の形にする。 */
export function formatClosedDays(days: number[]): string {
  return days.map((d) => WEEKDAY_LABELS[d]).join("・");
}
