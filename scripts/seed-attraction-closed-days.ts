/**
 * 観光スポットの「休みの曜日」を closedWeekdays に入れる。
 *
 *   npx tsx scripts/seed-attraction-closed-days.ts            # ドライラン
 *   npx tsx scripts/seed-attraction-closed-days.ts --apply    # 投入
 *   npx tsx scripts/seed-attraction-closed-days.ts --report   # 未調査の一覧
 *   npx tsx scripts/seed-attraction-closed-days.ts --only <slug> [--apply]
 *                                                             # 1件だけ
 *
 * 冪等。slug を指定した行だけを更新する。
 *
 * ★ --apply は一覧の全件の closedDaysCheckedAt を今日に書き換える。
 *   確かめ直していない行まで「今日確かめた」ことになるので、1件を足したり
 *   直したりしたときは --only でその行だけを投入すること。
 *
 * ------------------------------------------------------------------
 * なぜ正規表現を使わないのか
 * ------------------------------------------------------------------
 * 直前まで lib/plan/dates.ts の parseClosedDays() が openingHours の
 * 散文から曜日を読み取っていた。155件中10件しか読めておらず、しかも
 * 書き方ひとつで誤読する(「土曜のみ」は他6日が休館だと読まれる)。
 *
 * ここでは移行元をパースしない。10件ぶんの読み取り結果は正しかったので、
 * その値を人が確認したうえで**数字として直接書いてある**。以後この列は
 * 出典を見て人が埋める。機械が推測する余地を残さない。
 *
 * ------------------------------------------------------------------
 * openingHours からの曜日の削除
 * ------------------------------------------------------------------
 * 同じ事実を2か所に置くと、改定のとき片方が取り残される。
 * closedWeekdays を入れた行は、openingHours から「休みの曜日」の記述を
 * 抜く(cleanOpeningHours)。曜日ごとに開館"時刻"が違う場合の曜日表記は
 * 残す——それは休館の情報ではないので重複しない。
 *
 *   バラ・マーケット
 *     前: 火〜金 10:00〜17:00 / 土 9:00〜17:00 / 日 10:00〜16:00（月休）
 *     後: 火〜金 10:00〜17:00 / 土 9:00〜17:00 / 日 10:00〜16:00
 *          ↑ 曜日ごとの時刻は残す。「月休」だけを列へ移す
 *
 * ------------------------------------------------------------------
 * 埋めていない行について
 * ------------------------------------------------------------------
 * closedDaysCheckedAt が null の行は「まだ調べていない」。空配列と
 * 区別できるようにしてあるのは、未調査を「毎日開いている」として
 * 出さないため。--report で残りが出る。
 */

import "dotenv/config";
import db from "../utils/db";

/** 0=月 〜 6=日。lib/plan/dates.ts の WEEKDAY_LABELS と同じ並び。 */
const MON = 0, TUE = 1, WED = 2, THU = 3, FRI = 4, SAT = 5, SUN = 6;
const LABELS = ["月", "火", "水", "木", "金", "土", "日"];

type Entry = {
  slug: string;
  /** 休みの曜日。空配列は「調べたうえで曜日休館は無い」。 */
  closed: number[];
  /** 曜日で表せない休み。1文。 */
  note?: string;
  /** openingHours から曜日の記述を抜いた形。変更が要らなければ省略。 */
  openingHours?: string;
  /** 根拠。URL か、それに準ずる出所。 */
  source: string;
};

/* ------------------------------------------------------------------ *
 * 1. 曜日休館がある行
 * ------------------------------------------------------------------ */

const CLOSED_SOME_DAYS: Entry[] = [
  {
    slug: "st-pauls-cathedral",
    closed: [SUN],
    note: "日曜は礼拝のみで、見学はできない（ドームの回廊は時期により公開）",
    source: "https://www.stpauls.co.uk/planning-your-visit",
  },
  {
    slug: "westminster-abbey",
    closed: [SUN],
    note: "日曜は礼拝のみで、見学はできない",
    source: "https://www.westminster-abbey.org/visit-us/prices-and-entry-times",
  },
  {
    slug: "kensington-palace",
    closed: [MON, TUE],
    source: "https://www.hrp.org.uk/kensington-palace/visit/opening-and-closing-times/",
  },
  {
    slug: "sir-john-soanes-museum",
    closed: [MON, TUE],
    openingHours: "10:00〜17:00 (最終入場16:30)",
    source: "https://www.soane.org/your-visit",
  },
  {
    slug: "quentin-blake-centre",
    closed: [MON, TUE],
    openingHours: "10:00〜17:00（最終入場16:00）",
    source: "https://qbcentre.org.uk/your-visit",
  },
  {
    slug: "royal-academy-of-arts",
    closed: [MON],
    openingHours: "10:00〜18:00 (金曜21:00まで)",
    source: "https://www.royalacademy.org.uk/plan-your-visit",
  },
  {
    slug: "serpentine-galleries",
    closed: [MON],
    openingHours: "10:00〜18:00 (展覧会期中)",
    source: "https://www.serpentinegalleries.org/visit/",
  },
  {
    slug: "florence-nightingale-museum",
    closed: [MON],
    openingHours: "10:00〜17:00 (最終入場16:30)",
    source: "https://www.florence-nightingale.co.uk/visit/",
  },
  {
    slug: "borough-market",
    closed: [MON],
    // 曜日ごとに時刻が違うので、曜日の表記そのものは残す。抜くのは「月休」だけ。
    openingHours: "火〜金 10:00〜17:00 / 土 9:00〜17:00 / 日 10:00〜16:00",
    source: "https://boroughmarket.org.uk/visit-us/",
  },
  {
    slug: "columbia-road-flower-market",
    closed: [MON, TUE, WED, THU, FRI, SAT],
    openingHours: "8:00〜15:00頃",
    source: "https://columbiaroad.info/",
  },
  {
    slug: "portobello-road-market",
    closed: [SUN],
    openingHours: "9:00〜18:00（木は13:00まで。アンティークの露店が出るのは土曜だけ）",
    source: "https://visitportobello.com/",
  },
  {
    slug: "banqueting-house-london",
    closed: [TUE, WED],
    note: "夏季のみ公開。会期は年によって変わる",
    openingHours: "10:00〜16:00 (夏季公開。会期は公式で確認)",
    source: "https://www.hrp.org.uk/banqueting-house/visit/",
  },
  {
    slug: "abba-voyage",
    closed: [TUE, WED],
    openingHours: "公演日は公式で確認",
    source: "https://abbavoyage.com/plan-your-visit/",
  },
  {
    slug: "emery-walkers-house",
    closed: [MON, TUE, WED, FRI, SUN],
    note: "見学はガイドツアーのみ。木曜と土曜の 11:00 と 13:00",
    source: "https://www.emerywalker.org.uk/visit",
  },
  {
    slug: "kelmscott-house-william-morris-society",
    closed: [MON, TUE, WED, SUN],
    note: "木曜と土曜は午後のみ。金曜はガイドツアーの枠だけ",
    source: "https://williammorrissociety.org/whats-on/",
  },
  /*
   * 館ではなく式なので「休み」は式の無い曜日。公式カレンダー(2026年10〜11月)は
   * 11:00の Guard Change を月・水・金にだけ載せ、火・木・土は15:00の
   * Captain's Inspection、日曜は一部の日に10:00の Sunday Parade。
   * 旅程の「この日は閉まっています」はこの値で出る(2026-10 の監査まで空で、
   * 火曜に入れても警告が出なかった)。夏に毎日になる年があるので、
   * 季節が変わったらカレンダーを見直すこと。
   */
  {
    slug: "changing-the-guard-buckingham-palace",
    closed: [TUE, THU, SAT, SUN],
    note: "11:00の衛兵交代は月・水・金。火・木・土は15:00の点検、日曜は10:00のパレードがある日がある",
    source: "https://www.householddivision.org.uk/changing-the-guard-calendar",
  },
];

/* ------------------------------------------------------------------ *
 * 2. 曜日休館が無いことを確認した行
 *
 *    「調べたら毎日開いていた」であって「調べていない」ではない。
 *    この区別のために closedDaysCheckedAt を入れる。
 * ------------------------------------------------------------------ */

const OPEN_EVERY_DAY: Entry[] = [
  { slug: "tower-of-london", closed: [], source: "https://www.hrp.org.uk/tower-of-london/visit/" },
  { slug: "british-museum-london", closed: [], source: "https://www.britishmuseum.org/visit" },
  { slug: "national-gallery-london", closed: [], source: "https://www.nationalgallery.org.uk/visiting" },
  { slug: "natural-history-museum", closed: [], source: "https://www.nhm.ac.uk/visit.html" },
  { slug: "churchill-war-rooms", closed: [], source: "https://www.iwm.org.uk/visits/churchill-war-rooms" },

  /*
   * 屋外・常時開放。openingHours が「常時開放」「終日」と書いている行で、
   * 曜日で閉まる余地が無いもの。個別に目視して選んである
   * (「常時開放」と書いてあっても中身が催しなら対象外にする)。
   */
  { slug: "trafalgar-square", closed: [], source: "屋外の広場。常時開放" },
  { slug: "piccadilly-circus", closed: [], source: "屋外の交差点。常時開放" },
  { slug: "parliament-square", closed: [], source: "屋外の広場。常時開放" },
  { slug: "millennium-bridge", closed: [], source: "屋外の橋。常時開放" },
  { slug: "the-fourth-plinth-trafalgar-square", closed: [], source: "屋外の彫刻。常時開放" },
  { slug: "movie-statue-street-leicester-square", closed: [], source: "屋外の銅像。常時開放" },
  { slug: "the-gherkin-30-st-mary-axe", closed: [], source: "外観のみ。内部は非公開" },
  { slug: "hampstead-heath", closed: [], source: "終日開放の公園" },
  { slug: "crystal-palace-dinosaurs", closed: [], source: "公園内の屋外展示。日没で閉園" },
  { slug: "golders-hill-park-zoo", closed: [], source: "公園内。動物エリアは日没まで" },
  { slug: "covent-garden", closed: [], source: "広場は終日。店舗の営業時間は個別" },
  { slug: "leadenhall-market-london", closed: [], source: "通路は常時開放。店舗の営業時間は個別" },
  { slug: "st-pancras-international", closed: [], source: "稼働中の鉄道駅。終日" },
];

const ENTRIES = [...CLOSED_SOME_DAYS, ...OPEN_EVERY_DAY];

const APPLY = process.argv.includes("--apply");
const REPORT = process.argv.includes("--report");
/** --only <slug> のときの slug。全件の確認日を書き換えずに1件だけ投入する。 */
const ONLY = (() => {
  const i = process.argv.indexOf("--only");
  return i === -1 ? null : (process.argv[i + 1] ?? "");
})();

const fmt = (days: number[]) =>
  days.length === 0 ? "曜日休館なし" : days.map((d) => LABELS[d]).join("・") + "休";

async function report() {
  const rows = await db.attraction.findMany({
    where: { isPublished: true },
    select: {
      slug: true, name: true, category: true, recommendLevel: true,
      openingHours: true, closedWeekdays: true, closedDaysCheckedAt: true,
    },
    orderBy: [{ recommendLevel: "desc" }, { name: "asc" }],
  });

  const checked = rows.filter((r) => r.closedDaysCheckedAt !== null);
  const unchecked = rows.filter((r) => r.closedDaysCheckedAt === null);

  console.log(`公開 ${rows.length}件 / 確認済み ${checked.length}件 / 未調査 ${unchecked.length}件\n`);

  console.log("=== 未調査(おすすめ度の高い順) ===");
  for (const r of unchecked) {
    console.log(`  lv${r.recommendLevel ?? 0} ${r.category.padEnd(13)} ${r.name}`);
  }

  /*
   * closedWeekdays を入れたのに openingHours にも曜日休館が残っている行。
   * 二重管理になっているので、片方を消すこと。
   */
  const drift = checked.filter(
    (r) => r.openingHours && /[月火水木金土日]\s*曜?\s*休/.test(r.openingHours),
  );
  if (drift.length > 0) {
    console.log("\n=== ★ openingHours にも休館曜日が残っている(二重管理) ===");
    for (const r of drift) console.log(`  ${r.name}  「${r.openingHours}」`);
  }

  await db.$disconnect();
}

async function main() {
  if (REPORT) return report();

  console.log(APPLY ? "== 投入 ==\n" : "== ドライラン(--apply で投入) ==\n");

  const targets = ONLY === null ? ENTRIES : ENTRIES.filter((e) => e.slug === ONLY);
  if (ONLY !== null && targets.length === 0) {
    console.error(`✗ --only ${ONLY || "(slug なし)"} は一覧にありません`);
    process.exitCode = 1;
    await db.$disconnect();
    return;
  }

  const seen = new Set<string>();
  let applied = 0;

  for (const e of targets) {
    if (seen.has(e.slug)) {
      console.error(`✗ ${e.slug} が2回出てきます`);
      process.exitCode = 1;
      continue;
    }
    seen.add(e.slug);

    const current = await db.attraction.findUnique({
      where: { slug: e.slug },
      select: {
        name: true,
        openingHours: true,
        closedWeekdays: true,
        closedDaysCheckedAt: true,
        closedNote: true,
      },
    });

    if (!current) {
      console.error(`✗ ${e.slug} が見つかりません`);
      process.exitCode = 1;
      continue;
    }

    console.log(`${current.name} (${e.slug})`);
    // 書き換える前の値。投入を取り消すときの戻し先になる。
    console.log(
      `    現在: ${current.closedDaysCheckedAt ? fmt(current.closedWeekdays) : "未調査"}` +
        (current.closedNote ? ` / 注記「${current.closedNote}」` : "") +
        (current.closedDaysCheckedAt
          ? ` / 確認 ${current.closedDaysCheckedAt.toISOString().slice(0, 10)}`
          : ""),
    );
    console.log(`    ${fmt(e.closed)}   出典: ${e.source}`);
    if (e.note) console.log(`    注記: ${e.note}`);
    if (e.openingHours && e.openingHours !== current.openingHours) {
      console.log(`    開館時間 - ${current.openingHours}`);
      console.log(`             + ${e.openingHours}`);
    }

    if (APPLY) {
      await db.attraction.update({
        where: { slug: e.slug },
        data: {
          closedWeekdays: e.closed,
          closedDaysCheckedAt: new Date(),
          ...(e.note ? { closedNote: e.note } : {}),
          ...(e.openingHours ? { openingHours: e.openingHours } : {}),
        },
      });
      console.log("    → 投入");
      applied++;
    }
    console.log("");
  }

  const withClosure = targets.filter((e) => e.closed.length > 0).length;
  console.log(
    `対象 ${targets.length}件（うち曜日休館あり ${withClosure}件 / ` +
      `毎日開いていることを確認 ${targets.length - withClosure}件）`,
  );
  if (APPLY) console.log(`投入 ${applied}件`);
  else console.log("\n--apply を付けると投入します。--report で未調査の一覧が出ます。");

  await db.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
