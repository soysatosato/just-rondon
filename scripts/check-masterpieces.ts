/**
 * 名作ページ(lib/masterpieces)の点検。読むだけで、DB には書かない。
 *
 *   npx tsx scripts/check-masterpieces.ts
 *
 * 名作ページは検索に載せるので、古い記録や切れたリンクを残さない。
 * 名作を足したとき、作品データを入れ替えたとき、月に1回流す。見るのは次のとおり。
 *
 * - 作品がその館のものとして DB にあるか
 * - 同じ部屋の作品へのリンクが、同じ館の作品を指しているか
 * - 人が確かめた記録(checked)から90日を過ぎていないか
 * - 写真が Commons の1200px以上で、見るところが3点あるか
 * - 公式の作品ページが参考資料に入っているか
 * - 公式を毎日読む館(ナショナル・ギャラリー)は、いまの公式の表示が
 *   checked と同じか。違えば checked を直す(ページは公式を読んで正しく
 *   出しているが、公式が読めない日に古い記録が出てしまう)
 * - 展示中なら、DB の Artwork.room が公式の部屋と同じか(作品の一覧や
 *   館のページは DB の部屋を出す)
 *
 * 問題があれば一覧を出して終了コード1で終わる。
 */

import db from "../utils/db";
import {
  MASTERPIECE_GUIDES,
  masterpiecePath,
  readsPlacementDaily,
  type MasterpieceGuide,
  type Placement,
} from "../lib/masterpieces";
import {
  nationalGalleryFloorplanUrl,
  parseNationalGalleryLocation,
  parseNationalGalleryRoomState,
} from "../lib/masterpieces/national-gallery-parse";

const STALE_DAYS = 90;
const MIN_PHOTO_WIDTH = 1200;

async function fetchText(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: { "User-Agent": "just-rondon (+https://www.just-rondon.com)" },
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`${url} が ${res.status} を返した`);
  return res.text();
}

function describe(p: Placement): string {
  switch (p.state) {
    case "on-display":
      return `${p.level} ${p.room}`;
    case "not-on-display":
      return "Not on display";
    case "on-loan":
      return `On loan: ${p.to}`;
  }
}

/** 公式の表示を読み、checked との違いと、DB の部屋との違いを返す。 */
async function checkOfficial(
  guide: MasterpieceGuide,
  dbRoom: string | null,
): Promise<string[]> {
  const where = masterpiecePath(guide);
  const problems: string[] = [];

  const location = parseNationalGalleryLocation(await fetchText(guide.officialUrl));
  const official: Placement =
    location.state === "on-display"
      ? { state: "on-display", level: location.level, room: location.room }
      : location;

  console.log(`  ${guide.name}: 公式は ${describe(official)}`);

  if (describe(official) !== describe(guide.checked.placement)) {
    problems.push(
      `${where}: 公式は「${describe(official)}」、checked は「${describe(guide.checked.placement)}」。checked を直す`,
    );
  }

  if (location.state === "on-display") {
    const roomState = parseNationalGalleryRoomState(
      await fetchText(nationalGalleryFloorplanUrl(location.levelSlug)),
      location.levelSlug,
      location.roomSlug,
    );
    console.log(`    館内図での ${location.room}: ${roomState}`);
    if (roomState === "unknown") {
      problems.push(`${where}: 館内図に ${location.room} の札が見つからない`);
    }
    if (dbRoom !== location.room) {
      problems.push(
        `${where}: DB の Artwork.room は「${dbRoom}」、公式は「${location.room}」`,
      );
    }
  }

  return problems;
}

async function main() {
  const problems: string[] = [];
  const today = Date.now();

  for (const guide of MASTERPIECE_GUIDES) {
    const where = masterpiecePath(guide);

    const artwork = await db.artwork.findUnique({
      where: { id: guide.artworkId },
      select: { room: true, museum: { select: { slug: true } } },
    });
    if (!artwork) {
      problems.push(`${where}: 作品が DB に無い`);
      continue;
    }
    if (artwork.museum.slug !== guide.museumSlug) {
      problems.push(`${where}: 作品の館は ${artwork.museum.slug}`);
    }

    for (const work of guide.sameRoom ?? []) {
      const id = work.href.split("/").pop() ?? "";
      const other = await db.artwork.findUnique({
        where: { id },
        select: { museum: { select: { slug: true } } },
      });
      if (!other || other.museum.slug !== guide.museumSlug) {
        problems.push(`${where}: 同じ部屋の「${work.label}」のリンク先が無い`);
      }
    }

    const age = (today - Date.parse(`${guide.checked.on}T12:00:00Z`)) / 86_400_000;
    if (age > STALE_DAYS) {
      problems.push(
        `${where}: checked が ${guide.checked.on}(${Math.floor(age)}日前)。公式で確かめ直す`,
      );
    }

    if (
      !guide.photo.url.startsWith("https://upload.wikimedia.org/") ||
      guide.photo.width < MIN_PHOTO_WIDTH
    ) {
      problems.push(`${where}: 写真が Commons の${MIN_PHOTO_WIDTH}px以上でない`);
    }
    if (guide.lookFor.length !== 3) {
      problems.push(`${where}: 見るところが${guide.lookFor.length}点`);
    }
    if (!guide.sources.some((s) => s.url === guide.officialUrl)) {
      problems.push(`${where}: 参考資料に公式の作品ページが無い`);
    }

    if (readsPlacementDaily(guide.museumSlug)) {
      try {
        problems.push(...(await checkOfficial(guide, artwork.room)));
      } catch (error) {
        problems.push(
          `${where}: 公式が読めない(${error instanceof Error ? error.message : error})`,
        );
      }
    }
  }

  if (problems.length > 0) {
    console.log(`\n問題 ${problems.length}件`);
    for (const p of problems) console.log(`- ${p}`);
    process.exitCode = 1;
  } else {
    console.log(`\n${MASTERPIECE_GUIDES.length}点、問題なし`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
