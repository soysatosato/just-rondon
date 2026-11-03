import { Fragment } from "react";
import Link from "next/link";
import {
  CalendarCheck,
  CalendarClock,
  CalendarOff,
  ClipboardCheck,
  Clock,
  Ticket,
  Train,
} from "lucide-react";
import { openDayLinksFor } from "@/lib/sightseeing/open-days";
import type { SpotKindProfile } from "@/lib/sightseeing/spot-kind";
import type { SpotTickets } from "@/lib/sightseeing/practical";

/**
 * スポットのページの冒頭に置く「早わかり」。料金・時間・休み・所要時間・
 * 最寄駅・チケットの取り方を、種類に合った欄名で1か所に出す。
 *
 * 旧 AttractionFactBar(美術館のページでは今も使う)との違い:
 * - 欄名を種類から引く(マーケットは「営業時間」「定休日」、公園は「開園時間」)。
 *   検索されている語と欄名が一致していないと、答えがページにあっても
 *   読者はそこを探せない。
 * - 並び順を種類で変える。店とマーケットは「いつ開いているか」が先、
 *   券を買って入る場所は「いくらで、何時間か」が先。
 * - 休みが週4日以上ある所は、開く曜日のほうを出す(「開館日: 日曜」)。
 * - チケットの取り方(lib/sightseeing/practical で公式を確かめたもの)を足す。
 * - スマホで2列にする。短い値(料金・所要時間)は半幅、長い値は全幅。
 *   1列に5段積むと、それだけで画面の4割を使っていた。
 *
 * 値は null を取りうる。埋まっている欄だけを出し、全部空なら何も返さない。
 */

/** 0=月 〜 6=日。lib/plan/dates.ts の WEEKDAY_LABELS と同じ並び。 */
const WEEKDAY_LABELS = ["月", "火", "水", "木", "金", "土", "日"];

/** これ以上の曜日を休む所は、開く曜日のほうを出す。open-days.ts と同じ境目。 */
const MOSTLY_CLOSED_DAYS = 4;

/** これより長い値は全幅にする。2列だと3行以上に折れて読みにくい。 */
const WIDE_VALUE_LENGTH = 15;

type FactKey = "price" | "duration" | "hours" | "days" | "tickets" | "station";

type Fact = {
  key: FactKey;
  icon: typeof Clock;
  label: string;
  value: string;
  note?: string | null;
  links?: { href: string; label: string }[];
  /** チケットの欄だけ、取り方の型で色を変える。 */
  tone?: "warn" | "ok" | "muted";
};

/** 種類ごとの欄の並び。読者がその種類の場所で最初に確かめることから。 */
const ORDER: Record<SpotKindProfile["kind"], FactKey[]> = {
  attraction: ["price", "duration", "hours", "days", "tickets", "station"],
  experience: ["price", "duration", "tickets", "hours", "days", "station"],
  tour: ["price", "duration", "tickets", "hours", "days", "station"],
  event: ["hours", "price", "tickets", "station", "duration", "days"],
  ceremony: ["hours", "days", "price", "duration", "station", "tickets"],
  market: ["hours", "days", "station", "duration", "price", "tickets"],
  store: ["hours", "days", "station", "duration", "price", "tickets"],
  park: ["hours", "days", "price", "station", "duration", "tickets"],
  landmark: ["station", "hours", "duration", "price", "days", "tickets"],
};

function isFreeText(value: string | null): boolean {
  return !!value && /^無料/.test(value.trim());
}

export default function SpotKeyFacts({
  profile,
  priceAdult,
  priceChild,
  durationText,
  nearestStation,
  openingHours,
  closedWeekdays,
  closedDaysCheckedAt,
  closedNote,
  tickets,
  website,
  accessAnchor,
  ticketsAnchor,
}: {
  profile: SpotKindProfile;
  priceAdult: string | null;
  priceChild: string | null;
  durationText: string | null;
  nearestStation: string | null;
  openingHours: string | null;
  /** 0=月 〜 6=日。空配列は closedDaysCheckedAt があるときだけ「休みなし」と読む。 */
  closedWeekdays: number[];
  closedDaysCheckedAt: Date | null;
  closedNote: string | null;
  tickets: SpotTickets | null;
  website: string | null;
  /** 「行き方と地図」へのページ内リンク。無ければ出さない。 */
  accessAnchor?: string;
  /** チケットの詳しい説明へのページ内リンク。 */
  ticketsAnchor?: string;
}) {
  // 大人と子どもが同額(どちらも「無料」など)なら1つにまとめる。
  const priceValue =
    priceAdult && priceChild && priceAdult !== priceChild
      ? `大人 ${priceAdult} ／ 子ども ${priceChild}`
      : (priceAdult ?? priceChild);
  const hidePrice =
    profile.hidePriceWhenFree &&
    isFreeText(priceAdult) &&
    (priceChild === null || isFreeText(priceChild));

  /*
    休みの曜日。closedDaysCheckedAt が無い空配列は「まだ調べていない」かも
    しれないので何も書かない。調べていない場所を毎日開いていることにしない
    (prisma/schema.prisma の closedWeekdays の注記)。
  */
  const checkedLabel = closedDaysCheckedAt
    ? `${closedDaysCheckedAt.getFullYear()}年${closedDaysCheckedAt.getMonth() + 1}月時点`
    : null;
  const mostlyClosed = closedWeekdays.length >= MOSTLY_CLOSED_DAYS;
  const openDays = WEEKDAY_LABELS.filter((_, i) => !closedWeekdays.includes(i));
  const daysFact: Fact | null =
    closedWeekdays.length > 0
      ? mostlyClosed
        ? {
            key: "days",
            icon: CalendarCheck,
            label: profile.openDaysLabel,
            value:
              openDays.length === 1
                ? `${openDays[0]}曜のみ`
                : `${openDays.join("・")}のみ`,
          }
        : {
            key: "days",
            icon: CalendarOff,
            label: profile.closedLabel,
            value: closedWeekdays
              .slice()
              .sort((a, b) => a - b)
              .map((d) => WEEKDAY_LABELS[d])
              .join("・"),
          }
      : // 外から見る名所に「休み: 曜日の休みなし」は情報にならない(通りや
        // 広場はそもそも閉まらない)。休みの記載がある名所だけ出す。
        checkedLabel && profile.kind !== "landmark"
        ? {
            key: "days",
            icon: CalendarOff,
            label: profile.closedLabel,
            value: "曜日の休みなし",
          }
        : closedNote
          ? {
              key: "days",
              icon: CalendarOff,
              label: profile.closedLabel,
              value: closedNote,
            }
          : null;
  if (daysFact && daysFact.value !== closedNote) {
    daysFact.note = [closedNote, checkedLabel].filter(Boolean).join("　") || null;
    // 日曜・月曜に休む所は、その曜日の代わりを探せる一覧へ送る。
    if (!mostlyClosed) daysFact.links = openDayLinksFor(closedWeekdays);
  }

  const all: Record<FactKey, Fact | null> = {
    price:
      priceValue && !hidePrice
        ? { key: "price", icon: Ticket, label: profile.priceLabel, value: priceValue }
        : null,
    duration: durationText
      ? { key: "duration", icon: Clock, label: "所要時間", value: durationText }
      : null,
    hours: openingHours
      ? {
          key: "hours",
          icon: CalendarClock,
          label: profile.hoursLabel,
          value: openingHours,
        }
      : null,
    days: daysFact,
    tickets: tickets
      ? {
          key: "tickets",
          icon: ClipboardCheck,
          label: "チケット・予約",
          value: tickets.short,
          tone:
            tickets.level === "walk-in"
              ? "ok"
              : tickets.level === "closed"
                ? "muted"
                : "warn",
          links: ticketsAnchor
            ? [{ href: `#${ticketsAnchor}`, label: "取り方を詳しく" }]
            : undefined,
        }
      : null,
    station: nearestStation
      ? {
          key: "station",
          icon: Train,
          label: "最寄駅",
          value: nearestStation,
          links: accessAnchor
            ? [{ href: `#${accessAnchor}`, label: "行き方と地図" }]
            : undefined,
        }
      : null,
  };

  const facts = ORDER[profile.kind]
    .map((key) => all[key])
    .filter((f): f is Fact => f !== null);

  if (facts.length === 0) return null;

  return (
    <section
      aria-label="早わかり"
      className="rounded-2xl border border-border bg-muted/40 p-4 sm:p-5"
    >
      {/*
        dl の各組は div > dt + dd に限る(間に div を挟むと、読み上げで
        項目名と値の対応が取れなくなる)。アイコンは dt の中に入れ、
        左の余白へ絶対配置している。
      */}
      <dl className="grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-3">
        {facts.map((f) => {
          const wide =
            f.value.length > WIDE_VALUE_LENGTH || !!f.note || f.key === "tickets";
          return (
            <div
              key={f.key}
              className={`relative min-w-0 pl-7 ${wide ? "col-span-2 sm:col-span-3" : ""}`}
            >
              <dt className="text-xs font-medium text-muted-foreground">
                <f.icon
                  className="absolute left-0 top-0.5 h-5 w-5 text-muted-foreground"
                  aria-hidden
                />
                {f.label}
              </dt>
              <dd className="mt-0.5 text-sm font-semibold leading-snug">
                {f.tone ? (
                  <span
                    className={
                      f.tone === "warn"
                        ? "text-amber-800 dark:text-amber-300"
                        : f.tone === "ok"
                          ? "text-emerald-800 dark:text-emerald-300"
                          : "text-muted-foreground"
                    }
                  >
                    {f.value}
                  </span>
                ) : (
                  f.value
                )}
                {f.note && (
                  <span className="mt-1 block text-xs font-normal leading-relaxed text-muted-foreground">
                    {f.note}
                  </span>
                )}
                {f.links && f.links.length > 0 && (
                  <span className="mt-1 block text-xs font-normal">
                    {f.links.map((link, i) => (
                      <Fragment key={link.href}>
                        {i > 0 && "・"}
                        {link.href.startsWith("#") ? (
                          <a
                            href={link.href}
                            className="text-link underline underline-offset-2 hover:opacity-80 dark:text-blue-400"
                          >
                            {link.label}
                          </a>
                        ) : (
                          <Link
                            href={link.href}
                            className="text-link underline underline-offset-2 hover:opacity-80 dark:text-blue-400"
                          >
                            {link.label}
                          </Link>
                        )}
                      </Fragment>
                    ))}
                  </span>
                )}
              </dd>
            </div>
          );
        })}
      </dl>

      {/* 料金と時間は改定される。ここの値がいつでも正しいとは約束できないので、
          必ず公式サイトを見に行ける状態にしておく。 */}
      <p className="mt-4 border-t border-border/60 pt-3 text-xs leading-relaxed text-muted-foreground">
        {profile.kind === "event"
          ? "会期・料金は回ごとに変わります。出かける前に"
          : "料金・時間は変わることがあります。出かける前に"}
        {website ? (
          <>
            {" "}
            <a
              href={website}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-link underline underline-offset-2 hover:opacity-80 dark:text-blue-400"
            >
              公式サイト
            </a>{" "}
          </>
        ) : (
          "公式サイト"
        )}
        で確かめてください。
      </p>
    </section>
  );
}
