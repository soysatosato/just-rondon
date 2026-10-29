/**
 * 2027年1月の行事を Event に足す(「1月のロンドン」/events/january の一覧)。
 *
 *   npx tsx scripts/add-events-2027-01.ts           # 足す行を表示するだけ
 *   npx tsx scripts/add-events-2027-01.ts --apply   # DBへ反映
 *
 * 2026-10-29、1月の本文(lib/london-months/content/january.ts)を書いたときに
 * 足した。月のページは、その年の行事が1件でもあればそれだけを出し、無ければ
 * 前の年の行事を「去年の日程」として出す(utils/actions/months.ts)。
 *
 * 入れるのは日付が確かなものだけ。元日とバーンズ・ナイト(1月25日)は日付が
 * 固定、元日のパレードは毎年1月1日、ロンドン・アート・フェアは会場の公式
 * ページで確かめた。2026年にあったマイム・ロンドンは、2027年の日程を公式で
 * 確かめられなかったので入れていない(発表されたら足す)。
 *
 * 説明文は2026年の行から写さずに書き直した。あちらには「例年50万人以上」
 * 「英国最大級」のような確かめていない言い方があった。太字は使わない。
 *
 * 冪等。同じ題で同じ開始日の行があれば飛ばす。
 */
import db from "../utils/db";

const APPLY = process.argv.includes("--apply");

const EVENTS = [
  {
    title: "New Year's Day（元日）",
    description:
      "元日。祝日で、店や飲食店は休みか短縮営業が多く、ナショナル・ギャラリーのように元日も休む美術館がある。",
    startDate: "2027-01-01",
    endDate: "2027-01-01",
    displayOrder: 1,
  },
  {
    title: "London New Year's Day Parade（ロンドン新年パレード）",
    description:
      "ピカデリーからホワイトホールまでの約3kmを、世界各地のマーチングバンドやダンサーが練り歩く。沿道で見るのは無料。2027年の出発時刻はまだ発表されていない(2026年は13時に出発)。",
    startDate: "2027-01-01",
    endDate: "2027-01-01",
    displayOrder: 2,
  },
  {
    title: "London Art Fair（ロンドン・アート・フェア）",
    description:
      "イズリントンのビジネス・デザイン・センターで開かれる、近代・現代美術のアートフェア。2027年は1月19日の夕方がVIPプレビューで、一般公開は20〜24日。",
    startDate: "2027-01-20",
    endDate: "2027-01-24",
    displayOrder: 3,
    website: "https://www.businessdesigncentre.co.uk/event/london-art-fair-2027/",
    venue: "ビジネス・デザイン・センター",
    area: "イズリントン",
  },
  {
    title: "Burns Night（バーンズ・ナイト）",
    description:
      "スコットランドの詩人ロバート・バーンズの誕生日、1月25日を祝う夜。スコットランド料理の店やパブで、ハギスを食べ、バーンズの詩を読む夕食会が開かれる。",
    startDate: "2027-01-25",
    endDate: "2027-01-25",
    displayOrder: 5,
  },
];

async function main() {
  let added = 0;
  for (const e of EVENTS) {
    if (e.description.includes("**")) throw new Error(`太字は使わない: ${e.title}`);
    const start = new Date(`${e.startDate}T00:00:00Z`);
    const exists = await db.event.findFirst({ where: { title: e.title, startDate: start } });
    if (exists) {
      console.log(`= ${e.startDate} ${e.title}(済み)`);
      continue;
    }
    console.log(`+ ${e.startDate}〜${e.endDate} ${e.title}`);
    added++;
    if (APPLY) {
      await db.event.create({
        data: {
          title: e.title,
          description: e.description,
          startDate: start,
          endDate: new Date(`${e.endDate}T00:00:00Z`),
          displayOrder: e.displayOrder,
          website: e.website ?? null,
          venue: e.venue ?? null,
          area: e.area ?? null,
        },
      });
    }
  }
  console.log(`\n${APPLY ? "反映" : "表示のみ(--apply で反映)"}: ${added}件`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
