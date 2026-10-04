/**
 * 月別ページの「祝日と、店・交通に影響する日」。
 *
 * バンク・ホリデー(法定の祝日)は gov.uk の公開データから取る。
 * 振替休日や、戴冠式のような臨時の祝日まで政府が決めた日付で
 * 載っていて、手で書くと臨時の祝日を取りこぼす。データは2年先まで
 * 出ている(2026年10月時点で2028年まで)。
 *
 * 祝日ではないが旅程に響く日(イースターの日曜・クリスマスイブ・
 * 大晦日・リメンブランス・サンデー)は、毎年同じ規則で決まるので
 * ここで計算する。祭りや花火のように「楽しみに行く日」は Event テーブルの
 * 側に任せ、ここには載せない。ここは店が閉まる・交通が止まる・道路が
 * 規制される、という「知らないと困る日」だけを扱う。
 */

const ENDPOINT = "https://www.gov.uk/bank-holidays.json";

/** 祝日は年に数回しか変わらない。1日に1回取り直せば足りる。 */
const REVALIDATE_SECONDS = 60 * 60 * 24;

export const BANK_HOLIDAY_SOURCE = {
  label: "GOV.UK – UK bank holidays(イングランドとウェールズ)",
  url: "https://www.gov.uk/bank-holidays",
} as const;

type GovUkResponse = Record<
  string,
  { division: string; events: { title: string; date: string; notes: string }[] }
>;

export type MonthDay = {
  /** "2026-12-25"。 */
  date: string;
  title: string;
  /** gov.uk の英語名。祝日でない日にも英語での呼び名を添える。 */
  englishTitle: string;
  /** bank = 法定の祝日 / other = 祝日ではないが影響がある日 */
  kind: "bank" | "other";
  /** 振替休日など、gov.uk の注記。 */
  substitute?: boolean;
  /** 店・交通・施設への影響。 */
  note: string;
};

const GENERIC_BANK_HOLIDAY_NOTE =
  "銀行と役所は休み。店は日曜並みの短縮営業が多く、地下鉄・バスは本数が減ります。主な美術館・博物館や観光地は開くところが多く、地元の人出で混みます。連休は鉄道の工事が入りやすく、空港や郊外への列車が運休・バス代行になることがあります。";

/**
 * gov.uk の英語名 → 日本語名と影響。
 * キーの綴りは gov.uk のまま(New Year’s Day の ’ は曲がった引用符)。
 * ここに無い名前(臨時の祝日)は英語名のまま、汎用の説明で出す。
 */
const BANK_HOLIDAYS: Record<string, { title: string; note: string }> = {
  "New Year’s Day": {
    title: "元日",
    note: "店・飲食店は休みか短縮営業が多く、美術館・博物館にも休館する館があります。地下鉄・バスは本数を減らして運行します。",
  },
  "Good Friday": {
    title: "グッド・フライデー(聖金曜日)",
    note: `イースターの4連休の初日。${GENERIC_BANK_HOLIDAY_NOTE}`,
  },
  "Easter Monday": {
    title: "イースター・マンデー",
    note: `イースターの4連休の最終日。${GENERIC_BANK_HOLIDAY_NOTE}`,
  },
  "Early May bank holiday": {
    title: "5月初めのバンク・ホリデー",
    note: GENERIC_BANK_HOLIDAY_NOTE,
  },
  "Spring bank holiday": {
    title: "春のバンク・ホリデー",
    note: GENERIC_BANK_HOLIDAY_NOTE,
  },
  "Summer bank holiday": {
    title: "夏のバンク・ホリデー",
    note: GENERIC_BANK_HOLIDAY_NOTE,
  },
  "Christmas Day": {
    title: "クリスマス",
    note: "ロンドンが止まる日です。地下鉄・バス・鉄道はほぼ全面運休、大型店は法律で休業、美術館・博物館もほぼすべて休館します。移動は徒歩かタクシーだけになると考えてください。",
  },
  "Boxing Day": {
    title: "ボクシング・デー",
    note: "冬のセールの初日で、オックスフォード・ストリートなどの繁華街は混みます。一方で地下鉄・バスは大幅な減便、鉄道は運休する路線が多く、美術館・博物館も休館する館があります。",
  },
};

/** gov.uk の祝日。取れなければ null(ページ側は計算できる日だけで出す)。 */
async function fetchBankHolidays(): Promise<
  { title: string; date: string; notes: string }[] | null
> {
  try {
    const res = await fetch(ENDPOINT, {
      headers: { Accept: "application/json" },
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as GovUkResponse;
    return data["england-and-wales"]?.events ?? null;
  } catch {
    return null;
  }
}

function ymd(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/** 西暦のイースター(復活祭)の日曜日。グレゴリオ暦の匿名アルゴリズム。 */
function easterSunday(year: number): { month: number; day: number } {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return { month, day };
}

/** その月の第 n 日曜日。 */
function nthSunday(year: number, month: number, n: number): number {
  const firstDow = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
  const firstSunday = firstDow === 0 ? 1 : 8 - firstDow;
  return firstSunday + (n - 1) * 7;
}

/** 祝日ではないが、店・交通・道路に影響が出る日。 */
function otherDays(year: number, month: number): MonthDay[] {
  const days: MonthDay[] = [];

  const easter = easterSunday(year);
  if (easter.month === month) {
    days.push({
      date: ymd(year, month, easter.day),
      title: "イースター・サンデー",
      englishTitle: "Easter Sunday",
      kind: "other",
      note: "祝日ではありませんが、大型店は法律で休業します(小さな店や飲食店は開きます)。",
    });
  }

  if (month === 11) {
    days.push({
      date: ymd(year, 11, nthSunday(year, 11, 2)),
      title: "リメンブランス・サンデー",
      englishTitle: "Remembrance Sunday",
      kind: "other",
      note: "戦没者を追悼する日。ホワイトホールの戦没者記念碑(セノタフ)で11時から国の式典があり、周辺は朝から通行が規制されます。",
    });
  }

  if (month === 12) {
    days.push(
      {
        date: ymd(year, 12, 24),
        title: "クリスマス・イブ",
        englishTitle: "Christmas Eve",
        kind: "other",
        note: "祝日ではありませんが、店は早じまいし、美術館・博物館も休館する館が多くあります。地下鉄・バスは夜の終わりが早まります。",
      },
      {
        date: ymd(year, 12, 31),
        title: "大晦日",
        englishTitle: "New Year’s Eve",
        kind: "other",
        note: "テムズ川の年越し花火は有料のチケット制で、夕方から川沿いの道路と一部の駅が規制されます。チケットが無いと、川沿いに近づくこと自体が難しくなります。",
      }
    );
  }

  return days;
}

/**
 * その年月の祝日と影響のある日を日付順で。
 * gov.uk が取れなかったときは bankHolidaysAvailable が false になる。
 */
export async function getMonthDays(
  year: number,
  month: number
): Promise<{ days: MonthDay[]; bankHolidaysAvailable: boolean }> {
  const prefix = ymd(year, month, 1).slice(0, 7);
  const events = await fetchBankHolidays();

  const bank: MonthDay[] = (events ?? [])
    .filter((e) => e.date.startsWith(prefix))
    .map((e) => {
      const known = BANK_HOLIDAYS[e.title];
      return {
        date: e.date,
        title: known?.title ?? e.title,
        englishTitle: e.title,
        kind: "bank" as const,
        substitute: /substitute/i.test(e.notes),
        note: known?.note ?? GENERIC_BANK_HOLIDAY_NOTE,
      };
    });

  const days = [...bank, ...otherDays(year, month)].sort((a, b) =>
    a.date.localeCompare(b.date)
  );
  return { days, bankHolidaysAvailable: events !== null };
}
