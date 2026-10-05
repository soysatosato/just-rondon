/**
 * 時間別の回り方(lib/time-routes)の点検。読むだけで、DB には書かない。
 *
 *   npx tsx scripts/check-time-routes.ts
 *
 * 順路はコードに書いてあり、作品ページや近くのスポットへのリンクを
 * 手で書いた slug と id で張っている。作品が消えたり非公開になったりすると
 * リンクが黙って404になるので、順路を直したときと、作品データを
 * 入れ替えたときに流す。見るのは次のとおり。
 *
 * - attractionSlug が公開中の Attraction にあるか(旅程に入れるキー)
 * - museumSlug が Museum にあり、lib/museum-attraction-pairs.ts と一致するか
 * - href の作品がその館のものとして存在するか、スポットが公開中か
 * - 段の分数が旅程に入れられる値か、地点の合計が段の分数を超えないか
 * - 1文の答えに段の名前がすべて入っているか
 * - マークダウン記法が混ざっていないか(表示側はプレーンテキスト)
 * - 確認日から180日を過ぎていないか(過ぎていたら公式で確かめ直す)
 *
 * 問題があれば一覧を出して終了コード1で終わる。
 */

import db from "../utils/db";
import { isValidStayMinutes } from "../lib/plan";
import { attractionSlugForMuseum } from "../lib/museum-attraction-pairs";
import { TIME_ROUTE_GUIDES } from "../lib/time-routes";

const STALE_DAYS = 180;

async function main() {
  const problems: string[] = [];
  const today = new Date();

  for (const guide of TIME_ROUTE_GUIDES) {
    const where = guide.attractionSlug;

    const attraction = await db.attraction.findUnique({
      where: { slug: guide.attractionSlug },
      select: { isPublished: true, durationText: true },
    });
    if (!attraction?.isPublished) {
      problems.push(`${where}: 公開中の Attraction がない`);
    }

    if (guide.museumSlug) {
      const museum = await db.museum.findUnique({
        where: { slug: guide.museumSlug },
        select: { id: true },
      });
      if (!museum) problems.push(`${where}: Museum ${guide.museumSlug} がない`);
      if (attractionSlugForMuseum(guide.museumSlug) !== guide.attractionSlug) {
        problems.push(`${where}: museum-attraction-pairs の対応と一致しない`);
      }
    }

    for (const label of guide.routes.map((r) => r.label)) {
      if (!guide.answer.includes(label)) {
        problems.push(`${where}: 答えに「${label}」が入っていない`);
      }
    }

    const checked = new Date(`${guide.checkedAt}T00:00:00Z`);
    const age = Math.floor((today.getTime() - checked.getTime()) / 86_400_000);
    if (age > STALE_DAYS) {
      problems.push(`${where}: 確認日 ${guide.checkedAt} から${age}日たっている`);
    }

    const texts = [guide.answer, ...guide.notes];

    for (const route of guide.routes) {
      if (!isValidStayMinutes(route.minutes)) {
        problems.push(`${where} ${route.label}: 旅程に入れられない分数 ${route.minutes}`);
      }
      const total = route.stops.reduce((sum, stop) => sum + stop.minutes, 0);
      if (total > route.minutes) {
        problems.push(
          `${where} ${route.label}: 地点の合計${total}分が段の${route.minutes}分を超える`,
        );
      }
      texts.push(route.summary, route.tip ?? "");

      for (const stop of route.stops) {
        texts.push(stop.title, stop.where, stop.note);
        if (!stop.href) continue;

        const artwork = stop.href.match(/^\/museums\/([a-z0-9-]+)\/artworks\/([0-9a-f-]{36})$/);
        const spot = stop.href.match(/^\/sightseeing\/([a-z0-9-]+)$/);
        if (artwork) {
          const [, museumSlug, id] = artwork;
          const found = await db.artwork.findUnique({
            where: { id },
            select: { museum: { select: { slug: true } } },
          });
          if (found?.museum.slug !== museumSlug) {
            problems.push(`${where} ${route.label} 「${stop.title}」: 作品 ${id} が ${museumSlug} にない`);
          }
        } else if (spot) {
          const found = await db.attraction.findUnique({
            where: { slug: spot[1] },
            select: { isPublished: true },
          });
          if (!found?.isPublished) {
            problems.push(`${where} ${route.label} 「${stop.title}」: スポット ${spot[1]} が公開されていない`);
          }
        } else {
          problems.push(`${where} ${route.label} 「${stop.title}」: 点検できない href ${stop.href}`);
        }
      }
    }

    for (const text of texts) {
      if (/\*\*|\]\(|^#/.test(text)) {
        problems.push(`${where}: マークダウン記法が混ざっている「${text.slice(0, 30)}…」`);
      }
    }

    const summary = guide.routes
      .map((r) => {
        const total = r.stops.reduce((sum, stop) => sum + stop.minutes, 0);
        return `${r.label}(${r.stops.length}か所・見る時間${total}分/${r.minutes}分)`;
      })
      .join(" ");
    console.log(`${where}  掲載値「${attraction?.durationText ?? "-"}」  ${summary}`);
  }

  if (problems.length > 0) {
    console.log(`\n問題 ${problems.length}件:`);
    for (const problem of problems) console.log(`- ${problem}`);
    process.exitCode = 1;
  } else {
    console.log(`\n${TIME_ROUTE_GUIDES.length}件、問題なし`);
  }
}

main().finally(() => db.$disconnect());
