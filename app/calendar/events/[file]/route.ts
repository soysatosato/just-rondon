import { eventGuidePath, getEventGuide, pickEdition } from "@/lib/annual-events";
import { buildIcs, icsResponse } from "@/lib/ics";
import { londonDate } from "@/lib/publish-schedule";

/**
 * 年中行事ガイドの「カレンダーに追加」。/calendar/events/<slug>.ics
 *
 * 次の開催(まだ終わっていない最初の年)の日程を、会場ごとに終日の予定にする。
 * 次回が未発表なら配らない。
 */
export const revalidate = 3600;

export function GET(_req: Request, { params }: { params: { file: string } }) {
  const slug = params.file.replace(/\.ics$/, "");
  const guide = params.file.endsWith(".ics") ? getEventGuide(slug) : null;
  if (!guide) return new Response("Not found", { status: 404 });

  const { edition, upcoming } = pickEdition(guide, londonDate(new Date()));
  if (!upcoming) return new Response("Not found", { status: 404 });

  const events = edition.dates.map((d, i) => ({
    uid: `event-${guide.slug}-${edition.year}-${i}`,
    title: d.label ? `${guide.title}(${d.label})` : guide.title,
    start: d.date,
    end: d.endDate,
    description: [
      ...(d.time ? [d.time] : []),
      ...edition.notes,
      `${edition.checkedAt}に公式の発表で確かめた日程です。変わることがあるので、行く前に公式の案内を見てください。`,
    ].join("\n"),
    path: eventGuidePath(guide),
  }));
  return icsResponse(
    `${guide.slug}-${edition.year}.ics`,
    buildIcs(`${guide.title} ${edition.year}`, events),
  );
}
