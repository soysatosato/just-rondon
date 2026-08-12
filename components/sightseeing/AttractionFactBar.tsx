import { Clock, Ticket, Train, CalendarClock } from "lucide-react";

/**
 * 訪問前に知りたい実用情報を1か所にまとめて出す。
 *
 * もともとこれらは sections の本文に散らばっていて、しかも見出しの表記が
 * ページごとに違った(「料金・チケット情報」「チケット情報」「チケット料金」
 * 「料金」がすべて同義)。読者は毎ページ違う位置から同じ事実を探していた。
 *
 * 値は null を取りうる。埋まっている項目だけを描き、全部空ならこの
 * コンポーネント自体が何も返さない。「情報なし」の行を並べても読者の
 * 役に立たないし、抽出できなかったという裏側の事情を見せる意味もない。
 */

type Fact = {
  icon: typeof Clock;
  label: string;
  value: string;
};

export default function AttractionFactBar({
  priceAdult,
  priceChild,
  durationText,
  nearestStation,
  openingHours,
}: {
  priceAdult: string | null;
  priceChild: string | null;
  durationText: string | null;
  nearestStation: string | null;
  openingHours: string | null;
}) {
  // 大人と子どもが同額(どちらも「無料」など)なら1行にまとめる。
  // 同じ値を2行並べても情報が増えない。
  const priceValue =
    priceAdult && priceChild && priceAdult !== priceChild
      ? `大人 ${priceAdult} ／ 子ども ${priceChild}`
      : (priceAdult ?? priceChild);

  const facts: Fact[] = [
    ...(priceValue
      ? [{ icon: Ticket, label: "料金", value: priceValue }]
      : []),
    ...(durationText
      ? [{ icon: Clock, label: "所要時間", value: durationText }]
      : []),
    ...(nearestStation
      ? [{ icon: Train, label: "最寄駅", value: nearestStation }]
      : []),
    ...(openingHours
      ? [{ icon: CalendarClock, label: "開館時間", value: openingHours }]
      : []),
  ];

  if (facts.length === 0) return null;

  return (
    <section
      aria-label="訪問前に知っておきたいこと"
      className="rounded-2xl border border-border bg-muted/40 p-4 sm:p-5"
    >
      <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
        {facts.map((f) => (
          <div key={f.label} className="flex items-start gap-3">
            <f.icon
              className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground"
              aria-hidden
            />
            <div className="min-w-0">
              <dt className="text-xs font-medium text-muted-foreground">
                {f.label}
              </dt>
              <dd className="text-sm font-semibold leading-snug">{f.value}</dd>
            </div>
          </div>
        ))}
      </dl>

      {/* 料金と開館時間は改定される。ここの値がいつでも正しいと約束はできない
          ので、必ず公式サイトを見に行ける状態にしておく(リンクは呼び出し側)。 */}
      <p className="mt-4 border-t border-border/60 pt-3 text-xs text-muted-foreground">
        料金・開館時間は変更されることがあります。訪問前に公式サイトで最新情報をご確認ください。
      </p>
    </section>
  );
}
