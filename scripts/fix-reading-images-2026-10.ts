/**
 * コラムとイギリス英語の主画像を、幅1200px以上・1280px配信に揃える(2026-10)。
 *
 * Google Discover は幅1200px以上の画像と max-image-preview:large を
 * 大きなカードの条件にしている(lib/seo.ts の INDEXABLE_ROBOTS)。
 * 点検した時点の状態は次のとおりだった。
 *
 *   - コラム73本中31本、イギリス英語20本中7本の主画像が幅1200px未満
 *     (最小は 120x248)
 *   - 残りの多くは原本をそのまま指しており、最大18MBの写真を記事の上部と
 *     一覧のカードで読ませていた
 *
 * 1) 小さい38本は、同じ題材で幅1200px以上の Commons 画像に差し替える。
 *    肖像画などで大きな版が無い回は、関係する場所・建物・物の写真にした。
 * 2) それ以外は、原本が1280px以上なら1280px版のURLに書き換える。
 *
 * どちらも scripts/lib/article-image.ts を通すので、今後の登録と同じ
 * 条件で検査される。冪等。--dry で差分だけ表示する。
 *
 * updatedAt は更新される。OGカードのURLに updatedAt が入っており
 * (lib/og.ts)、カードには主画像が描かれるので、SNS側のキャッシュも
 * 新しい画像で取り直される。
 */
import "dotenv/config";
import db from "../utils/db";
import { resolveArticleImage } from "./lib/article-image";

const DRY = process.argv.includes("--dry");

const UA =
  "just-rondon/1.0 (https://www.just-rondon.com; article image migration)";

/** slug → 差し替え先の Commons ファイル名。 */
const REPLACEMENTS: Record<string, string> = {
  // —— コラム ——
  "the-door-slammed-in-the-king-s-face-how-one-day-in-1642-still-choreographs-british-parliament":
    "Black Rod knocking Commons door 2019.jpg",
  "why-a-single-old-penny-keeps-big-ben-on-time":
    "London , Westminster - Big Ben, Clock Face - geograph.org.uk - 2063072.jpg",
  "the-primary-school-teacher-who-sewed-punk-s-uniform-nine-years-at-430-king-s-road-the-vivienne-westwood-story-part-1":
    "Clock on World's End shop of Vivienne Westwood 4 June 2011.jpg",
  // 本文で触れているウォレス・コレクションの同じ絵の、大きな版。
  "she-dug-up-the-clothes-feminism-hated-the-punk-who-haunted-the-wallace-collection-the-vivienne-westwood-story-part-2":
    "Boucher - Daphnis and Chloe, 1743.jpg",
  "the-dame-who-rode-a-tank-from-the-palace-twirl-to-a-quiet-house-in-clapham-the-vivienne-westwood-story-part-3-final":
    "Vivian Westwood at the June 1, 2013 protest for Bradley Manning in London (8948489903).jpg",
  "why-swans-on-the-thames-are-still-counted-as-the-king-s-property-inside-800-years-of-swan-upping":
    "Swan Upping.jpg",
  "the-tree-that-sheds-its-soot-why-the-london-plane-alone-survived-the-air-of-the-industrial-revolution":
    "Berkeley Plane (4).jpg",
  "why-british-postboxes-change-their-letters-with-every-monarch-and-the-one-that-got-blown-up":
    "Edward VIII pillar box, Glasgow - geograph.org.uk - 8154970.jpg",
  // ルース・ベルヴィルの写真は小さいものしか無い。彼女が時刻を合わせに
  // 通ったグリニッジ天文台の門の時計にする。
  "the-woman-who-sold-time-104-years-of-carrying-a-single-pocket-watch-across-london":
    "Shepherd Gate clock - Greenwich Observatory - London, England - DSC00991.jpg",
  "the-pleasant-riverside-walk-that-is-actually-the-roof-of-a-sewer":
    "Victoria Embankment and the River Thames - geograph.org.uk - 8195086.jpg",
  "the-lion-that-never-weathered-eleanor-coade-and-the-stone-she-baked-in-a-kiln":
    "South Bank Lion, Westminster Bridge, London.jpg",
  "two-pieces-of-teak-in-a-glass-case-on-trafalgar-square-what-london-celebrated-on-15-august-1945":
    "Civilians and service personnel in London's Picadilly Circus celebrate the news of Allied Victory over Japan in August 1945. D25636.jpg",
  "the-white-posts-that-ring-london-how-a-tax-nobody-paid-at-the-post-built-the-embankment":
    "Coal Tax Post - geograph.org.uk - 1655786.jpg",
  "the-london-necropolis-railway-87-years-of-first-second-and-third-class-coffins":
    "The London Necropolis Railway Station, privately owned station in Westminster Bridge Road, after London's biggest night raid of the war HD-SN-99-02671.jpg",
  // ハリー・レッドファーンが設計した国営パブの1軒。
  "when-the-british-government-owned-the-pubs-57-years-of-nationalised-beer-and-the-law-that-made-buying-a-round-a-crime":
    "Carlisle - Cumberland Inn - 20180916162931.jpg",
  "the-grocer-who-voted-ignatius-sancho-the-westminster-poll-books-and-a-ballot-we-can-still-read-246-years-later":
    "Ignatius Sancho MET DP820264.jpg",
  "the-royal-warrant-is-not-a-medal-but-a-five-year-contract-how-cadbury-lost-170-years-in-a-letter-that-gave-no-reason":
    "A 'Royal Warrant' Chemists shop in Ballater - geograph.org.uk - 5785186.jpg",
  // 第1回が扱う17世紀の東インド会社船。
  "the-company-that-met-in-a-tavern-lemon-juice-pepper-and-the-right-to-make-war-the-east-india-company-story-part-1":
    "Two views of an East Indiaman of the time of King William III.jpg",
  "will-the-cows-give-their-milk-earlier-because-of-mr-willett-the-eight-years-parliament-laughed-at-william-willett-and-the-twenty-one-days-after-germany-that-made-it-law":
    "William Willett Memorial Sundial - geograph.org.uk - 2447133.jpg",
  "britain-never-put-its-name-on-the-penny-black-in-1840-and-in-1874-the-world-let-it-stay-that-way":
    "Penny-black-stamp-great-britain-circa-1840.jpg",
  "the-oxford-english-dictionary-s-greatest-contributor-was-a-murderer-12-000-slips-from-broadmoor-asylum":
    "Broadmoor Criminal Lunatic Asylum; panoramic view. Wood engr Wellcome V0047625.jpg",
  "did-a-rector-s-daughter-found-manchester-city-the-1880-church-club-built-to-stop-the-scuttlers-the-two-clubs-of-manchester-part-2":
    "Etihad Stadium, Manchester City Football Club (Ank Kumar, Infosys) 16.jpg",
  "winnie-the-pooh-was-named-after-a-real-bear-at-london-zoo-the-cub-a-canadian-army-vet-bought-at-a-station-for-20-in-1914":
    "ZSL London - Harry Colebourn and Winnie the Bear (01).jpg",
  "wimbledon-began-in-1877-to-pay-for-a-broken-pony-roller-the-first-champion-later-called-lawn-tennis-monotonous":
    "Centre Court at Wimbledon (1) - geograph.org.uk - 3551620.jpg",
  "why-the-marathon-is-42-195-km-the-1908-windsor-start-and-the-royal-myth-that-never-was":
    "Johnny Hayes - 1908 - Olympics - drawing.jpg",
  "not-twenty-thousand-pounds-in-the-treasury-the-rigged-lottery-that-founded-the-british-museum-in-1753-the-british-museum-story-part-1":
    "The British Museum at Montague House; the courtyard. Engravi Wellcome V0013502.jpg",
  "speakers-corner-was-never-a-place-where-anything-goes-the-hyde-park-crowds-who-won-rules-not-rights":
    "Hyde Park, Speakers' Corner (Szónokok Sarka). Fortepan 28398.jpg",
  "beatrix-potter-studied-fungi-the-1897-linnean-society-paper":
    "Beatrix and Peter Rabbit photo.jpg",
  // 本文で触れている、博覧会のあとキュー植物園へ移された勅使門。
  "japan-matsuri-and-the-1910-japan-british-exhibition":
    "Chokushi-Mon at Kew Gardens.jpg",
  // 1952年12月の写真で大きいものは Commons に無い。同じロンドンの濃霧の写真。
  "great-smog-of-london-1952": "Big Ben in de mist, Bestanddeelnr 254-1946.jpg",
  "the-jumbo-in-jumbo-jet-was-a-london-zoo-elephant-the-1882-sale-that-broke-britain-s-heart":
    "Kerr's spool cotton. Who bought Jumbo? Barnum, with his mighty $. Poor old Jumbo with his little friends in the zoo. - DPLA - 27c83b9f44688f00dbf0f08103739f16 (page 1).jpg",

  // —— イギリス英語 ——
  "bob-s-your-uncle":
    "Robert Arthur Talbot Gascoyne-Cecil, 3rd Marquess of Salisbury by George Frederic Watts.jpg",
  // いまの挿絵と同じ版画の、大きな版。
  posh: "The Peninsular & Oriental Steam Navigation Company's Screw Steam Ship Madras - PAH8969.jpg",
  "half-seven":
    "The Clock at Kings Cross Station, London - geograph.org.uk - 2187834.jpg",
  waffle: "Our dog (barking).jpg",
  "sent-to-coventry":
    "The ruins of the old Coventry Cathedral - geograph.org.uk - 2444833.jpg",
  "all-mouth-and-no-trousers":
    "Holmfirth - Sid's Cafe - geograph.org.uk - 7372852.jpg",
  "pear-shaped": "Four pears.jpg",
};

/** Commons のファイル名から原本のURLを引く。 */
async function commonsOriginalUrl(fileName: string): Promise<string> {
  const query = new URLSearchParams({
    action: "query",
    format: "json",
    prop: "imageinfo",
    iiprop: "url",
    titles: `File:${fileName}`,
  });
  const res = await fetch(`https://commons.wikimedia.org/w/api.php?${query}`, {
    headers: { "User-Agent": UA },
  });
  const json = (await res.json()) as any;
  const page: any = Object.values(json?.query?.pages ?? {})[0];
  const url: string | undefined = page?.imageinfo?.[0]?.url;
  if (!url) throw new Error(`Not on Commons: ${fileName}`);
  return url;
}

async function main() {
  const rows = await db.content.findMany({
    where: { category: { in: ["column", "british-english"] } },
    select: { id: true, slug: true, category: true, image: true },
    orderBy: { createdAt: "asc" },
  });

  const unknown = Object.keys(REPLACEMENTS).filter(
    (slug) => !rows.some((r) => r.slug === slug),
  );
  if (unknown.length) throw new Error(`Unknown slugs: ${unknown.join(", ")}`);

  let replaced = 0;
  let resized = 0;
  let unchanged = 0;
  const failures: string[] = [];

  for (const row of rows) {
    const replacement = REPLACEMENTS[row.slug];
    if (!row.image && !replacement) continue;

    // Wikimedia の縮小版生成の制限(429)に当たらないよう間を空ける。
    await new Promise((resolve) => setTimeout(resolve, 1500));

    try {
      const source = replacement
        ? await commonsOriginalUrl(replacement)
        : row.image!;
      const { url, width, height } = await resolveArticleImage(source);

      if (url === row.image) {
        unchanged += 1;
        continue;
      }

      const kind = replacement ? "replace" : "resize";
      console.log(`${kind.padEnd(7)} ${row.category} ${row.slug}`);
      console.log(`        ${row.image}`);
      console.log(`     -> ${url} (${width}x${height})`);

      if (!DRY) {
        await db.content.update({ where: { id: row.id }, data: { image: url } });
      }
      if (replacement) replaced += 1;
      else resized += 1;
    } catch (error) {
      failures.push(`${row.slug}: ${(error as Error).message}`);
    }
  }

  console.log(
    `\n${DRY ? "[dry] " : ""}replaced ${replaced}, resized ${resized}, unchanged ${unchanged}`,
  );
  if (failures.length) {
    console.log(`\nFailed (${failures.length}):`);
    for (const f of failures) console.log(`  ${f}`);
    process.exitCode = 1;
  }
}

main().finally(() => db.$disconnect());
