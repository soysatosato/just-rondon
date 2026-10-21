"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { ChevronDown, Map as MapIcon, Plus, Undo2 } from "lucide-react";

import {
  buildDayPlan,
  decodePlan,
  DEFAULT_START_MINUTES,
  encodePlan,
  hasRealLocation,
  isValidStartMinutes,
  MAX_DAYS,
  MAX_SPOTS,
  type PlanEntry,
  type PlanSpot,
} from "@/lib/plan";
import { londonPassVerdict, tripTransport } from "@/lib/plan/costs";
import { dateForDay, formatPlanDate, parseIsoDate } from "@/lib/plan/dates";
import { savedPlanContent } from "@/lib/plan/saved";
import { useHomeZone } from "./home-zone";
import PlanAddSheet from "./PlanAddSheet";
import PlanCostPanel from "./PlanCostPanel";
import PlanDay from "./PlanDay";
import PlanDateBar from "./PlanDateBar";
import PlanSpotPicker from "./PlanSpotPicker";
import PlanStarter from "./PlanStarter";
import PlanSummaryBar from "./PlanSummaryBar";
import PlanSyncStatus from "./PlanSyncStatus";
import type { DragState, DropTarget } from "./drag";
import {
  appendDays,
  clearDay,
  clearPlan,
  moveToDayAt,
  readPlan,
  readSnapshot,
  readStartDate,
  removeFromPlan,
  replacePlan,
  restoreSnapshot,
  usePlanEntries,
  usePlanHydrated,
  usePlanStartDate,
  usePlanStartMinutes,
  type PlanSnapshot,
} from "./plan-store";
import { resolvePlanConflict, usePlanSyncStatus } from "./plan-sync";
import { trackPlan } from "./track";

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
/** 宿を出る時刻(0時からの分)。既定の9:00なら付けない。 */
const FROM_PARAM = "from";
/** リンクの出どころ。サイト内のボタンが付ける(イルミの順路など)。 */
const SOURCE_PARAM = "src";

/**
 * 出どころごとの呼び名。取り込みの帯の見出しに出す。
 *
 * サイト内のボタンから開いたものまで「共有されたプラン」と呼ぶと、
 * 誰かから送られてきたものに見え、自分のプランに足せるものだと分からない。
 */
const SOURCE_LABELS: Record<string, string> = {
  lights: "クリスマスのイルミの順路",
};

/** 共有リンクを開いたあと、アドレス欄から取り込み用のクエリを落とす。 */
function stripShareParams() {
  const url = new URL(window.location.href);
  for (const key of [SHARE_PARAM, START_PARAM, FROM_PARAM, SOURCE_PARAM]) {
    url.searchParams.delete(key);
  }
  window.history.replaceState(null, "", `${url.pathname}${url.search}`);
}

/**
 * 共有リンクの URL。
 *
 * URLSearchParams を通さずに組み立てる。encodePlan の区切り(. と _ と ~)は
 * percent-encode されない文字だが、通すと読みにくくなる書き方に化けるものが
 * ある。共有リンクは人が LINE やメールに貼るので見た目のまま残す。
 */
function buildShareUrl(
  entries: PlanEntry[],
  startDate: string | null,
  startMinutes: number,
): string {
  const query = [
    `${SHARE_PARAM}=${encodePlan(entries)}`,
    startDate ? `${START_PARAM}=${startDate}` : null,
    startMinutes !== DEFAULT_START_MINUTES ? `${FROM_PARAM}=${startMinutes}` : null,
  ]
    .filter(Boolean)
    .join("&");
  return `${window.location.origin}/plan?${query}`;
}

/** 「5ヶ所・2日間・10月3日(金)から」。2つのプランを見比べてもらうときの一言。 */
function describePlan(entries: PlanEntry[], startDate: string | null): string {
  const days = new Set(entries.map((entry) => entry.day)).size;
  const start = parseIsoDate(startDate);
  return [
    entries.length === 0 ? "空" : `${entries.length}ヶ所・${days}日間`,
    start && entries.length > 0 ? `${formatPlanDate(start)}から` : null,
  ]
    .filter(Boolean)
    .join("・");
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
  const hydrated = usePlanHydrated();
  const entries = usePlanEntries();
  const startDate = usePlanStartDate();
  const startMinutes = usePlanStartMinutes();
  const homeZone = useHomeZone();
  const syncStatus = usePlanSyncStatus();
  const signedIn =
    syncStatus.kind !== "pending" && syncStatus.kind !== "off";
  const [incoming, setIncoming] = useState<{
    entries: PlanEntry[];
    startDate: string | null;
    /** 送った人の宿を出る時刻。リンクに無ければ null。 */
    startMinutes: number | null;
    /** 出どころの呼び名。サイト内のボタンなら「クリスマスのイルミの順路」など。 */
    label: string;
    /** サイト内のボタンから開いたか。足すのが主な使い方になる。 */
    fromSite: boolean;
    /** 計測に添える出どころ。リンクに src が無ければ "share"。 */
    source: string;
  } | null>(null);
  /**
   * 共有リンクの欄を開いているか。
   *
   * 以前は URL そのものを state に置いていたので、欄を開いたあとで
   * プランを直しても古い URL が残り、手で写すと直す前のプランが届いた。
   * URL はいまの中身から毎回作る(shareUrl)。
   */
  const [shareOpen, setShareOpen] = useState(false);
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
  /** 一覧に無く、/api/plan/spots から引き直せたスポット。 */
  const [extraSpots, setExtraSpots] = useState<ReadonlyMap<string, PlanSpot>>(
    () => new Map(),
  );
  /**
   * 引き直しても公開中ではなかった slug。値は伏せた催しの名前で、
   * DB にも無ければ null。
   */
  const [goneSpots, setGoneSpots] = useState<ReadonlyMap<string, string | null>>(
    () => new Map(),
  );

  const bySlug = useMemo(() => {
    const map = new Map(spots.map((spot) => [spot.slug, spot]));
    for (const [slug, spot] of extraSpots) map.set(slug, spot);
    return map;
  }, [spots, extraSpots]);

  /*
   * アカウントのプランとこのブラウザのプランが両方変わっていたときの、
   * アカウント側の中身。数えるのは公開中のスポットだけ——伏せた催しの
   * slug まで数えると、選んだあとに開くプランと件数が食い違う。
   */
  const conflictRemote = useMemo(() => {
    if (syncStatus.kind !== "conflict") return null;
    const remote = savedPlanContent(syncStatus.remote);
    return {
      ...remote,
      entries: remote.entries.filter((entry) => bySlug.has(entry.slug)),
    };
  }, [syncStatus, bySlug]);

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
   * 一覧に無い slug を引き直す。
   *
   * 以前はここで「非公開になったスポット」とみなし、保存からも消していた。
   * ところが一覧はページと一緒に最長1時間キャッシュされるので、一覧に無い
   * ことは「伏せた」とは限らない。新しく載せたスポットを詳細ページから
   * 足した読者は、/plan を開いた瞬間にそれを失っていた(2026-10 の監査)。
   * いまは消さずに問い合わせ、公開中なら行として足し、伏せたものは
   * 名前を添えて知らせる。外すかどうかは読者が決める。
   */
  const unknownKey = useMemo(
    () =>
      [...new Set(entries.map((entry) => entry.slug))]
        .filter((slug) => !bySlug.has(slug) && !goneSpots.has(slug))
        .sort()
        .join(","),
    [entries, bySlug, goneSpots],
  );

  useEffect(() => {
    if (!unknownKey) return;
    const asked = unknownKey.split(",");
    let cancelled = false;
    fetch(`/api/plan/spots?slugs=${unknownKey}`)
      .then((res) => (res.ok ? res.json() : null))
      .then(
        (
          data: {
            spots?: PlanSpot[];
            hidden?: { slug: string; name: string }[];
          } | null,
        ) => {
          if (cancelled || !data) return;
          const found = new Map(
            (data.spots ?? []).map((spot) => [spot.slug, spot] as const),
          );
          const hidden = new Map(
            (data.hidden ?? []).map((row) => [row.slug, row.name] as const),
          );
          if (found.size > 0) {
            setExtraSpots((prev) => new Map([...prev, ...found]));
          }
          setGoneSpots((prev) => {
            const next = new Map(prev);
            for (const slug of asked) {
              if (!found.has(slug)) next.set(slug, hidden.get(slug) ?? null);
            }
            return next;
          });
        },
      )
      // 通信できなければ何もしない。行は保存に残っていて、次に開いたときに引き直す。
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [unknownKey]);

  const goneEntries = entries.filter((entry) => goneSpots.has(entry.slug));

  /*
   * 共有リンクの取り込み。
   *
   * 自分のプランを黙って上書きしない。旅程は作るのに時間がかかるもので、
   * 同行者からリンクが届いたときに消えるのがいちばん困る。
   * 空のときだけ自動で開き、中身があるときは選ばせる(足す・入れ替える・
   * やめる)。サイト内のボタン(イルミの順路など)も同じ口から入ってくる。
   */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const param = params.get(SHARE_PARAM);
    if (!param) return;

    // 一覧に無い slug もここでは落とさない。一覧が古いだけのこともあり、
    // 取り込んだあとで引き直す(上の unknownKey)。
    const decoded = decodePlan(param);
    if (decoded.length === 0) {
      stripShareParams();
      return;
    }
    // 日付の形をしていないものは捨てる。相手の旅程がずれるより出ないほうがよい。
    const incomingStart = parseIsoDate(params.get(START_PARAM))
      ? params.get(START_PARAM)
      : null;
    const from = Number(params.get(FROM_PARAM));
    const incomingStartMinutes = isValidStartMinutes(from) ? from : null;
    const source = params.get(SOURCE_PARAM);
    const sourceLabel = source ? SOURCE_LABELS[source] : undefined;

    // 描画時のスナップショットではなく保存内容を直接読む。
    // localStorage の読み込み前だと空に見えてしまうため。
    const current = readPlan();
    if (current.length === 0) {
      replacePlan(decoded, incomingStart, incomingStartMinutes ?? undefined);
      trackPlan("import", { mode: "auto", src: source ?? "share" });
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
    setIncoming({
      entries: decoded,
      startDate: incomingStart,
      startMinutes: incomingStartMinutes,
      label: sourceLabel ?? "共有されたプラン",
      fromSite: Boolean(sourceLabel),
      source: source ?? "share",
    });
  }, []);

  /*
   * 取り込みを受ける。どちらを選んでも「元に戻す」を出す。
   *
   * 以前は入れ替えると戻せず、帯にも「戻せません」と書いていた。中身を
   * 件数でしか見せずに入れ替えさせる以上、戻せないと押せない。
   */
  const acceptIncoming = (mode: "append" | "replace") => {
    if (!incoming) return;
    trackPlan("import", { mode, src: incoming.source });
    const snapshot = readSnapshot();
    if (mode === "replace") {
      replacePlan(
        incoming.entries,
        incoming.startDate,
        incoming.startMinutes ?? undefined,
      );
      setUndo({
        label: `${incoming.label}に入れ替えました`,
        snapshot,
        countAfter: incoming.entries.length,
      });
    } else {
      const { added, skipped, firstDay } = appendDays(incoming.entries);
      // 足した結果の最終日。足せなかった日があれば詰まるので、実物から数える。
      const lastAdded = readPlan().reduce(
        (max, entry) => Math.max(max, entry.day),
        0,
      );
      if (added > 0) {
        setUndo({
          label:
            `${added}ヶ所を${firstDay}日目${lastAdded > firstDay ? `〜${lastAdded}日目` : ""}に足しました` +
            (skipped > 0
              ? `(すでに入っていたものなど${skipped}ヶ所は足していません)`
              : ""),
          snapshot,
          countAfter: snapshot.entries.length + added,
        });
      }
    }
    setIncoming(null);
    stripShareParams();
  };

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

  /*
   * 交通費とロンドンパスの損得。どちらも旅程全体を見ないと出ない
   * (週の上限額は月曜で区切られ、パスは連続した日数で切れる)ので、
   * 日ごとの buildDayPlan とは別にここで1度だけ組む。
   */
  const transport = useMemo(
    () => tripTransport(days, homeZone, startDate),
    [days, homeZone, startDate],
  );
  const pass = useMemo(() => londonPassVerdict(days), [days]);

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

  /** 開いている間は、いまの中身から作り直す。欄の URL が直す前のまま残らない。 */
  const shareUrl = useMemo(
    () => (shareOpen ? buildShareUrl(entries, startDate, startMinutes) : null),
    [shareOpen, entries, startDate, startMinutes],
  );

  const handleShare = async () => {
    const url = buildShareUrl(entries, startDate, startMinutes);
    setShareOpen(true);
    trackPlan("share");
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
    trackPlan("clear", { scope: "all" });
    setConfirmingClear(false);
    setShareOpen(false);
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
    trackPlan("clear", { scope: "day" });
  };

  /*
   * 食い違いを片付ける。どちらを選んでも「元に戻す」を出す。
   *
   * 選ばなかったほうは、アカウントからもこのブラウザからも消える。
   * 2つの件数だけを見て選ぶので、開いてみたら思っていたほうではなかった、
   * は起きうる。戻すと、選ばなかったほうがこのブラウザのプランになり、
   * それがまたアカウントへ送られる。
   */
  const keepAccountPlan = () => {
    if (!conflictRemote) return;
    setUndo({
      label: "アカウントに保存されていたプランに入れ替えました",
      snapshot: readSnapshot(),
      countAfter: conflictRemote.entries.length,
    });
    resolvePlanConflict("remote");
    trackPlan("conflict", { choice: "remote" });
  };

  const keepBrowserPlan = () => {
    if (!conflictRemote) return;
    setUndo({
      label: "このブラウザのプランをアカウントに保存しました",
      snapshot: { ...conflictRemote, entries: [...conflictRemote.entries] },
      countAfter: entries.length,
    });
    resolvePlanConflict("local");
    trackPlan("conflict", { choice: "local" });
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

  /** いまのプランの最終日。取り込みを後ろに足すときの起点。 */
  const lastPlanDay = entries.reduce((max, entry) => Math.max(max, entry.day), 0);
  const incomingDays = incoming
    ? [...new Set(incoming.entries.map((entry) => entry.day))].sort((a, b) => a - b)
    : [];
  const inPlan = new Set(entries.map((entry) => entry.slug));
  /** 1ヶ所でも足せるか。日数・ヶ所数の上限と、すでに入っているかを見る。 */
  const canAppend =
    incoming !== null &&
    lastPlanDay < MAX_DAYS &&
    entries.length < MAX_SPOTS &&
    incoming.entries.some((entry) => !inPlan.has(entry.slug));

  // 保存を読み終えるまでは、空のプランかどうかが分からない。
  if (!hydrated) return <PlanSkeleton />;

  return (
    <div className="space-y-6">
      {conflictRemote && (
        <div className="space-y-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 print:hidden dark:border-amber-800 dark:bg-amber-950/30">
          <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">
            アカウントに、別の端末で保存したプランがあります
          </p>
          <dl className="grid gap-1 text-xs text-amber-900 dark:text-amber-200 sm:grid-cols-[auto_1fr] sm:gap-x-3">
            <dt className="font-semibold">アカウント</dt>
            <dd>{describePlan(conflictRemote.entries, conflictRemote.startDate)}</dd>
            <dt className="font-semibold">このブラウザ</dt>
            <dd>{describePlan(entries, startDate)}</dd>
          </dl>
          <p className="text-xs leading-relaxed text-amber-800 dark:text-amber-300">
            選ばなかったほうは、アカウントからもこのブラウザからも消えます
            (選んだ直後なら「元に戻す」で戻せます)。選ぶまでは、ここで直した分は
            アカウントに送られません。
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={keepAccountPlan}
              className="rounded-full bg-amber-700 px-4 py-2 text-xs font-semibold text-white transition hover:bg-amber-800"
            >
              アカウントのプランを開く
            </button>
            <button
              type="button"
              onClick={keepBrowserPlan}
              className="rounded-full border border-amber-300 bg-background px-4 py-2 text-xs font-semibold transition hover:border-amber-500 dark:border-amber-800"
            >
              このブラウザのプランを残す
            </button>
          </div>
        </div>
      )}

      {incoming && (
        <div className="space-y-3 rounded-2xl border border-indigo-300 bg-indigo-50 p-4 dark:border-indigo-800 dark:bg-indigo-950/40">
          <p className="text-sm font-semibold text-indigo-900 dark:text-indigo-200">
            {incoming.label}を開いています（{incoming.entries.length}ヶ所・
            {incomingDays.length}日間）
          </p>
          {/* 件数だけでは、足すか入れ替えるかを決められない。中身を出す。 */}
          <ul className="space-y-1 text-xs leading-relaxed text-indigo-900 dark:text-indigo-200">
            {incomingDays.map((day) => (
              <li key={day}>
                {incomingDays.length > 1 && (
                  <span className="mr-1.5 font-semibold">{day}日目</span>
                )}
                {incoming.entries
                  .filter((entry) => entry.day === day)
                  .map((entry) => bySlug.get(entry.slug)?.name ?? entry.slug)
                  .join("・")}
              </li>
            ))}
          </ul>
          <p className="text-xs leading-relaxed text-indigo-800 dark:text-indigo-300">
            いまのあなたのプラン（{entries.length}ヶ所・{lastPlanDay}日間）とは別のものです。
            {canAppend
              ? "後ろに日として足すこともできます。入れ替えても、この画面を離れるまでは元に戻せます。"
              : "足すと上限(10日・40ヶ所)を超えるか、すべてすでに入っています。入れ替えても、この画面を離れるまでは元に戻せます。"}
          </p>
          <div className="flex flex-wrap gap-2">
            {canAppend && (
              <button
                type="button"
                onClick={() => acceptIncoming("append")}
                className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                  incoming.fromSite
                    ? "bg-indigo-600 text-white hover:bg-indigo-700"
                    : "border border-indigo-300 bg-background hover:border-indigo-500 dark:border-indigo-800"
                }`}
              >
                {lastPlanDay + 1}日目
                {incomingDays.length > 1
                  ? `〜${Math.min(MAX_DAYS, lastPlanDay + incomingDays.length)}日目`
                  : ""}
                として足す
              </button>
            )}
            <button
              type="button"
              onClick={() => acceptIncoming("replace")}
              className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                incoming.fromSite && canAppend
                  ? "border border-indigo-300 bg-background hover:border-indigo-500 dark:border-indigo-800"
                  : "bg-indigo-600 text-white hover:bg-indigo-700"
              }`}
            >
              いまのプランと入れ替える
            </button>
            <button
              type="button"
              onClick={() => {
                trackPlan("import", { mode: "dismiss", src: incoming.source });
                setIncoming(null);
                stripShareParams();
              }}
              className="rounded-full px-4 py-2 text-xs font-semibold text-muted-foreground transition hover:text-foreground"
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

      {/*
        伏せた催しなど、いまは掲載していないスポット。保存からは消さずに残し、
        何が計算から外れているのかをここで言う。黙って消すと、組んだ覚えの
        ある行がいつの間にか無くなっている。
      */}
      {goneEntries.length > 0 && (
        <div className="space-y-2.5 rounded-2xl border border-amber-300 bg-amber-50 p-4 print:hidden dark:border-amber-800 dark:bg-amber-950/30">
          <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">
            いまは掲載していないスポットが{goneEntries.length}ヶ所あります
          </p>
          <p className="text-xs leading-relaxed text-amber-800 dark:text-amber-300">
            会期が終わった催しなどです。プランには残してありますが、時刻と費用の計算には入れていません。
          </p>
          <ul className="flex flex-wrap gap-2">
            {goneEntries.map((entry) => (
              <li
                key={entry.slug}
                className="inline-flex items-center gap-2 rounded-full border border-amber-300 bg-background px-3 py-1 text-xs dark:border-amber-800"
              >
                <span className="font-semibold">
                  {goneSpots.get(entry.slug) ?? entry.slug}
                </span>
                <span className="text-muted-foreground">{entry.day}日目</span>
                <button
                  type="button"
                  onClick={() => removeFromPlan(entry.slug)}
                  className="font-semibold text-amber-800 underline underline-offset-2 hover:text-amber-950 dark:text-amber-300"
                >
                  外す
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {spotCount === 0 ? (
        <>
          <PlanSyncStatus hasPlan={false} />
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
            transportGbp={transport.payg}
            totalMinutes={totalMinutes}
            unknownPriceCount={unknownPriceCount}
            focusDay={focusDay}
            onSelectDay={selectDay}
            onAdd={() => openAdd(days.length)}
            onShare={handleShare}
            onPrint={() => {
              trackPlan("print");
              window.print();
            }}
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
                1日目の日付と宿を出る時刻の設定も一緒に消えます。消したあと、この画面を
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
                {signedIn
                  ? "自分の別の端末なら、リンクを使わなくてもログインすれば同じプランが開きます。"
                  : "プランはこのブラウザにだけ保存されているので、機種変更のときもこのリンクから持ち出せます。"}
              </p>
              <input
                type="text"
                readOnly
                value={shareUrl}
                onFocus={(e) => e.currentTarget.select()}
                aria-label="共有リンク"
                className="w-full rounded-lg border border-border bg-muted/40 px-3 py-2 text-base sm:text-xs"
              />
            </div>
          )}

          <PlanSyncStatus hasPlan />

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
                    <p className="border-t border-border bg-muted/30 px-3 py-2 text-xs leading-relaxed text-muted-foreground">
                      {focusDay
                        ? `${focusDay}日目だけを濃く出しています。上の日程から「全日程」を選ぶと戻ります。`
                        : "色は日の色と同じです。線は直線で結んだもので、実際に歩く道のりではありません。"}
                    </p>
                  </div>
                )}
              </aside>
            )}

            <div className="space-y-5 lg:order-1">
              {days.map((day, i) => (
                <PlanDay
                  key={day.day}
                  plan={day}
                  transport={transport.days[i]}
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

          <PlanCostPanel
            days={days}
            transport={transport}
            pass={pass}
            admissionsGbp={totalGbp}
            unknownPriceCount={unknownPriceCount}
            homeZone={homeZone}
            startDate={startDate}
          />
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

/**
 * 保存を読み終えるまでの骨組み。日割りのおおよその形だけを出す。
 * サーバーの描画もこれになる(サーバーは保存されたプランを知らない)。
 */
function PlanSkeleton() {
  return (
    <div
      className="space-y-5"
      aria-busy="true"
      aria-label="保存したプランを読み込んでいます"
    >
      <div className="h-24 animate-pulse rounded-2xl bg-muted motion-reduce:animate-none" />
      <div className="h-72 animate-pulse rounded-2xl bg-muted motion-reduce:animate-none" />
      <div className="h-72 animate-pulse rounded-2xl bg-muted motion-reduce:animate-none" />
    </div>
  );
}
