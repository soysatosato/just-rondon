/**
 * 旅行プランの操作を GA4 に送る。
 *
 * 2026-10 の監査の時点で、プランが使われているかを測る手段が無かった
 * (アカウントに保存されたプランが1件あるだけ)。入口ごとの追加と、/plan での
 * 主な操作を数えて、画面を直す前と後を同じ物差しで比べる。
 *
 * 送るのは「何をしたか」だけで、プランの中身そのものは送らない。
 * 追加と外すにはスポットの slug を添える(どこが足されているかは入口の
 * 良し悪しを見るのに要る)。
 *
 * gtag は本番で GA を読み込んだときだけある(app/layout.tsx)。無ければ何もしない。
 * 同意の扱いは GA 側の同意モード(ConsentDefaults)に任せる。
 */

type Gtag = (
  command: "event",
  name: string,
  params: Record<string, string | number>,
) => void;

export type PlanEvent =
  /** スポットを足した。source: detail | card | picker | time_route */
  | "add"
  /** スポットを外した。source: detail | card | picker | row */
  | "remove"
  /** ひな形を読み込んだ。template_id */
  | "template"
  /** リンクから取り込んだ。mode: auto | append | replace | dismiss、src */
  | "import"
  | "share"
  | "print"
  /** 1日目の日付を入れた。 */
  | "set_date"
  /** その日の順路を Google マップで開いた。day */
  | "open_maps"
  /** 消した。scope: all | day */
  | "clear"
  /** アカウントとの食い違いを片付けた。choice: remote | local */
  | "conflict";

export function trackPlan(
  event: PlanEvent,
  params: Record<string, string | number> = {},
) {
  if (typeof window === "undefined") return;
  const gtag = (window as unknown as { gtag?: Gtag }).gtag;
  if (typeof gtag !== "function") return;
  gtag("event", `plan_${event}`, params);
}
