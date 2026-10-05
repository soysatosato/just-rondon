/**
 * 時間別の回り方(lib/time-routes)の裏取りで見つかった、古くなった事実を直す。
 *
 *   npx tsx scripts/fix-time-route-facts-2026-10.ts           # 差分を表示するだけ
 *   npx tsx scripts/fix-time-route-facts-2026-10.ts --apply   # DBへ反映
 *
 * どれも 2026-10-05 に公式サイトで確かめた。順路の隣に古い事実が残ると、
 * 同じページの中で言うことが食い違うので、順路と同時に直す。
 *
 * 1. サイエンス・ミュージアム: スティーヴンソンのロケット号は2018年に
 *    ロンドンを離れ、2026年はヨークの国立鉄道博物館にある。館の見どころ・
 *    歩き方・本文の3か所が「ここにある」と書いていた。宇宙の展示は
 *    Exploring Space ではなく Space(Level 0)になっている。ワンダーラボは
 *    地下ではなく Level 3。
 *    https://www.sciencemuseum.org.uk/see-and-do/space
 *    https://www.sciencemuseum.org.uk/see-and-do/flight
 *    https://www.sciencemuseum.org.uk/see-and-do/wonderlab-equinor-gallery
 *    https://www.railwaymuseum.org.uk/stephensons-rocket
 * 2. ロンドン塔: 衛士のツアーは30分おきではなく45分おき(10:00、日・月は
 *    10:45から、最終15:15)。所要の分数は公式に書かれていないので外す。
 *    https://www.hrp.org.uk/tower-of-london/whats-on/yeoman-warder-tours/
 * 3. 自然史博物館: 最終入場は17:20ではなく17:30。
 *    https://www.nhm.ac.uk/visit.html
 * 4. 美術館ページの開館時間(OpeningHours): ナショナル・ギャラリーは
 *    10:00〜18:00・金曜21:00まで(17:00・金曜20:30のままだった)。
 *    テート・モダンは金・土曜21:00まで(18:00のままだった)。
 *    https://www.nationalgallery.org.uk/visiting/plan-your-visit
 *    https://www.tate.org.uk/visit/tate-modern
 * 5. ナショナル・ギャラリーの作品の部屋番号: 2025年の全館の掛け替え前の
 *    番号が残っていたもののうち、公式の部屋別ページで今の部屋を確かめられた
 *    ものだけを直す(確かめられないものは触らない)。
 *    https://www.nationalgallery.org.uk/visiting/floorplans/level-2
 * 6. 大英博物館『聖なる茨の聖遺物箱』は Room 2 ではなく Room 2a。
 *    https://www.britishmuseum.org/sites/default/files/2026-05/British_Museum_map.pdf
 *
 * seed-*.ts を流し直したときに古い文に戻らないよう、元のシードの文も
 * 同じ内容に直してある。部分一致で置き換えるので、二重に流しても壊れない。
 */

import db from "../utils/db";

const APPLY = process.argv.includes("--apply");

type TextFix = { note: string; find: string; replace: string };

/** Attraction.visitFlow の1ステップ(スポットと見出しで指す)。 */
const VISIT_STEP_FIXES: (TextFix & {
  attractionSlug: string;
  title: string;
  newTitle?: string;
})[] = [
  {
    attractionSlug: "science-museum",
    title: "ロケット号",
    newTitle: "フライトの実機",
    note: "ロケット号は2018年にロンドンを離れている",
    find: "1829年、ジョージ・スティーヴンソンのレインヒル・トライアルズ優勝機。ここから世界の鉄道が始まった、と言って差し支えない機関車の実物です。イギリスが何を発明した国なのかを、1台で説明してしまいます。",
    replace:
      "Level 3には、1919年に初めて大西洋を無着陸で渡ったヴィッカース・ヴィミーや、エイミー・ジョンソンのジプシー・モスが天井から吊られています。どれも実際に空を飛んだ機体です。入場は無料で、有料のワンダーラボと同じ階にあります。",
  },
  {
    attractionSlug: "tower-of-london",
    title: "ビーフィーターのツアー",
    note: "ツアーは45分おき、最終15:15",
    find: "赤と金の制服を着たヨーマン・ウォーダーが案内する約60分のツアー。入場料に含まれていて、30分おきに正門付近から出発します。事前予約はできない当日先着制。",
    replace:
      "赤と金の制服を着たヨーマン・ウォーダー(衛士)が場内を案内するツアー。入場料に含まれ、予約は要りません。10:00(日・月曜は10:45)から45分おきに出発し、最終は15:15。天候や混雑で取りやめることがあります。",
  },
];

/** Museum.visitFlow の1ステップ。 */
const MUSEUM_STEP_FIXES: (TextFix & { museumSlug: string; title: string })[] = [
  {
    museumSlug: "science-museum",
    title: "宇宙開発のギャラリーには実物がある",
    note: "宇宙の展示は Space(Level 0)",
    find: "Exploring Space には、模型ではなく実際に宇宙へ行った機体が含まれます。ロケットの断面や着陸船を間近で見られるので、天井の高い展示室ごと見上げて回ってください。",
    replace:
      "地上階(Level 0)の Space には、実際に人を乗せて飛んだアポロ10号の司令船とソユーズ宇宙船が並んでいます。英国人で初めて宇宙へ行ったヘレン・シャーマンの宇宙服や月の石もあり、模型ではない実物の大きさが分かります。",
  },
];

/** Museum の Highlight(これだけは見て帰りたい)。 */
const HIGHLIGHT_FIXES: {
  museumSlug: string;
  title: string;
  note: string;
  next: { title: string; location: string | null; body: string };
}[] = [
  {
    museumSlug: "science-museum",
    title: "スティーヴンソンのロケット号",
    note: "ロケット号は2018年にロンドンを離れている",
    next: {
      title: "フライトの実機",
      location: "Level 3",
      body: "1919年に初めて大西洋を無着陸で横断したヴィッカース・ヴィミーや、エイミー・ジョンソンのジプシー・モスなど、実際に空を飛んだ機体が天井から吊られています。入場は無料で、ワンダーラボと同じ階にあります。",
    },
  },
];

/** AttractionStory の本文(スポットと kind で指す)。 */
const STORY_FIXES: (TextFix & { attractionSlug: string; kind: string })[] = [
  {
    attractionSlug: "science-museum",
    kind: "trivia",
    note: "有料なのはワンダーラボ・IMAX・一部の企画展",
    find: "- **入場は無料**。常設展示はすべて無料で、特別展とIMAXシアター、フライト・シミュレーターだけが有料です。",
    replace:
      "- **入場は無料**。常設展示はすべて無料で、有料なのはワンダーラボ、IMAX、一部の企画展だけです(無料チケットの事前予約は必要)。",
  },
  {
    attractionSlug: "science-museum",
    kind: "trivia",
    note: "ロケット号は2018年にロンドンを離れている",
    find: "- **ロケット号もここにある**。スティーブンソンの「ロケット」は鉄道の実用化を決定づけた機関車で、初期の蒸気機関車が集まる一角は、鉄道という技術が生まれた現場そのものです。",
    replace:
      "- **ロケット号はもうここにない**。スティーヴンソンの「ロケット」は2018年までこの館にありましたが、いまはヨークの国立鉄道博物館で展示されています。古いガイドブックを頼りに探さないでください。",
  },
  {
    attractionSlug: "science-museum",
    kind: "trivia",
    note: "ワンダーラボは Level 3",
    find: "- **子ども向けの体験フロアは地下**。ワンダーラボなど手を動かす展示は動線が分かれているので、目的によって最初に向かう階を決めておくと効率的です。",
    replace:
      "- **ワンダーラボはLevel 3**。有料の体験型展示で、無料の常設展とは別に時間を取っておくと、子ども連れでも落ち着いて回れます。",
  },
  {
    attractionSlug: "science-museum",
    kind: "practical",
    note: "階ごとの展示の並び",
    find: "宇宙・航空は上階、動く機械や産業史は下階、子ども向けは地下。",
    replace:
      "宇宙と蒸気機関は地上階(Level 0)、医学はLevel 1、数学と通信はLevel 2、飛行機とワンダーラボはLevel 3です。",
  },
];

/** Attraction の列。 */
const ATTRACTION_FIELD_FIXES: {
  slug: string;
  note: string;
  field: "openingHours";
  from: string;
  to: string;
}[] = [
  {
    slug: "natural-history-museum",
    note: "最終入場は17:30",
    field: "openingHours",
    from: "10:00〜17:50 (最終入場17:20)",
    to: "10:00〜17:50 (最終入場17:30)",
  },
];

/** Museum の OpeningHours(曜日ごと)。 */
const OPENING_HOURS: {
  museumSlug: string;
  note: string;
  hours: Record<string, { open: string; close: string }>;
}[] = [
  {
    museumSlug: "national-gallery",
    note: "10:00〜18:00、金曜21:00まで",
    hours: {
      Monday: { open: "10:00", close: "18:00" },
      Tuesday: { open: "10:00", close: "18:00" },
      Wednesday: { open: "10:00", close: "18:00" },
      Thursday: { open: "10:00", close: "18:00" },
      Friday: { open: "10:00", close: "21:00" },
      Saturday: { open: "10:00", close: "18:00" },
      Sunday: { open: "10:00", close: "18:00" },
    },
  },
  {
    museumSlug: "tate-modern",
    note: "金・土曜は21:00まで",
    hours: {
      Friday: { open: "10:00", close: "21:00" },
      Saturday: { open: "10:00", close: "21:00" },
    },
  },
];

/**
 * 作品の部屋番号。英題(engTitle)で指す。館の中で一意に当たらなければ止める。
 * 部屋別ページの一覧に載っていたものだけ。
 */
const ARTWORK_ROOMS: { museumSlug: string; engTitle: string; room: string }[] = [
  { museumSlug: "national-gallery", engTitle: "Mystic Nativity", room: "Room 60" },
  { museumSlug: "national-gallery", engTitle: "The Baptism of Christ", room: "Room 66" },
  { museumSlug: "national-gallery", engTitle: "Portrait of a Lady ('La Schiavona')", room: "Room 10" },
  { museumSlug: "national-gallery", engTitle: "The Family of Darius before Alexander", room: "Room 10" },
  { museumSlug: "national-gallery", engTitle: "The Origin of the Milky Way", room: "Room 10" },
  { museumSlug: "national-gallery", engTitle: "The Toilet of Venus ('The Rokeby Venus')", room: "Room 19" },
  { museumSlug: "national-gallery", engTitle: "Philip IV of Spain", room: "Room 19" },
  { museumSlug: "national-gallery", engTitle: "Philip IV of Spain in Brown and Silver", room: "Room 19" },
  { museumSlug: "national-gallery", engTitle: "Christ contemplated by the Christian Soul", room: "Room 19" },
  { museumSlug: "national-gallery", engTitle: "Christ in the House of Martha and Mary", room: "Room 19" },
  { museumSlug: "national-gallery", engTitle: "Portrait of Archbishop Fernando de Valdés", room: "Room 19" },
  { museumSlug: "national-gallery", engTitle: "Saint John the Evangelist on the Island of Patmos", room: "Room 19" },
  { museumSlug: "national-gallery", engTitle: "The Immaculate Conception", room: "Room 19" },
  { museumSlug: "national-gallery", engTitle: "A Young Woman seated at a Virginal", room: "Room 25" },
  { museumSlug: "national-gallery", engTitle: "A Young Woman standing at a Virginal", room: "Room 25" },
  { museumSlug: "national-gallery", engTitle: "Bathers at Asnières", room: "Room 44" },
  { museumSlug: "national-gallery", engTitle: "Christina of Denmark, Duchess of Milan", room: "Room 4" },
  { museumSlug: "british-museum", engTitle: "The Holy Thorn Reliquary", room: "Room 2a" },
];

function log(label: string, before: string | null, after: string) {
  console.log(`\n■ ${label}`);
  console.log(`  - ${before ?? "(空)"}`);
  console.log(`  + ${after}`);
}

async function main() {
  let changes = 0;

  for (const fix of VISIT_STEP_FIXES) {
    const step = await db.attractionVisitStep.findFirst({
      where: { attraction: { slug: fix.attractionSlug }, title: { in: [fix.title, fix.newTitle ?? fix.title] } },
    });
    if (!step) throw new Error(`歩き方が見つからない: ${fix.attractionSlug} ${fix.title}`);
    if (!step.body.includes(fix.find)) {
      console.log(`済み: ${fix.attractionSlug} 「${step.title}」`);
      continue;
    }
    const body = step.body.replace(fix.find, fix.replace);
    log(`${fix.attractionSlug} 歩き方「${fix.title}」(${fix.note})`, step.body, body);
    changes++;
    if (APPLY) {
      await db.attractionVisitStep.update({
        where: { id: step.id },
        data: { body, title: fix.newTitle ?? step.title },
      });
    }
  }

  for (const fix of MUSEUM_STEP_FIXES) {
    const step = await db.museumVisitStep.findFirst({
      where: { museum: { slug: fix.museumSlug }, title: fix.title },
    });
    if (!step) throw new Error(`館の歩き方が見つからない: ${fix.museumSlug} ${fix.title}`);
    if (!step.body.includes(fix.find)) {
      console.log(`済み: ${fix.museumSlug} 「${fix.title}」`);
      continue;
    }
    const body = step.body.replace(fix.find, fix.replace);
    log(`${fix.museumSlug} 館の歩き方「${fix.title}」(${fix.note})`, step.body, body);
    changes++;
    if (APPLY) await db.museumVisitStep.update({ where: { id: step.id }, data: { body } });
  }

  for (const fix of HIGHLIGHT_FIXES) {
    const highlight = await db.highlight.findFirst({
      where: { museum: { slug: fix.museumSlug }, title: fix.title },
    });
    if (!highlight) {
      console.log(`済み: ${fix.museumSlug} 見どころ「${fix.title}」`);
      continue;
    }
    log(
      `${fix.museumSlug} 見どころ「${fix.title}」(${fix.note})`,
      `${highlight.title} / ${highlight.body}`,
      `${fix.next.title} @ ${fix.next.location} / ${fix.next.body}`,
    );
    changes++;
    if (APPLY) await db.highlight.update({ where: { id: highlight.id }, data: fix.next });
  }

  for (const fix of STORY_FIXES) {
    const stories = await db.attractionStory.findMany({
      where: { attraction: { slug: fix.attractionSlug }, kind: fix.kind },
    });
    const story = stories.find((s) => s.body.includes(fix.find));
    if (!story) {
      console.log(`済み: ${fix.attractionSlug} 本文(${fix.kind})「${fix.note}」`);
      continue;
    }
    const body = story.body.replace(fix.find, fix.replace);
    log(`${fix.attractionSlug} 本文(${fix.kind})(${fix.note})`, fix.find, fix.replace);
    changes++;
    if (APPLY) await db.attractionStory.update({ where: { id: story.id }, data: { body } });
  }

  for (const fix of ATTRACTION_FIELD_FIXES) {
    const row = await db.attraction.findUnique({
      where: { slug: fix.slug },
      select: { id: true, openingHours: true },
    });
    if (!row) throw new Error(`スポットが見つからない: ${fix.slug}`);
    if (row[fix.field] !== fix.from) {
      console.log(`済み: ${fix.slug} ${fix.field}「${row[fix.field]}」`);
      continue;
    }
    log(`${fix.slug} ${fix.field}(${fix.note})`, fix.from, fix.to);
    changes++;
    if (APPLY) await db.attraction.update({ where: { id: row.id }, data: { [fix.field]: fix.to } });
  }

  for (const fix of OPENING_HOURS) {
    const museum = await db.museum.findUnique({
      where: { slug: fix.museumSlug },
      select: { id: true, openingHours: true },
    });
    if (!museum) throw new Error(`館が見つからない: ${fix.museumSlug}`);
    for (const [day, { open, close }] of Object.entries(fix.hours)) {
      const row = museum.openingHours.find((h) => h.dayOfWeek === day);
      if (row && row.openTime === open && row.closeTime === close) continue;
      log(
        `${fix.museumSlug} 開館時間 ${day}(${fix.note})`,
        row ? `${row.openTime}–${row.closeTime}` : null,
        `${open}–${close}`,
      );
      changes++;
      if (APPLY) {
        await db.openingHours.upsert({
          where: { museumId_dayOfWeek: { museumId: museum.id, dayOfWeek: day } },
          update: { openTime: open, closeTime: close },
          create: { museumId: museum.id, dayOfWeek: day, openTime: open, closeTime: close },
        });
      }
    }
  }

  for (const fix of ARTWORK_ROOMS) {
    const rows = await db.artwork.findMany({
      where: { museum: { slug: fix.museumSlug }, engTitle: fix.engTitle },
      select: { id: true, title: true, room: true, location: true },
    });
    if (rows.length !== 1) {
      throw new Error(`作品が一意に当たらない(${rows.length}件): ${fix.museumSlug} ${fix.engTitle}`);
    }
    const [artwork] = rows;
    if (artwork.room === fix.room && artwork.location === fix.room) continue;
    log(`${fix.museumSlug} 作品『${artwork.title}』の部屋`, artwork.room, fix.room);
    changes++;
    if (APPLY) {
      await db.artwork.update({
        where: { id: artwork.id },
        data: { room: fix.room, location: fix.room },
      });
    }
  }

  console.log(
    `\n${changes}件${APPLY ? "を反映した" : "の変更がある(--apply で反映)"}`,
  );
}

main().finally(() => db.$disconnect());
