import "dotenv/config";
import db from "../utils/db";

// 画像が未設定のまま公開されていたコラム7本に、Wikimedia Commons の
// 自由ライセンス画像を割り当てる。ColumnCard / ColumnDetail は image が
// 無いと画像枠ごと消える作りなので、一覧での見え方が他と揃っていなかった。
const IMAGES: { slug: string; image: string }[] = [
  {
    // 蛇口が2本ある洗面台そのもの（CC BY-SA 4.0 / Trosmisiek）
    slug: "why-british-basins-still-have-two-taps-the-tank-in-the-loft-and-the-law-that-outlived-it",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/a/ab/Separate_Taps_UK.jpg",
  },
  {
    // 儀式が行われるストランドの王立裁判所（CC BY-SA 4.0 / The wub）
    slug: "the-quit-rents-ceremony-paying-eight-centuries-of-rent-on-land-nobody-can-find",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/3/3a/Royal_Courts_of_Justice_exterior_-_01.jpg",
  },
  {
    // Edward Francis Burney によるレースの情景画（CC0 / Yale Center for British Art）
    slug: "doggett-s-coat-and-badge-the-world-s-oldest-boat-race-and-the-vanished-trade-that-still-rows-it",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/5/5b/Edward_Francis_Burney_-_View_at_Chelsea_of_the_Annual_Sculling_Race_for_Doggett%27s_Coat_and_Badge_-_B2001.2.695_-_Yale_Center_for_British_Art.jpg",
  },
  {
    // 燃えるロンドンを川から描いた同時代の絵（PD）
    slug: "a-woman-might-piss-it-out-the-five-days-that-burned-london-the-great-fire-story-part-1",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/b/b6/Great_Fire_London.jpg",
  },
  {
    // 150年刻まれ続けた嘘＝モニュメントの碑文（CC BY-SA 2.0 / Michael Garlick）
    slug: "the-man-everyone-knew-was-innocent-robert-hubert-and-the-lie-carved-into-london-for-150-years-the-great-fire-story-part-2",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/c/cf/City_of_London%2C_The_Monument%2C_latin_inscription_-_geograph.org.uk_-_7907623.jpg",
  },
  {
    // 大火から生まれた火災保険。契約者の家だけを消すための保険プレート（PD）
    slug: "the-court-built-only-to-decide-who-pays-for-a-burnt-house-insurance-fire-brigades-and-the-rules-that-rebuilt-london-the-great-fire-story-part-3-final",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/d/d0/Two_old_fire_insurance_plaques._11_Princelet_Street.jpg",
  },
  {
    // 国営パブの実物。カーライルの Gretna Tavern（PD）
    slug: "when-the-british-government-owned-the-pubs-57-years-of-nationalised-beer-and-the-law-that-made-buying-a-round-a-crime",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/5/5f/Gretna_Tavern_Lowther_Street_Carlisle_Cumbria_Postcard_Sanbride_%2850580803993%29.jpg",
  },
];

async function main() {
  const dryRun = process.argv.includes("--dry");

  for (const { slug, image } of IMAGES) {
    const content = await db.content.findFirst({
      where: { slug, category: "column" },
      select: { id: true, title: true, image: true },
    });

    if (!content) {
      console.warn(`SKIP (not found): ${slug}`);
      continue;
    }
    // 既に画像があるものは上書きしない。この移行は「無いものを埋める」だけ。
    if (content.image?.trim()) {
      console.log(`SKIP (has image): ${slug}`);
      continue;
    }

    if (dryRun) {
      console.log(`WOULD SET ${slug}\n  -> ${image}`);
      continue;
    }

    await db.content.update({ where: { id: content.id }, data: { image } });
    console.log(`SET ${slug}\n  -> ${image}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
