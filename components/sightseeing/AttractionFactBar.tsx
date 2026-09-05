import { Clock, Ticket, Train, CalendarClock, CalendarOff } from "lucide-react";

/**
 * 訪問前に知りたい実用情報を1か所にまとめて出す。
 *
 * もともとこれらは sections の本文に散らばっていて、しかも見出しの表記が
 * ページごとに違った(「料金・チケット情報」「チケット情報」「チケット料金」
 * 「料金」がすべて同義)。読者は毎ページ違う位置から同じ事実を探していた。
 *
 * 値は null を取りうる。埋まっている項目だけを描き、全部空ならこの
 * コンポーネント自体が何も返さない。「情報なし」の行を並べても読者の
 * 役に立たないし、抽出できなかったという裏側の事情を見せる意味もない。
 */

type Fact = {
  icon: typeof Clock;
  label: string;
  value: string;
  /** 値だけでは足りないときの但し書き。小さく下に出す。 */
  note?: string | null;
};

/** 0=月 〜 6=日。lib/plan/dates.ts の WEEKDAY_LABELS と同じ並び。 */
const WEEKDAY_LABELS = ["月", "火", "水", "木", "金", "土", "日"];

export default function AttractionFactBar({
  priceAdult,
  priceChild,
  durationText,
  nearestStation,
  openingHours,
  closedWeekdays,
  closedNote,
  website,
}: {
  priceAdult: string | null;
  priceChild: string | null;
  durationText: string | null;
  nearestStation: string | null;
  openingHours: string | null;
  /**
   * 休みの曜日。0=月 〜 6=日。
   *
   * 空配列のときは何も出さない。空は「調べたうえで曜日休館は無い」と
   * 「まだ調べていない」の両方でありうるので(区別は closedDaysCheckedAt)、
   * ここで「無休」と書くと、調べていない施設まで毎日開いていることに
   * なってしまう。出すのは休みが分かっている行だけにする。
   */
  closedWeekdays?: number[] | null;
  /** 曜日では表せない休み。休館日の下に小さく添える。 */
  closedNote?: string | null;
  /** 公式サイト。下の注意書きから直接飛ばすために受け取る。 */
  website?: string | null;
}) {
  // 大人と子どもが同額(どちらも「無料」など)なら1行にまとめる。
  // 同じ値を2行並べても情報が増えない。
  const priceValue =
    priceAdult && priceChild && priceAdult !== priceChild
      ? `大人 ${priceAdult} ／ 子ども ${priceChild}`
      : (priceAdult ?? priceChild);

  /*
   * 休館日は開館時間より先に出す。閉まっている日に行けば開館時間は
   * 意味を持たないうえ、これは現地では取り返せない——旅程を組み直せる
   * のは出発前だけなので、読者が読み飛ばしにくい位置に置く。
   */
  const closedValue =
    closedWeekdays && closedWeekdays.length > 0
      ? closedWeekdays.map((d) => WEEKDAY_LABELS[d]).join("・")
      : null;

  const facts: Fact[] = [
    ...(priceValue
      ? [{ icon: Ticket, label: "料金", value: priceValue }]
      : []),
    ...(durationText
      ? [{ icon: Clock, label: "所要時間", value: durationText }]
      : []),
    ...(nearestStation
      ? [{ icon: Train, label: "最寄駅", value: nearestStation }]
      : []),
    ...(closedValue
      ? [{ icon: CalendarOff, label: "休館日", value: closedValue, note: closedNote }]
      : []),
    ...(openingHours
      ? [{ icon: CalendarClock, label: "開館時間", value: openingHours }]
      : []),
  ];

  if (facts.length === 0) return null;

  return (
    <section
      aria-label="訪問前に知っておきたいこと"
      className="rounded-2xl border border-border bg-muted/40 p-4 sm:p-5"
    >
      <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
        {facts.map((f) => (
          <div key={f.label} className="flex items-start gap-3">
            <f.icon
              className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground"
              aria-hidden
            />
            <div className="min-w-0">
              <dt className="text-xs font-medium text-muted-foreground">
                {f.label}
              </dt>
              <dd className="text-sm font-semibold leading-snug">{f.value}</dd>
              {f.note && (
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {f.note}
                </p>
              )}
            </div>
          </div>
        ))}
      </dl>

      {/* 料金と開館時間は改定される。ここの値がいつでも正しいと約束はできない
          ので、必ず公式サイトを見に行ける状態にしておく。 */}
      <p className="mt-4 border-t border-border/60 pt-3 text-xs text-muted-foreground">
        料金・開館時間は変更されることがあります。訪問前に
        {website ? (
          <>
            {" "}
            <a
              href={website}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-blue-600 underline underline-offset-2 hover:opacity-80 dark:text-blue-400"
            >
              公式サイト
            </a>{" "}
          </>
        ) : (
          "公式サイト"
        )}
        で最新情報をご確認ください。
      </p>
    </section>
  );
}
