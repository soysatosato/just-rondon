import { formatRange, resolveItems, seasonYear } from "@/lib/christmas";
import type { SeasonKind } from "@/lib/christmas/types";
import { buildIcs, icsResponse, type IcsEvent } from "@/lib/ics";
import { londonDate } from "@/lib/publish-schedule";

/**
 * クリスマス特集の「開幕・点灯日をまとめてカレンダーに入れる」。
 *
 * そのシーズンに日付が発表されたもののうち、まだ始まっていないものの初日を
 * 終日の予定にする。会期まるごとを予定にすると、2か月続く棒がカレンダーを
 * 埋めてしまうので、会期は説明文に書く。未発表のものは入れない(予想の日付は
 * 載せないという特集の決まりと同じ)。
 */
export const revalidate = 3600;

const STARTS: Record<SeasonKind, string> = {
  lights: "の点灯",
  market: "が始まる",
  rink: "がオープン",
  event: "が始まる",
  show: "の初日",
};

export function GET() {
  const today = londonDate(new Date());
  const year = seasonYear(today);
  const events: IcsEvent[] = resolveItems(year).flatMap((item) => {
    const edition = item.edition;
    if (!edition?.start || edition.start < today) return [];
    return [
      {
        uid: `christmas-${year}-${item.slug}`,
        title: `${item.shortTitle}${STARTS[item.kind]}`,
        start: edition.start,
        description: [
          item.summary,
          `会期: ${formatRange(edition)}`,
          `入場: ${item.entry}`,
          `最寄り駅: ${item.station}`,
          `${edition.checkedAt}に公式の発表で確かめた日付です。変わることがあるので、行く前に公式の案内を見てください。`,
        ].join("\n"),
        path: item.href,
        location: item.station,
      },
    ];
  });
  return icsResponse(
    `london-christmas-${year}.ics`,
    buildIcs(`ロンドンのクリスマス ${year}`, events),
  );
}
