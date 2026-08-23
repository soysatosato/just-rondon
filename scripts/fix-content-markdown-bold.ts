/**
 * DB内の本文で、太字(**)が描画されない箇所を直す。
 *
 * 壊れる条件・直し方は scripts/fix-markdown-bold.ts と同じ
 * (CommonMark の right-flanking 判定に日本語の句読点が引っかかるケース)。
 * あちらはソースコード中の静的文字列が対象で、こちらは以下のDBフィールドが対象:
 *
 *   - Content.summary / Content.mainText / ContentSection.description
 *     (category: column / british-english / modern-britain)
 *   - WeeklyBriefItem.description
 *     (WeeklyBrief.headline / summary はプレーンテキスト表示なので対象外)
 *
 * 実行: npx tsx scripts/fix-content-markdown-bold.ts --dry
 *      npx tsx scripts/fix-content-markdown-bold.ts
 */

import "dotenv/config";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import db from "../utils/db";

const renderMd = (md: string): string =>
  renderToStaticMarkup(
    React.createElement(ReactMarkdown, { remarkPlugins: [remarkGfm] }, md),
  );

function hasBrokenBold(text: string): boolean {
  if ((text.match(/\*\*/g) ?? []).length < 2) return false;
  return renderMd(text).includes("**");
}

/** 閉じ ** を壊す句読点。全角・半角の両方。 */
const PUNCT = "。、！？：；）」』】〉》・，．!?:;)\\]\\.";

/**
 * 壊れている閉じ ** を1つずつ直す。fix-markdown-bold.ts の fixLine と同じ方針:
 * 開きの ** を探しに行かず、壊れている閉じ ** だけを見て最小限の変形をする。
 */
function fixText(text: string): string | null {
  let current = text;

  for (let guard = 0; guard < 30; guard++) {
    if (!hasBrokenBold(current)) return current === text ? null : current;

    const candidates = new RegExp(`([${PUNCT}])\\*\\*(?=[^\\s*])`, "g");
    let applied: string | null = null;

    for (const c of [...current.matchAll(candidates)]) {
      if (c.index === undefined) continue;
      const punct = c[1];
      const at = c.index;
      const before = current.slice(0, at);
      const after = current.slice(at + 1 + 2);

      const trials = /[。、！？，．!?]/.test(punct)
        ? [`${before}**${punct}${after}`]
        : [
            `${before}${punct}** ${after}`,
            (() => {
              const open = before.lastIndexOf("**");
              if (open <= 0) return "";
              return (
                before.slice(0, open) +
                " **" +
                before.slice(open + 2) +
                `${punct}** ${after}`
              );
            })(),
          ].filter(Boolean);

      const wasBad = (renderMd(current).match(/\*\*/g) ?? []).length;

      for (const trial of trials) {
        if (trial === current) continue;
        const nowBad = (renderMd(trial).match(/\*\*/g) ?? []).length;
        if (nowBad < wasBad) {
          applied = trial;
          break;
        }
      }

      if (applied !== null) break;
    }

    if (applied === null) return null;
    current = applied;
  }

  return null;
}

type Target = {
  label: string;
  text: string;
  apply: (fixed: string) => Promise<void>;
};

const CONTENT_CATEGORIES = ["column", "british-english", "modern-britain"];

async function collectContentTargets(): Promise<Target[]> {
  const contents = await db.content.findMany({
    where: { category: { in: CONTENT_CATEGORIES } },
    select: {
      id: true,
      slug: true,
      category: true,
      summary: true,
      mainText: true,
      sections: { select: { id: true, description: true, displayOrder: true } },
    },
  });

  const targets: Target[] = [];

  for (const c of contents) {
    const path = `/${c.category}/${c.slug}`;
    if (c.summary) {
      targets.push({
        label: `${path} summary`,
        text: c.summary,
        apply: async (fixed) => {
          await db.content.update({ where: { id: c.id }, data: { summary: fixed } });
        },
      });
    }
    if (c.mainText) {
      targets.push({
        label: `${path} mainText`,
        text: c.mainText,
        apply: async (fixed) => {
          await db.content.update({ where: { id: c.id }, data: { mainText: fixed } });
        },
      });
    }
    for (const sec of c.sections) {
      if (!sec.description) continue;
      targets.push({
        label: `${path} section#${sec.displayOrder}`,
        text: sec.description,
        apply: async (fixed) => {
          await db.contentSection.update({
            where: { id: sec.id },
            data: { description: fixed },
          });
        },
      });
    }
  }

  return targets;
}

async function collectWeeklyBriefTargets(): Promise<Target[]> {
  const items = await db.weeklyBriefItem.findMany({
    select: {
      id: true,
      title: true,
      description: true,
      brief: { select: { slug: true } },
    },
  });

  return items.map((item) => ({
    label: `/events/week/${item.brief.slug} item "${item.title}"`,
    text: item.description,
    apply: async (fixed) => {
      await db.weeklyBriefItem.update({ where: { id: item.id }, data: { description: fixed } });
    },
  }));
}

async function main() {
  const dry = process.argv.includes("--dry");

  const targets = [
    ...(await collectContentTargets()),
    ...(await collectWeeklyBriefTargets()),
  ];

  let fixedCount = 0;
  const skipped: { label: string; text: string }[] = [];

  for (const t of targets) {
    if (!hasBrokenBold(t.text)) continue;

    const fixed = fixText(t.text);
    if (fixed === null || hasBrokenBold(fixed)) {
      skipped.push({ label: t.label, text: t.text.slice(0, 200) });
      continue;
    }

    console.log(`修正: ${t.label}`);
    if (!dry) await t.apply(fixed);
    fixedCount++;
  }

  console.log(dry ? "\n=== dry run ===" : "\n=== 修正しました ===");
  console.log(`修正した箇所: ${fixedCount}`);
  console.log(`手動が必要  : ${skipped.length}`);
  if (skipped.length > 0) {
    console.log("\n--- 自動で直せなかった箇所 ---");
    for (const s of skipped) {
      console.log(`${s.label}\n    ${s.text}\n`);
    }
  }

  await db.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
