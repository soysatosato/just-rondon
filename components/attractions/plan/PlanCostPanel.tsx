"use client";

import Link from "next/link";
import { CreditCard, Receipt, TicketCheck, TrainFront } from "lucide-react";

import { formatGbp, type DayPlan } from "@/lib/plan";
import {
  HOME_ZONES,
  zoneRangeLabel,
  type HomeZone,
  type PassVerdict,
  type TripTransport,
} from "@/lib/plan/costs";
import { dateForDay, formatPlanDate } from "@/lib/plan/dates";
import { BUS_CREDIT } from "@/lib/sightseeing/passes";
import {
  PAYMENT,
  TFL_CAPPING_SOURCE,
  TFL_FARES_SOURCE,
  TFL_SINGLE_FARE_SOURCE,
} from "@/lib/transport/rates";
import { setHomeZone } from "./home-zone";

/**
 * 旅程の費用のまとめ。日別の入場料と交通費、ロンドンパスの損得、
 * 交通費の払い方の比較を1か所に置く。
 *
 * 日のカードにも交通費を1行ずつ出しているが、パスと払い方の判断は
 * 旅程全体を見ないと出せない(パスは連続した日数で切れ、週の上限額は
 * 月曜で区切られる)。日ごとの数字の足し算では答えられない問いなので、
 * 日割りの下にまとめて置く。
 *
 * 交通費は経路を引いていない概算なので、金額にはすべて「約」を付け、
 * 作り方を同じ枠の中に書く。数字だけが別の場所に引用されて
 * 乗換案内の代わりに使われるのを避けたい。
 */
export default function PlanCostPanel({
  days,
  transport,
  pass,
  admissionsGbp,
  unknownPriceCount,
  homeZone,
  startDate,
}: {
  days: DayPlan[];
  transport: TripTransport;
  pass: PassVerdict;
  /** 入場料の合計(£)。日割りの合計と同じ数字。 */
  admissionsGbp: number;
  unknownPriceCount: number;
  homeZone: HomeZone;
  startDate: string | null;
}) {
  const total = admissionsGbp + transport.payg;
  const passBest = pass.best;
  const withPass =
    passBest && (pass.kind === "win" || pass.kind === "close")
      ? total - passBest.saving
      : null;

  return (
    <section
      id="plan-costs"
      className="scroll-mt-36 overflow-hidden rounded-2xl border border-border bg-card print:break-inside-avoid print:rounded-none"
    >
      <header className="flex flex-wrap items-end justify-between gap-3 border-b border-border bg-muted/40 px-4 py-3">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-bold tracking-tight">
            <Receipt className="h-4 w-4 text-indigo-600 dark:text-indigo-400" aria-hidden />
            費用の目安
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            大人1名の入場料と市内の交通費。宿・食事・空港との往復は入っていません。
          </p>
        </div>
        <label className="flex items-center gap-2 text-xs font-semibold print:hidden">
          宿のゾーン
          <select
            value={homeZone}
            onChange={(e) => setHomeZone(Number(e.target.value) as HomeZone)}
            className="rounded-lg border border-border bg-background px-2 py-1.5 text-base sm:text-xs font-semibold"
          >
            {HOME_ZONES.map((zone) => (
              <option key={zone} value={zone}>
                Zone {zone}
              </option>
            ))}
          </select>
        </label>
      </header>

      {/* 総額。この枠の答え。 */}
      <div className="border-b border-border px-4 py-4">
        <p className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-sm tabular-nums">
          <span className="text-muted-foreground">入場料</span>
          <span className="font-bold">{formatGbp(admissionsGbp)}</span>
          <span className="text-muted-foreground">＋ 交通費</span>
          <span className="font-bold">約{formatGbp(transport.payg)}</span>
          <span className="text-muted-foreground">＝</span>
          <span className="text-2xl font-bold">約{formatGbp(roundGbp(total))}</span>
        </p>
        {withPass !== null && passBest && (
          <p className="mt-1.5 text-xs text-muted-foreground">
            ロンドンパス{passBest.days}日券を使うと
            <span className="mx-1 font-bold tabular-nums text-foreground">
              約{formatGbp(roundGbp(withPass))}
            </span>
            (下の判定を参照)
          </p>
        )}
        {(unknownPriceCount > 0 || transport.outsideLegs > 0) && (
          <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
            {[
              unknownPriceCount > 0 ? `料金の分からない${unknownPriceCount}ヶ所の入場料` : null,
              transport.outsideLegs > 0 ? "ロンドン市外への鉄道運賃" : null,
            ]
              .filter(Boolean)
              .join("と")}
            は入っていません。実際はこれより増えます。
          </p>
        )}
      </div>

      {/* 日別 */}
      <div
        className="overflow-x-auto border-b border-border"
        tabIndex={0}
        role="region"
        aria-label="日別の費用(横にスクロールできます)"
      >
        <table className="w-full text-xs tabular-nums">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="px-4 py-2 font-semibold">日</th>
              <th className="px-2 py-2 text-right font-semibold">入場料</th>
              <th className="px-4 py-2 text-right font-semibold">交通費（目安）</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {days.map((day, i) => {
              const t = transport.days[i];
              const date = dateForDay(startDate, day.day);
              return (
                <tr key={day.day}>
                  <td className="whitespace-nowrap px-4 py-2 font-semibold">
                    {day.day}日目
                    {date && (
                      <span className="ml-1.5 font-normal text-muted-foreground">
                        {formatPlanDate(date)}
                      </span>
                    )}
                  </td>
                  <td className="px-2 py-2 text-right">{formatGbp(day.totalGbp)}</td>
                  <td className="px-4 py-2 text-right">
                    <span className="font-semibold">
                      {t.rides > 0 ? `約${formatGbp(t.gbp)}` : "—"}
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      {[
                        t.rides > 0
                          ? `${zoneRangeLabel(t.reach)}・${t.rides}回${t.capped ? "・上限" : ""}`
                          : null,
                        t.outsideLegs > 0 ? "市外の鉄道は別途" : null,
                      ]
                        .filter(Boolean)
                        .join("／")}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t border-border bg-muted/20 font-bold">
              <td className="px-4 py-2">合計</td>
              <td className="px-2 py-2 text-right">{formatGbp(admissionsGbp)}</td>
              <td className="px-4 py-2 text-right">
                約{formatGbp(transport.payg)}
                {transport.weeklyCapSaving > 0 && (
                  <span className="block text-xs font-normal text-muted-foreground">
                    週の上限額で −{formatGbp(transport.weeklyCapSaving)}
                  </span>
                )}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="grid gap-px bg-border md:grid-cols-2">
        <PassBlock pass={pass} />
        <PaymentBlock transport={transport} dayCount={days.length} />
      </div>

      <div className="space-y-1.5 border-t border-border bg-muted/20 px-4 py-3 text-xs leading-relaxed text-muted-foreground">
        <p>
          交通費は経路を引いていない概算です。宿との往復と、徒歩圏でない区間を
          1回ずつ地下鉄で移動するとして、Zone 1 を通る片道運賃を足し、1日の
          上限額で頭打ちにしています。平日の6:30〜9:30と16:00〜19:00に乗る回は
          ピーク運賃で数えます(出発日が無いときは平日として計算)。バスは数えていません。
          スポットのゾーンは最寄り駅から決めています。
        </p>
        <p>
          運賃は
          <a
            href={TFL_SINGLE_FARE_SOURCE.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mx-0.5 underline underline-offset-2 hover:text-foreground"
          >
            TfLの片道運賃
          </a>
          ・
          <a
            href={TFL_FARES_SOURCE.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mx-0.5 underline underline-offset-2 hover:text-foreground"
          >
            上限額とTravelcardの価格表
          </a>
          ・
          <a
            href={TFL_CAPPING_SOURCE.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mx-0.5 underline underline-offset-2 hover:text-foreground"
          >
            上限額の仕組み
          </a>
          による大人の額です。運賃の仕組みは
          <Link
            href="/sightseeing/transport"
            className="mx-0.5 underline underline-offset-2 hover:text-foreground"
          >
            ロンドンの交通ガイド
          </Link>
          にまとめています。
        </p>
      </div>
    </section>
  );
}

/** 総額は£1未満を落とす。概算に端数を付けると精度があるように見える。 */
function roundGbp(amount: number): number {
  return Math.round(amount);
}

function BlockHeading({
  icon: Icon,
  children,
}: {
  icon: typeof TicketCheck;
  children: React.ReactNode;
}) {
  return (
    <h3 className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
      <Icon className="h-3.5 w-3.5" aria-hidden />
      {children}
    </h3>
  );
}

/**
 * ロンドンパスの判定。
 *
 * 見出しは結論を金額つきの1文で言う。「対象◯ヶ所」のような材料だけを
 * 出して判断を読者に預けると、数が多いほうへ(=買う方向へ)読まれる。
 */
function PassBlock({ pass }: { pass: PassVerdict }) {
  const best = pass.best;
  const coveredSlugs = new Set(best?.covered.map((item) => item.slug));
  const outsideWindow = pass.eligible.filter((item) => !coveredSlugs.has(item.slug));

  let headline: React.ReactNode;
  let tone = "text-foreground";
  if (pass.kind === "none" || !best) {
    headline = "対象の有料スポットが入っていないので、ロンドンパスは要りません";
  } else if (pass.kind === "lose") {
    headline = (
      <>
        このプランなら、ロンドンパスは買わないほうが
        <span className="mx-1 tabular-nums">{formatGbp(-best.saving)}</span>
        安い
      </>
    );
  } else if (pass.kind === "close") {
    tone = "text-amber-700 dark:text-amber-400";
    headline = (
      <>
        {best.days}日券のほうが{formatGbp(best.saving)}安いが、差はわずか
      </>
    );
  } else {
    tone = "text-emerald-700 dark:text-emerald-400";
    headline = (
      <>
        ロンドンパス{best.days}日券（{formatGbp(best.price)}）で
        <span className="mx-1 tabular-nums">{formatGbp(best.saving)}</span>
        得
      </>
    );
  }

  return (
    <div className="space-y-2.5 bg-card px-4 py-4">
      <BlockHeading icon={TicketCheck}>ロンドンパスの損得</BlockHeading>
      <p className={`text-sm font-bold leading-snug ${tone}`}>{headline}</p>

      {best && (
        <>
          <p className="text-xs leading-relaxed text-muted-foreground">
            {pass.kind === "lose" ? "いちばん差が小さいのは" : ""}
            {best.days}日券（大人{formatGbp(best.price)}）を
            {best.startDay === best.endDay
              ? `${best.startDay}日目`
              : `${best.startDay}日目〜${best.endDay}日目`}
            に使う組み合わせです。期間内の対象{best.covered.length}ヶ所を個別に買うと
            {formatGbp(best.coveredValue)}。
            {pass.kind === "close" &&
              "パスは多くの施設で時間指定の予約が要り、行き先も対象施設に縛られます。この差なら、個別に買う自由を取ってもよい範囲です。"}
          </p>
          <ul className="space-y-1 text-xs">
            {best.covered.map((item) => (
              <li key={item.slug} className="flex items-baseline justify-between gap-3">
                <span className="min-w-0 truncate">
                  {item.name}
                  <span className="ml-1.5 text-xs text-muted-foreground">
                    {item.day}日目
                  </span>
                </span>
                <span className="shrink-0 tabular-nums">{formatGbp(item.price)}</span>
              </li>
            ))}
          </ul>
        </>
      )}

      {outsideWindow.length > 0 && (
        <p className="text-xs leading-relaxed text-muted-foreground">
          パスの期間外: {outsideWindow.map((item) => `${item.name}(${item.day}日目)`).join("、")}
        </p>
      )}
      {pass.conditional.length > 0 && (
        <p className="text-xs leading-relaxed text-muted-foreground">
          条件付きの対象のため計算に入れていない:{" "}
          {pass.conditional.map((item) => item.name).join("、")}
        </p>
      )}
      {pass.busWouldFlip && (
        <p className="text-xs leading-relaxed text-muted-foreground">
          パスに含まれる乗り降り自由バス(単体で{formatGbp(BUS_CREDIT)}〜)にも乗るつもりなら、
          損得は逆転します。
        </p>
      )}
      <p className="text-xs leading-relaxed text-muted-foreground">
        入場料は各スポットの掲載値(多くはオンライン事前購入の最安値)で比べています。
        <Link
          href="/sightseeing/passes"
          className="mx-0.5 underline underline-offset-2 hover:text-foreground"
        >
          観光パスの損益分岐
        </Link>
        の表は窓口価格なので、こちらのほうがパスに厳しく出ます。
      </p>
    </div>
  );
}

/**
 * 交通費の払い方。タッチ決済・Oyster・Oyster＋7日Travelcard の3通り。
 *
 * 週の上限額と7日 Travelcard は同じ値段なので、ふつうはタッチ決済で
 * 足りる。差が出るのは月曜をまたぐ旅程だけで、そのときは理由まで書く。
 * 理由が無いと「Travelcard は無意味」という一般論と食い違って見える。
 */
function PaymentBlock({
  transport,
  dayCount,
}: {
  transport: TripTransport;
  dayCount: number;
}) {
  const tc = transport.travelcard;

  if (!tc) {
    return (
      <div className="space-y-2.5 bg-card px-4 py-4">
        <BlockHeading icon={CreditCard}>交通費の払い方</BlockHeading>
        <p className="text-sm font-bold leading-snug">
          市内で地下鉄に乗る区間がありません
        </p>
      </div>
    );
  }

  const travelcardWins = tc.gbp < transport.payg;
  const rows = [
    {
      key: "contactless",
      label: "タッチ決済（Visa・Mastercard・Amex）",
      gbp: transport.payg,
      note: "改札にかざすだけ。1日・週の上限額で自動的に頭打ちになる",
      best: !travelcardWins,
    },
    {
      key: "oyster",
      label: "Oyster（都度払い）",
      gbp: transport.oyster,
      note: `運賃と上限額はタッチ決済と同じで、カード代${formatGbp(PAYMENT.oysterCardFee)}が乗る`,
      best: false,
    },
    {
      key: "travelcard",
      label: `Oyster＋7日Travelcard（${zoneRangeLabel(tc.zone)}）`,
      gbp: tc.gbp,
      note:
        `券${formatGbp(tc.price)}＋カード代${formatGbp(PAYMENT.oysterCardFee)}。` +
        `${tc.fromDay}日目から7日間、バスも乗り放題` +
        (tc.extraGbp > 0 ? `。それ以降の日は都度払い(${formatGbp(tc.extraGbp)})` : ""),
      best: travelcardWins,
    },
  ];

  return (
    <div className="space-y-2.5 bg-card px-4 py-4">
      <BlockHeading icon={CreditCard}>交通費の払い方</BlockHeading>
      <p className="text-sm font-bold leading-snug">
        {travelcardWins
          ? `7日Travelcardのほうが${formatGbp(transport.payg - tc.gbp)}安い`
          : "タッチ決済でかざすだけがいちばん安い"}
      </p>
      <ul className="space-y-2">
        {rows.map((row) => (
          <li
            key={row.key}
            className={`rounded-xl border px-3 py-2 ${
              row.best
                ? "border-indigo-300 bg-indigo-50/60 dark:border-indigo-800 dark:bg-indigo-950/30"
                : "border-border"
            }`}
          >
            <div className="flex items-baseline justify-between gap-3 text-xs">
              <span className="font-semibold">{row.label}</span>
              <span className="shrink-0 font-bold tabular-nums">約{formatGbp(row.gbp)}</span>
            </div>
            <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
              {row.note}
            </p>
          </li>
        ))}
      </ul>
      <p className="text-xs leading-relaxed text-muted-foreground">
        {travelcardWins
          ? "週の上限額は月曜〜日曜で区切られ、7日Travelcardは何曜日からでも始められます。この旅程は月曜をまたぐので、上限額が2週に割れて効ききりません。"
          : "週の上限額は7日Travelcardと同じ値段なので、乗った分だけ払うタッチ決済が損になることはふつうありません。"}
        {!transport.datesKnown &&
          dayCount >= 5 &&
          "いまは1日目を月曜とみなしています。出発日を入れると、月曜で区切った正確な額になります。"}
      </p>
      <p className="flex items-start gap-1.5 text-xs leading-relaxed text-muted-foreground">
        <TrainFront className="mt-0.5 h-3 w-3 shrink-0" aria-hidden />
        JCBのタッチ決済は改札で使えません。Visa・Mastercard・Amexが無ければ、Oysterの2行を比べてください。
      </p>
    </div>
  );
}
