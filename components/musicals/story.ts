/**
 * あらすじ3層の型と、DB の Json カラムを読むための検証。
 *
 * 3層に分けているのは、作品ページに来る読者が二種類いるため。
 * まだ観るか決めていない読者は「どんな話か」だけを知りたく、結末を
 * 読まされると損をする。既にチケットを取った読者は逆に、英語で観る前に
 * 筋を最後まで把握しておきたい。一枚の長い箇条書きはそのどちらにも
 * 応えられないので、hook(惹き) → characters(理解) → scenes(深掘り) →
 * ending(折りたたみ) の順に置き、読者に降りる場所を選ばせる。
 */

/** あらすじの登場人物。characters カラムの JSON 要素1件。 */
export type MusicalCharacter = {
  /** 日本語表記の役名。 */
  name: string;
  /** 「主人公」「その親友」など、立ち位置を示す2〜8字程度の語。 */
  role: string;
  /** その人物が何を抱えているかの一文。筋の説明ではなく人物の説明。 */
  oneLiner: string;
};

function isCharacter(value: unknown): value is MusicalCharacter {
  if (typeof value !== "object" || value === null) return false;
  const c = value as Record<string, unknown>;
  return (
    typeof c.name === "string" &&
    typeof c.role === "string" &&
    typeof c.oneLiner === "string"
  );
}

/**
 * characters カラムを読む。
 *
 * Prisma の Json は any 相当で返るため、表示前にここで形を確かめる。
 * 1件でも壊れていれば配列ごと捨てて空を返す——人物欄が虫食いで出るより、
 * 層ごと消えて description だけが残るほうが読者の混乱が小さい。
 */
export function parseCharacters(value: unknown): MusicalCharacter[] {
  if (!Array.isArray(value)) return [];
  if (!value.every(isCharacter)) return [];
  return value;
}

/** 見どころ("highlight")か、裏話("trivia")か。 */
export type MusicalAppealKind = "highlight" | "trivia";

/**
 * 見どころ・裏話1件。appeals カラムの JSON 要素。
 *
 * 二種類を別カラムにせず kind で分けているのは、原稿を書くときに
 * 両者が交互に出てくるほうが読ませやすいため。並び順が原稿の一部になる。
 */
export type MusicalAppeal = {
  kind: MusicalAppealKind;
  /** 見出し。「第一幕の幕切れで拍手が鳴りやまない」のように、体言止めにしない。 */
  title: string;
  /** 2〜4文の解説。なぜそう言えるかの具体(舞台機構、初演の経緯)を必ず含める。 */
  body: string;
};

function isAppeal(value: unknown): value is MusicalAppeal {
  if (typeof value !== "object" || value === null) return false;
  const a = value as Record<string, unknown>;
  return (
    (a.kind === "highlight" || a.kind === "trivia") &&
    typeof a.title === "string" &&
    typeof a.body === "string"
  );
}

/** appeals カラムを読む。壊れていれば層ごと捨てる(parseCharacters と同じ方針)。 */
export function parseAppeals(value: unknown): MusicalAppeal[] {
  if (!Array.isArray(value)) return [];
  if (!value.every(isAppeal)) return [];
  return value;
}
