/**
 * AttractionStory の並び順と見出し。
 *
 * 旧 AttractionSection では title が自由文字列だったため、
 * 「見どころ」を先に出す・料金の節を伏せる、といった判断をすべて
 * 正規表現で推測していた。172種類の見出しに対して推測が当たらず、
 * isRedundantOverview() は0/145という状態だった。
 *
 * AttractionStory は kind が固定値なので、ここは推測ではなく対応表になる。
 * kind を増やすときは STORY_ORDER と STORY_LABEL の両方を直すこと。
 */

export type StoryKind =
  | "highlight"
  | "history"
  | "trivia"
  | "practical"
  | "context";

export type StoryLike = {
  id: number;
  kind: string;
  heading: string | null;
  body: string;
  displayOrder: number;
  imageUrl: string | null;
  imageSource: string | null;
  imageCredit: string | null;
  imageLink: string | null;
  imageCaption: string | null;
};

/**
 * 読む順。読者がこのページに来た理由(見どころ)を先に、
 * 実用情報を後ろに置く。
 *
 * context は「そのスポット固有の話」で、扱いが読み物寄りなので
 * 歴史と豆知識の間に入れている。
 */
const STORY_ORDER: Record<StoryKind, number> = {
  highlight: 0,
  history: 1,
  context: 2,
  trivia: 3,
  practical: 4,
};

/** heading が null のときに使う既定の見出し。 */
const STORY_LABEL: Record<StoryKind, string> = {
  highlight: "見どころ",
  history: "歴史",
  context: "この場所について",
  trivia: "豆知識",
  practical: "訪問のヒント",
};

function orderOf(kind: string): number {
  return STORY_ORDER[kind as StoryKind] ?? STORY_ORDER.context;
}

/** 表示に使う見出し。固有の heading があればそれを優先する。 */
export function storyHeading(story: StoryLike): string {
  return story.heading?.trim() || STORY_LABEL[story.kind as StoryKind] || "";
}

/**
 * 同じ見出しが1ページに複数出るかどうか。
 *
 * heading が null の story が同じ kind で2本あると、既定ラベルが並んで
 * 「訪問のヒント」が2つ、という状態になる。移行スクリプト側で
 * heading を残すようにしたので通常は起きないが、あとから手で足したときの
 * 保険としてここでも検出できるようにしておく。
 * (目次では見分けがつかないので、重複していたら番号を振る)
 */
export function withUniqueHeadings(stories: StoryLike[]): {
  story: StoryLike;
  heading: string;
}[] {
  const seen: Record<string, number> = {};
  const total: Record<string, number> = {};
  stories.forEach((s) => {
    const h = storyHeading(s);
    total[h] = (total[h] ?? 0) + 1;
  });
  return stories.map((story) => {
    const h = storyHeading(story);
    if (total[h] <= 1) return { story, heading: h };
    seen[h] = (seen[h] ?? 0) + 1;
    return { story, heading: `${h}（${seen[h]}）` };
  });
}

/** 目次リンクと <h2 id> に使うアンカー。 */
export function storyAnchor(story: StoryLike): string {
  return `story-${story.id}`;
}

/**
 * 表示する読み物を、読む順に並べて返す。
 *
 * visitFlow(「着いてからの歩き方」)があるページでは highlight を伏せる。
 * どちらも「何を見るか」を扱うので、両方出すと同じ対象を2回説明することに
 * なるため。旧実装では見出しの正規表現で同じことをしていたが、
 * kind があるので条件がそのまま書ける。
 */
export function visibleStories(
  stories: StoryLike[],
  opts: { visitFlowSteps: number },
): StoryLike[] {
  return stories
    .filter((s) => s.body.trim().length > 0)
    .filter((s) => !(opts.visitFlowSteps > 0 && s.kind === "highlight"))
    .sort((a, b) => {
      const diff = orderOf(a.kind) - orderOf(b.kind);
      return diff !== 0 ? diff : a.displayOrder - b.displayOrder;
    });
}
