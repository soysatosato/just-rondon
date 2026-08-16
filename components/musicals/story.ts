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
