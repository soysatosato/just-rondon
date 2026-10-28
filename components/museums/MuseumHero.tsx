"use client";

import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { OpeningHoursTable } from "@/components/museums/OpeningHoursTable";
import { MapPin, Clock, Ticket, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import ImageCredit from "@/components/shared/ImageCredit";
import { IMAGE_SIZES, responsiveImage } from "@/lib/wikimedia-image";

type OpeningHour = {
  dayOfWeek: string;
  openTime: string | null;
  closeTime: string | null;
};

/** "2026-11-02" → "2026年11月2日" */
function formatJaDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${y}年${m}月${d}日`;
}

export default function MuseumHero({
  museum,
  longClosure = null,
  facts = null,
}: {
  museum: any;
  /**
   * 改修などの長期休館中なら、その開始日と補足(lib/christmas/closures.ts)。
   * あるときは曜日の開館時間を「本日」に出さない。
   */
  longClosure?: { from: string; note: string | null } | null;
  /**
   * 観光スポットと対になる館(lib/museum-attraction-pairs.js)では、料金と
   * 所要時間を Attraction の文言のまま出す。同じページのファクトバーと
   * 旅行プランが読むのはそちらで、Museum の数値(£◯・分)を丸めて出すと
   * 「2〜3時間」と「目安 3時間」のように同じページの中で書き方が割れる。
   */
  facts?: { price: string | null; duration: string | null } | null;
}) {
  const today = new Date();
  const dayOfWeek = today.toLocaleDateString("en-US", { weekday: "long" });
  const hours: OpeningHour[] = museum.openingHours ?? [];
  const todayHours = hours.find((h) => h.dayOfWeek === dayOfWeek);
  const openToday =
    !longClosure && todayHours?.openTime && todayHours?.closeTime
      ? `${todayHours.openTime}–${todayHours.closeTime}`
      : null;

  const minutes = museum.museumInfo?.recommendedDuration as number | undefined;
  const isFree = facts
    ? (facts.price?.startsWith("無料") ?? false)
    : museum.price === 0;
  const priceLabel = facts
    ? facts.price
    : isFree
      ? "常設展 無料"
      : `£${museum.price}〜`;
  const durationLabel = facts
    ? facts.duration
    : minutes
      ? minutes >= 60
        ? `${Math.round((minutes / 60) * 10) / 10}時間`
        : `${minutes}分`
      : null;

  return (
    <section className="mt-4">
      {/* 画像 */}
      <div className="relative h-[240px] w-full overflow-hidden rounded-2xl md:h-[380px]">
        <img
          {...responsiveImage(museum.image, IMAGE_SIZES.wide)}
          alt={museum.name}
          className="absolute inset-0 h-full w-full object-cover"
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />

        <div className="absolute inset-x-0 bottom-0 p-5 md:p-8">
          {museum.engName && (
            <p className="text-xs uppercase tracking-[0.2em] text-white/80 md:text-sm">
              {museum.engName}
            </p>
          )}
          <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-white drop-shadow-sm md:text-4xl">
            {museum.name}
          </h1>
          <div className="mt-3 flex flex-wrap gap-2">
            {priceLabel && (
              <Badge
                className={
                  isFree
                    ? "bg-emerald-700 text-white hover:bg-emerald-700"
                    : "bg-slate-900/80 text-white hover:bg-slate-900/80"
                }
              >
                <Ticket className="mr-1 h-3 w-3" />
                {priceLabel}
              </Badge>
            )}
            {durationLabel && (
              <Badge className="bg-slate-900/80 text-white hover:bg-slate-900/80">
                <Timer className="mr-1 h-3 w-3" />
                目安 {durationLabel}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Commons の CC BY / BY-SA は作者とライセンスの表示が利用の条件。 */}
      <ImageCredit
        source={museum.imageSource}
        credit={museum.imageCredit}
        link={museum.imageLink}
        className="mt-1.5 px-1 text-right"
      />

      {/* 実務情報のバー */}
      <div className="mt-4 flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1.5 text-sm">
          <p className="flex items-center gap-2">
            <Clock className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="text-muted-foreground">本日:</span>
            <strong className={openToday ? "" : "text-destructive"}>
              {longClosure ? "長期休館中" : (openToday ?? "休館")}
            </strong>
          </p>
          {longClosure && (
            <p className="pl-6 text-xs leading-relaxed text-muted-foreground">
              {/* note は休館データの文体(である調)なので、こちらも体言止めで揃える。 */}
              {formatJaDate(longClosure.from)}から休館中。
              {longClosure.note}
            </p>
          )}
          <p className="flex items-start gap-2">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="text-muted-foreground">{museum.address}</span>
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                開館時間
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto border border-border bg-background p-2">
              <OpeningHoursTable openingHours={museum.openingHours} />
            </PopoverContent>
          </Popover>

          <Button asChild size="sm" variant="outline">
            <Link
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                `${museum.engName ?? museum.name} ${museum.address} London`,
              )}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              地図で見る
            </Link>
          </Button>

          {museum.website && (
            <Button asChild size="sm">
              <Link
                href={museum.website}
                target="_blank"
                rel="noopener noreferrer"
              >
                公式サイト
              </Link>
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
