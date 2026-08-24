/**
 * 観光スポットのファクトバーの欠けを埋める(推薦度3以下)。
 *
 *   npx tsx scripts/fill-attraction-facts-level3.ts                   # ドライラン
 *   npx tsx scripts/fill-attraction-facts-level3.ts --apply           # 投入
 *   npx tsx scripts/fill-attraction-facts-level3.ts --apply --slug=london-zoo
 *
 * 冪等。指定した項目だけを上書きし、ここに書いていない項目には触らない。
 * ロジックは fill-attraction-facts-2026-08.ts と同一。推薦度で分けているのは
 * 出典コメントが1ファイルに収まらなくなったためだけ。
 *
 * ------------------------------------------------------------------
 * 「常時開放」をどう書くか
 * ------------------------------------------------------------------
 * 残っていた欠けの多くは、公共の広場・橋・公道に面した市場で、
 * そもそも開館時間という概念がない場所だった。ここを空のままにすると、
 * 読者からは「調べていないページ」と区別がつかない。
 *
 * かといって「24時間」と書くと、夜間に行っても同じものが見られるという
 * 誤解を生む(照明が落ちる、店が閉まる、治安が変わる)。そこで
 * 「常時開放」+ 補足という形にそろえた。事実として開いていることと、
 * 行く時間帯の判断材料を同時に渡すのが狙い。
 *
 * ------------------------------------------------------------------
 * 裏取り(2026-08-25 時点)
 * ------------------------------------------------------------------
 * - ロンドン動物園: 3/28〜9/2は10:00〜17:00、9/3〜10/23は10:00〜16:00、
 *   10/24〜2/12は10:00〜15:00。最終入場は閉園1時間前。所要3〜4時間。
 *   Camden Town 徒歩15分。
 *   https://www.londonzoo.org/plan-your-visit/opening-times
 * - ケンウッド・ハウス: 10:00〜17:00(冬季16:00)。入場無料。
 *   https://www.english-heritage.org.uk/visit/places/kenwood/prices-and-opening-times/
 * - ロイヤル・アカデミー: 火〜日 10:00〜18:00(金曜21:00まで)、月曜休み。
 *   https://www.royalacademy.org.uk/page/opening-times
 * - サーペンタイン・ギャラリーズ: 展覧会期中は火〜日 10:00〜18:00。無料。
 *   https://www.serpentinegalleries.org/visit/
 * - サー・ジョン・ソーン美術館: 水〜日 10:00〜17:00(最終入場16:30)、
 *   月火休み。無料だが時間指定券が要る。
 *   https://www.soane.org/your-visit
 * - バンケティング・ハウス: 2026年は8/1〜9/20の木〜月 10:00〜16:00
 *   (最終入場15:00)、火水休み。所要45分〜1時間。会期が年ごとに変わるため
 *   「公式で確認」を添える。
 *   https://www.hrp.org.uk/banqueting-house/visit/opening-and-closing-times/
 * - フローレンス・ナイチンゲール博物館: 火〜日 10:00〜17:00(最終入場16:30)。
 *   https://www.florence-nightingale.co.uk/visiting-us/
 * - IFSクラウド・ケーブルカー: 月〜木 8:00〜21:00、金 9:00〜22:00、
 *   土 9:00〜23:00、日祝 9:00〜21:00。
 *   https://tfl.gov.uk/modes/london-cable-car/opening-hours-frequency
 * - パディントン・ベア・エクスペリエンス: 10:00〜18:00、週7日。
 *   https://paddingtonbearexperience.com/
 * - レドンホール・マーケット: 通路そのものは常時開放。店舗の営業時間は
 *   個別に異なる。所要30分ほど。
 *   https://leadenhallmarket.co.uk/visit/
 * - ビスター・ヴィレッジ: 月〜土 9:00〜21:00、日 10:00〜19:00。
 *   https://www.thebicestercollection.com/bicester-village/en/opening-hours/
 * - チェシントン: 10:00開園、閉園は時期により17:00〜18:00。
 *   レゴランド・ウィンザー: 10:00開園、閉園は16:30〜17:00前後。
 *   どちらも日ごとに変わるので「公式で確認」を添える。所要は1日。
 *   https://www.chessington.com / https://www.legoland.co.uk
 * - マンション・ハウス: ツアーは£9.50(割引£7.50)、所要1時間。
 *   https://www.cityoflondon.gov.uk/about-us/about-the-city-of-london-corporation/mansion-house/mansion-house-tours
 * - ランベス宮殿: 通常のツアーは現在休止中で、2026年内の再開を予定。
 *   標準の大人料金は£12。開催状況が流動的なので公式確認を促す。
 *   https://www.archbishopofcanterbury.org/node/33/tours-and-open-days
 * - BBCテレビジョン・センター: 2012年にBBCが売却済みで、スタジオの
 *   一般見学はできない。番組観覧はブロードキャスティング・ハウス側。
 *   建物は外から見るのみなので開館時間が存在しない。
 *   https://www.bbc.co.uk/showsandtours
 * - 公共空間(常時開放): ミレニアム・ブリッジ、パーラメント・スクエア、
 *   フォース・プラインス(トラファルガー広場)、ザ・ガーキン(外観のみ)、
 *   映画スター銅像ストリート(レスター・スクエア)、
 *   クリスタルパレス・パーク、コーラムズ・フィールズ、
 *   ダイアナ妃メモリアル・プレイグラウンド、ゴールダーズ・ヒル・パーク。
 *   公園は日没で閉まるものがあるため、その旨を添える。
 *   https://www.royalparks.org.uk/parks/kensington-gardens/diana-memorial-playground
 *   https://www.coramsfields.org/
 */

import "dotenv/config";
import db from "../utils/db";

type Facts = {
  priceAdult?: string;
  priceChild?: string;
  durationText?: string;
  nearestStation?: string;
  openingHours?: string;
};

export const FACTS: Record<string, Facts> = {
  // ---- 開館時間のある施設 ----
  "london-zoo": {
    durationText: "3〜4時間",
    nearestStation: "Camden Town 徒歩15分",
    openingHours: "10:00〜17:00 (時期により16:00・15:00、最終入場は閉園1時間前)",
  },
  "kenwood-house-hampstead": {
    openingHours: "10:00〜17:00 (冬季は16:00まで)",
  },
  "royal-academy-of-arts": {
    openingHours: "火〜日 10:00〜18:00 (金曜21:00まで、月休)",
  },
  "serpentine-galleries": {
    openingHours: "火〜日 10:00〜18:00 (展覧会期中、月休)",
  },
  "sir-john-soanes-museum": {
    openingHours: "水〜日 10:00〜17:00 (最終入場16:30、月火休)",
  },
  "banqueting-house-london": {
    durationText: "45分〜1時間",
    openingHours: "夏季公開 木〜月 10:00〜16:00 (会期は公式で確認)",
    // 既存値は £5.00 で、現在の £10.00 の半額だった。いつの時点の値かは
    // 追えないが、倍に開いた料金を出したままにはできない。
    // 16歳未満は無料なので、子ども料金は "無料" に直す。
    priceAdult: "£10.00",
    priceChild: "無料 (16歳未満)",
  },
  "florence-nightingale-museum": {
    openingHours: "火〜日 10:00〜17:00 (最終入場16:30)",
  },
  "ifs-cloud-cable-car-london": {
    openingHours: "月〜木 8:00〜21:00 / 金 9:00〜22:00 / 土 9:00〜23:00 / 日 9:00〜21:00",
  },
  "paddington-bear-experience": {
    openingHours: "10:00〜18:00",
  },
  "bicester-village": {
    openingHours: "月〜土 9:00〜21:00 / 日 10:00〜19:00",
  },
  "chessington-world-of-adventures": {
    durationText: "1日",
    openingHours: "10:00開園 (閉園は日により17:00〜18:00、公式で確認)",
  },
  "legoland-windsor": {
    durationText: "1日",
    openingHours: "10:00開園 (閉園は日により16:30〜17:00、公式で確認)",
  },
  "mansion-house-london": {
    priceAdult: "£9.50 (割引£7.50)",
    openingHours: "ツアーのみ (開催日は公式で確認)",
  },
  "lambeth-palace": {
    openingHours: "ツアーは現在休止中 (再開時期は公式で確認)",
  },
  "leadenhall-market-london": {
    durationText: "30分",
    openingHours: "通路は常時開放 (店舗の営業時間は個別に異なる)",
  },

  // ---- 常時開放の公共空間 ----
  // 「24時間」ではなく「常時開放」と書く。夜も同じものが見られるという
  // 誤解を避けつつ、開館時間を気にせず行けることは伝える。
  "millennium-bridge": {
    openingHours: "常時開放",
  },
  "parliament-square": {
    openingHours: "常時開放 (広場の外周のみ、中央の芝生は立入制限あり)",
  },
  "the-fourth-plinth-trafalgar-square": {
    openingHours: "常時開放 (屋外の彫刻)",
  },
  "the-gherkin-30-st-mary-axe": {
    openingHours: "常時開放 (外観のみ。内部はオフィスで一般公開なし)",
  },
  "movie-statue-street-leicester-square": {
    openingHours: "常時開放 (屋外の銅像)",
  },
  "crystal-palace-dinosaurs": {
    openingHours: "常時開放 (公園は日没で閉まる)",
  },
  "corams-fields": {
    durationText: "1〜2時間",
    nearestStation: "Russell Square 徒歩5分",
    openingHours: "9:00〜日没 (大人は子ども同伴でのみ入場可)",
  },
  "diana-princess-of-wales-memorial-playground": {
    durationText: "1〜2時間",
    openingHours: "10:00〜日没 (大人は子ども同伴でのみ入場可)",
  },
  "golders-hill-park-zoo": {
    durationText: "1時間",
    openingHours: "常時開放 (動物エリアは日没まで)",
  },
  // BBC は建物の外観のみ。スタジオ見学はできないので開館時間が存在しない。
  "bbc-television-centre": {
    openingHours: "外観のみ (スタジオの一般見学は不可)",
  },
  // BTタワーは2024年にMCR Hotelsへ売却され、ホテルへの転用が決まっている。
  // ただしBTの通信設備の移設に数年かかるため、当面は一般公開されない。
  // 回転展望レストランは1980年から閉鎖されたまま。
  "bt-tower-london": {
    openingHours: "外観のみ (一般公開なし。ホテルへ転用予定)",
  },
};

/**
 * 埋めないと決めたもの(このファイルの担当ぶん)。
 * fill-attraction-facts-2026-08.ts の INTENTIONALLY_EMPTY と合わせて読むこと。
 *
 * - 予約制の体験・ツアー(alcotraz / gripped / the-crystal-maze /
 *   wee-toast-tours / the-ghost-bus-tours / 58th-street-london /
 *   ballie-ballerson / bat-and-ball / the-cauldron / monopoly-lifesized /
 *   f1-drive-london / london-bridge-experience / paradox-museum /
 *   shreks-adventure / cutty-sark-rig-climb / dare-skywalk /
 *   afternoon-tea-bus / taylor-swift-afternoon-tea-bus-tour /
 *   nye-london-eye / prehistoric-planet / jack-the-ripper-museum):
 *   開催枠が日ごとに変わり、公式でも固定の営業時間を出していない。
 *   代表値を書くと外れたときに読者を空振りさせるので空のままにする。
 * - スタジアムツアー(london-stadium / kia-oval / chelsea / fulham):
 *   試合日程で運休するため固定の時間が出せない。
 * - ナショナル・トラストの邸宅(osterley-park / sutton-house / fenton-house):
 *   季節で開館日が大きく変わり、冬季は閉まる。
 * - 王室関連(st-jamess-palace / queen-charlottes-cottage):
 *   セント・ジェームズ宮殿は内部非公開(衛兵交代の経路として外から見る)。
 *   クイーン・シャーロット・コテージは年に数日のみ開く。
 * - 小規模館(emery-walkers-house / kelmscott-house):
 *   開館が週1〜2日で予約制。公式の案内も流動的。
 * - phantom-peak: 会場移転中(2026年12月にウェストフィールド・
 *   ストラトフォードで再開予定)。再開後に入れる。
 * - royal-ballet-opera-london: 公演ごとに価格が違い、代表値を出せない。
 * - harry-potter-shop-platform-934: 店舗なので所要時間の概念が薄い。
 * - arcelormittal-orbit-zip-world-london: 滑走とタワー入場で料金体系が
 *   分かれており、単一の代表値にできない。
 */
export const INTENTIONALLY_EMPTY = [
  "alcotraz-immersive-prison-cocktail-experience",
  "gripped-london",
  "the-crystal-maze-live-experience-london",
  "wee-toast-tours",
  "the-ghost-bus-tours",
  "58th-street-london",
  "ballie-ballerson-london",
  "bat-and-ball-stratford",
  "the-cauldron",
  "monopoly-lifesized-london",
  "f1-drive-london",
  "london-bridge-experience-and-tombs",
  "paradox-museum-london",
  "shreks-adventure-london",
  "cutty-sark-rig-climb-experience",
  "the-dare-skywalk-tottenham-hotspur-stadium",
  "afternoon-tea-bus-london",
  "taylor-swift-afternoon-tea-bus-tour",
  "nye-london-eye-riverside-rooms",
  "prehistoric-planet-london",
  "jack-the-ripper-museum",
  "london-stadium-tour",
  "kia-oval-cricket-tour",
  "chelsea-stamford-bridge-tour",
  "fulham-craven-cottage-tour",
  "osterley-park-and-house",
  "sutton-house-breakers-yard",
  "fenton-house-hampstead",
  "st-jamess-palace",
  "queen-charlottes-cottage",
  "emery-walkers-house",
  "kelmscott-house-william-morris-society",
  "phantom-peak",
  "royal-ballet-opera-london",
  "harry-potter-shop-platform-934",
  "arcelormittal-orbit-zip-world-london",
  "chimney-lift-battersea-power-station",
  "hop-on-hop-off-bus-tour-london",
  "the-total-london-experience-tour",
];

const APPLY = process.argv.includes("--apply");
const SLUG_ARG = process.argv.find((a) => a.startsWith("--slug="));

async function main() {
  const slugs = SLUG_ARG ? [SLUG_ARG.split("=")[1]] : Object.keys(FACTS);

  for (const slug of slugs) {
    if (!FACTS[slug]) {
      console.error(`✗ ${slug}: FACTS にありません`);
      process.exitCode = 1;
      return;
    }
  }

  console.log(APPLY ? "== 投入 ==\n" : "== ドライラン(--apply で投入) ==\n");

  let filled = 0;
  let overwritten = 0;

  for (const slug of slugs) {
    const a = await db.attraction.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        priceAdult: true,
        priceChild: true,
        durationText: true,
        nearestStation: true,
        openingHours: true,
      },
    });
    if (!a) {
      console.error(`✗ ${slug}: 見つかりません`);
      process.exitCode = 1;
      continue;
    }

    const next = FACTS[slug];
    const lines: string[] = [];
    for (const [key, value] of Object.entries(next)) {
      const before = (a as Record<string, unknown>)[key] as string | null;
      if (before === value) continue;
      if (before) {
        lines.push(`    ${key}: "${before}" → "${value}"  ★上書き`);
        overwritten++;
      } else {
        lines.push(`    ${key}: (空) → "${value}"`);
        filled++;
      }
    }

    if (lines.length === 0) {
      console.log(`${a.name} (${slug})\n    変更なし\n`);
      continue;
    }

    console.log(`${a.name} (${slug})`);
    lines.forEach((l) => console.log(l));

    if (APPLY) {
      await db.attraction.update({ where: { id: a.id }, data: next });
      console.log("    → 更新");
    }
    console.log("");
  }

  console.log(`対象 ${slugs.length}件 / 空欄を埋めた ${filled}項目 / 上書き ${overwritten}項目`);
  if (!APPLY) console.log("\n--apply を付けると投入します。");
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
