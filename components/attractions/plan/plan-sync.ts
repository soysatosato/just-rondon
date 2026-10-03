"use client";

import { useSyncExternalStore } from "react";

import { encodePlan } from "@/lib/plan";
import {
  readSavedPlan,
  samePlanContent,
  savedPlanContent,
  type SavedPlan,
} from "@/lib/plan/saved";
import { applyRemotePlan, onLocalChange, readContent } from "./plan-store";

/**
 * 旅行プランを、ログインしている読者のアカウント(/api/plan)と同期する。
 *
 * プランの本体はブラウザの localStorage のままで、ここはその写しを
 * アカウントへ送り、別の端末ではアカウントから読み戻すだけ。画面は
 * 常に手元の localStorage を見て動くので、通信が遅くても途切れても
 * プランの操作は止まらない。
 *
 * -------------------------------------------------------------------
 * 何を覚えておくか
 *
 * 端末ごとに「最後にアカウントと揃えた版(revision)」と「揃えたあとに
 * この端末で変えたか(dirty)」を localStorage に持つ。アカウントを読んだ
 * ときに、この2つで次の4通りに分ける。
 *
 * - 中身が同じ          → 揃っている。版だけ覚え直す。
 * - アカウントが前のまま → この端末の変更を送る。
 * - この端末が前のまま   → アカウントの中身で置き換える(別の端末で直した)。
 * - 両方が変わっている   → 読者に選ばせる。
 *
 * 最後の場合を後勝ちにしないのは、旅程が組むのに時間のかかるもので、
 * スマホで直したものを開きっぱなしだったPCのタブが黙って上書きすると
 * 取り返しがつかないため。共有リンクを開いたときに今のプランを黙って
 * 上書きしないのと同じ考え方(PlanBuilder の取り込み)。
 *
 * このブラウザで初めて同期するアカウント(ログインした直後)は、
 * 手元のプランが空ならアカウントの中身を開き、アカウントが空なら
 * 手元のプランを送る。両方にあって違えば、やはり選ばせる。
 * -------------------------------------------------------------------
 *
 * 送るのは変更から少し待ってから。日割りを並べ替える間は1秒に何度も
 * 書き換わるので、そのたびに送ると、ほとんどが次の一手で古くなる。
 * 待っている間にタブを閉じられても、dirty が残るので次に開いたときに送る。
 */

const META_KEY = "just-rondon-plan-sync-v1";
/** 最後の変更からこれだけ待って送る。 */
const PUSH_DELAY_MS = 1500;
/** タブに戻ってきたとき、前に読んでからこれだけ経っていれば読み直す。 */
const PULL_INTERVAL_MS = 30_000;

type SyncMeta = {
  /** 揃えた相手のアカウント。別の人がこのブラウザでログインしたら使わない。 */
  userId: string;
  /** 最後にアカウントと揃えた版。アカウントにまだ何も無かったなら null。 */
  revision: number | null;
  /** 揃えたあとに、この端末で変えたか。 */
  dirty: boolean;
};

export type PlanSyncStatus =
  /** ログインしているかがまだ分からない。何も出さない。 */
  | { kind: "pending" }
  /** ログインしていない。プランはこのブラウザにだけある。 */
  | { kind: "off" }
  /** アカウントの中身を読みに行っている。 */
  | { kind: "loading" }
  | { kind: "saving" }
  | { kind: "saved" }
  | { kind: "error" }
  /** アカウントとこの端末の両方が変わっていて、どちらを残すか選ばせる。 */
  | { kind: "conflict"; remote: SavedPlan };

const PENDING: PlanSyncStatus = { kind: "pending" };

let userId: string | null = null;
let status: PlanSyncStatus = PENDING;
const statusListeners = new Set<() => void>();

let pushTimer: number | null = null;
/**
 * 送っている相手のアカウント。読む側と同じく人ごとに持つ——ログアウト直後に
 * 前の人の送信が残っていても、次の人の読み込みを止めないように。
 */
let pushingFor: string | null = null;
/** 送っている間に、もう一度送る必要が出た。 */
let pushAgain = false;
/** 読みに行っている相手のアカウント。別の人に切り替わったら結果を捨てる。 */
let pullingFor: string | null = null;
let lastPullAt = 0;
/** 読者の操作の通し番号。送っている間に変わったかを見る。 */
let localSeq = 0;

/** localStorage が使えないブラウザでの置き場。そのタブの間だけ覚えている。 */
let memoryMeta: SyncMeta | null = null;

function setStatus(next: PlanSyncStatus) {
  status = next;
  for (const listener of statusListeners) listener();
}

/* ------------------------------------------------------------------ *
 * 覚えておくもの
 * ------------------------------------------------------------------ */

/**
 * 毎回 localStorage から読む。別のタブが送って版を進めたとき、
 * こちらのタブが古い版のまま送って食い違いと判定しないように。
 */
function readMeta(): SyncMeta | null {
  try {
    const raw = localStorage.getItem(META_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<SyncMeta> | null;
    if (
      typeof parsed?.userId === "string" &&
      (parsed.revision === null || Number.isInteger(parsed.revision)) &&
      typeof parsed.dirty === "boolean"
    ) {
      return parsed as SyncMeta;
    }
    return null;
  } catch {
    return memoryMeta;
  }
}

function writeMeta(meta: SyncMeta) {
  memoryMeta = meta;
  try {
    localStorage.setItem(META_KEY, JSON.stringify(meta));
  } catch {
    // プライベートモードなど。このタブの中では memoryMeta で動き続ける。
  }
}

/* ------------------------------------------------------------------ *
 * 突き合わせ
 * ------------------------------------------------------------------ */

/** アカウントにある中身(null は1度も保存していない)と手元を突き合わせる。 */
function reconcile(server: SavedPlan | null) {
  const user = userId;
  if (!user) return;

  const local = readContent();
  const meta = readMeta();
  const known = meta?.userId === user ? meta : null;

  if (!server) {
    if (local.entries.length === 0) {
      writeMeta({ userId: user, revision: null, dirty: false });
      setStatus({ kind: "saved" });
      return;
    }
    writeMeta({ userId: user, revision: null, dirty: true });
    void push();
    return;
  }

  if (samePlanContent(local, savedPlanContent(server))) {
    writeMeta({ userId: user, revision: server.revision, dirty: false });
    setStatus({ kind: "saved" });
    return;
  }

  // アカウントは前に揃えたときのまま。違うのはこの端末で変えたぶん。
  if (known && known.revision === server.revision) {
    writeMeta({ ...known, dirty: true });
    void push();
    return;
  }

  // アカウントが先へ進んでいる(か、このブラウザでは初めて揃える)。
  // 手元に失うものが無ければ、黙ってアカウントの中身を開く。
  const nothingToLose = known ? !known.dirty : local.entries.length === 0;
  if (nothingToLose) {
    applyRemotePlan(savedPlanContent(server));
    writeMeta({ userId: user, revision: server.revision, dirty: false });
    setStatus({ kind: "saved" });
    return;
  }

  setStatus({ kind: "conflict", remote: server });
}

/* ------------------------------------------------------------------ *
 * 読む・送る
 * ------------------------------------------------------------------ */

async function pull() {
  const user = userId;
  if (!user || pullingFor === user) return;
  // 送る予定や送っている途中のものがあるなら、それが済むのを待つ。
  // 先に読むと、送る前の手元を「アカウントと違う」と判定してしまう。
  if (pushingFor === user || pushTimer !== null || status.kind === "conflict") {
    return;
  }

  pullingFor = user;
  lastPullAt = Date.now();
  try {
    const res = await fetch("/api/plan", { cache: "no-store" });
    if (user !== userId) return;
    const data = res.ok
      ? ((await res.json()) as { signedIn?: boolean; plan?: unknown })
      : null;
    if (!data || data.signedIn === false) {
      setStatus({ kind: "error" });
      return;
    }
    reconcile(readSavedPlan(data.plan));
  } catch {
    if (user === userId) setStatus({ kind: "error" });
  } finally {
    if (pullingFor === user) pullingFor = null;
  }
}

/**
 * 手元の中身を送る。
 *
 * keepalive はタブを閉じる直前に送るとき用。ページが消えても送信だけは
 * 最後まで行われる(応答は受け取れないので、版は次に開いたときに揃う)。
 */
async function push(keepalive = false) {
  const user = userId;
  if (!user || status.kind === "conflict") return;
  if (pushingFor === user) {
    pushAgain = true;
    return;
  }

  pushingFor = user;
  const seq = localSeq;
  const content = readContent();
  const meta = readMeta();
  if (status.kind !== "saving") setStatus({ kind: "saving" });

  try {
    const res = await fetch("/api/plan", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        spots: encodePlan(content.entries),
        startDate: content.startDate,
        startMinutes: content.startMinutes,
        baseRevision: meta?.userId === user ? meta.revision : null,
      }),
      keepalive,
    });
    if (user !== userId) return;

    const data = (await res.json().catch(() => null)) as {
      plan?: unknown;
    } | null;

    // 別の端末が先に書いていた。いまのアカウントの中身と突き合わせ直す。
    if (res.status === 409) {
      reconcile(readSavedPlan(data?.plan));
      return;
    }

    const saved = res.ok ? readSavedPlan(data?.plan) : null;
    if (!saved) {
      setStatus({ kind: "error" });
      return;
    }

    // 送っている間に読者が次の一手を打っていたら、それもまた送る。
    const changedMeanwhile = localSeq !== seq;
    writeMeta({ userId: user, revision: saved.revision, dirty: changedMeanwhile });
    if (changedMeanwhile) schedulePush();
    else setStatus({ kind: "saved" });
  } catch {
    if (user === userId) setStatus({ kind: "error" });
  } finally {
    if (pushingFor === user) pushingFor = null;
    if (pushAgain) {
      pushAgain = false;
      if (user === userId) schedulePush(0);
    }
  }
}

function schedulePush(delay = PUSH_DELAY_MS) {
  if (!userId || status.kind === "conflict") return;
  if (pushTimer !== null) window.clearTimeout(pushTimer);
  pushTimer = window.setTimeout(() => {
    pushTimer = null;
    void push();
  }, delay);
  if (status.kind !== "saving") setStatus({ kind: "saving" });
}

/** 読者がプランを変えた。 */
function handleLocalChange() {
  localSeq += 1;

  // ログインしていなくても印は付ける。ログアウト中に直したぶんを、
  // 次にログインしたとき「アカウントのほうが新しい」と取り違えて
  // 消さないため。
  const meta = readMeta();
  if (meta && !meta.dirty) writeMeta({ ...meta, dirty: true });

  // 最初の読み込み中は送らない。読み終えた時点の手元で突き合わせるので、
  // いまの変更もそこで送られる。
  if (!userId || status.kind === "loading") return;
  schedulePush();
}

if (typeof window !== "undefined") {
  onLocalChange(handleLocalChange);

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      // 待っている変更があれば、タブを離れる前に送ってしまう。
      if (pushTimer !== null) {
        window.clearTimeout(pushTimer);
        pushTimer = null;
        void push(true);
      }
      return;
    }
    // 戻ってきた。別の端末で直していたかもしれないので読み直す。
    if (Date.now() - lastPullAt >= PULL_INTERVAL_MS) void pull();
  });
}

/* ------------------------------------------------------------------ *
 * 外からの入口
 * ------------------------------------------------------------------ */

/** ログインしている人が変わった(ログイン・ログアウト)。PlanSync が呼ぶ。 */
export function setPlanSyncUser(next: string | null) {
  if (next === userId && status.kind !== "pending") return;
  userId = next;
  if (pushTimer !== null) {
    window.clearTimeout(pushTimer);
    pushTimer = null;
  }
  if (!next) {
    setStatus({ kind: "off" });
    return;
  }
  setStatus({ kind: "loading" });
  void pull();
}

/**
 * 食い違いを読者の選んだほうで片付ける。
 *
 * remote: アカウントの中身でこのブラウザのプランを置き換える。
 * local:  このブラウザのプランでアカウントを上書きする。
 */
export function resolvePlanConflict(choice: "remote" | "local") {
  if (status.kind !== "conflict" || !userId) return;
  const { remote } = status;

  if (choice === "remote") {
    applyRemotePlan(savedPlanContent(remote));
    writeMeta({ userId, revision: remote.revision, dirty: false });
    setStatus({ kind: "saved" });
    return;
  }

  // 見せたアカウントの版の上に書く。選んでいる間にさらに別の端末が
  // 書いていれば、もう一度 409 になって選び直しになる。
  writeMeta({ userId, revision: remote.revision, dirty: true });
  setStatus({ kind: "saving" });
  void push();
}

/** 保存に失敗したあとの「もう一度試す」。読み直して突き合わせからやり直す。 */
export function retryPlanSync() {
  if (!userId) return;
  setStatus({ kind: "loading" });
  void pull();
}

function subscribeStatus(listener: () => void) {
  statusListeners.add(listener);
  return () => {
    statusListeners.delete(listener);
  };
}

export function usePlanSyncStatus(): PlanSyncStatus {
  return useSyncExternalStore(
    subscribeStatus,
    () => status,
    () => PENDING,
  );
}
