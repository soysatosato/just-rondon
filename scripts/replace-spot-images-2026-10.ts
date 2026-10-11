/**
 * 権利に問題のある画像を差し替える・外す(2026-10、AdSense 不承認後の監査)。
 *
 * 1. 観光スポット3件の画像を Wikimedia Commons の写真に差し替える。
 *    - hyde-park-winter-wonderland / shreks-adventure-london は英語版
 *      Wikipedia のローカルファイル(ロゴ・公式写真)だった。英語版の
 *      非フリー画像はフェアユースを根拠に Wikipedia の記事の中でだけ
 *      置かれているもので、外部のサイトでは使えない。
 *    - abbey-road-beatles はアルバム『Abbey Road』のジャケットだった。
 *      Commons は米国での著作権切れ(PD-URAA 等)として置いているが、
 *      撮影者 Iain Macmillan は2006年没で、英国でも日本でも保護期間内。
 *    シュレックの館内の写真は Commons に無いので、入居している
 *    カウンティ・ホールの外観にする。
 *
 * 2. 作品ページの写真のうち、著作権の残る作品(作者が1956年以降に没、
 *    または存命)を外す。写真は館内で運営者が撮ったものだが、絵画・
 *    版画・写真・書は撮影しても作品の複製になり、作品の権利が残る。
 *    彫刻・工芸も、展示替えのある館内の作品は英国の Freedom of Panorama
 *    (CDPA s.62「恒久的に設置」)に確実には当たらないので、同じく外す。
 *    外した写真は Supabase ストレージに残っており、URL はこのファイルの
 *    実行ログと DB のバックアップから戻せる。
 *
 * 3. 幅 2560px の縮小版 URL を 1280px に直す。2560 は Wikimedia が生成を
 *    許している幅(lib/og.ts の WIKIMEDIA_THUMB_WIDTHS)に無く、400 が
 *    返って写真が出ていなかった(読み物 Content の主画像)。
 *
 * このあと scripts/fill-spot-image-credits.ts を流すと、差し替えた画像が
 * 1280px 版になり、作者とライセンスの表記が入る。何度流しても結果は同じ
 * (差し替え済みの行は飛ばす)。
 *
 *   npx tsx scripts/replace-spot-images-2026-10.ts --dry
 *   npx tsx scripts/replace-spot-images-2026-10.ts
 */
import "dotenv/config";
import db from "../utils/db";
import { parseWikimediaUrl } from "./lib/article-image";

const DRY = process.argv.includes("--dry");

const UA =
  "just-rondon/1.0 (https://www.just-rondon.com; content image resolver)";

/** スポットの slug → 差し替える Commons のファイル名。 */
const ATTRACTION_IMAGES: Record<string, string> = {
  "abbey-road-beatles": "Abbey Road zebra crossing 2026-04-01.jpg",
  "hyde-park-winter-wonderland":
    "Winter Wonderland, Hyde Park, London - geograph.org.uk - 4749324.jpg",
  "shreks-adventure-london": "County Hall London seen from Westminster Bridge.jpg",
};

/**
 * 写真を外す作品。美術館の slug と作品名(DB の title)で指す。
 * 括弧内は作者と没年(存命なら「存命」)。英国の保護期間は没後70年の
 * 年末までなので、2026年時点では1955年以前に没した作者の作品は切れている
 * (マティス1954・ピカビア1953・ペヒシュタイン1955・新納忠之介1954 は残す)。
 */
const ARTWORKS_WITHOUT_PHOTO: { museum: string; title: string }[] = [
  // テート・モダン
  { museum: "tate-modern", title: "扇子" }, // ローランサン 1956
  { museum: "tate-modern", title: "肖像画（マリー・ロランサン、セシリア・デ・マドラソと犬ココ）" }, // ローランサン 1956
  { museum: "tate-modern", title: "ナルキッソスの変容" }, // ダリ 1989
  { museum: "tate-modern", title: "ロブスター電話" }, // ダリ 1989
  { museum: "tate-modern", title: "小さな夜の音楽" }, // タニング 2012
  { museum: "tate-modern", title: "現代アフリカ美術の博物館" }, // メシャック・ガバ 存命
  { museum: "tate-modern", title: "イヴァ" }, // ジョーン・ミッチェル 1992
  { museum: "tate-modern", title: "再生：子どもの夢の響き" }, // エル＝サラヒ
  { museum: "tate-modern", title: "センティネル" }, // シモーヌ・リー 存命
  { museum: "tate-modern", title: "LOVE Red Violet" }, // ロバート・インディアナ 2018
  { museum: "tate-modern", title: "新聞を持つ男" }, // マグリット 1967
  { museum: "tate-modern", title: "兵士の神格化" }, // 山下菊二 1986
  { museum: "tate-modern", title: "ブラック・オン・マルーン" }, // ロスコ 1970
  { museum: "tate-modern", title: "古代の知識の響き" }, // エドガー・カレル 存命
  { museum: "tate-modern", title: "バベル" }, // シルド・メイレレス 存命
  { museum: "tate-modern", title: "ゲリラ・ガールズ" }, // ゲリラ・ガールズ 存命
  { museum: "tate-modern", title: "噴水" }, // デュシャン 1968
  { museum: "tate-modern", title: "穴" }, // 嶋本昭三 2013
  { museum: "tate-modern", title: "燃える国" }, // アラフマイアニ 存命
  { museum: "tate-modern", title: "無題（イール・シリーズより、ヴェネツィア）" }, // ウッドマン 1981
  { museum: "tate-modern", title: "ルンゲンフリュゲル" }, // ピピロッティ・リスト 存命
  { museum: "tate-modern", title: "女性が運営するタックス・ヘイブン" }, // モンスター・チェトウィンド 存命
  { museum: "tate-modern", title: "マリリン・ディプティック" }, // ウォーホル 1987
  // テート・ブリテン
  { museum: "tate-britain", title: "モリー・ハウス" }, // パブロ・ブロンスタイン 存命
  // ナショナル・ギャラリー
  { museum: "national-gallery", title: "母性" }, // ピカソ 1973
  // V&A
  { museum: "victoria-and-albert-museum", title: "V&Aロタンダ・シャンデリア" }, // チフーリ 存命
  // 大英博物館
  { museum: "british-museum", title: "かしら（文楽人形） 文七" }, // 四代目大江巳之助 1997
  { museum: "british-museum", title: "色絵狛犬" }, // 小松美刃 存命
  { museum: "british-museum", title: "早春の響" }, // 今野忠一 2013
  { museum: "british-museum", title: "人の布" }, // エル・アナツイ 存命
  { museum: "british-museum", title: "プカラ" }, // Spinifex の作家たち 2013年作
  { museum: "british-museum", title: "ストロング・マン" }, // ティネイ・マシャヤ 存命
  { museum: "british-museum", title: "茶室" }, // 1990年作
  { museum: "british-museum", title: "初代中村鴈治郎の紙屋治兵衛" }, // 吉川観方 1979
  { museum: "british-museum", title: "敬愛" }, // 豊道春海 1970
  { museum: "british-museum", title: "マンダリン・バタフライシリーズ" }, // キャロライン・イー・チェン 存命
];

/** Commons のファイル名から原本の URL を引く。 */
async function originalUrl(fileName: string): Promise<string> {
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
  const url = page?.imageinfo?.[0]?.url;
  if (!url) throw new Error(`File not found on Commons: ${fileName}`);
  return String(url).split("?")[0];
}

async function main() {
  for (const [slug, fileName] of Object.entries(ATTRACTION_IMAGES)) {
    const row = await db.attraction.findUnique({
      where: { slug },
      select: { id: true, image: true },
    });
    if (!row) throw new Error(`Attraction not found: ${slug}`);
    const current = parseWikimediaUrl(row.image)?.fileName.replace(/_/g, " ");
    if (current === fileName) continue;
    const image = await originalUrl(fileName);
    console.log(`Attraction/${slug}\n  ${row.image}\n  → ${image}`);
    if (!DRY) {
      // 表記は fill-spot-image-credits.ts が入れ直す。古い画像の表記を
      // 残さないよう、ここで空にしておく。updatedAt は変えない。
      await db.$executeRaw`
        UPDATE "Attraction"
        SET image = ${image}, "imageSource" = NULL, "imageCredit" = NULL, "imageLink" = NULL
        WHERE id = ${row.id}`;
    }
  }

  for (const { museum, title } of ARTWORKS_WITHOUT_PHOTO) {
    const rows = await db.artwork.findMany({
      where: { title, museum: { slug: museum } },
      select: { id: true, image: true },
    });
    if (rows.length !== 1) {
      throw new Error(`Expected 1 artwork for ${museum}/${title}, got ${rows.length}`);
    }
    const [row] = rows;
    if (!row.image) continue;
    console.log(`Artwork/${museum}/${title}\n  ${row.image} → (なし)`);
    if (!DRY) {
      await db.$executeRaw`
        UPDATE "Artwork"
        SET image = NULL, "imageSource" = NULL, "imageCredit" = NULL, "imageLink" = NULL
        WHERE id = ${row.id}`;
    }
  }

  const broken = await db.content.findMany({
    where: { image: { contains: "/2560px-" } },
    select: { id: true, slug: true, image: true },
  });
  for (const row of broken) {
    const image = row.image!.replace("/2560px-", "/1280px-");
    console.log(`Content/${row.slug}\n  ${row.image}\n  → ${image}`);
    if (!DRY) {
      await db.$executeRaw`UPDATE "Content" SET image = ${image} WHERE id = ${row.id}`;
    }
  }

  console.log(`\n${DRY ? "[dry] " : ""}done`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
