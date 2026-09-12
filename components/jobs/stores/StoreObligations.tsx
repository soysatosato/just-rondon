// components/jobs/stores/StoreObligations.tsx
import { Card } from "@/components/ui/card";
import type { ObligationTally, StoreAggregate } from "@/utils/service-charge";

/**
 * 法定義務の3項目。雇用主に義務があり、かつ働く人が自分で確認できるもの。
 *
 * 2026年9月の設問刷新で聞き始めた項目なので、それ以前の回答はすべて未回答になる。
 * 1件も答えが無い店舗では、空の表を出さずにブロックごと消す。
 */

const ITEMS: {
  key: "writtenPolicy" | "onPayslip" | "kitchenIncluded";
  label: string;
  /** 「いいえ」が問題になる項目かどうか。 */
  note: string;
}[] = [
  {
    key: "writtenPolicy",
    label: "書面のチップポリシーがある",
    note: "分配のルールを書面にし、働く人が読める状態にしておくことは雇用主の義務です。",
  },
  {
    key: "onPayslip",
    label: "給与明細に別項目で載る",
    note: "記録は3年間保存する義務があり、従業員は過去3年分の支払い記録を閲覧できます。",
  },
  {
    key: "kitchenIncluded",
    label: "キッチンにも分配される",
    note: "分配の対象はフロアに限られません。一律の除外は公平性の観点で争点になります。",
  },
];

function Row({ label, note, tally }: { label: string; note: string; tally: ObligationTally }) {
  if (tally.answered === 0 && tally.unknown === 0) return null;

  return (
    <li className="space-y-1">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="shrink-0 text-xs tabular-nums text-muted-foreground">
          はい {tally.yes}・いいえ {tally.no}
          {tally.unknown > 0 && `・わからない ${tally.unknown}`}
        </p>
      </div>
      <p className="text-xs leading-relaxed text-muted-foreground">{note}</p>
    </li>
  );
}

export default function StoreObligations({ store }: { store: StoreAggregate }) {
  const answered = ITEMS.some(
    (item) => store[item.key].answered > 0 || store[item.key].unknown > 0,
  );
  if (!answered) return null;

  return (
    <Card className="p-5">
      <p className="text-sm font-medium">法律が求めていることは満たされているか</p>
      <p className="mt-0.5 text-xs text-muted-foreground">
        徴収ありの回答{store.collectedCount}件のうち、答えのあったものだけを数えています
      </p>
      <ul className="mt-4 space-y-3">
        {ITEMS.map((item) => (
          <Row
            key={item.key}
            label={item.label}
            note={item.note}
            tally={store[item.key]}
          />
        ))}
      </ul>
    </Card>
  );
}
