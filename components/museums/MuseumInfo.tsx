import {
  Ticket,
  Camera,
  Clock,
  BadgeCheck,
  Luggage,
  TrainFront,
  Bus,
  BookHeadphones,
  Utensils,
  ShoppingCart,
  Wifi,
} from "lucide-react";

type MuseumInfoRow = {
  photographyAllowed: string | null;
  reservationRequired: boolean | null;
  cloakroomInfo: string | null;
  nearestStation: string | null;
  stationWalkingMinutes: number | null;
  nearestBusStop: string | null;
  busStopWalkingMinutes: number | null;
  guidedTourAvailable: boolean | null;
  guidedTourLanguages: string | null;
  cafeteriaAvailable: boolean | null;
  shopAvailable: boolean | null;
  wifiAvailable: boolean | null;
  admissionFeeAdult: number | null;
  admissionFeeChild: number | null;
  recommendedDuration: number | null;
  guidedTourFee: number | null;
};

/** DB上「-」「無し」などの表記ゆれで入っている未設定値を空として扱う。 */
const EMPTY_VALUES = new Set(["-", "ー", "―", "無し", "なし", ""]);

function clean(value: string | null | undefined) {
  if (!value) return null;
  const trimmed = value.trim();
  return EMPTY_VALUES.has(trimmed) ? null : trimmed;
}

function formatFee(fee: number | null) {
  if (fee === null || fee === undefined) return null;
  return fee === 0 ? "無料" : `£${fee}`;
}

function formatDuration(min: number | null) {
  if (!min) return null;
  if (min < 60) return `${min}分`;
  const hours = Math.round((min / 60) * 10) / 10;
  return `${hours}時間`;
}

export default function MuseumInfo({
  museumInfo,
}: {
  museumInfo: MuseumInfoRow | null;
}) {
  // museumInfo は任意リレーション。以前は無条件に参照していたため、
  // レコードの無い館を追加した時点でページ全体が落ちる状態だった。
  if (!museumInfo) return null;

  const station = clean(museumInfo.nearestStation);
  const busStop = clean(museumInfo.nearestBusStop);
  const cloakroom = clean(museumInfo.cloakroomInfo);
  const photo = clean(museumInfo.photographyAllowed);
  const langs = clean(museumInfo.guidedTourLanguages);
  const adult = formatFee(museumInfo.admissionFeeAdult);
  const child = formatFee(museumInfo.admissionFeeChild);
  const duration = formatDuration(museumInfo.recommendedDuration);

  const items: { icon: React.ElementType; label: string; value: string }[] = [];

  if (adult) items.push({ icon: Ticket, label: "大人料金", value: adult });
  if (child) items.push({ icon: Ticket, label: "子ども料金", value: child });
  if (duration)
    items.push({ icon: Clock, label: "滞在時間の目安", value: duration });

  // reservationRequired は47館中3館しか設定が無い。false と null を同じ
  // 「不要」として出すと、未確認の館まで断定することになるので出さない。
  if (museumInfo.reservationRequired !== null) {
    items.push({
      icon: BadgeCheck,
      label: "予約",
      value: museumInfo.reservationRequired ? "必要" : "不要",
    });
  }

  if (photo) items.push({ icon: Camera, label: "写真撮影", value: photo });
  if (cloakroom)
    items.push({ icon: Luggage, label: "荷物預かり", value: cloakroom });

  if (station) {
    const walk = museumInfo.stationWalkingMinutes;
    items.push({
      icon: TrainFront,
      label: "最寄駅",
      value: walk ? `${station}（徒歩${walk}分）` : station,
    });
  }

  if (busStop) {
    const walk = museumInfo.busStopWalkingMinutes;
    items.push({
      icon: Bus,
      label: "最寄バス停",
      value: walk ? `${busStop}（徒歩${walk}分）` : busStop,
    });
  }

  if (museumInfo.guidedTourAvailable) {
    const fee = museumInfo.guidedTourFee;
    items.push({
      icon: BookHeadphones,
      label: "音声ガイド",
      value: [
        "あり",
        fee ? `£${fee}` : null,
        langs && langs !== "英語" ? langs : null,
      ]
        .filter(Boolean)
        .join(" / "),
    });
  }

  const amenities = [
    museumInfo.cafeteriaAvailable && { icon: Utensils, label: "カフェ" },
    museumInfo.shopAvailable && { icon: ShoppingCart, label: "ショップ" },
    museumInfo.wifiAvailable && { icon: Wifi, label: "Wi-Fi" },
  ].filter(Boolean) as { icon: React.ElementType; label: string }[];

  if (items.length === 0 && amenities.length === 0) return null;

  return (
    <section className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-6">
        <span className="inline-block rounded-full bg-slate-600 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white">
          Essentials
        </span>
        <h2 className="mt-3 text-2xl font-bold tracking-tight">基本情報</h2>
      </div>

      <dl className="grid grid-cols-1 gap-x-6 gap-y-4 rounded-xl border border-border bg-card p-5 sm:grid-cols-2">
        {items.map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-start gap-3">
            <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <div className="min-w-0">
              <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {label}
              </dt>
              <dd className="mt-0.5 text-sm">{value}</dd>
            </div>
          </div>
        ))}
      </dl>

      {amenities.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {amenities.map(({ icon: Icon, label }) => (
            <span
              key={label}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground"
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </span>
          ))}
        </div>
      )}
    </section>
  );
}
