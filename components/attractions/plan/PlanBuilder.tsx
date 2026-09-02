"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { ChevronDown, Map as MapIcon, Plus, Undo2 } from "lucide-react";

import {
  buildDayPlan,
  decodePlan,
  encodePlan,
  hasRealLocation,
  MAX_DAYS,
  type PlanEntry,
  type PlanSpot,
} from "@/lib/plan";
import { dateForDay, parseIsoDate } from "@/lib/plan/dates";
import PlanAddSheet from "./PlanAddSheet";
import PlanDay from "./PlanDay";
import PlanDateBar from "./PlanDateBar";
import PlanSpotPicker from "./PlanSpotPicker";
import PlanStarter from "./PlanStarter";
import PlanSummaryBar from "./PlanSummaryBar";
import type { DragState, DropTarget } from "./drag";
import {
  clearDay,
  clearPlan,
  moveToDayAt,
  readPlan,
  readSnapshot,
  readStartDate,
  replacePlan,
  restoreSnapshot,
  usePlanEntries,
  usePlanStartDate,
  usePlanStartMinutes,
  type PlanSnapshot,
} from "./plan-store";

/**
 * 地図は leaflet が window を触るのでサーバーでは描けない。
 * ここで分けておくと、地図を開かない読者には bundle も届かない。
 */
const PlanTripMap = dynamic(() => import("./PlanTripMap"), {
  ssr: false,
  loading: () => <div className="h-[300px] w-full animate-pulse bg-muted" />,
});

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
 * 保存しているのが slug と出発日・開始時刻だけなので、料金や開館時間は
 * ここで引き直した最新の値になる。ブラウザに数ヶ月前のプランが残っていても、
 * 出る数字は今のもの。
 *
 * 画面は広いところで2枚に割る。左に日割り、右に地図を貼りつけたまま
 * 残すのは、旅程を直す作業がずっと「並びを変える → 順路を見る」の
 * 往復だから。地図が本文の中にあると、その往復のたびにスクロールが要る。
 * 狭い画面では地図が日割りの上に来る(同じ1枚を CSS の order で動かして
 * いるので、地図の実体は最後まで1つ)。
 */
export default function PlanBuilder({ spots }: { spots: PlanSpot[] }) {
  const entries = usePlanEntries();
  const startDate = usePlanStartDate();
  const startMinutes = usePlanStartMinutes();
  const [incoming, setIncoming] = useState<{
    entries: PlanEntry[];
    startDate: string | null;
  } | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [confirmingClear, setConfirmingClear] = useState(false);
  /** 追加の引き出し。開いていればその行き先の日。 */
  const [addingDay, setAddingDay] = useState<number | null>(null);
  /** 地図が寄っている日。null なら全日程。 */
  const [focusDay, setFocusDay] = useState<number | null>(null);
  const [mapOpen, setMapOpen] = useState(false);
  /**
   * これから連れていく先の id。
   *
   * 地図を開くのと同じ操作で移動すると、押した時点ではまだ地図が
   * 入っていない。その場で scrollIntoView を呼ぶと、地図が入るぶんだけ
   * 下へずれた位置に着く。描画が終わってから動かすために1手ためる。
   */
  const [scrollTo, setScrollTo] = useState<string | null>(null);
  /**
   * 消したものの写し。「元に戻す」が押されるまで持っておく。
   *
   * countAfter は消した直後の件数。ここから件数が動いたら、読者は次の
   * 一手を打っている——そのあとに戻すと、いま組みはじめたぶんを消すことになる。
   */
  const [undo, setUndo] = useState<{
    label: string;
    snapshot: PlanSnapshot;
    countAfter: number;
  } | null>(null);
  const [drag, setDrag] = useState<DragState>(null);
  const [drop, setDrop] = useState<DropTarget>(null);

  const bySlug = useMemo(
    () => new Map(spots.map((spot) => [spot.slug, spot])),
    [spots],
  );

  /*
   * 広い画面では地図を開いた状態から始める。
   *
   * 貼りついた地図は本文を押しのけないので、開いていて損が無い。狭い画面は
   * 逆で、開いたままだと日割りが1画面ぶん下がる。SSR では画面幅が分からない
   * ので、判定は描画後に1度だけ。
   */
  useEffect(() => {
    if (window.matchMedia("(min-width: 1024px)").matches) setMapOpen(true);
  }, []);

  useEffect(() => {
    if (!scrollTo) return;
    document
      .getElementById(scrollTo)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
    setScrollTo(null);
  }, [scrollTo]);

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
   * 消したあとで中身が動いたら「元に戻す」を引っ込める。
   *
   * ひな形を読み込んだり新しく足したりしたあとに残っていると、
   * それを押した人は消える側の中身を戻すつもりで、いま組みはじめた
   * ぶんを消すことになる。取り消しは直後の一手だけに効かせる。
   */
  useEffect(() => {
    if (undo && entries.length !== undo.countAfter) setUndo(null);
  }, [entries, undo]);

  // 確認を開いたまま最後の1件を「外す」で消すと、下の塊ごと畳まれて
  // 開いた状態が残る。次に何かを足したとき、押していない確認が
  // いきなり出るので閉じておく。
  useEffect(() => {
    if (entries.length === 0) {
      setConfirmingClear(false);
      setAddingDay(null);
      setFocusDay(null);
    }
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
        { date: dateForDay(startDate, day), overrides, startMinutes },
      ),
    );
  }, [entries, bySlug, startDate, overrides, startMinutes]);

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

  /** 地図に渡す形。順路は日ごとに別々の線になる。 */
  const mapDays = useMemo(
    () => days.map((day) => ({ day: day.day, spots: day.rows.map((r) => r.spot) })),
    [days],
  );

  /*
   * 地図に載るスポットが1つも無いプランがありうる。ロンドンパスや
   * 周遊バスのような商品だけを入れた場合で、そこは座標が便宜的な一点
   * でしかないので載せていない。枠と但し書きだけが残ると壊れて見える。
   */
  const hasMappable = mapDays.some((day) => day.spots.some(hasRealLocation));

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
  const handleClearAll = () => {
    setUndo({
      label: `${spotCount}ヶ所・${days.length}日分をすべて消しました`,
      snapshot: readSnapshot(),
      countAfter: 0,
    });
    clearPlan();
    setConfirmingClear(false);
    setShareUrl(null);
    // 消すとページが一気に短くなり、ブラウザが位置を切り詰めて
    // 下端に落ちる。「元に戻す」は上に出るので、そこまで連れていく。
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /*
   * 1日ぶんを空にする。全消しと違って確認を挟まない。
   *
   * 消える量が1日ぶんに限られていて、その中身が画面に出たまま押すことに
   * なるうえ、直後に「元に戻す」が出る。ここで確認を挟むと、5日ぶんを
   * 整理する間に5回同じ確認を読むことになる。
   */
  const handleClearDay = (day: number) => {
    const removed = entries.filter((entry) => entry.day === day).length;
    if (removed === 0) return;
    setUndo({
      label: `${day}日目の${removed}ヶ所を外しました`,
      snapshot: readSnapshot(),
      countAfter: entries.length - removed,
    });
    clearDay(day);
  };

  /** 掴んだものを落とす。落ちる位置が決まっていなければ何もしない。 */
  const handleDrop = useCallback(() => {
    if (drag && drop) {
      let index = drop.index;
      // 落ちる位置は「抜く前の並び」で数えてある。同じ日の中で後ろへ
      // 動かすときだけ、抜いたぶん1つ手前にずれる。
      if (drag.day === drop.day && drag.index < index) index -= 1;
      moveToDayAt(drag.slug, drop.day, index);
    }
    setDrag(null);
    setDrop(null);
  }, [drag, drop]);

  const openAdd = (day: number) => setAddingDay(day);

  /**
   * 上の日程チップ。押した日へ連れていき、地図もその日に寄せる。
   * 同じ日をもう一度押すと全日程に戻す。
   */
  const selectDay = (day: number | null) => {
    const next = focusDay === day ? null : day;
    setFocusDay(next);
    if (next === null) return;
    setMapOpen(true);
    setScrollTo(`plan-day-${next}`);
  };

  /**
   * 日のカードにある「この日を地図で」。
   *
   * 広い画面では地図が右に貼りついたままなので、寄せるだけでよい。
   * 狭い画面では地図が日割りの上にあり、押した位置からは見えないので
   * 地図まで連れていく。ここで日のカードへ戻すと、押した場所に
   * 戻ってくるだけで何も起きていないように見える。
   */
  const showDayOnMap = (day: number) => {
    setFocusDay(day);
    setMapOpen(true);
    if (!window.matchMedia("(min-width: 1024px)").matches) {
      setScrollTo("plan-map");
    }
  };

  return (
    <div className="space-y-6">
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
          <p className="text-sm font-semibold">{undo.label}</p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                restoreSnapshot(undo.snapshot);
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
        <>
          <PlanStarter spots={spots} />

          {/*
            空のときは畳まない。押し下げる日割りがまだ無いうえ、ひな形が
            どれも刺さらなかった人にとっては、ここが唯一の入口になる。
          */}
          <section className="space-y-3 rounded-2xl border border-border p-4 print:hidden sm:p-5">
            <h2 className="flex items-center gap-2 text-base font-bold tracking-tight">
              <Plus className="h-4 w-4 text-indigo-600" aria-hidden />
              行き先を直接えらぶ
            </h2>
            <p className="text-xs text-muted-foreground">
              エリアや種類で絞り込めます。選んだものは1日目に入り、
              あとから日を分けられます。
            </p>
            <PlanSpotPicker spots={spots} />
          </section>
        </>
      ) : (
        <>
          <PlanSummaryBar
            days={days}
            spotCount={spotCount}
            totalGbp={totalGbp}
            totalMinutes={totalMinutes}
            unknownPriceCount={unknownPriceCount}
            focusDay={focusDay}
            onSelectDay={selectDay}
            onAdd={() => openAdd(days.length)}
            onShare={handleShare}
            onPrint={() => window.print()}
            onClear={() => setConfirmingClear(true)}
            shareCopied={copied}
          />

          {/*
            確認は本文の先頭に出す。何ヶ所・何日分が消えるのかを書けるのが
            OSのダイアログとの違いで、この画面でいちばん間違えやすいのが
            「1日目だけ消すつもりだった」なので、消える量を数で見せてから押させる。
          */}
          {confirmingClear && (
            <div className="space-y-3 rounded-2xl border border-red-300 bg-red-50 p-4 print:hidden dark:border-red-900 dark:bg-red-950/30">
              <p className="text-sm font-semibold text-red-900 dark:text-red-200">
                {spotCount}ヶ所・{days.length}日分をすべて消します
              </p>
              <p className="text-xs leading-relaxed text-red-800 dark:text-red-300">
                出発日と開始時刻の設定も一緒に消えます。消したあと、この画面を
                離れるまでは「元に戻す」で戻せます。1日だけ消したいなら、
                その日の見出しにある消しゴムのボタンを使ってください。
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleClearAll}
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

          <PlanDateBar dayCount={days.length} />

          {/*
            2枚組み。地図は DOM 上ここ1箇所にしかなく、広い画面では
            order で右へ回している。狭い画面と広い画面で別々に置くと、
            タイルを2面ぶん取りに行くことになる。
          */}
          <div
            // 紙では1枚に戻す。lg の指定は印刷にも効くので、そのままだと
            // 消したはずの右の列ぶんだけ本文が細くなる。地図に載るものが
            // 何も無いプランでも同じことが起きるので、そのときは割らない。
            className={`print:block ${
              hasMappable
                ? "lg:grid lg:grid-cols-[minmax(0,1fr)_19rem] lg:items-start lg:gap-6"
                : ""
            }`}
            onDrop={handleDrop}
            onDragOver={(e) => {
              // 落とせる場所であることをブラウザに伝える。これが無いと
              // 行の上でも「禁止」のカーソルになる。
              if (drag) e.preventDefault();
            }}
          >
            {hasMappable && (
              <aside
                id="plan-map"
                className="mb-6 scroll-mt-36 lg:sticky lg:top-32 lg:order-2 lg:mb-0 print:hidden"
              >
                <button
                  type="button"
                  onClick={() => setMapOpen((open) => !open)}
                  aria-expanded={mapOpen}
                  className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold transition hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                >
                  <MapIcon className="h-3.5 w-3.5" aria-hidden />
                  {mapOpen ? "地図を閉じる" : "順路を地図で見る"}
                  <ChevronDown
                    className={`h-3.5 w-3.5 transition ${mapOpen ? "rotate-180" : ""}`}
                    aria-hidden
                  />
                </button>

                {mapOpen && (
                  <div className="overflow-hidden rounded-2xl border border-border">
                    <PlanTripMap
                      days={mapDays}
                      focusDay={focusDay}
                      className="h-[300px] w-full lg:h-[calc(100vh-16rem)] lg:min-h-[360px]"
                    />
                    <p className="border-t border-border bg-muted/30 px-3 py-2 text-[11px] leading-relaxed text-muted-foreground">
                      {focusDay
                        ? `${focusDay}日目だけを濃く出しています。上の日程から「全日程」を選ぶと戻ります。`
                        : "色は日の色と同じです。線は直線で結んだもので、実際に歩く道のりではありません。"}
                    </p>
                  </div>
                )}
              </aside>
            )}

            <div className="space-y-5 lg:order-1">
              {days.map((day) => (
                <PlanDay
                  key={day.day}
                  plan={day}
                  dayCount={days.length}
                  date={dateForDay(startDate, day.day)}
                  focused={focusDay === day.day}
                  onFocus={() => showDayOnMap(day.day)}
                  onAdd={() => openAdd(day.day)}
                  onClear={() => handleClearDay(day.day)}
                  drag={drag}
                  drop={drop}
                  onDragStart={setDrag}
                  onDragEnd={() => {
                    setDrag(null);
                    setDrop(null);
                  }}
                  onDropTarget={setDrop}
                />
              ))}

              {days.length < MAX_DAYS && (
                <button
                  type="button"
                  onClick={() => openAdd(days.length + 1)}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border px-4 py-3.5 text-sm font-bold text-muted-foreground transition hover:border-indigo-400 hover:text-indigo-600 print:hidden dark:hover:text-indigo-400"
                >
                  <Plus className="h-4 w-4" aria-hidden />
                  {days.length + 1}日目を作る
                </button>
              )}
            </div>
          </div>
        </>
      )}

      <PlanAddSheet
        open={addingDay !== null}
        onOpenChange={(open) => setAddingDay(open ? addingDay : null)}
        spots={spots}
        day={addingDay ?? 1}
        dayCount={days.length}
      />
    </div>
  );
}
