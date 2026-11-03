/**
 * ナショナル・ギャラリーの公式ページから、作品がいまどこにあるかを読む。
 * 取得はしない(lib/masterpieces/national-gallery.ts と
 * scripts/check-masterpieces.ts がそれぞれ取ってきて渡す)。
 *
 * 設計メモ:
 * 1. 作品ページの「Location」欄は3つの形しか無い(2026-10-30 に確認)。
 *      展示中   <dd><a href="/visiting/floorplans/level-2/room-43">Room 43</a></dd>
 *      展示外   <dd><a href="/visiting/floorplans/not-on-display">Not on display</a></dd>
 *      貸し出し <dd> On loan: Monet and Time (working title), <a>Musée de l'Orangerie</a>, Paris, France </dd>
 *    どれにも当たらなければ、書き方が変わったとみなして例外にする。
 *    推し量って「展示中」と出すくらいなら、何も出さないほうがよい。
 * 2. 作品ページの部屋番号は「掛ける場所」で、その部屋が今日開いているかは
 *    分からない。館は研究センター(2028年開館予定)の工事で部屋を閉めており、
 *    閉まった部屋は館内図(floorplans/<階>)に "Room closed" と出る。
 *    作品ページのリンクが指す階の館内図を読み、部屋の開閉を合わせて出す。
 * 3. 館内図が読めなくても作品の場所は正しいので、部屋の開閉は "unknown" に
 *    して作品の場所だけを出す。
 */

export class NationalGalleryParseError extends Error {}

export type NationalGalleryLocation =
  | {
      state: "on-display";
      /** 館内図のURLの階("level-2")。部屋の開閉を読みに行くのに使う。 */
      levelSlug: string;
      /** 館内図のURLの部屋("room-43")。 */
      roomSlug: string;
      /** 館内の表示("Level 2")。 */
      level: string;
      /** 館内の表示("Room 43")。 */
      room: string;
    }
  | { state: "not-on-display" }
  | { state: "on-loan"; to: string };

/**
 * 館内図での部屋の状態。
 *
 * - open: 開いている(館内図に部屋のテーマが出ている)
 * - closed: "Room closed"
 * - empty: "Room temporarily open but empty"(開いているが作品が無い)
 * - unknown: 館内図に部屋が見つからない、または館内図が読めなかった
 */
export type RoomState = "open" | "closed" | "empty" | "unknown";

const ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  rsquo: "’",
  lsquo: "‘",
  ndash: "–",
  mdash: "—",
};

function decodeEntities(text: string): string {
  return text.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (whole, code: string) => {
    if (code[0] === "#") {
      const n =
        code[1] === "x" || code[1] === "X"
          ? parseInt(code.slice(2), 16)
          : parseInt(code.slice(1), 10);
      return Number.isFinite(n) ? String.fromCodePoint(n) : whole;
    }
    return ENTITIES[code.toLowerCase()] ?? whole;
  });
}

/** タグを外して1行にする。 */
function textOf(html: string): string {
  return decodeEntities(html.replace(/<[^>]+>/g, " "))
    .replace(/\s+/g, " ")
    .replace(/\s+,/g, ",")
    .trim();
}

/** "level-2" → "Level 2" */
function levelLabel(levelSlug: string): string {
  const n = levelSlug.match(/^level-(\w+)$/i);
  return n ? `Level ${n[1]}` : levelSlug;
}

/** 作品ページの HTML から Location 欄を読む。 */
export function parseNationalGalleryLocation(
  html: string,
): NationalGalleryLocation {
  const field = html.match(/<dt>\s*Location\s*<\/dt>\s*<dd>([\s\S]*?)<\/dd>/i);
  if (!field) {
    throw new NationalGalleryParseError("作品ページに Location の欄が無い");
  }

  const inner = field[1];
  const text = textOf(inner);

  const room = inner.match(
    /href="\/visiting\/floorplans\/(level-[\w-]+)\/(room-[\w-]+)"/i,
  );
  if (room) {
    if (!/^room\s+\w+$/i.test(text)) {
      throw new NationalGalleryParseError(
        `部屋へのリンクはあるが、表示が「Room ◯」の形でない: ${text}`,
      );
    }
    return {
      state: "on-display",
      levelSlug: room[1].toLowerCase(),
      roomSlug: room[2].toLowerCase(),
      level: levelLabel(room[1]),
      room: text,
    };
  }

  if (/^not on display$/i.test(text)) return { state: "not-on-display" };

  const loan = text.match(/^on loan\s*:\s*(.+)$/i);
  if (loan) return { state: "on-loan", to: loan[1] };

  throw new NationalGalleryParseError(`Location の欄が読めない形: ${text}`);
}

/**
 * 階の館内図(/visiting/floorplans/<階>)の HTML から、部屋の状態を読む。
 *
 * 館内図の部屋の札は次の形(2026-10-30 に確認)。同じ URL を指す画像地図の
 * <area> もあるが、そちらは <a> ではないので拾わない。
 *   <a href="/visiting/floorplans/level-2/room-7"> … <div class="long-name">Room closed</div></a>
 */
export function parseNationalGalleryRoomState(
  html: string,
  levelSlug: string,
  roomSlug: string,
): RoomState {
  const panel = html.match(
    new RegExp(
      `<a\\s[^>]*href="/visiting/floorplans/${levelSlug}/${roomSlug}"[^>]*>([\\s\\S]*?)</a>`,
      "i",
    ),
  );
  if (!panel) return "unknown";

  const longName = panel[1].match(/class="long-name"[^>]*>([\s\S]*?)<\//i);
  const name = longName ? textOf(longName[1]) : "";
  if (/^room closed$/i.test(name)) return "closed";
  if (/open but empty/i.test(name)) return "empty";
  return name ? "open" : "unknown";
}

/** 作品ページのリンクから、その階の館内図の URL を作る。 */
export function nationalGalleryFloorplanUrl(levelSlug: string): string {
  return `https://www.nationalgallery.org.uk/visiting/floorplans/${levelSlug}`;
}
