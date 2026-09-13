"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { ArrowDown, ArrowUp, ChevronDown, Pin, PinOff, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FxRate } from "@/lib/fx/rate";
import { WAGE_BANDS } from "@/lib/jobs/rates";
import {
  calculateTakeHome,
  marginalRates,
  perPeriod,
  toAnnual,
  type PayPeriod,
} from "@/lib/money/take-home/calculate";
import { curveDomainMax, sampleRateCurve } from "@/lib/money/take-home/curve";
import {
  formatAmountInput,
  formatGbp,
  formatGbpDelta,
  formatPercent,
  formatYenApprox,
  parseAmountInput,
} from "@/lib/money/take-home/format";
import {
  CURRENT_TAX_YEAR_ID,
  TAX_REGION_LABELS,
  getTaxYear,
  isLatestTaxYearOver,
  type TaxRegion,
} from "@/lib/money/take-home/tax-years";
import {
  DEFAULT_STATE,
  stateFromSearchParams,
  stateToInput,
  stateToSearchParams,
  type CalculatorState,
} from "@/lib/money/take-home/url-state";
import AdvancedOptions, { countAdvancedChanges } from "./AdvancedOptions";
import { APPLY_CONDITION_EVENT, CALCULATOR_ANCHOR_ID } from "./ApplyConditionLink";
import AmountField from "./AmountField";
import AnimatedNumber from "./AnimatedNumber";
import DeductionBar from "./DeductionBar";
import InfoTip from "./InfoTip";
import InsightList from "./InsightList";
import PayslipCard, { type PayslipView } from "./PayslipCard";
import PensionOptions from "./PensionOptions";
import RateChart from "./RateChart";
import Segmented from "./Segmented";
import ShareActions from "./ShareActions";
import { buildInsights } from "./insights";
import { SERIES, seriesValues, type SeriesKey } from "./series";

/**
 * イギリスの手取り計算機。
 *
 * 画面の約束ごと:
 * 1. 送信ボタンを置かない。1文字打つたびに全部が計算し直される。
 *    「£35,000なら？ £38,000なら？」を試す速さが、この道具の価値そのもの。
 * 2. 条件は URL に載せる(lib/money/take-home/url-state.ts)。
 *    共有されたリンクは同じ条件で開き、自分の最後の条件はブラウザに残る。
 * 3. 数字の意味は、数字の横で言葉にする(insights.ts)。
 * 4. 静的に書き出した HTML には既定の条件(年収£35,000)の結果が入る。
 *    検索エンジンにも JavaScript の読み込み前の読者にも、空の計算機を見せない。
 */

const STORAGE_KEY = "jr-take-home-v1";
const PIN_KEY = "jr-take-home-pin-v1";
const VIEW_KEY = "jr-take-home-view-v1";

/** このクエリを1つでも持つ URL は、保存済みの条件より優先する。 */
const URL_KEYS = ["pay", "per", "h", "region", "pension", "pp", "ep", "pm", "pb", "sl", "pg", "code", "year", "spa"];

const VIEW_LABEL: Record<PayslipView, string> = { year: "年", month: "月", week: "週" };
const VIEW_DIVISOR: Record<PayslipView, number> = { year: 1, month: 12, week: 52 };
const PER_LABEL: Record<PayPeriod, string> = { year: "年収", month: "月給", week: "週給", hour: "時給" };

const HOURS_PRESETS = [16, 20, 30, 37.5, 40];

const NATIONAL_LIVING_WAGE = WAGE_BANDS[0].hourlyRate;

const PRESETS: { label: string; patch: Partial<CalculatorState> }[] = [
  {
    label: "最低賃金・週37.5時間",
    patch: { per: "hour", pay: NATIONAL_LIVING_WAGE, hoursPerWeek: 37.5 },
  },
  {
    label: "最低賃金・週20時間",
    patch: { per: "hour", pay: NATIONAL_LIVING_WAGE, hoursPerWeek: 20 },
  },
  { label: "年収£30,000", patch: { per: "year", pay: 30000 } },
  { label: "年収£50,000", patch: { per: "year", pay: 50000 } },
  { label: "年収£110,000", patch: { per: "year", pay: 110000 } },
];

/** 単位を切り替えたとき、同じ年収になる額に直して入力欄に入れる。 */
function roundForPeriod(value: number, per: PayPeriod) {
  return per === "hour" ? Math.round(value * 100) / 100 : Math.round(value);
}

function describeState(state: CalculatorState) {
  const pension =
    state.pension === "none" ? "年金なし" : state.pension === "auto" ? "年金 最低額" : `年金 ${state.employeePercent}%`;
  return `${PER_LABEL[state.per]}${formatGbp(state.pay ?? 0, { pence: state.per === "hour" })}${
    state.per === "hour" ? `×週${state.hoursPerWeek}時間` : ""
  }・${state.region === "scotland" ? "スコットランド" : "イングランド等"}・${pension}`;
}

export default function SalaryCalculator() {
  const [state, setState] = useState<CalculatorState>(DEFAULT_STATE);
  const [amountText, setAmountText] = useState(formatAmountInput(DEFAULT_STATE.pay ?? 0));
  const [view, setView] = useState<PayslipView>("month");
  const [pinned, setPinned] = useState<CalculatorState | null>(null);
  const [ready, setReady] = useState(false);
  const [fx, setFx] = useState<FxRate | null>(null);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [stale, setStale] = useState(false);
  const [pillVisible, setPillVisible] = useState(false);
  /** 結果が画面より下にあるか(狭い画面では入力の下に結果が来る)。 */
  const [heroBelow, setHeroBelow] = useState(true);
  const [liveText, setLiveText] = useState("");
  const shellRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  // ---- 初期化: URL > 保存済み > 既定 ------------------------------------------
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    let next = DEFAULT_STATE;
    if (URL_KEYS.some((key) => params.has(key))) {
      next = stateFromSearchParams(params);
    } else {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) next = stateFromSearchParams(new URLSearchParams(saved));
      } catch {
        // プライベートブラウズなどで読めなくても、既定の条件で動けばよい。
      }
    }
    setState(next);
    setAmountText(next.pay === null ? "" : formatAmountInput(next.pay));
    setAdvancedOpen(countAdvancedChanges(next, DEFAULT_STATE) > 0);

    try {
      const savedView = localStorage.getItem(VIEW_KEY);
      if (savedView === "year" || savedView === "month" || savedView === "week") setView(savedView);
      const savedPin = localStorage.getItem(PIN_KEY);
      if (savedPin !== null) setPinned(stateFromSearchParams(new URLSearchParams(savedPin)));
    } catch {
      // 同上
    }

    setStale(isLatestTaxYearOver(new Date()));
    setReady(true);
  }, []);

  // ---- 早見表などから条件を受け取る ------------------------------------------------
  useEffect(() => {
    const apply = (event: Event) => {
      const detail = (event as CustomEvent<string>).detail ?? "";
      const next = stateFromSearchParams(new URLSearchParams(detail));
      setState(next);
      setAmountText(next.pay === null ? "" : formatAmountInput(next.pay));
      setAdvancedOpen((open) => open || countAdvancedChanges(next, DEFAULT_STATE) > 0);
    };
    window.addEventListener(APPLY_CONDITION_EVENT, apply);
    return () => window.removeEventListener(APPLY_CONDITION_EVENT, apply);
  }, []);

  const query = useMemo(() => stateToSearchParams(state).toString(), [state]);

  // ---- URL とブラウザへの保存 ---------------------------------------------------
  useEffect(() => {
    if (!ready) return;
    const timer = setTimeout(() => {
      const url = `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`;
      window.history.replaceState(window.history.state, "", url);
      try {
        localStorage.setItem(STORAGE_KEY, query);
      } catch {
        // 保存できなくても計算は続けられる。
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query, ready]);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(VIEW_KEY, view);
      if (pinned) localStorage.setItem(PIN_KEY, stateToSearchParams(pinned).toString());
      else localStorage.removeItem(PIN_KEY);
    } catch {
      // 同上
    }
  }, [view, pinned, ready]);

  // ---- 為替 -------------------------------------------------------------------
  useEffect(() => {
    let alive = true;
    fetch("/api/fx-rate")
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
      .then((json: FxRate) => {
        if (alive && typeof json.jpyPerGbp === "number") setFx(json);
      })
      .catch(() => {
        // 円換算は添え物。取れなければ出さない。
      });
    return () => {
      alive = false;
    };
  }, []);

  // ---- 計算 -------------------------------------------------------------------
  const input = useMemo(() => stateToInput(state), [state]);
  const result = useMemo(() => calculateTakeHome(input), [input]);
  const rates = useMemo(() => marginalRates(input), [input]);
  const insights = useMemo(() => buildInsights(state, input, result), [state, input, result]);
  const values = seriesValues(result);
  const year = result.year;
  const gross = result.grossAnnual;
  const divisor = VIEW_DIVISOR[view];

  // 曲線は額面に依存しない。額面を動かすたびに480点を計算し直さないよう、
  // 額面以外の条件を文字列にしてキーにする。
  const curveKey = JSON.stringify({ ...input, grossAnnual: 0 });
  const [frozenXMax, setFrozenXMax] = useState<number | null>(null);
  const fittedXMax = curveDomainMax(gross);
  const xMax = frozenXMax ?? fittedXMax;
  const fittedXMaxRef = useRef(fittedXMax);
  fittedXMaxRef.current = fittedXMax;
  // ドラッグ中は横軸を止め、離したら額面に合わせ直す(RateChart の onDragChange を参照)。
  const handleChartDrag = useCallback((dragging: boolean) => {
    setFrozenXMax(dragging ? fittedXMaxRef.current : null);
  }, []);
  const points = useMemo(
    () => sampleRateCurve(JSON.parse(curveKey), xMax),
    [curveKey, xMax],
  );
  const taperZone = result.taxCodeParsed
    ? null
    : {
        from: year.allowanceTaperThreshold,
        to: year.allowanceTaperThreshold + year.personalAllowance * 2,
      };

  const pinnedQuery = pinned ? stateToSearchParams(pinned).toString() : null;
  const pinnedResult = useMemo(
    () => (pinned ? calculateTakeHome(stateToInput(pinned)) : null),
    [pinned],
  );
  const comparing = pinnedResult !== null && pinnedQuery !== query;
  const deltas = useMemo(() => {
    if (!comparing || !pinnedResult) return null;
    const before = seriesValues(pinnedResult);
    return Object.fromEntries(
      SERIES.map((s) => [s.key, values[s.key] - before[s.key]]),
    ) as Record<SeriesKey, number>;
    // values は result から作られるので、result を依存にすれば足りる。
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [comparing, pinnedResult, result]);

  // ---- 読み上げ ---------------------------------------------------------------
  useEffect(() => {
    const timer = setTimeout(() => {
      setLiveText(
        `手取りは月${formatGbp(result.takeHome / 12)}、年${formatGbp(result.takeHome)}です。`,
      );
    }, 900);
    return () => clearTimeout(timer);
  }, [result.takeHome]);

  // ---- 狭い画面で結果が見えないときの追従表示 -----------------------------------------
  useEffect(() => {
    const shell = shellRef.current;
    const hero = heroRef.current;
    if (!shell || !hero) return;
    let shellVisible = false;
    let heroVisible = true;
    const sync = () => setPillVisible(shellVisible && !heroVisible);
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === shell) shellVisible = entry.isIntersecting;
        if (entry.target === hero) {
          heroVisible = entry.isIntersecting;
          setHeroBelow(entry.boundingClientRect.top > 0);
        }
      }
      sync();
    });
    observer.observe(shell);
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  // ---- 入力の操作 ---------------------------------------------------------------
  const update = useCallback((patch: Partial<CalculatorState>) => {
    setState((current) => ({ ...current, ...patch }));
  }, []);

  const setPay = useCallback((pay: number, patch: Partial<CalculatorState> = {}) => {
    setState((current) => ({ ...current, ...patch, pay }));
    setAmountText(formatAmountInput(pay));
  }, []);

  const handleTextChange = (text: string) => {
    setAmountText(text);
    if (text.trim() === "") {
      update({ pay: null });
      return;
    }
    const parsed = parseAmountInput(text);
    if (parsed !== null) update({ pay: Math.min(parsed, 10_000_000) });
  };

  const handlePerChange = (per: PayPeriod) => {
    if (per === state.per) return;
    if (state.pay === null) {
      update({ per });
      return;
    }
    const annual = toAnnual(state.pay, state.per, state.hoursPerWeek);
    setPay(roundForPeriod(perPeriod(annual, per, state.hoursPerWeek), per), { per });
  };

  const handleScrub = (value: number) => {
    let pay: number;
    switch (state.per) {
      case "month":
        pay = Math.round(value / 12 / 50) * 50;
        break;
      case "week":
        pay = Math.round(value / 52 / 10) * 10;
        break;
      case "hour":
        pay = Math.round((value / (state.hoursPerWeek * 52)) * 20) / 20;
        break;
      default:
        pay = Math.round(value / 500) * 500;
    }
    if (pay !== state.pay) setPay(pay);
  };

  const applyPreset = (patch: Partial<CalculatorState>) => {
    setPay(patch.pay ?? 0, patch);
  };

  const presetActive = (patch: Partial<CalculatorState>) =>
    Object.entries(patch).every(
      ([key, value]) => state[key as keyof CalculatorState] === value,
    );

  const advancedCount = countAdvancedChanges(state, DEFAULT_STATE);
  const codeRegion = result.taxCodeParsed?.region ?? null;
  const takeHomeShare = gross > 0 ? Math.max(0, result.takeHome) / gross : 0;
  const hourlyTakeHome = perPeriod(Math.max(0, result.takeHome), "hour", state.hoursPerWeek);
  const shareText = `イギリスで${PER_LABEL[state.per]}${formatGbp(state.pay ?? 0, {
    pence: state.per === "hour",
  })}${state.per === "hour" ? `（週${state.hoursPerWeek}時間）` : ""}の手取りは、月${formatGbp(
    result.takeHome / 12,
  )}でした（${year.label}年度・所得税、NI、年金を計算）`;

  return (
    <MotionConfig reducedMotion="user">
      <div id={CALCULATOR_ANCHOR_ID} className="scroll-mt-4 space-y-8">
        <div
          ref={shellRef}
          className="overflow-clip rounded-3xl border bg-card shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_40px_-24px_rgba(0,0,0,0.25)]"
        >
          <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.04fr)]">
            {/* ---------------- 入力 ---------------- */}
            <div className="space-y-7 p-5 sm:p-7">
              <AmountField
                text={amountText}
                pay={state.pay}
                per={state.per}
                onTextChange={handleTextChange}
                onBlur={() =>
                  setAmountText(state.pay === null ? "" : formatAmountInput(state.pay))
                }
                onPayChange={(value) => setPay(value)}
                onPerChange={handlePerChange}
              />

              {state.per === "hour" && (
                <div>
                  <span className="text-sm font-semibold">週の労働時間</span>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    {HOURS_PRESETS.map((hours) => (
                      <button
                        key={hours}
                        type="button"
                        aria-pressed={state.hoursPerWeek === hours}
                        onClick={() => update({ hoursPerWeek: hours })}
                        className={cn(
                          "h-9 rounded-full border px-3 text-sm tabular-nums transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                          state.hoursPerWeek === hours
                            ? "border-foreground bg-foreground font-semibold text-background"
                            : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground",
                        )}
                      >
                        {hours}
                      </button>
                    ))}
                    <label className="flex h-9 items-center gap-1 rounded-full border px-3 focus-within:border-foreground/40">
                      <span className="sr-only">週の労働時間を入力</span>
                      <input
                        type="number"
                        inputMode="decimal"
                        min={1}
                        max={100}
                        step={0.5}
                        value={state.hoursPerWeek}
                        onChange={(e) => {
                          const next = Number(e.target.value);
                          if (Number.isFinite(next) && next > 0) {
                            update({ hoursPerWeek: Math.min(100, next) });
                          }
                        }}
                        className="w-12 bg-transparent text-right text-sm font-semibold tabular-nums outline-none"
                      />
                      <span className="text-sm text-muted-foreground">時間</span>
                    </label>
                  </div>
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    年収にすると{" "}
                    <span className="font-medium tabular-nums text-foreground">
                      {formatGbp(gross)}
                    </span>
                    （52週で計算）
                  </p>
                </div>
              )}

              <div>
                <p className="text-xs font-medium text-muted-foreground">よくある条件で試す</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {PRESETS.map((preset) => {
                    const active = presetActive(preset.patch);
                    return (
                      <button
                        key={preset.label}
                        type="button"
                        aria-pressed={active}
                        onClick={() => applyPreset(preset.patch)}
                        className={cn(
                          "rounded-full border px-3 py-1.5 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                          active
                            ? "border-foreground bg-foreground text-background"
                            : "border-border bg-background text-muted-foreground hover:border-foreground/40 hover:text-foreground",
                        )}
                      >
                        {preset.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-semibold">住んでいる地域</span>
                  <InfoTip label="所得税の地域">
                    所得税の税率は、勤務地ではなく住んでいる場所で決まります。ロンドンで働いていてもスコットランドに住んでいればスコットランドの税率です。ウェールズと北アイルランドは、現在イングランドと同じ税率です。
                  </InfoTip>
                </div>
                <Segmented<TaxRegion>
                  name="region"
                  legend="住んでいる地域"
                  value={state.region}
                  onChange={(region) => update({ region })}
                  className="mt-2"
                  options={[
                    { value: "england", label: "イングランド", sub: "ウェールズ・北アイルランドも" },
                    { value: "scotland", label: "スコットランド", sub: "所得税が6段階" },
                  ]}
                />
                {codeRegion && codeRegion !== state.region && (
                  <p className="mt-1.5 text-xs text-amber-700 dark:text-amber-400">
                    税コードの先頭の記号が優先され、{TAX_REGION_LABELS[codeRegion]}の税率で計算しています。
                  </p>
                )}
              </div>

              <PensionOptions state={state} year={year} onChange={update} />

              <div className="rounded-2xl border border-dashed">
                <button
                  type="button"
                  aria-expanded={advancedOpen}
                  aria-controls="salary-advanced-options"
                  onClick={() => setAdvancedOpen((open) => !open)}
                  className="flex w-full items-center justify-between gap-3 rounded-2xl px-4 py-3.5 text-left transition hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span>
                    <span className="flex items-center gap-2 text-sm font-semibold">
                      詳しい条件
                      {advancedCount > 0 && (
                        <span className="rounded-full bg-foreground px-1.5 text-[11px] font-semibold tabular-nums text-background">
                          {advancedCount}
                        </span>
                      )}
                    </span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      学生ローン・税コード・税年度・{state.per === "hour" ? "" : "週の労働時間・"}年金受給年齢
                    </span>
                  </span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
                      advancedOpen && "rotate-180",
                    )}
                    aria-hidden
                  />
                </button>
                <AnimatePresence initial={false}>
                  {advancedOpen && (
                    <motion.div
                      id="salary-advanced-options"
                      key="advanced"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-dashed px-4 pb-5 pt-4">
                        <AdvancedOptions state={state} result={result} onChange={update} />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* ---------------- 結果 ---------------- */}
            <div className="border-t bg-gradient-to-b from-muted/70 via-muted/30 to-transparent p-5 sm:p-7 lg:border-l lg:border-t-0">
              <div className="lg:sticky lg:top-6">
                <div ref={heroRef}>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold">
                      手取り
                      <span className="ml-2 rounded-full border bg-background px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                        {year.label}年度
                      </span>
                    </p>
                    <Segmented<PayslipView>
                      name="result-view"
                      legend="手取りの単位"
                      size="sm"
                      value={view}
                      onChange={setView}
                      className="w-36"
                      options={[
                        { value: "year", label: "年" },
                        { value: "month", label: "月" },
                        { value: "week", label: "週" },
                      ]}
                    />
                  </div>

                  <p className="mt-3 flex flex-wrap items-baseline gap-x-2">
                    <AnimatedNumber
                      value={Math.max(0, result.takeHome) / divisor}
                      format={(v) => formatGbp(v)}
                      className="text-5xl font-bold tracking-tight text-foreground sm:text-6xl"
                    />
                    <span className="text-lg font-medium text-muted-foreground">/ {VIEW_LABEL[view]}</span>
                  </p>

                  <p className="mt-1 min-h-5 text-sm text-muted-foreground">
                    {fx ? (
                      <>
                        約{" "}
                        <span className="font-semibold text-foreground">
                          {formatYenApprox((Math.max(0, result.takeHome) / divisor) * fx.jpyPerGbp)}
                        </span>
                        <span className="ml-1.5 text-xs">
                          （£1＝{fx.jpyPerGbp.toFixed(1)}円・{fx.rateDate.slice(5).replace("-", "/")} ECB参考値）
                        </span>
                      </>
                    ) : (
                      <span className="text-xs">円換算は為替レートの取得後に表示します</span>
                    )}
                  </p>

                  {comparing && pinnedResult && pinned && (
                    <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 rounded-xl border bg-background/80 px-3 py-2 text-xs">
                      <span className="text-muted-foreground">保存した条件より</span>
                      <span
                        className={cn(
                          "font-semibold tabular-nums",
                          result.takeHome - pinnedResult.takeHome >= 0
                            ? "text-emerald-700 dark:text-emerald-400"
                            : "text-rose-700 dark:text-rose-400",
                        )}
                      >
                        {formatGbpDelta((result.takeHome - pinnedResult.takeHome) / divisor)} / {VIEW_LABEL[view]}
                      </span>
                      <span className="w-full truncate text-muted-foreground sm:w-auto">
                        保存: {describeState(pinned)}
                      </span>
                    </div>
                  )}

                  {stale && state.yearId === CURRENT_TAX_YEAR_ID && (
                    <p className="mt-3 rounded-xl border border-amber-300/80 bg-amber-50/80 px-3 py-2 text-xs leading-relaxed text-amber-900 dark:border-amber-900/70 dark:bg-amber-950/30 dark:text-amber-200">
                      {getTaxYear(CURRENT_TAX_YEAR_ID).label}年度は終わっています。新しい年度の税率はまだ反映していません。
                    </p>
                  )}
                </div>

                <div className="mt-6">
                  <p className="mb-2.5 text-sm text-muted-foreground">
                    {gross > 0 ? (
                      <>
                        額面 <span className="font-medium tabular-nums text-foreground">{formatGbp(gross / divisor)}</span> のうち{" "}
                        <span className="font-semibold text-foreground">{formatPercent(takeHomeShare, 0)}</span>{" "}
                        が手元に残ります
                      </>
                    ) : (
                      "額面を入れると、内訳がここに出ます"
                    )}
                  </p>
                  <DeductionBar values={values} gross={gross} divisor={divisor} deltas={deltas} />
                </div>

                <dl className="mt-5 grid grid-cols-3 gap-2">
                  <div className="rounded-xl border bg-background/70 p-3">
                    <dt className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      限界税率
                      <InfoTip label="限界税率">
                        額面が£1増えたとき、そのうち所得税・National Insurance・学生ローンに回る割合です。昇給したときに手元に残る額は、この率で決まります。
                      </InfoTip>
                    </dt>
                    <dd className="mt-0.5 text-lg font-bold">{formatPercent(rates.government, 0)}</dd>
                  </div>
                  <div className="rounded-xl border bg-background/70 p-3">
                    <dt className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      実効負担率
                      <InfoTip label="実効負担率">
                        額面全体に対して、所得税・National Insurance・学生ローンが占める割合です。年金は自分の資産なので含めていません。
                      </InfoTip>
                    </dt>
                    <dd className="mt-0.5 text-lg font-bold">
                      {formatPercent(gross > 0 ? (result.incomeTax + result.nationalInsurance + result.studentLoan + result.postgraduateLoan) / gross : 0)}
                    </dd>
                  </div>
                  <div className="rounded-xl border bg-background/70 p-3">
                    <dt className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      手取りの時給
                      <InfoTip label="手取りの時給">
                        手取りを、週{state.hoursPerWeek}時間×52週で割った額です。週の時間は「詳しい条件」で変えられます。
                      </InfoTip>
                    </dt>
                    <dd className="mt-0.5 text-lg font-bold">{formatGbp(hourlyTakeHome, { pence: true })}</dd>
                  </div>
                </dl>

                {gross > 0 && (
                  <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                    額面が年£1,000増えると、手取りは{" "}
                    <span className="font-semibold tabular-nums text-foreground">
                      {formatGbpDelta(rates.keep * 1000)}
                    </span>{" "}
                    （月{formatGbpDelta((rates.keep * 1000) / 12)}）。
                  </p>
                )}

                <div className="mt-5 flex flex-wrap items-center gap-2 border-t pt-4">
                  {pinned && !comparing ? (
                    <button
                      type="button"
                      onClick={() => setPinned(null)}
                      className="inline-flex h-9 items-center gap-1.5 rounded-full border border-foreground bg-foreground px-3 text-xs font-medium text-background transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <PinOff className="h-3.5 w-3.5" aria-hidden />
                      保存を解除
                    </button>
                  ) : pinned ? (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setState(pinned);
                          setAmountText(pinned.pay === null ? "" : formatAmountInput(pinned.pay));
                        }}
                        className="inline-flex h-9 items-center gap-1.5 rounded-full border bg-background px-3 text-xs font-medium transition hover:border-foreground/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <RotateCcw className="h-3.5 w-3.5" aria-hidden />
                        保存した条件に戻す
                      </button>
                      <button
                        type="button"
                        onClick={() => setPinned(state)}
                        className="inline-flex h-9 items-center gap-1.5 rounded-full border bg-background px-3 text-xs font-medium transition hover:border-foreground/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <Pin className="h-3.5 w-3.5" aria-hidden />
                        いまの条件で保存し直す
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setPinned(state)}
                      className="inline-flex h-9 items-center gap-1.5 rounded-full border bg-background px-3 text-xs font-medium transition hover:border-foreground/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <Pin className="h-3.5 w-3.5" aria-hidden />
                      この条件を保存して比べる
                    </button>
                  )}
                  <ShareActions query={query} shareText={shareText} />
                </div>
                {!pinned && (
                  <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
                    保存すると、条件を変えたときに差額が出ます。転職のオファー比較や、年金をやめた場合の確認に。
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <p className="sr-only" aria-live="polite">
          {liveText}
        </p>

        <InsightList insights={insights} />

        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <section className="rounded-2xl border bg-card p-5 sm:p-6" aria-label="給与明細のイメージ">
            <PayslipCard
              result={result}
              view={view}
              studentLoans={state.studentLoans}
              overStatePensionAge={state.overStatePensionAge}
            />
          </section>
          <section className="rounded-2xl border bg-card p-5 sm:p-6" aria-labelledby="rate-chart-heading">
            <h3 id="rate-chart-heading" className="text-base font-bold tracking-tight">
              額面が増えると、税の割合はどう変わるか
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              グラフの上をドラッグ（スマホは横になぞるかタップ）すると、額面を動かせます。
            </p>
            <div className="mt-4">
              <RateChart
                points={points}
                xMax={xMax}
                gross={gross}
                userMarginal={rates.government}
                userEffective={
                  gross > 0
                    ? (result.incomeTax + result.nationalInsurance + result.studentLoan + result.postgraduateLoan) / gross
                    : 0
                }
                taperZone={taperZone}
                onScrub={handleScrub}
                onDragChange={handleChartDrag}
              />
            </div>
          </section>
        </div>

        <AnimatePresence>
          {pillVisible && (
            <motion.button
              type="button"
              key="pill"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              onClick={() => heroRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })}
              className="fixed bottom-4 right-4 z-40 flex items-center gap-2 rounded-full bg-foreground py-2.5 pl-4 pr-3 text-background shadow-lg lg:hidden print:hidden"
            >
              <span className="text-xs opacity-75">手取り</span>
              <span className="text-base font-bold tabular-nums">
                {formatGbp(Math.max(0, result.takeHome) / divisor)}
              </span>
              <span className="text-xs opacity-75">/ {VIEW_LABEL[view]}</span>
              {heroBelow ? (
                <ArrowDown className="h-4 w-4 opacity-75" aria-hidden />
              ) : (
                <ArrowUp className="h-4 w-4 opacity-75" aria-hidden />
              )}
              <span className="sr-only">結果の位置へ移動</span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </MotionConfig>
  );
}
