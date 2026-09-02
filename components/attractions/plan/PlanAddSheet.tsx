"use client";

import { CalendarRange } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";
import { MAX_SPOTS, type PlanSpot } from "@/lib/plan";
import PlanSpotPicker from "./PlanSpotPicker";
import { usePlanCount } from "./plan-store";

/**
 * スポットを足す引き出し。
 *
 * 追加欄は本文の中に開いていた。上の共通欄を開くと日割り全体が1画面ぶん
 * 下がり、日のカードの中の欄を開くとその日から下が押し下げられる。
 * どちらも「いま見ていた場所」が動くので、1件足すたびに自分の位置を
 * 探し直すことになっていた。旅程を組む作業は追加を何十回も繰り返すもので、
 * その毎回に位置の探し直しが付く配分だった。
 *
 * 横から重ねれば、後ろの日割りは動かない。閉じたときに戻る場所も同じ。
 * 続けて何件でも足せるよう、1件足しても閉じない。
 *
 * 開いている間だけ描くので、閉じているときは候補144件ぶんの行も
 * 絞り込みの状態も持たない。開き直すと条件が白紙に戻るのは、
 * 「2日目にサウスバンクを足す」と「4日目に美術館を足す」が
 * 別の作業だから——前の条件が残っているほうが直す手数が増える。
 */
export default function PlanAddSheet({
  open,
  onOpenChange,
  spots,
  /** 追加先の日。日のカードから開いたときはその日が入っている。 */
  day,
  /** プラン全体の日数。引き出しの中で行き先を変えられるようにする。 */
  dayCount,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  spots: PlanSpot[];
  day: number;
  dayCount: number;
}) {
  const planCount = usePlanCount();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 p-0 sm:max-w-md"
      >
        {/* 右上に閉じるボタンが重なるので、見出しの右だけ空けておく。 */}
        <div className="border-b border-border px-5 pb-4 pr-12 pt-5">
          <SheetTitle className="flex items-center gap-2 text-base">
            <CalendarRange
              className="h-4 w-4 text-indigo-600 dark:text-indigo-400"
              aria-hidden
            />
            スポットを追加する
          </SheetTitle>
          <SheetDescription className="mt-1 text-xs leading-relaxed">
            続けて何件でも足せます。いま
            <span className="font-semibold text-foreground">
              {planCount}ヶ所
            </span>
            （上限{MAX_SPOTS}ヶ所）。
          </SheetDescription>
        </div>

        {/*
          絞り込みと候補だけを縦に流す。見出しと行き先の選択が一緒に
          流れると、20件目まで送ったところで「どの日に足しているのか」が
          画面から消える。
        */}
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {/*
            日を変えて開き直したら中身も作り直す。行き先は開いた時点の日で
            初期化しているので、そのままだと前に開いた日が残る。
          */}
          <PlanSpotPicker
            key={day}
            spots={spots}
            day={day}
            dayCount={dayCount}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
