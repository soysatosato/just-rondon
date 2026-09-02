"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpRight,
  Bus,
  CalendarClock,
  DoorClosed,
  Footprints,
  GripVertical,
  MapPin,
  TrainFront,
  Wallet,
  X,
} from "lucide-react";

import {
  formatClock,
  legLabel,
  MAX_DAYS,
  type LegKind,
  type PlanRow,
} from "@/lib/plan";
import LondonPassBadge from "./LondonPassBadge";
import PlanStayEditor from "./PlanStayEditor";
import { moveToDay, moveWithinDay, removeFromPlan } from "./plan-store";
import type { DragState } from "./drag";

const LEG_ICONS: Record<LegKind, typeof Footprints> = {
  walk: Footprints,
  transit: TrainFront,
  daytrip: Bus,
};

/**
 * 旅程の1行。
 *
 * 左に時刻の列を置いたのがこの画面でいちばん大きな変更。以前は
 * 「滞在1時間30分」という長さだけを出していた。長さは足し算の答えで
 * しかなく、読者が確かめたいことの多くは時刻でしか答えられない——
 * 閉館17時に間に合うか、19時の芝居に間に合うか、昼をどこで挟むか。
 * 開始時刻を1つもらえば、あとは滞在と移動を積むだけで全部出る。
 *
 * 掴んで動かせるようにしてあるが、掴む取っ手からしか始まらないように
 * している。行そのものを draggable にすると、名前を選んでコピーしようと
 * した指がドラッグになる。
 *
 * 触る画面ではブラウザの drag イベントが出ないので、↑↓と行き先の選択は
 * 消さずに残す。掴む操作はあくまで足したぶんで、これが唯一の手段に
 * なっている操作は1つも無い。
 */
export default function PlanDayRow({
  row,
  index,
  lastIndex,
  day,
  dayCount,
  /** 到着時刻より前に滞在時間の分からないスポットがあったか。 */
  clockUncertain,
  drag,
  onDragStart,
  onDragEnd,
  onDragOverRow,
  dropBefore,
  dropAfter,
}: {
  row: PlanRow;
  index: number;
  lastIndex: number;
  day: number;
  dayCount: number;
  clockUncertain: boolean;
  drag: DragState;
  onDragStart: () => void;
  onDragEnd: () => void;
  /** 行の上半分なら before、下半分なら after を返す。 */
  onDragOverRow: (position: "before" | "after") => void;
  dropBefore: boolean;
  dropAfter: boolean;
}) {
  /*
   * 取っ手を押している間だけ draggable を立てる。HTML の drag は
   * draggable な要素の上で始まるので、押した場所で決めるにはこうするしかない。
   */
  const [armed, setArmed] = useState(false);
  const dragging = drag?.slug === row.spot.slug;
  const LegIcon = row.legFromPrevious ? LEG_ICONS[row.legFromPrevious.kind] : null;

  return (
    <li
      draggable={armed}
      onDragStart={(e) => {
        // Firefox は何か入っていないと drag を始めない。
        e.dataTransfer.setData("text/plain", row.spot.slug);
        e.dataTransfer.effectAllowed = "move";
        onDragStart();
      }}
      onDragEnd={() => {
        setArmed(false);
        onDragEnd();
      }}
      onDragOver={(e) => {
        if (!drag) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        const box = e.currentTarget.getBoundingClientRect();
        onDragOverRow(
          e.clientY < box.top + box.height / 2 ? "before" : "after",
        );
      }}
      className={`relative print:break-inside-avoid ${
        dragging ? "opacity-40" : ""
      }`}
    >
      {/* 落ちる位置の目印。行の境目に線を引く。 */}
      {dropBefore && <DropLine />}

      {row.legFromPrevious && LegIcon && (
        // 左の余白は時刻の列ぶん。番号のレールの延長線上に置くと、
        // 移動が「前の番号と次の番号のあいだ」のものだと形で分かる。
        <p className="flex items-center gap-2 border-b border-dashed border-border bg-muted/20 py-1.5 pl-[4.5rem] pr-4 text-[11px] text-muted-foreground">
          <LegIcon className="h-3.5 w-3.5 shrink-0" aria-hidden />
          {legLabel(row.legFromPrevious)}
        </p>
      )}

      <div className="flex gap-3 p-4">
        {/*
          時刻の列。到着だけを出し、出発は出さない。両方並べると
          1行に4つの数字(到着・出発・滞在・料金)が乗り、いちばん見たい
          「何時に着くか」が他と同じ大きさに埋もれる。
        */}
        <div className="w-11 shrink-0 pt-0.5 text-right">
          <p className="text-xs font-bold tabular-nums leading-tight">
            {clockUncertain && (
              <span className="font-normal text-muted-foreground">〜</span>
            )}
            {formatClock(row.arriveMinutes)}
          </p>
          {row.stayMinutes !== null && (
            <p className="text-[10px] tabular-nums leading-tight text-muted-foreground">
              {formatClock(row.leaveMinutes)}
            </p>
          )}
        </div>

        <div className="flex shrink-0 flex-col items-center">
          <span
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white"
            aria-hidden
          >
            {index + 1}
          </span>
          {/*
            縦のレール。時刻の列と並びが1本に繋がって見えるようにする。
            最後の行では出さない——その先に続く行が無いのに線だけ伸びると、
            まだ何かあるように見える。
          */}
          {index !== lastIndex && (
            <span className="mt-1 w-px flex-1 bg-border print:hidden" aria-hidden />
          )}
        </div>

        <img
          src={row.spot.image}
          alt=""
          className="hidden h-16 w-16 shrink-0 rounded-lg object-cover sm:block print:hidden"
          loading="lazy"
          decoding="async"
        />

        <div className="min-w-0 flex-1 space-y-1.5">
          {/*
            別タブで開く。ここを踏む人は「そもそもどんな場所か」を
            確かめに行くので、まだプランを組んでいる途中にいる。
            同じタブだと、戻ったときにスクロール位置も畳まれ、
            どこまで組んだかを探し直すことになる。
            印刷には矢印を出さない——紙には押す先が無い。
          */}
          <Link
            href={`/sightseeing/${row.spot.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-baseline gap-1 font-semibold leading-snug underline decoration-border underline-offset-4 transition hover:text-indigo-600 hover:decoration-indigo-600 dark:hover:text-indigo-400"
          >
            {row.spot.name}
            <ArrowUpRight
              className="h-3.5 w-3.5 shrink-0 self-center text-muted-foreground transition group-hover:text-indigo-600 print:hidden dark:group-hover:text-indigo-400"
              aria-label="新しいタブで開く"
            />
          </Link>

          {/* 休館はパスの対象より先に出す。パスは買い方の話だが、
              閉まっている日に行くのは旅程が崩れる話で、直すのに
              要る手数も締切も違う。 */}
          {row.closedOn && (
            <p className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-semibold text-red-800 dark:bg-red-950/50 dark:text-red-200">
              <DoorClosed className="h-3 w-3 shrink-0" aria-hidden />
              この日は休み（{row.closedOn}休）
            </p>
          )}

          {row.spot.londonPass && (
            <div className="space-y-1">
              <LondonPassBadge note={row.spot.londonPassNote} />
              {/* 条件はバッジに収まらないので下に出す。これが無いと、
                  会社の限られる対象を無条件だと受け取られる。 */}
              {row.spot.londonPassNote && (
                <p className="text-[11px] leading-relaxed text-muted-foreground">
                  {row.spot.londonPassNote}
                </p>
              )}
            </div>
          )}

          <dl className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
            {/*
              掲載値の無いスポットでも出す。42件が滞在時間を持っておらず、
              そこが合計から落ちたままなのがこの道具のいちばん大きな穴だった。
              入口が無いと埋めようがない。
            */}
            <div>
              <dt className="sr-only">滞在時間</dt>
              <dd>
                <PlanStayEditor row={row} />
              </dd>
            </div>
            {row.spot.priceAdult && (
              <div className="flex items-center gap-1">
                <Wallet className="h-3 w-3 shrink-0" aria-hidden />
                <dt className="sr-only">大人料金</dt>
                <dd>{row.spot.priceAdult}</dd>
              </div>
            )}
            {row.spot.openingHours && (
              <div className="flex min-w-0 items-center gap-1">
                <CalendarClock className="h-3 w-3 shrink-0" aria-hidden />
                <dt className="sr-only">開館時間</dt>
                <dd className="truncate print:whitespace-normal">
                  {row.spot.openingHours}
                </dd>
              </div>
            )}
          </dl>

          {/*
            住所は画面では隠し、印刷にだけ出す。現地で紙を見る人には
            いちばん要る一行だが、画面では1行増えるだけで、
            タップすれば詳細ページに全部載っている。
          */}
          {row.spot.address && row.spot.address !== "-" && (
            <p className="hidden items-start gap-1 text-[11px] text-muted-foreground print:flex">
              <MapPin className="mt-0.5 h-3 w-3 shrink-0" aria-hidden />
              {row.spot.address}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-2 pt-1 print:hidden">
            <span
              onPointerDown={() => setArmed(true)}
              onPointerUp={() => setArmed(false)}
              onPointerCancel={() => setArmed(false)}
              aria-hidden
              title="掴んで動かす"
              className="hidden cursor-grab items-center rounded-full border border-border px-1.5 py-1 text-muted-foreground transition hover:text-indigo-600 active:cursor-grabbing sm:inline-flex dark:hover:text-indigo-400"
            >
              <GripVertical className="h-3.5 w-3.5" aria-hidden />
            </span>

            <div className="flex items-center rounded-full border border-border">
              <IconButton
                label={`${row.spot.name}を前に動かす`}
                disabled={index === 0}
                onClick={() => moveWithinDay(row.spot.slug, -1)}
              >
                <ArrowUp className="h-3.5 w-3.5" aria-hidden />
              </IconButton>
              <IconButton
                label={`${row.spot.name}を後ろに動かす`}
                disabled={index === lastIndex}
                onClick={() => moveWithinDay(row.spot.slug, 1)}
              >
                <ArrowDown className="h-3.5 w-3.5" aria-hidden />
              </IconButton>
            </div>

            <label className="sr-only" htmlFor={`day-${row.spot.slug}`}>
              {row.spot.name}を移す日
            </label>
            <select
              id={`day-${row.spot.slug}`}
              value={day}
              onChange={(e) => moveToDay(row.spot.slug, Number(e.target.value))}
              className="rounded-full border border-border bg-background px-2.5 py-1 text-[11px]"
            >
              {Array.from({ length: dayCount }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n}日目
                </option>
              ))}
              {dayCount < MAX_DAYS && (
                <option value={dayCount + 1}>{dayCount + 1}日目を作る</option>
              )}
            </select>

            <button
              type="button"
              onClick={() => removeFromPlan(row.spot.slug)}
              className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-[11px] text-muted-foreground transition hover:border-red-400 hover:text-red-600 dark:hover:text-red-400"
            >
              <X className="h-3 w-3" aria-hidden />
              外す
            </button>
          </div>
        </div>
      </div>

      {dropAfter && <DropLine />}
    </li>
  );
}

/** 掴んだものが落ちる位置。行の境目に重ねるので、高さは取らない。 */
function DropLine() {
  return (
    <span
      className="pointer-events-none absolute inset-x-3 z-10 -mt-px block h-0.5 rounded-full bg-indigo-600"
      aria-hidden
    />
  );
}

function IconButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="px-2 py-1 text-muted-foreground transition first:rounded-l-full last:rounded-r-full hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-30 dark:hover:text-indigo-400"
    >
      {children}
    </button>
  );
}
