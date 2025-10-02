import {
  Ticket,
  Camera,
  Clock,
  BadgeCheck,
  Luggage,
  SquareM,
  Bus,
  BookHeadphones,
  Languages,
  Utensils,
  ShoppingCart,
  Wifi,
  Globe,
} from "lucide-react";
import Link from "next/link";

export default function MuseumInfoLuxury({ museumInfo }: { museumInfo: any }) {
  const formatFee = (fee: any) =>
    fee === null || fee === undefined ? "ー" : `£${fee}`;

  const formatMinutes = (min: any) =>
    min === null || min === undefined ? "" : `（徒歩${min}分）`;

  return (
    <section className="max-w-4xl mx-auto px-6 py-10">
      <h2 className="text-2xl font-semibold tracking-wide text-gray-800 dark:text-gray-100 mb-6 border-b pb-2 border-gray-300 dark:border-gray-700">
        基本情報
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-5 text-gray-700 dark:text-gray-300 leading-relaxed">
        <InfoItem
          icon={Ticket}
          label="大人料金"
          value={formatFee(museumInfo.admissionFeeAdult)}
        />
        <InfoItem
          icon={Ticket}
          label="子ども料金"
          value={formatFee(museumInfo.admissionFeeChild)}
        />
        <InfoItem
          icon={Clock}
          label="所要時間"
          value={
            museumInfo.recommendedDuration
              ? `${museumInfo.recommendedDuration} min`
              : "ー"
          }
        />
        <InfoItem
          icon={BadgeCheck}
          label="予約"
          value={museumInfo.reservationRequired ? "必要" : "不要"}
        />
        <InfoItem
          icon={Camera}
          label="写真撮影"
          value={museumInfo.photographyAllowed ?? "ー"}
        />
        <InfoItem
          icon={Luggage}
          label="手荷物クローク"
          value={museumInfo.cloakroomInfo ?? "ー"}
        />
        <InfoItem
          icon={SquareM}
          label="最寄駅"
          value={
            <>
              <div className="font-medium text-gray-800 dark:text-gray-200">
                {museumInfo.nearestStation ?? "ー"}
              </div>
              {museumInfo.stationWalkingMinutes && (
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  {formatMinutes(museumInfo.stationWalkingMinutes)}
                </div>
              )}
            </>
          }
        />
        <InfoItem
          icon={Bus}
          label="最寄バス停"
          value={
            <>
              <div className="font-medium text-gray-800 dark:text-gray-200">
                {museumInfo.nearestBusStop ?? "ー"}
              </div>
              {museumInfo.busStopWalkingMinutes && (
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  {formatMinutes(museumInfo.busStopWalkingMinutes)}
                </div>
              )}
            </>
          }
        />
        <InfoItem
          icon={BookHeadphones}
          label="音声ガイド"
          value={
            museumInfo.guidedTourAvailable
              ? `あり${
                  museumInfo.guidedTourFee
                    ? `（£${museumInfo.guidedTourFee}）`
                    : ""
                }`
              : "-"
          }
        />
        <InfoItem
          icon={Languages}
          label="対応言語"
          value={museumInfo.guidedTourLanguages ?? "ー"}
        />
        <InfoItem
          icon={Utensils}
          label="カフェ"
          value={museumInfo.cafeteriaAvailable ? "あり" : "-"}
        />
        <InfoItem
          icon={ShoppingCart}
          label="ショップ"
          value={museumInfo.shopAvailable ? "あり" : "-"}
        />
        <InfoItem
          icon={Wifi}
          label="Wi-Fi"
          value={museumInfo.wifiAvailable ? "あり" : "-"}
        />
        {museumInfo.website && (
          <Link
            href={museumInfo.website}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 text-yellow-700 dark:text-yellow-400 hover:underline"
          >
            <Globe size={20} />
            <span className="text-sm font-semibold">公式サイトを見る</span>
          </Link>
        )}
      </div>
    </section>
  );
}

function InfoItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon size={20} className="text-yellow-600 dark:text-yellow-400" />
      <div>
        <div className="text-xs uppercase tracking-widest font-semibold text-gray-500 dark:text-gray-400">
          {label}
        </div>
        <div className="text-sm font-medium text-gray-800 dark:text-gray-200">
          {value}
        </div>
      </div>
    </div>
  );
}
