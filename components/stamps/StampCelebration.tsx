"use client";

import Link from "next/link";
import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { MapPin } from "lucide-react";

import StampImpression, { type StampArt } from "@/components/stamps/StampImpression";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { StampPressProgress } from "@/lib/stamp-rallies";
import { STAMP_BOOK_HREF } from "@/lib/stamps";

/**
 * スタンプを押した直後に開く画面。
 *
 * 以前は右下に「スタンプを押しました」のトーストが出るだけで、押しても
 * 何かが貯まった感じがしなかった。押す操作の手応えはこの一瞬で決まるので、
 * 判が上から落ちてきてぐっと押される動きを見せ、その場で
 * 「何個目か」「どの台紙がいくつ進んだか」「称号まであと何個か」を出す。
 * 台紙を制覇した・称号が上がったときだけ紙吹雪を飛ばす(毎回飛ばすと
 * 特別さが無くなる)。
 *
 * 動きを減らす設定の端末では、判も棒も最後の姿で出す。
 */

export type StampCelebrationData = {
  /** 押すたびに変える。同じ場所を押し直したときも動きを最初から見せる。 */
  id: number;
  art: StampArt;
  name: string;
  change: "created" | "upgraded";
  /** 位置情報を付けて押したが、遠くて赤いスタンプになった。 */
  outOfRange: boolean;
  progress: StampPressProgress | null;
};

export default function StampCelebration({
  data,
  open,
  onOpenChange,
}: {
  data: StampCelebrationData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open && data !== null} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] w-[calc(100%-2rem)] max-w-sm gap-0 overflow-y-auto overflow-x-hidden rounded-3xl border-0 p-0 sm:rounded-3xl">
        {data && <Body key={data.id} data={data} />}
      </DialogContent>
    </Dialog>
  );
}

function Body({ data }: { data: StampCelebrationData }) {
  const reduce = useReducedMotion() ?? false;
  const { art, name, change, outOfRange, progress } = data;
  const gold = art.onSite;

  const rallies = [...(progress?.rallies ?? [])]
    .sort(
      (a, b) =>
        Number(b.count >= b.total) - Number(a.count >= a.total) ||
        a.total - a.count - (b.total - b.count),
    )
    .slice(0, 3);
  const completedNow = rallies.some((r) => r.before < r.total && r.count >= r.total);
  const rankedUp = change === "created" && Boolean(progress?.title.rankedUp);
  const firstEver = change === "created" && progress?.total === 1;

  const headline =
    change === "upgraded"
      ? "金のスタンプになりました"
      : firstEver
        ? "はじめてのスタンプ!"
        : gold
          ? "金のスタンプを押しました!"
          : "スタンプを押しました!";

  return (
    <motion.div
      className="stamp-paper relative px-5 pb-5 pt-7 sm:px-6"
      // 判が紙に当たった瞬間に、帳面ごと小さく揺れる。
      animate={reduce ? undefined : { x: [0, -3, 3, -1.5, 0] }}
      transition={{ duration: 0.28, delay: 0.34 }}
    >
      <div className="relative mx-auto h-36 w-36">
        {!reduce && <InkBurst gold={gold} />}
        <motion.div
          initial={reduce ? false : { scale: 2.3, opacity: 0, rotate: -16, y: -14 }}
          animate={{ scale: 1, opacity: 1, rotate: 0, y: 0 }}
          transition={{ type: "spring", stiffness: 520, damping: 26, mass: 0.9, delay: 0.1 }}
        >
          <StampImpression art={art} label={`${name}のスタンプ`} />
        </motion.div>
        {!reduce && (completedNow || rankedUp) && <Confetti />}
      </div>

      <div className="mt-4 text-center">
        <p
          className={cn(
            "text-[10px] font-bold uppercase tracking-[0.28em]",
            gold ? "text-amber-600 dark:text-amber-400" : "text-rose-600 dark:text-rose-400",
          )}
        >
          {gold ? "Gold Stamp" : "Stamped"}
        </p>
        <DialogTitle className="mt-1 text-xl font-black tracking-tight">{headline}</DialogTitle>
        <DialogDescription className="mt-1 text-sm text-muted-foreground">
          {name}
        </DialogDescription>
        {progress && (
          <p className="mt-2 text-xs text-muted-foreground">
            {change === "upgraded" ? (
              <>
                金のスタンプ
                <span className="mx-1 font-serif text-base font-black text-foreground">
                  {progress.gold}
                </span>
                個目
              </>
            ) : (
              <>
                <span className="mr-1 font-serif text-base font-black text-foreground">
                  {progress.total}
                </span>
                個目のスタンプ
              </>
            )}
          </p>
        )}
      </div>

      {outOfRange && (
        <p className="mt-4 flex gap-2 rounded-xl bg-amber-100/80 px-3 py-2.5 text-left text-xs leading-relaxed text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
          現在地が{name}から離れていたので、赤いスタンプで押しました。現地で押し直すと金になります。
        </p>
      )}

      {progress && (
        <div className="mt-5 space-y-2 text-left">
          {change === "created" && (
            <TitleProgress title={progress.title} total={progress.total} reduce={reduce} />
          )}
          {rallies.map((rally) => (
            <RallyRow key={rally.slug} rally={rally} reduce={reduce} />
          ))}
        </div>
      )}

      <div className="mt-6 grid grid-cols-2 gap-2">
        <DialogClose asChild>
          <button
            type="button"
            className="rounded-full border border-border bg-background px-4 py-2.5 text-sm font-semibold transition hover:bg-muted"
          >
            閉じる
          </button>
        </DialogClose>
        <Link
          href={STAMP_BOOK_HREF}
          className="rounded-full bg-rose-600 px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-rose-700"
        >
          スタンプ帳を見る
        </Link>
      </div>
    </motion.div>
  );
}

function TitleProgress({
  title,
  total,
  reduce,
}: {
  title: StampPressProgress["title"];
  total: number;
  reduce: boolean;
}) {
  if (title.rankedUp) {
    return (
      <motion.div
        initial={reduce ? false : { opacity: 0, scale: 0.92, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 0.75, type: "spring", stiffness: 300, damping: 20 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#5b1629] to-[#2a0912] px-4 py-3.5 text-center text-white"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -right-10 -top-12 h-32 w-32 rounded-full bg-amber-400/25 blur-2xl"
        />
        <p className="relative text-[10px] font-bold uppercase tracking-[0.3em] text-amber-300">
          New Title
        </p>
        <p className="relative mt-1 text-[11px] text-white/60">
          {title.previous.min === 0
            ? "ロンドンに入国しました"
            : `「${title.previous.title}」から称号が上がりました`}
        </p>
        <p className="relative mt-1.5 font-serif text-3xl font-black text-amber-200">
          {title.current.title}
        </p>
        <p className="relative mt-1 text-xs leading-relaxed text-white/70">
          {title.current.note}
        </p>
      </motion.div>
    );
  }

  if (!title.next) {
    return (
      <p className="rounded-xl bg-background/70 px-3 py-2.5 text-xs ring-1 ring-border">
        称号は最上位の「{title.current.title}」です。
      </p>
    );
  }

  const span = title.next.min - title.current.min;
  const done = total - title.current.min;

  return (
    <div className="rounded-xl bg-background/70 px-3 py-2.5 ring-1 ring-border">
      <p className="flex flex-wrap items-baseline justify-between gap-x-2 text-xs">
        <span>
          称号「<span className="font-bold">{title.current.title}</span>」
        </span>
        <span className="text-muted-foreground">
          「{title.next.title}」まであと
          <span className="mx-0.5 font-serif text-sm font-black text-foreground">
            {title.next.min - total}
          </span>
          個
        </span>
      </p>
      {span <= 16 ? (
        <div className="mt-2 flex gap-1" aria-hidden>
          {Array.from({ length: span }, (_, i) => {
            const filled = i < done;
            const fresh = i === done - 1;
            return (
              <span key={i} className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                {filled && (
                  <motion.span
                    className="block h-full origin-left rounded-full bg-amber-400"
                    // 今押した1マスだけ、あとから埋まる。
                    initial={fresh && !reduce ? { scaleX: 0 } : false}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.6, duration: 0.45, ease: "easeOut" }}
                  />
                )}
              </span>
            );
          })}
        </div>
      ) : (
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted" aria-hidden>
          <motion.div
            className="h-full rounded-full bg-amber-400"
            initial={reduce ? false : { width: `${((done - 1) / span) * 100}%` }}
            animate={{ width: `${(done / span) * 100}%` }}
            transition={{ delay: 0.6, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
      )}
    </div>
  );
}

function RallyRow({
  rally,
  reduce,
}: {
  rally: StampPressProgress["rallies"][number];
  reduce: boolean;
}) {
  const complete = rally.count >= rally.total;
  const justCompleted = complete && rally.before < rally.total;
  const from = (rally.before / rally.total) * 100;
  const to = (rally.count / rally.total) * 100;

  return (
    <div
      className={cn(
        "rounded-xl px-3 py-2.5",
        justCompleted
          ? "bg-amber-100/80 ring-1 ring-amber-300 dark:bg-amber-950/40 dark:ring-amber-700/60"
          : "bg-background/70 ring-1 ring-border",
      )}
    >
      <p className="flex items-baseline justify-between gap-2 text-xs">
        <span className="truncate font-semibold">{rally.title}</span>
        <span className="shrink-0 tabular-nums text-muted-foreground">
          {justCompleted ? (
            <span className="font-black text-amber-600 dark:text-amber-400">制覇!</span>
          ) : complete ? (
            "制覇済み"
          ) : (
            <>
              あと{rally.total - rally.count}
              {rally.unit}
            </>
          )}
          <span className="ml-1.5">
            <span className="font-serif text-sm font-black text-foreground">{rally.count}</span>/
            {rally.total}
          </span>
        </span>
      </p>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted" aria-hidden>
        <motion.div
          className={cn("h-full rounded-full", complete ? "bg-amber-500" : "bg-rose-500")}
          initial={reduce ? false : { width: `${from}%` }}
          animate={{ width: `${to}%` }}
          transition={{ delay: 0.55, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
    </div>
  );
}

/** 判が紙に当たった瞬間の、インクの輪としぶき。 */
function InkBurst({ gold }: { gold: boolean }) {
  const drops = useMemo(
    () =>
      Array.from({ length: 10 }, (_, i) => {
        const angle = (i / 10) * Math.PI * 2 + Math.random() * 0.5;
        const distance = 66 + Math.random() * 26;
        return {
          x: Math.cos(angle) * distance,
          y: Math.sin(angle) * distance,
          size: 3 + Math.random() * 4,
        };
      }),
    [],
  );

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <motion.span
        className={cn(
          "absolute inset-3 rounded-full border-[3px]",
          gold ? "border-amber-500" : "border-rose-500",
        )}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: [0.8, 1.45], opacity: [0.5, 0] }}
        transition={{ delay: 0.3, duration: 0.55, ease: "easeOut" }}
      />
      {drops.map((drop, i) => (
        <motion.span
          key={i}
          className={cn(
            "absolute left-1/2 top-1/2 rounded-full",
            gold ? "bg-amber-500" : "bg-rose-500",
          )}
          style={{
            width: drop.size,
            height: drop.size,
            marginLeft: -drop.size / 2,
            marginTop: -drop.size / 2,
          }}
          initial={{ x: 0, y: 0, opacity: 0, scale: 0.5 }}
          animate={{ x: drop.x, y: drop.y, opacity: [0, 0.85, 0], scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}

const CONFETTI_COLORS = ["#e11d48", "#f59e0b", "#fbbf24", "#fb7185", "#fde68a", "#be123c"];

/** 台紙を制覇した・称号が上がったときの紙吹雪。 */
function Confetti() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 36 }, (_, i) => {
        const angle = (i / 36) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
        const distance = 80 + Math.random() * 90;
        const round = Math.random() < 0.3;
        const width = 5 + Math.random() * 4;
        return {
          x: Math.cos(angle) * distance,
          // 上へ打ち上げてから落とす。
          y: Math.sin(angle) * distance - 40,
          fall: 70 + Math.random() * 80,
          rotate: (Math.random() - 0.5) * 720,
          delay: 0.35 + Math.random() * 0.15,
          color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
          width,
          height: round ? width : 8 + Math.random() * 6,
          round,
        };
      }),
    [],
  );

  return (
    <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2">
      {pieces.map((p, i) => (
        <motion.span
          key={i}
          className="absolute block"
          style={{
            width: p.width,
            height: p.height,
            left: -p.width / 2,
            top: -p.height / 2,
            backgroundColor: p.color,
            borderRadius: p.round ? 999 : 2,
          }}
          initial={{ x: 0, y: 0, opacity: 0, rotate: 0 }}
          animate={{
            x: p.x,
            y: [0, p.y, p.y + p.fall],
            opacity: [0, 1, 1, 0],
            rotate: p.rotate,
          }}
          transition={{
            delay: p.delay,
            duration: 1.6,
            x: { delay: p.delay, duration: 1.2, ease: [0.15, 0.8, 0.3, 1] },
            y: {
              delay: p.delay,
              duration: 1.6,
              times: [0, 0.35, 1],
              ease: ["easeOut", "easeIn"],
            },
            opacity: { delay: p.delay, duration: 1.6, times: [0, 0.05, 0.75, 1] },
          }}
        />
      ))}
    </div>
  );
}
