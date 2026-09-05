import { readFileSync } from "node:fs";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
const renderMd = (md: string): string =>
  renderToStaticMarkup(React.createElement(ReactMarkdown, { remarkPlugins: [remarkGfm] }, md));
let bad = 0;
for (const file of process.argv.slice(2)) {
  const p = JSON.parse(readFileSync(file, "utf-8"));
  for (const it of p.items) {
    if ((it.description.match(/\*\*/g) ?? []).length < 2) continue;
    const html = renderMd(it.description);
    if (html.includes("**")) {
      bad++;
      const idx = html.indexOf("**");
      console.log(`\nBROKEN displayOrder=${it.displayOrder} — ${it.title}`);
      console.log("  ..." + html.slice(Math.max(0, idx - 70), idx + 40).replace(/\n/g, " ") + "...");
    }
  }
}
console.log(bad ? `\n${bad} broken` : "\nOK: all bold renders cleanly");
process.exit(bad ? 1 : 0);
