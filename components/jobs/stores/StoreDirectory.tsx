// components/jobs/stores/StoreDirectory.tsx
import StoreRow from "./StoreRow";
import { postcodeArea, type StoreAggregate } from "@/utils/service-charge";

/**
 * 店舗別一覧。ポストコードの地区ごとにまとめて全件をそのまま出す。
 *
 * ダッシュボードの StoreExplorer は絞り込みのためにクライアントで
 * 一部だけを描くが、こちらは検索から来た人が着地するページなので、
 * 全店舗のリンクを最初からHTMLに含める。
 */

/** 地区記号の並び。ロンドン中心部から外へ。ここに無い記号は末尾にまとめる。 */
const AREA_ORDER = ["W", "WC", "EC", "E", "N", "NW", "SE", "SW"] as const;

const AREA_LABEL: Record<string, string> = {
  W: "W｜ソーホー・メイフェア・ケンジントン",
  WC: "WC｜ブルームズベリー・コヴェントガーデン",
  EC: "EC｜シティ",
  E: "E｜イーストエンド",
  N: "N｜イズリントン・北部",
  NW: "NW｜カムデン・北西部",
  SE: "SE｜サウスバンク・南東部",
  SW: "SW｜チェルシー・南西部",
};

const OTHER_LABEL = "ロンドン以外";

function groupByArea(stores: StoreAggregate[]) {
  const groups = new Map<string, StoreAggregate[]>();
  for (const store of stores) {
    const area = postcodeArea(store.postcode);
    const key = area && AREA_LABEL[area] ? area : OTHER_LABEL;
    const list = groups.get(key);
    if (list) list.push(store);
    else groups.set(key, [store]);
  }

  const ordered: { key: string; label: string; stores: StoreAggregate[] }[] = [];
  for (const area of AREA_ORDER) {
    const list = groups.get(area);
    if (list) ordered.push({ key: area, label: AREA_LABEL[area], stores: list });
  }
  const rest = groups.get(OTHER_LABEL);
  if (rest) ordered.push({ key: OTHER_LABEL, label: OTHER_LABEL, stores: rest });

  return ordered;
}

export default function StoreDirectory({
  stores,
}: {
  stores: StoreAggregate[];
}) {
  const groups = groupByArea(stores);

  if (groups.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border p-8 text-center">
        <p className="text-sm font-medium text-foreground">
          まだ公開できる店舗がありません
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {groups.map((group) => (
        <section key={group.key}>
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h3 className="text-base font-bold tracking-tight">
              {group.label}
            </h3>
            <p className="text-xs tabular-nums text-muted-foreground">
              {group.stores.length}店舗
            </p>
          </div>
          <ul className="mt-3 divide-y divide-border overflow-hidden rounded-xl border border-border">
            {group.stores.map((store) => (
              <StoreRow key={store.placeId} store={store} />
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
