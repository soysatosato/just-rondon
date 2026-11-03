import { ExternalLink, MapPin } from "lucide-react";
import {
  formatCheckedOn,
  type MasterpieceGuide,
  type Placement,
} from "@/lib/masterpieces";
import {
  formatPlacementCheckedAt,
  type LivePlacement,
  type LivePlacementResult,
} from "@/lib/masterpieces/national-gallery";
import { cn } from "@/lib/utils";

/**
 * 名作ページの冒頭に置く「いまどこにあるか」。読者の問い(「◯◯ どこ」
 * 「◯◯ ない」)への答えそのものなので、写真より前に出す。
 *
 * 公式を毎日読む館で読めた日は、その結果と確認時刻を出す。読めなかった日と、
 * 毎日は読まない館は、人が最後に確かめた記録を日付つきで出し、行く前に
 * 公式で確かめるよう添える。どちらでも公式の作品ページへのリンクを置く。
 */

type Tone = "ok" | "warn" | "off";

const BADGE_CLASS: Record<Tone, string> = {
  ok: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300",
  warn: "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300",
  off: "bg-muted text-muted-foreground",
};

function describeLive(
  placement: LivePlacement,
  museumName: string,
): { badge: string; tone: Tone; text: string } {
  switch (placement.state) {
    case "on-display":
      if (placement.roomState === "closed") {
        return {
          badge: "部屋が閉まっています",
          tone: "warn",
          text: `${museumName}の ${placement.level}、${placement.room} に掛かることになっていますが、公式の館内図ではこの部屋はいま閉まっています。`,
        };
      }
      if (placement.roomState === "empty") {
        return {
          badge: "要確認",
          tone: "warn",
          text: `公式の作品ページでは ${placement.room} ですが、館内図ではこの部屋は「開いているが作品が無い」状態です。`,
        };
      }
      return {
        badge: "展示中",
        tone: "ok",
        text: `${museumName}の ${placement.level}、${placement.room} にあります。`,
      };
    case "not-on-display":
      return {
        badge: "展示外",
        tone: "off",
        text: "いまは展示されていません(公式サイトの表示は Not on display)。",
      };
    case "on-loan":
      return {
        badge: "貸し出し中",
        tone: "off",
        text: `いまは他の館へ貸し出されています。公式サイトの表示: On loan: ${placement.to}`,
      };
  }
}

function describeChecked(placement: Placement, on: string): string {
  const date = formatCheckedOn(on);
  switch (placement.state) {
    case "on-display":
      return `${date}に公式サイトで確かめたときは、${placement.level} の ${placement.room} にありました。`;
    case "not-on-display":
      return `${date}に公式サイトで確かめたときは、展示されていませんでした。`;
    case "on-loan":
      return `${date}に公式サイトで確かめたときは、${placement.to} へ貸し出されていました。`;
  }
}

export default function MasterpieceStatus({
  guide,
  museumName,
  live,
  note,
}: {
  guide: MasterpieceGuide;
  museumName: string;
  /** 公式を毎日読む館だけ。それ以外は null。 */
  live: LivePlacementResult | null;
  note: string | null;
}) {
  const officialLink = (
    <a
      href={guide.officialUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 font-medium text-link underline underline-offset-2 hover:opacity-80 dark:text-blue-400"
    >
      公式の作品ページ
      <ExternalLink className="h-3.5 w-3.5" aria-hidden />
    </a>
  );

  const current = live?.ok ? describeLive(live.placement, museumName) : null;

  return (
    <section
      aria-labelledby="masterpiece-status"
      className="rounded-2xl border border-border bg-muted/40 p-4 sm:p-5"
    >
      <h2
        id="masterpiece-status"
        className="flex flex-wrap items-center gap-2 text-lg font-semibold tracking-tight"
      >
        <MapPin className="h-5 w-5 text-muted-foreground" aria-hidden />
        いま見られるか
        {current && (
          <span
            className={cn(
              "rounded-full px-2.5 py-0.5 text-xs font-semibold",
              BADGE_CLASS[current.tone],
            )}
          >
            {current.badge}
          </span>
        )}
      </h2>

      {current && live?.ok ? (
        <>
          <p className="mt-2 text-base leading-relaxed">{current.text}</p>
          <p className="mt-1.5 text-xs text-muted-foreground">
            公式サイトで確認: {formatPlacementCheckedAt(live.checkedAt)}
            (ロンドン時間)・{officialLink}
          </p>
        </>
      ) : (
        <>
          <p className="mt-2 text-base leading-relaxed">
            {describeChecked(guide.checked.placement, guide.checked.on)}
          </p>
          <p className="mt-1.5 text-sm text-muted-foreground">
            展示の場所は変わることがあります。行く前に{officialLink}
            で確かめてください。
          </p>
        </>
      )}

      {note && (
        <p className="mt-3 border-t border-border/60 pt-3 text-sm leading-relaxed text-muted-foreground">
          {note}
        </p>
      )}
    </section>
  );
}
