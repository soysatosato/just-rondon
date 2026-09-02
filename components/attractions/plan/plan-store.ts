"use client";

import { useSyncExternalStore } from "react";

import {
  DEFAULT_START_MINUTES,
  isValidStartMinutes,
  isValidStayMinutes,
  MAX_DAYS,
  MAX_SPOTS,
  normalizeDays,
  type PlanEntry,
} from "@/lib/plan";

/**
 * 旅行プランの保存先。ブラウザの localStorage だけで完結する。
 *
 * ログインを挟まないのは、プランを作るのが旅行前の一度きりで、
 * そのためにアカウントを作らせると大半がそこで離脱するため。
 * 端末をまたぎたい人には共有リンク(?spots=)を渡す。
 *
 * 持つのは slug と何日目か、それに出発日だけ。名前や料金まで保存すると、
 * 料金改定のあとも古い値がブラウザに残り続ける。中身は開くたびにDBから引き直す。
 *
 * 状態を React の外に置いているのは、「プランに追加」ボタンが一覧の
 * カードにも詳細ページにも出るため。Context で包むには描画位置が
 * 散らばりすぎており、useSyncExternalStore なら購読している行だけが
 * 再描画される。
 */

const STORAGE_KEY = "just-rondon-plan-v1";

/** 保存された出発日の形。壊れた値を読んで日付が1日ずれるのを防ぐ。 */
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** サーバー描画時のスナップショット。毎回同じ参照を返す必要がある。 */
const EMPTY: PlanEntry[] = [];

let entries: PlanEntry[] = EMPTY;
/** 出発日 "YYYY-MM-DD"。未設定なら null で、その場合は「1日目」表記に戻る。 */
let startDate: string | null = null;
/** 1日の開始時刻(0時からの分)。各日の時刻表はここから積み上げる。 */
let startMinutes: number = DEFAULT_START_MINUTES;
let hydrated = false;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

/**
 * localStorage から読む。
 *
 * 読み込みは subscribe の中(=描画のあと)で行う。描画中に読むと、
 * サーバーが返した空のHTMLとクライアントの初回描画が食い違い、
 * hydration エラーになる。useSyncExternalStore は購読直後に
 * スナップショットを取り直すので、ここで更新すれば正しく反映される。
 */
function hydrate() {
  hydrated = true;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    const parsed: unknown = JSON.parse(saved);

    /*
     * 保存の形は2つある。出発日を足す前は配列そのものを書いていた。
     * 鍵を変えず両方を受けるのは、鍵を変えると移行の間だけ「プランが
     * 消えた」ように見えるため。古い形は次の保存で新しい形に置き換わる。
     */
    const raw: unknown = Array.isArray(parsed)
      ? parsed
      : (parsed as { entries?: unknown } | null)?.entries;
    if (!Array.isArray(raw)) return;

    if (!Array.isArray(parsed)) {
      const savedStart = (parsed as { startDate?: unknown } | null)?.startDate;
      if (typeof savedStart === "string" && ISO_DATE.test(savedStart)) {
        startDate = savedStart;
      }
      // 開始時刻を足す前に保存された分には入っていない。既定のままにする。
      const savedClock = (parsed as { startMinutes?: unknown } | null)
        ?.startMinutes;
      if (isValidStartMinutes(savedClock)) startMinutes = savedClock;
    }

    const restored: PlanEntry[] = [];
    for (const item of raw) {
      if (
        item &&
        typeof item === "object" &&
        typeof (item as PlanEntry).slug === "string" &&
        Number.isInteger((item as PlanEntry).day)
      ) {
        const entry = item as PlanEntry;
        const day = Math.min(Math.max(entry.day, 1), MAX_DAYS);
        // 壊れた滞在時間は落とす。掲載値に戻るだけで、プランは残る。
        restored.push(
          isValidStayMinutes(entry.minutes)
            ? { slug: entry.slug, day, minutes: entry.minutes }
            : { slug: entry.slug, day },
        );
      }
    }
    entries = normalizeDays(restored.slice(0, MAX_SPOTS));
  } catch {
    // プライベートモード、保存拒否、壊れたJSON。
    // プランが空から始まるだけで、他の機能には影響しない。
  }
}

function persist() {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ entries, startDate, startMinutes }),
    );
  } catch {
    // 同上。この画面の中では動き続ける。
  }
}

/**
 * 書き込みの唯一の入口。日を 1..n に詰め直し、日ごとにまとめてから保存する。
 * 配列の並びがそのまま「その日に回る順」になるので、順序を崩さない
 * 安定ソートであることに依存している。
 */
function write(next: PlanEntry[]) {
  const normalized = normalizeDays(next.slice(0, MAX_SPOTS));
  entries = [...normalized].sort((a, b) => a.day - b.day);
  persist();
  emit();
}

function subscribe(listener: () => void) {
  if (!hydrated) hydrate();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * 別のタブで足したスポットを、開きっぱなしのタブにも反映する。
 * 一覧で選びながら別タブでプランを開く見方をされるので、
 * 片方が古いままだと「追加したのに出ない」に見える。
 */
if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key !== STORAGE_KEY) return;
    hydrated = false;
    entries = EMPTY;
    startDate = null;
    startMinutes = DEFAULT_START_MINUTES;
    hydrate();
    emit();
  });
}

function getSnapshot() {
  return entries;
}

function getServerSnapshot() {
  return EMPTY;
}

/* ------------------------------------------------------------------ *
 * 読み取り
 * ------------------------------------------------------------------ */

/**
 * 購読を通さずに今の中身を読む。共有リンクの取り込みで使う。
 *
 * 取り込みは useEffect の中で「今すでに自分のプランがあるか」を見て
 * 分岐する。描画時のスナップショットを見ると、localStorage の読み込みが
 * 済む前の空の配列を「プランは空」と誤って判断し、人のプランで
 * 上書きしてしまう。エフェクトの実行順に依存させないための入口。
 */
export function readPlan(): PlanEntry[] {
  if (!hydrated) hydrate();
  return entries;
}

export function usePlanEntries(): PlanEntry[] {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/**
 * そのスポットが何日目に入っているか。入っていなければ 0。
 *
 * 数値を返しているのは、カードごとに購読しても再描画が起きないようにするため。
 * 配列やオブジェクトを返すと参照が毎回変わり、144枚のカードが
 * 1件の追加で全部描き直される。
 */
export function usePlanDay(slug: string): number {
  return useSyncExternalStore(
    subscribe,
    () => entries.find((e) => e.slug === slug)?.day ?? 0,
    () => 0,
  );
}

/**
 * 出発日。設定されていなければ null。
 *
 * 文字列を返すので、購読している行だけが再描画される。Date を返すと
 * 参照が毎回変わり、日付を持つ行が全部描き直される。
 */
export function usePlanStartDate(): string | null {
  return useSyncExternalStore(
    subscribe,
    () => startDate,
    () => null,
  );
}

/** 1日の開始時刻(0時からの分)。 */
export function usePlanStartMinutes(): number {
  return useSyncExternalStore(
    subscribe,
    () => startMinutes,
    () => DEFAULT_START_MINUTES,
  );
}

export function usePlanCount(): number {
  return useSyncExternalStore(
    subscribe,
    () => entries.length,
    () => 0,
  );
}

/* ------------------------------------------------------------------ *
 * 書き込み
 * ------------------------------------------------------------------ */

/** 現在の日数。空のプランは 0。 */
function lastDay(): number {
  return entries.reduce((max, e) => Math.max(max, e.day), 0);
}

/**
 * スポットを足す。行き先を渡さなければ最終日。
 *
 * サイト内のカードや詳細ページから足すときは日を選べない——読んでいる
 * 途中で「何日目か」を決めさせるのは、まだ組んでいない人には答えられない
 * 問いなので、「いま埋めている日」= 最終日に落としている。
 *
 * 日を渡せるようにしてあるのは、プラン画面の中の追加欄のため。そこでは
 * すでに日割りが目の前にあり、「2日目が薄い」と分かったうえで足すので、
 * 最終日に入れてから移し直させるのは手数がひとつ多い。
 * 最終日 + 1 を渡すと新しい日になる(normalizeDays が 1..n に詰める)。
 */
export function addToPlan(slug: string, day?: number): boolean {
  if (entries.some((e) => e.slug === slug)) return false;
  if (entries.length >= MAX_SPOTS) return false;
  const target = day ?? Math.max(lastDay(), 1);
  if (!Number.isInteger(target) || target < 1 || target > MAX_DAYS) return false;
  write([...entries, { slug, day: target }]);
  return true;
}

export function removeFromPlan(slug: string) {
  write(entries.filter((e) => e.slug !== slug));
}

export function togglePlan(slug: string) {
  if (entries.some((e) => e.slug === slug)) removeFromPlan(slug);
  else addToPlan(slug);
}

/** 日を移す。day に「今の最終日 + 1」を渡すと新しい日になる。 */
export function moveToDay(slug: string, day: number) {
  if (day < 1 || day > MAX_DAYS) return;
  write(entries.map((e) => (e.slug === slug ? { ...e, day } : e)));
}

/**
 * 日と、その日の中の位置をまとめて指定して移す。掴んで動かす操作の受け口。
 *
 * moveToDay は日だけを変えるので、行き先の日では常に末尾に付く。掴んだ
 * ものを「2日目の2番目」に落としたのに末尾に着地すると、動かした先を
 * 目で追っていた読者にはどこへ行ったのか分からなくなる。
 *
 * 落とす位置は、動かすものを抜く前の並びで数えた番号で受け取る。
 * 同じ日の中で後ろへ動かすときのずれは呼び出し側で吸収している——
 * その補正に要る「元の位置」を知っているのは掴んだ側だけなので。
 */
export function moveToDayAt(slug: string, day: number, index: number) {
  if (day < 1 || day > MAX_DAYS) return;
  const moving = entries.find((e) => e.slug === slug);
  if (!moving) return;

  const without = entries.filter((e) => e.slug !== slug);
  const target = without.filter((e) => e.day === day);
  const others = without.filter((e) => e.day !== day);

  target.splice(Math.min(Math.max(index, 0), target.length), 0, {
    ...moving,
    day,
  });
  write([...others, ...target]);
}

/**
 * 2つの日を丸ごと入れ替える。
 *
 * 「ロンドン塔は日曜が混むから2日目と3日目を入れ替えたい」は、いまは
 * 中身を1件ずつ移し替えるしかなかった。8件を手で移す間に順番も崩れる。
 */
export function swapDays(a: number, b: number) {
  if (a === b || a < 1 || b < 1 || a > MAX_DAYS || b > MAX_DAYS) return;
  write(
    entries.map((e) =>
      e.day === a ? { ...e, day: b } : e.day === b ? { ...e, day: a } : e,
    ),
  );
}

/** その日のスポットを全部外す。空いた日は normalizeDays が詰める。 */
export function clearDay(day: number) {
  write(entries.filter((e) => e.day !== day));
}

/** 同じ日の中で1つ前後に動かす。日をまたいでは動かさない。 */
export function moveWithinDay(slug: string, direction: -1 | 1) {
  const index = entries.findIndex((e) => e.slug === slug);
  if (index === -1) return;

  const day = entries[index].day;
  const sameDay = entries
    .map((e, i) => ({ e, i }))
    .filter(({ e }) => e.day === day);
  const position = sameDay.findIndex(({ i }) => i === index);
  const target = sameDay[position + direction];
  if (!target) return;

  const next = [...entries];
  next[index] = target.e;
  next[target.i] = entries[index];
  write(next);
}

/**
 * その日のスポットを、渡された順に並べ替える。
 *
 * 並びだけを変えたいので、既存の entry をそのまま引き当てて並べる。
 * ここで { slug, day } を作り直すと、読者が入れた滞在時間が
 * 「近い順に並べ替える」を押すたびに消える。
 */
export function reorderDay(day: number, slugsInOrder: string[]) {
  const others = entries.filter((e) => e.day !== day);
  const bySlug = new Map(entries.map((e) => [e.slug, e]));
  const reordered = slugsInOrder
    .map((slug) => bySlug.get(slug))
    .filter((entry): entry is PlanEntry => Boolean(entry))
    .map((entry) => ({ ...entry, day }));
  write([...others, ...reordered]);
}

export function clearPlan() {
  startDate = null;
  startMinutes = DEFAULT_START_MINUTES;
  write([]);
}

/**
 * 滞在時間を上書きする。null を渡すと掲載値に戻る。
 *
 * 掲載値と同じ数を入れても上書きとして持つ。ここで「同じだから」と
 * 落とすと、掲載値が改定されたときに読者が決めた数まで一緒に動く。
 * 読者が明示的に押した値は、掲載値と一致していても読者のものとして残す。
 */
export function setSpotMinutes(slug: string, minutes: number | null) {
  write(
    entries.map((entry) => {
      if (entry.slug !== slug) return entry;
      if (minutes === null || !isValidStayMinutes(minutes)) {
        const { minutes: _dropped, ...rest } = entry;
        return rest;
      }
      return { ...entry, minutes };
    }),
  );
}

/**
 * 出発日を決める。null で「1日目」表記に戻す。
 *
 * 日付そのものは検証しない——入口が <input type="date"> だけなので、
 * ここに来る値は必ず YYYY-MM-DD になっている。壊れた値が入りうるのは
 * localStorage から読むときだけで、そちらは hydrate で弾いている。
 */
export function setStartDate(next: string | null) {
  startDate = next;
  persist();
  emit();
}

/** 1日の開始時刻。範囲外は捨てる——入口は選択欄だけなので普通は来ない。 */
export function setStartMinutes(next: number) {
  if (!isValidStartMinutes(next)) return;
  startMinutes = next;
  persist();
  emit();
}

/** 共有リンクとひな形の読み込み。今のプランを丸ごと置き換える。 */
export function replacePlan(next: PlanEntry[], nextStartDate?: string | null) {
  if (nextStartDate !== undefined) startDate = nextStartDate;
  write(next);
}

/** 購読を通さずに今の出発日を読む。共有リンクの取り込みで使う。 */
export function readStartDate(): string | null {
  if (!hydrated) hydrate();
  return startDate;
}

/* ------------------------------------------------------------------ *
 * 取り消し
 * ------------------------------------------------------------------ */

/**
 * プラン全体の写し。
 *
 * 消す操作の前にこれを取っておき、「元に戻す」で書き戻す。中身だけでなく
 * 出発日と開始時刻まで含めるのは、全消しがその2つも一緒に消すため。
 * 戻したときに日付だけ空のままだと、各日から日付と休館警告が消える。
 */
export type PlanSnapshot = {
  entries: PlanEntry[];
  startDate: string | null;
  startMinutes: number;
};

export function readSnapshot(): PlanSnapshot {
  if (!hydrated) hydrate();
  return { entries: [...entries], startDate, startMinutes };
}

export function restoreSnapshot(snapshot: PlanSnapshot) {
  startDate = snapshot.startDate;
  startMinutes = snapshot.startMinutes;
  write(snapshot.entries);
}
