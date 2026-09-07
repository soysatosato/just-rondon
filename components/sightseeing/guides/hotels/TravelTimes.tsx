import {
  destinationById,
  origins,
  type TravelLeg,
  type TravelTimeTable,
} from "@/lib/hotels/travel-times";
import table from "./travel-times.json";

/**
 * そのエリアからの実際の所要時間。
 *
 * 本文は「移動時間で決まる」と言いながら数字を1つも持っていなかった。
 * ここが入ることで、Zone 3 を避けろという主張が読者の側で検算できる。
 *
 * 表示上の判断:
 *
 * 1. **エリアごとのカードの中に置き、全エリアの一覧表にはしない。**
 *    13エリア × 10行き先の表はスマホで横スクロールになる。この記事は
 *    以前まさにそれ(5列のGFMテーブル)で失敗しており、同じ轍は踏まない。
 *    読者は検討中の1〜2エリアしか見ないので、カードの中で足りる。
 *
 * 2. **「直通」を強調する。** 乗換0回はスーツケースを持つ日と、観劇の
 *    帰りに効く。分数だけ並べると同じ40分でも直通と乗換2回が同じ顔で
 *    並んでしまうが、この2つは体感がまるで違う。
 *
 * 3. **徒歩圏は分数より先に「徒歩」と言う。** 「大英博物館まで11分」より
 *    「徒歩11分」のほうが強い情報で、エリアを選ぶ決め手になる。
 *
 * 4. **乗ったほうが速い場合でも、歩ける距離なら併記する。** Covent Garden
 *    から大英博物館は乗車13分・徒歩14分。数字では乗車が勝つが、この1分差で
 *    「歩ける」という事実を消すと、エリア選びに一番効く情報が落ちる。
 *    WALKABLE_MAX_MINUTES 以内なら小さく添える。
 */

/**
 * 「歩ける」と併記する上限。
 *
 * 25分は、観光の行き帰りに1日2回歩いても苦にならない上限として置いた。
 * これを超えると、歩けはしても選択肢として数えられなくなる。
 */
const WALKABLE_MAX_MINUTES = 25;

const data = table as TravelTimeTable;

function Chip({ leg }: { leg: TravelLeg }) {
  const dest = destinationById(leg.destinationId);
  if (!dest) return null;

  return (
    <li className="rounded-lg bg-gray-50 px-2.5 py-2 dark:bg-neutral-800/60">
      <p className="truncate text-xs text-gray-500 dark:text-gray-400" title={dest.label}>
        {dest.label}
      </p>
      <p className="mt-0.5 flex items-baseline gap-1.5">
        <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
          {leg.minutes}分
        </span>
        {leg.walkOnly ? (
          <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
            徒歩
          </span>
        ) : leg.changes === 0 ? (
          <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
            直通
          </span>
        ) : (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            乗換{leg.changes}回
          </span>
        )}
      </p>
      {!leg.walkOnly &&
        leg.walkMinutes !== undefined &&
        leg.walkMinutes <= WALKABLE_MAX_MINUTES && (
          <p className="mt-0.5 text-[11px] text-emerald-700 dark:text-emerald-400">
            歩けば{leg.walkMinutes}分
          </p>
        )}
      {dest.note && (
        <p className="mt-0.5 text-[11px] leading-snug text-gray-400 dark:text-gray-500">
          {dest.note}
        </p>
      )}
    </li>
  );
}

export default function TravelTimes({ areaId }: { areaId: string }) {
  const legs = data.areas[areaId];
  if (!legs || legs.length === 0) return null;

  const origin = origins.find((o) => o.id === areaId);
  const airports = legs.filter(
    (l) => destinationById(l.destinationId)?.kind === "airport"
  );
  const landmarks = legs.filter(
    (l) => destinationById(l.destinationId)?.kind === "landmark"
  );

  return (
    <div className="mt-4 border-t border-gray-200 pt-3 dark:border-neutral-700">
      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
        ここからの所要時間
        {origin && (
          <span className="ml-1 font-normal">（{origin.station} 起点）</span>
        )}
      </p>

      {landmarks.length > 0 && (
        <ul className="mt-2 grid grid-cols-2 gap-1.5 sm:grid-cols-3">
          {landmarks.map((l) => (
            <Chip key={l.destinationId} leg={l} />
          ))}
        </ul>
      )}

      {airports.length > 0 && (
        <>
          <p className="mt-3 text-xs font-semibold text-gray-500 dark:text-gray-400">
            空港へ
          </p>
          <ul className="mt-1.5 grid grid-cols-2 gap-1.5 sm:grid-cols-3">
            {airports.map((l) => (
              <Chip key={l.destinationId} leg={l} />
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

/** 数字の出どころ。セクションの末尾に一度だけ出す。 */
export function TravelTimesNote() {
  return (
    <p className="mt-3 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
      所要時間は TfL（ロンドン交通局）の経路検索を{data.departure.label}
      で引いた実測値です。時間帯・運行状況で変わるため目安として扱ってください。
      各エリアの代表駅からの値で、宿の位置によって数分前後します。
    </p>
  );
}
