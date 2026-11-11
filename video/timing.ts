import type { ReelProps } from "./types";

/**
 * リールの尺。場面ごとの長さは、その場面の字数から決める。
 *
 * 文字が主役の動画なので、読み終える前に次へ進むと何も伝わらない。
 * 読む速さを1秒9字(空白を除く。大人の黙読のやや遅め)とし、文字が
 * 出揃うまでの演出と余韻のぶんを足す。上限で切るのは、1場面が長すぎると
 * 指が離れるから。リールは繰り返し再生されるので、読み残しは2周目で拾える。
 *
 * 原稿の字数の上限(lib/instagram/limits.ts の IG_REEL_LIMITS)と対で、
 * 上限いっぱいの原稿でも全体が40秒前後。本文を40字前後にすると35秒前後。
 */

export const REEL_FPS = 30;
export const REEL_WIDTH = 1080;
export const REEL_HEIGHT = 1920;

/** 次の場面が前の場面の上に重なって出てくる長さ(フレーム)。 */
export const REEL_TRANSITION = 12;

/** 読む速さ。1秒あたりの字数。 */
const READ_CPS = 9;

/**
 * 文字が1字ずつ現れる速さ(1フレームあたりの字数)。読む速さよりずっと速く、
 * 目を引く演出にとどめる。60字の本文でも1秒強で出揃う。
 */
export const REVEAL_TITLE_CPF = 1.2;
export const REVEAL_BODY_CPF = 1.8;

/** 1字が透明から現れきるまでのフレーム数。 */
export const REVEAL_FADE = 5;

export type ReelSceneKind = "cover" | "point" | "closing";

export type ReelScene = {
  kind: ReelSceneKind;
  /** 0 = 表紙、1〜3 = 要点、4 = 締め。 */
  index: number;
  /** 動画の頭から数えた開始フレーム。 */
  from: number;
  duration: number;
};

type TimingInput = Pick<
  ReelProps,
  "word" | "coverHead" | "coverTail" | "points" | "closingTitle" | "closingBody"
>;

function chars(text: string | null | undefined): number {
  return Array.from((text ?? "").replace(/\s/g, "")).length;
}

function seconds(value: number, min: number, max: number): number {
  return Math.round(Math.min(max, Math.max(min, value)) * REEL_FPS);
}

/** 文字が出揃うまでのフレーム数。 */
export function revealFrames(text: string, charsPerFrame: number): number {
  return Math.ceil(Array.from(text).length / charsPerFrame) + REVEAL_FADE;
}

export function reelScenes(props: TimingInput): ReelScene[] {
  // 表紙は1コマ目から出来上がった絵で出す(サムネイルになり、冒頭1秒で
  // 何の話か分かるように)。つかみなので長居させない(上限5.5秒)。
  // イギリス英語は英語の表現を読むぶん少し足す。
  const cover = seconds(
    1.6 + chars(props.coverHead + (props.coverTail ?? "")) / READ_CPS + (props.word ? 0.6 : 0),
    3,
    5.5,
  );
  const points = props.points.map((p) =>
    seconds(1.4 + chars(p.title + p.body) / READ_CPS, 4.5, 10),
  );
  // 締めは最後に誘導の枠が出るので、そのぶん(2.2秒)残す。
  const closing = seconds(
    1.4 + chars(props.closingTitle + props.closingBody) / READ_CPS + 2.2,
    5.5,
    12,
  );

  const durations = [cover, ...points, closing];
  let from = 0;
  return durations.map((duration, index) => {
    const kind: ReelSceneKind =
      index === 0 ? "cover" : index === durations.length - 1 ? "closing" : "point";
    const scene = { kind, index, from, duration };
    from += duration - REEL_TRANSITION;
    return scene;
  });
}

export function reelDurationInFrames(props: TimingInput): number {
  const scenes = reelScenes(props);
  const last = scenes[scenes.length - 1];
  return last.from + last.duration;
}

/**
 * 場面の文字が出揃ったあとのフレーム(動画の頭から数える)。確認用の
 * 静止画をここで切り出す。次の場面が重なり始める直前。
 */
export function settledFrame(scene: ReelScene, isLast: boolean): number {
  return scene.from + scene.duration - (isLast ? 1 : REEL_TRANSITION + 1);
}
