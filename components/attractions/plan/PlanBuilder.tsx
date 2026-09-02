"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Link2, Plus, Printer, Trash2, Undo2 } from "lucide-react";

import {
  buildDayPlan,
  decodePlan,
  encodePlan,
  formatGbp,
  formatMinutes,
  MAX_SPOTS,
  type PlanEntry,
  type PlanSpot,
} from "@/lib/plan";
import { dateForDay, parseIsoDate } from "@/lib/plan/dates";
import PlanDay from "./PlanDay";
import PlanDateBar from "./PlanDateBar";
import PlanSpotPicker from "./PlanSpotPicker";
import PlanStarter from "./PlanStarter";
import {
  clearPlan,
  readPlan,
  readStartDate,
  replacePlan,
  usePlanEntries,
  usePlanStartDate,
} from "./plan-store";

const SHARE_PARAM = "spots";
const START_PARAM = "start";

/** 共有リンクを開いたあと、アドレス欄から取り込み用のクエリを落とす。 */
function stripShareParams() {
  const url = new URL(window.location.href);
  url.searchParams.delete(SHARE_PARAM);
  url.searchParams.delete(START_PARAM);
  window.history.replaceState(null, "", `${url.pathname}${url.search}`);
}

/**
 * 旅行プランの本体。公開中の全スポットを受け取り、
 * 保存されている slug を突き合わせて日別に組み立てる。
 *
 * 保存しているのが slug と出発日だけなので、料金や開館時間はここで
 * 引き直した最新の値になる。ブラウザに数ヶ月前のプランが残っていても、
 * 出る数字は今のもの。
 */
export default function PlanBuilder({ spots }: { spots: PlanSpot[] }) {
  const entries = usePlanEntries();
  const startDate = usePlanStartDate();
  const [incoming, setIncoming] = useState<{
    entries: PlanEntry[];
    startDate: string | null;
  } | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [confirmingClear, setConfirmingClear] = useState(false);
  /** 全消しの直前の中身。「元に戻す」が押されるまで持っておく。 */
  const [undo, setUndo] = useState<{
    entries: PlanEntry[];
    startDate: string | null;
  } | null>(null);

  const bySlug = useMemo(
    () => new Map(spots.map((spot) => [spot.slug, spot])),
    [spots],
  );

  /*
   * 非公開になったスポットを落とす。
   *
   * 期間限定の催しは isPublished で伏せるので、ブラウザに残った
   * プランが実在しない slug を指すことがある。表示から消すだけだと
   * 「プランを見る(5)」と中身の4件が食い違うので、保存側からも外す。
   */
  useEffect(() => {
    if (entries.length === 0) return;
    const alive = entries.filter((entry) => bySlug.has(entry.slug));
    if (alive.length !== entries.length) replacePlan(alive);
  }, [entries, bySlug]);

  /*
   * 共有リンクの取り込み。
   *
   * 自分のプランを黙って上書きしない。旅程は作るのに時間がかかるもので、
   * 同行者からリンクが届いたときに消えるのがいちばん困る。
   * 空のときだけ自動で開き、中身があるときは選ばせる。
   */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const param = params.get(SHARE_PARAM);
    if (!param) return;

    const decoded = decodePlan(param).filter((entry) => bySlug.has(entry.slug));
    if (decoded.length === 0) {
      stripShareParams();
      return;
    }
    // 日付の形をしていないものは捨てる。相手の旅程がずれるより出ないほうがよい。
    const incomingStart = parseIsoDate(params.get(START_PARAM))
      ? params.get(START_PARAM)
      : null;

    // 描画時のスナップショットではなく保存内容を直接読む。
    // localStorage の読み込み前だと空に見えてしまうため。
    const current = readPlan();
    if (current.length === 0) {
      replacePlan(decoded, incomingStart);
      stripShareParams();
      return;
    }
    if (
      encodePlan(current) === encodePlan(decoded) &&
      readStartDate() === incomingStart
    ) {
      stripShareParams();
      return;
    }
    setIncoming({ entries: decoded, startDate: incomingStart });
  }, [bySlug]);

  /*
   * 消したあとで何かが入ったら「元に戻す」を引っ込める。
   *
   * ひな形を読み込んだり新しく足したりしたあとに残っていると、
   * それを押した人は消える側の中身を戻すつもりで、いま組みはじめた
   * ぶんを消すことになる。取り消しは直後の一手だけに効かせる。
   */
  useEffect(() => {
    if (undo && entries.length > 0) setUndo(null);
  }, [entries, undo]);

  // 確認を開いたまま最後の1件を「外す」で消すと、下の塊ごと畳まれて
  // 開いた状態が残る。次に何かを足したとき、押していない確認が
  // いきなり出るので閉じておく。
  useEffect(() => {
    if (entries.length === 0) setConfirmingClear(false);
  }, [entries]);

  /** 読者が入れた滞在時間。slug で引けるようにして計算側へ渡す。 */
  const overrides = useMemo(() => {
    const map = new Map<string, number>();
    for (const entry of entries) {
      if (entry.minutes !== undefined) map.set(entry.slug, entry.minutes);
    }
    return map;
  }, [entries]);

  const days = useMemo(() => {
    const numbers = [...new Set(entries.map((entry) => entry.day))].sort(
      (a, b) => a - b,
    );
    return numbers.map((day) =>
      buildDayPlan(
        day,
        entries
          .filter((entry) => entry.day === day)
          .map((entry) => bySlug.get(entry.slug))
          .filter((spot): spot is PlanSpot => Boolean(spot)),
        { date: dateForDay(startDate, day), overrides },
      ),
    );
  }, [entries, bySlug, startDate, overrides]);

  const spotCount = days.reduce((sum, day) => sum + day.rows.length, 0);
  const totalGbp = days.reduce((sum, day) => sum + day.totalGbp, 0);
  const unknownPriceCount = days.reduce(
    (sum, day) => sum + day.unknownPriceCount,
    0,
  );
  const totalMinutes = days.reduce(
    (sum, day) => sum + day.stayMinutes + day.travelMinutes,
    0,
  );

  const handleShare = async () => {
    // URLSearchParams を通さずに組み立てる。encodePlan の区切り(. と _)は
    // percent-encode されない文字だが、通すと読みにくくなる書き方に化ける
    // ものがある。共有リンクは人が LINE やメールに貼るので見た目のまま残す。
    const query = [
      `${SHARE_PARAM}=${encodePlan(entries)}`,
      startDate ? `${START_PARAM}=${startDate}` : null,
    ]
      .filter(Boolean)
      .join("&");
    const url = `${window.location.origin}/plan?${query}`;
    setShareUrl(url);
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      // 権限が下りない、http で開いている、対応していない古いブラウザ。
      // URL は下に出してあるので、手で選んでコピーできる。
      setCopied(false);
    }
  };

  /*
   * 全消し。
   *
   * 以前は window.confirm で止めていた。OSのダイアログは何ヶ所・何日分を
   * 消すのかを出せず、スマホでは画面の上端に小さく出るだけで、
   * 「すべて消す」を押した指の位置とも離れている。押す前に何が消えるかを
   * その場に出し、押したあとは戻せるようにしてある。
   *
   * 戻せるようにしたので、確認は一度きりでよい。旅程は組むのに時間が
   * かかるものだが、取り返しがつかないのは「戻せないこと」であって
   * 「押しやすいこと」ではない。
   */
  const handleClear = () => {
    setUndo({ entries: [...readPlan()], startDate: readStartDate() });
    clearPlan();
    setConfirmingClear(false);
    setShareUrl(null);
    // 消すとページが一気に短くなり、ブラウザが位置を切り詰めて
    // 下端に落ちる。「元に戻す」は上に出るので、そこまで連れていく。
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="space-y-8">
      {incoming && (
        <div className="space-y-3 rounded-2xl border border-indigo-300 bg-indigo-50 p-4 dark:border-indigo-800 dark:bg-indigo-950/40">
          <p className="text-sm font-semibold text-indigo-900 dark:text-indigo-200">
            共有されたプランが開かれています（
            {incoming.entries.length}ヶ所・
            {new Set(incoming.entries.map((entry) => entry.day)).size}日間）
          </p>
          <p className="text-xs leading-relaxed text-indigo-800 dark:text-indigo-300">
            いま保存されているあなたのプラン（{entries.length}ヶ所）とは別のものです。
            入れ替えると、いまのプランは戻せません。
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                replacePlan(incoming.entries, incoming.startDate);
                setIncoming(null);
                stripShareParams();
              }}
              className="rounded-full bg-indigo-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-indigo-700"
            >
              共有されたプランに入れ替える
            </button>
            <button
              type="button"
              onClick={() => {
                setIncoming(null);
                stripShareParams();
              }}
              className="rounded-full border border-indigo-300 bg-background px-4 py-2 text-xs font-semibold transition hover:border-indigo-500 dark:border-indigo-800"
            >
              いまのプランのままにする
            </button>
          </div>
        </div>
      )}

      {undo && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-muted/40 px-4 py-3 print:hidden">
          <p className="text-sm font-semibold">
            プランを消しました（{undo.entries.length}ヶ所・
            {new Set(undo.entries.map((entry) => entry.day)).size}日分）
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                replacePlan(undo.entries, undo.startDate);
                setUndo(null);
              }}
              className="inline-flex items-center gap-1.5 rounded-full bg-indigo-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-indigo-700"
            >
              <Undo2 className="h-3.5 w-3.5" aria-hidden />
              元に戻す
            </button>
            <button
              type="button"
              onClick={() => setUndo(null)}
              className="rounded-full px-3 py-2 text-xs font-semibold text-muted-foreground transition hover:text-foreground"
            >
              閉じる
            </button>
          </div>
        </div>
      )}

      {spotCount === 0 ? (
        <PlanStarter spots={spots} />
      ) : (
        <>
          {/*
            合計はこの道具の答えそのものなので、いちばん大きく出す。
            以前は他の操作ボタンと同じ帯に小さく並べていた。
          */}
          <div className="space-y-4 rounded-2xl border border-border bg-muted/40 px-4 py-4 print:border-0 print:bg-transparent print:px-0">
            <dl className="flex flex-wrap items-end gap-x-8 gap-y-3">
              <Stat label="日数" value={`${days.length}日`} />
              <Stat label="スポット" value={`${spotCount}ヶ所`} />
              <Stat
                label="入場料の合計（大人1人）"
                value={formatGbp(totalGbp)}
                note={
                  unknownPriceCount > 0
                    ? `${unknownPriceCount}ヶ所は料金不明のため未計上`
                    : undefined
                }
              />
              <Stat
                label="滞在と移動の合計"
                value={formatMinutes(totalMinutes)}
              />
            </dl>

            <div className="flex flex-wrap gap-2 print:hidden">
              <button
                type="button"
                onClick={handleShare}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-2 text-xs font-semibold transition hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5" aria-hidden />
                ) : (
                  <Link2 className="h-3.5 w-3.5" aria-hidden />
                )}
                {copied ? "コピーしました" : "共有リンクを作る"}
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-2 text-xs font-semibold transition hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400"
              >
                <Printer className="h-3.5 w-3.5" aria-hidden />
                印刷する
              </button>
              {/*
                消す色を最初から着せている。以前は灰色で、押すまで
                赤くならなかった。ホバーの無いスマホでは共有・印刷と
                見分けがつかず、3つ並んだうちの淡い文字として読み飛ばされる。
              */}
              <button
                type="button"
                onClick={() => setConfirmingClear(true)}
                aria-expanded={confirmingClear}
                className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-background px-3 py-2 text-xs font-semibold text-red-600 transition hover:border-red-400 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/40"
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden />
                すべて消す
              </button>
            </div>

            {/*
              確認は押した場所の真下に出す。何ヶ所・何日分が消えるのかを
              書けるのがOSのダイアログとの違いで、この画面でいちばん
              間違えやすいのが「1日目だけ消すつもりだった」なので、
              消える量を数で見せてから押させる。
            */}
            {confirmingClear && (
              <div className="space-y-3 rounded-xl border border-red-300 bg-red-50 p-4 print:hidden dark:border-red-900 dark:bg-red-950/30">
                <p className="text-sm font-semibold text-red-900 dark:text-red-200">
                  {spotCount}ヶ所・{days.length}日分をすべて消します
                </p>
                <p className="text-xs leading-relaxed text-red-800 dark:text-red-300">
                  出発日の設定も一緒に消えます。消したあと、この画面を
                  離れるまでは「元に戻す」で戻せます。
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleClear}
                    autoFocus
                    className="rounded-full bg-red-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-red-700"
                  >
                    すべて消す
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmingClear(false)}
                    className="rounded-full border border-red-300 bg-background px-4 py-2 text-xs font-semibold transition hover:border-red-500 dark:border-red-900"
                  >
                    やめる
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="print:hidden">
            <PlanDateBar dayCount={days.length} />
          </div>

          {shareUrl && (
            <div className="space-y-2 rounded-2xl border border-border p-4 print:hidden">
              <p className="text-xs text-muted-foreground">
                このURLを開くと同じプランが復元されます。同行者に送ってください。
                プランはブラウザにだけ保存されているので、機種変更のときも
                このリンクから持ち出せます。
              </p>
              <input
                type="text"
                readOnly
                value={shareUrl}
                onFocus={(e) => e.currentTarget.select()}
                aria-label="共有リンク"
                className="w-full rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs"
              />
            </div>
          )}

          <div className="space-y-6">
            {days.map((day) => (
              <PlanDay
                key={day.day}
                plan={day}
                dayCount={days.length}
                date={dateForDay(startDate, day.day)}
              />
            ))}
          </div>
        </>
      )}

      <section className="space-y-3 rounded-2xl border border-border p-4 print:hidden sm:p-5">
        <h2 className="flex items-center gap-2 text-base font-bold tracking-tight">
          <Plus className="h-4 w-4 text-indigo-600" aria-hidden />
          スポットを追加する
        </h2>
        <p className="text-xs text-muted-foreground">
          追加したスポットは最終日に入ります。日を移すには、各スポットの
          「◯日目」から選び直してください。
          {spotCount >= MAX_SPOTS && (
            <span className="font-semibold text-amber-700 dark:text-amber-400">
              {" "}
              上限の{MAX_SPOTS}ヶ所に達しています。
            </span>
          )}
        </p>
        <PlanSpotPicker spots={spots} />
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note?: string;
}) {
  return (
    <div>
      <dt className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </dt>
      <dd className="text-2xl font-bold tabular-nums">{value}</dd>
      {note && <p className="text-[10px] text-muted-foreground">{note}</p>}
    </div>
  );
}
