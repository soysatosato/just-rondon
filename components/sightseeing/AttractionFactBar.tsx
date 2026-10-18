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
  closedDaysCheckedAt,
  closedNote,
  website,
  isEvent = false,
}: {
  priceAdult: string | null;
  priceChild: string | null;
  durationText: string | null;
  nearestStation: string | null;
  openingHours: string | null;
  /**
   * 休みの曜日。0=月 〜 6=日。
   *
   * 空配列は「調べたうえで曜日休館は無い」と「まだ調べていない」の両方で
   * ありうる。closedDaysCheckedAt があるときだけ「曜日の休館なし」と書き、
   * 無いときは何も出さない。調べていない施設まで毎日開いていることに
   * してしまわないため。
   */
  closedWeekdays?: number[] | null;
  /**
   * 休館曜日を最後に確かめた日。null は未調査。
   *
   * これがあるときだけ、空の closedWeekdays を「曜日の休館なし」と書ける。
   * 確かめた月を「◯年◯月時点」として値の下に出す。
   */
  closedDaysCheckedAt?: Date | null;
  /** 曜日では表せない休み。休館日の下に小さく添える。 */
  closedNote?: string | null;
  /** 公式サイト。下の注意書きから直接飛ばすために受け取る。 */
  website?: string | null;
  /**
   * 会期のある催し(季節限定のスポット、チェルシー・フラワー・ショー)。
   * 時間の欄を「開催日時」と呼び、注意書きを会期向けにする。
   */
  isEvent?: boolean;
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
  const checkedLabel = closedDaysCheckedAt
    ? `${closedDaysCheckedAt.getFullYear()}年${closedDaysCheckedAt.getMonth() + 1}月時点`
    : null;
  const closedValue =
    closedWeekdays && closedWeekdays.length > 0
      ? closedWeekdays.map((d) => WEEKDAY_LABELS[d]).join("・")
      : // 空でも、確かめた記録があれば「休館なし」と言い切れる。
        // 記録が無い空は未調査かもしれないので、何も書かない。
        checkedLabel
        ? "曜日の休館なし"
        : null;
  const closedRowNote =
    [closedNote, checkedLabel].filter(Boolean).join("　") || null;

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
      ? [{ icon: CalendarOff, label: "休館日", value: closedValue, note: closedRowNote }]
      : closedNote
        ? [{ icon: CalendarOff, label: "休館日", value: closedNote }]
        : []),
    ...(openingHours
      ? [
          {
            icon: CalendarClock,
            label: isEvent ? "開催日時" : "開館時間",
            value: openingHours,
          },
        ]
      : []),
  ];

  if (facts.length === 0) return null;

  return (
    <section
      aria-label="訪問前に知っておきたいこと"
      className="rounded-2xl border border-border bg-muted/40 p-4 sm:p-5"
    >
      {/*
        dl の各組は div > dt + dd に限る(div の中にさらに div を挟むと、
        読み上げで項目名と値の対応が取れなくなる)。アイコンは dt の中に
        入れ、左の余白へ絶対配置して見た目を保っている。
      */}
      <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
        {facts.map((f) => (
          <div key={f.label} className="relative min-w-0 pl-8">
            <dt className="text-xs font-medium text-muted-foreground">
              <f.icon
                className="absolute left-0 top-0.5 h-5 w-5 text-muted-foreground"
                aria-hidden
              />
              {f.label}
            </dt>
            <dd className="text-sm font-semibold leading-snug">
              {f.value}
              {f.note && (
                <span className="mt-1 block text-xs font-normal leading-relaxed text-muted-foreground">
                  {f.note}
                </span>
              )}
            </dd>
          </div>
        ))}
      </dl>

      {/* 料金と開館時間は改定される。ここの値がいつでも正しいと約束はできない
          ので、必ず公式サイトを見に行ける状態にしておく。 */}
      <p className="mt-4 border-t border-border/60 pt-3 text-xs text-muted-foreground">
        {isEvent
          ? "会期・料金は回ごとに変わります。出かける前に"
          : "料金・開館時間は変更されることがあります。訪問前に"}
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
