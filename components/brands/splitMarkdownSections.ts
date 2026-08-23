/**
 * 本文を `## ` 見出し単位のブロックに分割する。
 *
 * 図版を本文の途中(見出しの切れ目)に挟み込むために使う。
 * 最初のブロックには見出しの前の導入文が入る(見出しが無ければ全文が1ブロック)。
 */
export function splitMarkdownSections(markdown: string): string[] {
  const lines = markdown.split("\n");
  const blocks: string[] = [];
  let current: string[] = [];

  for (const line of lines) {
    if (/^## /.test(line) && current.length > 0) {
      blocks.push(current.join("\n").trim());
      current = [line];
    } else {
      current.push(line);
    }
  }
  if (current.length > 0) blocks.push(current.join("\n").trim());

  return blocks.filter((b) => b.length > 0);
}
