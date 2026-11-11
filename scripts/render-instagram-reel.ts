/**
 * Instagram の投稿原稿を、リールの動画(MP4)に書き出す。
 * /add-instagram-reel スキルから呼ぶ。描画は Remotion(video/IgReel.tsx)。
 *
 *   npx tsx scripts/render-instagram-reel.ts <payload.json>    登録前の原稿(配列)を全件
 *   npx tsx scripts/render-instagram-reel.ts --post <投稿のid>  DB に入れた投稿から
 *
 *   --stills  動画は書かず、確認用の静止画と表紙だけ(原稿を直している途中に速く回す)
 *
 * payload は scripts/create-instagram-posts.ts と同じ形。書き出す前に同じ検査
 * (validateIgCopy と、リール用に短くした validateIgReelCopy)を通す。
 *
 * 出力は instagram-reels/(コミットしない)。1本につき:
 *
 *   reel-<slug>.mp4          投稿する動画。1080x1920・30fps・H.264。無音の音声トラック入り
 *   reel-<slug>-cover.jpg    表紙。アプリでカバーを「カメラロールから追加」するとき用
 *   reel-<slug>-caption.txt  キャプション(記事への誘導・画像クレジット・タグ込み)
 *   reel-<slug>-check/       場面ごとの静止画(文字が出揃ったところ、半分の大きさ)
 *
 * 音は入れない。曲を付けるなら Instagram アプリで付ける(商用で使える曲だけ)。
 * 初回は描画用の Chrome(約100MB)を Remotion が取ってくる。
 */
import "dotenv/config";
import { existsSync } from "node:fs";
import { copyFile, mkdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { bundle } from "@remotion/bundler";
import {
  ensureBrowser,
  renderMedia,
  renderStill,
  selectComposition,
} from "@remotion/renderer";
import db from "../utils/db";
import { loadOgPhoto } from "../lib/og";
import { composeIgCaption } from "../lib/instagram/caption";
import {
  isIgCategory,
  parseIgPoints,
  validateIgCopy,
  validateIgReelCopy,
  type IgCategory,
  type IgPoint,
} from "../lib/instagram/limits";
import { reelScenes, settledFrame, REEL_FPS } from "../video/timing";
import type { ReelProps } from "../video/types";
import { reelWebpackOverride } from "../video/webpack-override";

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, "instagram-reels");
const WORK_DIR = path.join(ROOT, "scripts", ".tmp", "reel");
const PUBLIC_DIR = path.join(WORK_DIR, "public");
const FONT_CACHE = path.join(ROOT, "scripts", ".tmp", "fonts");

const STILLS_ONLY = process.argv.includes("--stills");

type Copy = {
  coverHead: string;
  coverTail: string | null;
  points: IgPoint[];
  closingTitle: string;
  closingBody: string;
  caption: string;
  hashtags: string[];
};

type Item = {
  category: IgCategory;
  slug: string;
  copy: Copy;
  engTitle: string | null;
  image: string | null;
  imageSource: string | null;
  imageCredit: string | null;
};

const CONTENT_SELECT = {
  category: true,
  slug: true,
  engTitle: true,
  image: true,
  imageSource: true,
  imageCredit: true,
} as const;

/** 位置引数(payload のパス)か --post <id> から、書き出す原稿を集める。 */
async function loadItems(): Promise<Item[]> {
  const args = process.argv.slice(2);
  const postFlag = args.indexOf("--post");

  if (postFlag !== -1) {
    const id = args[postFlag + 1];
    if (!id) throw new Error("--post のあとに投稿の id を書いてください");
    const post = await db.instagramPost.findUnique({
      where: { id },
      include: { content: { select: CONTENT_SELECT } },
    });
    if (!post) throw new Error(`投稿が見つかりません: ${id}`);
    if (!isIgCategory(post.content.category)) {
      throw new Error(`この記事のカテゴリではリールを作れません: ${post.content.category}`);
    }
    return [
      {
        category: post.content.category,
        slug: post.content.slug,
        copy: {
          coverHead: post.coverHead,
          coverTail: post.coverTail,
          points: parseIgPoints(post.points) ?? [],
          closingTitle: post.closingTitle,
          closingBody: post.closingBody,
          caption: post.caption,
          hashtags: post.hashtags,
        },
        engTitle: post.content.engTitle,
        image: post.content.image,
        imageSource: post.content.imageSource,
        imageCredit: post.content.imageCredit,
      },
    ];
  }

  const file = args.find((a) => !a.startsWith("--"));
  if (!file) {
    throw new Error(
      "Usage: npx tsx scripts/render-instagram-reel.ts <payload.json> | --post <id> [--stills]",
    );
  }
  const payload = JSON.parse(await readFile(file, "utf-8")) as Record<string, unknown>[];
  if (!Array.isArray(payload) || payload.length === 0) {
    throw new Error("payload は1件以上の配列にしてください");
  }

  const items: Item[] = [];
  for (const [i, input] of payload.entries()) {
    const category = String(input.category ?? "");
    const slug = String(input.slug ?? "");
    if (!isIgCategory(category)) {
      throw new Error(`[${i}] category は column か british-english です`);
    }
    const content = await db.content.findFirst({
      where: { category, slug },
      select: CONTENT_SELECT,
    });
    if (!content) throw new Error(`[${i}] 記事が見つかりません: ${category}/${slug}`);
    items.push({
      category,
      slug,
      copy: {
        coverHead: String(input.coverHead ?? ""),
        coverTail: typeof input.coverTail === "string" ? input.coverTail : null,
        points: Array.isArray(input.points) ? (input.points as IgPoint[]) : [],
        closingTitle: String(input.closingTitle ?? ""),
        closingBody: String(input.closingBody ?? ""),
        caption: String(input.caption ?? ""),
        hashtags: Array.isArray(input.hashtags) ? (input.hashtags as string[]) : [],
      },
      engTitle: content.engTitle,
      image: content.image,
      imageSource: content.imageSource,
      imageCredit: content.imageCredit,
    });
  }
  return items;
}

/** 書き出す前の検査。登録スクリプトと同じ基準に、リールの字数の上限を足す。 */
function problemsOf(item: Item): string[] {
  const where = `${item.category}/${item.slug}`;
  const problems = [
    ...validateIgCopy(item.copy),
    ...validateIgReelCopy(item.copy),
  ].map((p) => `${where}: ${p}`);
  if (item.category === "british-english" && !item.engTitle?.trim()) {
    problems.push(`${where}: 記事に engTitle が無く、表紙の主役が描けません`);
  }
  if (item.category === "column" && !item.image) {
    problems.push(`${where}: 記事に写真が無く、表紙が無地になります`);
  }
  if (item.category === "column" && item.imageSource === "commons" && !item.imageCredit) {
    problems.push(
      `${where}: 写真のクレジットがありません。先に npx tsx scripts/fill-content-image-credits.ts を流してください`,
    );
  }
  return problems;
}

/**
 * Noto Sans JP の全字形を1度だけ取ってきて置いておく。
 *
 * 古い User-Agent で頼むと、Google Fonts は分割していない WOFF を1つ返す
 * (lib/og.ts の TRUETYPE_UA と同じ手)。サブセットにしないのは、リールは
 * 5場面ぶんの字を1本で使い、取り漏らした字だけが代わりのフォントになるから。
 */
async function ensureFont(weight: 400 | 700): Promise<string> {
  const file = path.join(FONT_CACHE, `noto-sans-jp-${weight}.woff`);
  if (existsSync(file) && (await stat(file)).size > 500_000) return file;

  const ua =
    "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/27.0.1453.116 Safari/537.36";
  const css = await fetch(
    `https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@${weight}`,
    { headers: { "User-Agent": ua } },
  ).then((res) => (res.ok ? res.text() : ""));
  const url = css.match(/src:\s*url\((https:\/\/[^)]+)\)/)?.[1];
  if (!url) throw new Error(`Noto Sans JP (${weight}) の URL を取れませんでした`);

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Noto Sans JP (${weight}) を取れませんでした: HTTP ${res.status}`);
  const data = Buffer.from(await res.arrayBuffer());
  if (data.length < 500_000) {
    throw new Error(`Noto Sans JP (${weight}) が小さすぎます(${data.length} bytes)。サブセットが返った可能性`);
  }
  await mkdir(FONT_CACHE, { recursive: true });
  await writeFile(file, data);
  return file;
}

/**
 * 表紙の写真。1920px 版から順に取りに行く(Wikimedia は原本より大きい
 * 縮小版を作らず 400 を返すので、1280・960 と下げる)。lib/instagram/render.tsx の
 * loadIgPhoto と同じ順。
 */
async function savePhoto(url: string, name: string): Promise<ReelProps["photo"]> {
  for (const width of [1920, 1280, 960]) {
    const photo = await loadOgPhoto(url, width);
    if (!photo) continue;
    const m = /^data:image\/([a-z+]+);base64,(.+)$/.exec(photo.src);
    if (!m) continue;
    const ext = m[1] === "jpeg" ? "jpg" : m[1].replace("+xml", "");
    const file = `${name}.${ext}`;
    await writeFile(path.join(PUBLIC_DIR, file), Buffer.from(m[2], "base64"));
    return { file, width: photo.width, height: photo.height };
  }
  return null;
}

function logProgress(label: string) {
  let last = -1;
  return ({ progress }: { progress: number }) => {
    const pct = Math.floor(progress * 10) * 10;
    if (pct !== last) {
      last = pct;
      process.stdout.write(`  ${label} ${pct}%\n`);
    }
  };
}

async function main() {
  const items = await loadItems();
  const problems = items.flatMap(problemsOf);
  if (problems.length) {
    console.error("書き出しを中止しました:");
    for (const p of problems) console.error(`  - ${p}`);
    process.exitCode = 1;
    return;
  }

  await rm(WORK_DIR, { recursive: true, force: true });
  await mkdir(PUBLIC_DIR, { recursive: true });
  await mkdir(OUT_DIR, { recursive: true });

  const fonts = { regular: "noto-sans-jp-400.woff", bold: "noto-sans-jp-700.woff" };
  await copyFile(await ensureFont(400), path.join(PUBLIC_DIR, fonts.regular));
  await copyFile(await ensureFont(700), path.join(PUBLIC_DIR, fonts.bold));

  // 写真は描画の前にこちらで取って置く。描画中のブラウザに外へ取りに
  // 行かせると、取れなかったコマだけ写真が欠ける。
  const propsList: ReelProps[] = [];
  for (const [i, item] of items.entries()) {
    let photo: ReelProps["photo"] = null;
    if (item.category === "column" && item.image) {
      photo = await savePhoto(item.image, `photo-${i}`);
      if (!photo) throw new Error(`${item.slug}: 表紙の写真を取れませんでした(${item.image})`);
    }
    propsList.push({
      category: item.category,
      word: item.category === "british-english" ? item.engTitle?.trim() || null : null,
      coverHead: item.copy.coverHead.trim(),
      coverTail: item.copy.coverTail?.trim() || null,
      points: item.copy.points.map((p) => ({
        label: p.label.trim(),
        title: p.title.trim(),
        body: p.body.trim(),
      })),
      closingTitle: item.copy.closingTitle.trim(),
      closingBody: item.copy.closingBody.trim(),
      photo,
      credit: photo && item.imageSource === "commons" ? item.imageCredit : null,
      fonts,
    });
  }

  console.log("描画用の Chrome を確かめています…");
  await ensureBrowser();

  console.log("動画の部品をまとめています…");
  const serveUrl = await bundle({
    entryPoint: path.join(ROOT, "video", "index.ts"),
    publicDir: PUBLIC_DIR,
    webpackOverride: reelWebpackOverride,
  });

  for (const [i, item] of items.entries()) {
    const inputProps = propsList[i];
    const base = `reel-${item.slug.slice(0, 60)}`;
    const composition = await selectComposition({ serveUrl, id: "IgReel", inputProps });
    const seconds = (composition.durationInFrames / REEL_FPS).toFixed(1);
    console.log(`\n${item.category}/${item.slug}(${seconds}秒)`);

    const mp4 = path.join(OUT_DIR, `${base}.mp4`);
    if (!STILLS_ONLY) {
      await renderMedia({
        composition,
        serveUrl,
        inputProps,
        codec: "h264",
        outputLocation: mp4,
        overwrite: true,
        // CRF 18 は Remotion の h264 の既定と同じで、文字の縁がにじまない画質。
        // 色はスマホで地の色がずれないよう bt709 で書く。
        crf: 18,
        pixelFormat: "yuv420p",
        colorSpace: "bt709",
        imageFormat: "jpeg",
        jpegQuality: 92,
        // 無音でも音声トラックを持たせる。音声の無い動画を受け付けない
        // 編集アプリや API がある。
        enforceAudioTrack: true,
        onProgress: logProgress("動画"),
      });
    }

    const cover = path.join(OUT_DIR, `${base}-cover.jpg`);
    await renderStill({
      composition,
      serveUrl,
      inputProps,
      frame: 0,
      output: cover,
      imageFormat: "jpeg",
      jpegQuality: 92,
      overwrite: true,
    });

    const checkDir = path.join(OUT_DIR, `${base}-check`);
    await rm(checkDir, { recursive: true, force: true });
    await mkdir(checkDir, { recursive: true });
    const scenes = reelScenes(inputProps);
    for (const scene of scenes) {
      await renderStill({
        composition,
        serveUrl,
        inputProps,
        frame: settledFrame(scene, scene.index === scenes.length - 1),
        output: path.join(checkDir, `${scene.index + 1}-${scene.kind}.jpg`),
        imageFormat: "jpeg",
        jpegQuality: 85,
        scale: 0.5,
        overwrite: true,
      });
    }

    const caption = composeIgCaption({
      caption: item.copy.caption,
      hashtags: item.copy.hashtags,
      credit: inputProps.credit,
    });
    const captionFile = path.join(OUT_DIR, `${base}-caption.txt`);
    await writeFile(captionFile, `${caption}\n`);

    if (!STILLS_ONLY) console.log(`  動画:       ${mp4}`);
    console.log(`  表紙:       ${cover}`);
    console.log(`  キャプション: ${captionFile}`);
    console.log(`  確認用:     ${checkDir}`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
