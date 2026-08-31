"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Check, Link2, MapPin, Plus, Trash2 } from "lucide-react";

import {
  buildDayPlan,
  decodePlan,
  encodePlan,
  formatGbp,
  MAX_SPOTS,
  type PlanEntry,
  type PlanSpot,
} from "@/lib/sightseeing/plan";
import PlanDay from "./PlanDay";
import PlanSpotPicker from "./PlanSpotPicker";
import {
  clearPlan,
  readPlan,
  replacePlan,
  usePlanEntries,
} from "./plan-store";

const SHARE_PARAM = "spots";

/** 共有リンクを開いたあと、アドレス欄から ?spots= を落とす。 */
function stripShareParam() {
  const url = new URL(window.location.href);
  url.searchParams.delete(SHARE_PARAM);
  window.history.replaceState(null, "", `${url.pathname}${url.search}`);
}

/**
 * 旅行プランの本体。公開中の全スポットを受け取り、
 * 保存されている slug を突き合わせて日別に組み立てる。
 *
 * 保存しているのが slug だけなので、料金や開館時間はここで引き直した
 * 最新の値になる。ブラウザに数ヶ月前のプランが残っていても、
 * 出る数字は今のもの。
 */
export default function PlanBuilder({ spots }: { spots: PlanSpot[] }) {
  const entries = usePlanEntries();
  const [incoming, setIncoming] = useState<PlanEntry[] | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

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
    const param = new URLSearchParams(window.location.search).get(SHARE_PARAM);
    if (!param) return;

    const decoded = decodePlan(param).filter((entry) => bySlug.has(entry.slug));
    if (decoded.length === 0) {
      stripShareParam();
      return;
    }

    // 描画時のスナップショットではなく保存内容を直接読む。
    // localStorage の読み込み前だと空に見えてしまうため。
    const current = readPlan();
    if (current.length === 0) {
      replacePlan(decoded);
      stripShareParam();
      return;
    }
    if (encodePlan(current) === encodePlan(decoded)) {
      stripShareParam();
      return;
    }
    setIncoming(decoded);
  }, [bySlug]);

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
      ),
    );
  }, [entries, bySlug]);

  const spotCount = days.reduce((sum, day) => sum + day.rows.length, 0);
  const totalGbp = days.reduce((sum, day) => sum + day.totalGbp, 0);
  const unknownPriceCount = days.reduce(
    (sum, day) => sum + day.unknownPriceCount,
    0,
  );

  const handleShare = async () => {
    const url = `${window.location.origin}/sightseeing/plan?${SHARE_PARAM}=${encodePlan(entries)}`;
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

  const handleClear = () => {
    if (window.confirm("プランをすべて消します。元に戻せません。")) {
      clearPlan();
      setShareUrl(null);
    }
  };

  return (
    <div className="space-y-8">
      {incoming && (
        <div className="space-y-3 rounded-2xl border border-indigo-300 bg-indigo-50 p-4 dark:border-indigo-800 dark:bg-indigo-950/40">
          <p className="text-sm font-semibold text-indigo-900 dark:text-indigo-200">
            共有されたプランが開かれています（
            {incoming.length}ヶ所・
            {new Set(incoming.map((entry) => entry.day)).size}日間）
          </p>
          <p className="text-xs leading-relaxed text-indigo-800 dark:text-indigo-300">
            いま保存されているあなたのプラン（{entries.length}ヶ所）とは別のものです。
            入れ替えると、いまのプランは戻せません。
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                replacePlan(incoming);
                setIncoming(null);
                stripShareParam();
              }}
              className="rounded-full bg-indigo-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-indigo-700"
            >
              共有されたプランに入れ替える
            </button>
            <button
              type="button"
              onClick={() => {
                setIncoming(null);
                stripShareParam();
              }}
              className="rounded-full border border-indigo-300 bg-background px-4 py-2 text-xs font-semibold transition hover:border-indigo-500 dark:border-indigo-800"
            >
              いまのプランのままにする
            </button>
          </div>
        </div>
      )}

      {spotCount === 0 ? (
        <EmptyState />
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-muted/40 px-4 py-4">
            <dl className="flex flex-wrap items-center gap-x-6 gap-y-2">
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
            </dl>

            <div className="flex flex-wrap gap-2">
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
                onClick={handleClear}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-2 text-xs font-semibold text-muted-foreground transition hover:border-red-400 hover:text-red-600 dark:hover:text-red-400"
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden />
                すべて消す
              </button>
            </div>
          </div>

          {shareUrl && (
            <div className="space-y-2 rounded-2xl border border-border p-4">
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
              <PlanDay key={day.day} plan={day} dayCount={days.length} />
            ))}
          </div>
        </>
      )}

      <section className="space-y-3 rounded-2xl border border-border p-4 sm:p-5">
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
      <dd className="text-lg font-bold tabular-nums">{value}</dd>
      {note && <p className="text-[10px] text-muted-foreground">{note}</p>}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-border px-6 py-10 text-center">
      <MapPin className="mx-auto h-8 w-8 text-muted-foreground" aria-hidden />
      <p className="mt-3 text-sm font-semibold">
        まだスポットが入っていません
      </p>
      <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-muted-foreground">
        下の検索から足すか、
        <Link
          href="/sightseeing/all"
          className="underline underline-offset-2 hover:text-foreground"
        >
          観光スポット一覧
        </Link>
        ・各スポットのページにある「旅行プランに追加」から選んでください。
        どこから始めるか決まっていないなら、
        <Link
          href="/sightseeing/itinerary"
          className="underline underline-offset-2 hover:text-foreground"
        >
          モデルコース
        </Link>
        の順路をなぞって足していくのが早いです。
      </p>
    </div>
  );
}
