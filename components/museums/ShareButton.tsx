"use client";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Share2 } from "lucide-react";
import { Button } from "../ui/button";
import ShareActions from "@/components/money/salary-calculator/ShareActions";

/**
 * 美術館ページの共有。中身は手取り計算機と同じ ShareActions(リンクのコピー・
 * 端末の共有シート・X・LINE)。以前は react-share を使っていて、作品の
 * スライダー(swiper)と合わせて美術館ページだけ gzip で約50KB 重かった。
 */
export default function ShareButton({
  museumId,
  name,
}: {
  name: string;
  museumId: string;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        {/* アイコンだけのボタンなので名前を付ける。以前は名前が無く、
            読み上げでは「ボタン」としか聞こえなかった。 */}
        <Button
          variant="outline"
          size="icon"
          aria-label={`${name}を共有`}
          className="h-11 w-11"
        >
          <Share2 className="h-4 w-4" aria-hidden />
        </Button>
      </PopoverTrigger>
      <PopoverContent side="top" align="end" sideOffset={10} className="w-auto max-w-[calc(100vw-2rem)]">
        <ShareActions
          path={`/museums/${museumId}`}
          shareText={name}
          title={name}
          copyLabel="リンクをコピー"
        />
      </PopoverContent>
    </Popover>
  );
}
