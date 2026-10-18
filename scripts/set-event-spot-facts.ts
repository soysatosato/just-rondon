/**
 * 会期のある催し(観光スポットとして載せているもの)のファクトバーを埋める。
 *
 *   npx tsx scripts/set-event-spot-facts.ts           # 差分を表示
 *   npx tsx scripts/set-event-spot-facts.ts --apply   # DBへ反映
 *
 * 催しの「開催日時」は Attraction.openingHours に書く。ファクトバーは
 * 会期のある催し(components/sightseeing/categories.ts の isTimeLimitedEvent)
 * のとき、この欄を「開館時間」ではなく「開催日時」と呼ぶ。
 *
 * 公式に確かめた事実だけを入れる。発表されていない値(翌年の料金など)は
 * 空のまま残す——ファクトバーは空の行を出さない。毎年、会期が発表されたら
 * ここを直して流し直すこと。
 *
 * 2026-10-18 に流した。それ以前の値:
 *   rhs-chelsea-flower-show       openingHours / nearestStation はどちらも null
 *   hyde-park-winter-wonderland   openingHours "10:00〜22:00 (最終入場21:30)"
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();
const apply = process.argv.includes("--apply");

type Facts = {
  openingHours?: string;
  nearestStation?: string;
  durationText?: string;
};

const UPDATES: { slug: string; facts: Facts; source: string }[] = [
  {
    // 2027年の会期・会員日・時間。料金は未掲載(2026-10-18 時点)なので入れない。
    // チケット発売は会員10月19日・一般10月21日(年の明記なし)。
    // 徒歩分は、同じページの本文(公式のアクセス案内を引いたもの)と揃える。
    //
    // durationText はあえて入れない。入れると <title> が「所要時間◯◯」の形に
    // 変わる(components/sightseeing/meta.ts)。このページは検索流入が最も多く、
    // 今のタイトルで上位に出ているので、ファクトバーのために題を動かさない。
    slug: "rhs-chelsea-flower-show",
    facts: {
      openingHours:
        "2027年5月18日〜22日 8:00〜20:00（18・19日はRHS会員のみ。22日は17:30終了）",
      nearestStation: "Sloane Square 徒歩10分",
    },
    source:
      "https://www.rhs.org.uk/shows-events/rhs-chelsea-flower-show(2026-10-18 確認)",
  },
  {
    // 会期はクリスマスマーケットのハブ(lib/christmas/markets.ts)と同じ出典。
    // 1日の時間は既存の値をそのまま残し、会期を前に足す。
    slug: "hyde-park-winter-wonderland",
    facts: {
      openingHours: "2026年11月19日〜2027年1月3日 10:00〜22:00（最終入場21:30）",
    },
    source:
      "https://hydeparkwinterwonderland.com/tickets-guide/(2026-10-11 確認)",
  },
];

async function main() {
  for (const { slug, facts, source } of UPDATES) {
    const row = await db.attraction.findUnique({
      where: { slug },
      select: { openingHours: true, nearestStation: true, durationText: true },
    });
    if (!row) {
      console.log(`!! ${slug}: 見つかりません`);
      continue;
    }

    const changes = Object.entries(facts).filter(
      ([key, value]) => row[key as keyof typeof row] !== value,
    );
    if (changes.length === 0) {
      console.log(`= ${slug}: 変更なし`);
      continue;
    }

    console.log(`~ ${slug}  (${source})`);
    for (const [key, value] of changes) {
      console.log(`    ${key}: ${JSON.stringify(row[key as keyof typeof row])} -> ${JSON.stringify(value)}`);
    }

    if (apply) {
      await db.attraction.update({ where: { slug }, data: facts });
    }
  }

  if (!apply) console.log("\n(--apply を付けると反映します)");
}

main().finally(() => db.$disconnect());
