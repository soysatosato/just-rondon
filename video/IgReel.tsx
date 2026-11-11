import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import {
  AbsoluteFill,
  Img,
  Sequence,
  cancelRender,
  continueRender,
  delayRender,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { IG_LINK_LABEL } from "../lib/instagram/caption";
import {
  IG_CREDIT_PREFIX,
  IG_CTA_LEAD,
  IG_CTA_MAIN,
  IG_DOMAIN,
  IG_FRAMES,
  IG_SITE,
  IG_TAGLINE,
  IG_THEMES,
  coverHeadSize,
  innerWidth,
  labelSize,
  photoShade,
  textUnits,
  wordSize,
  type IgTheme,
} from "../lib/instagram/design";
import {
  REEL_TRANSITION,
  REVEAL_BODY_CPF,
  REVEAL_FADE,
  REVEAL_TITLE_CPF,
  reelScenes,
  revealFrames,
  type ReelScene,
} from "./timing";
import type { ReelProps } from "./types";

/**
 * Instagram のリール(1080x1920)。原稿はカルーセルと同じ5場面
 * (表紙 / 要点3つ / 締め)で、見た目も components/og/IgSlide.tsx の
 * リール用の版面に合わせてある。違いは動きだけ。
 *
 *   表紙   1コマ目から完成した絵(サムネイルになる)。写真はゆっくり寄る
 *   要点   札が弾んで出て、見出しと本文が1字ずつ現れる
 *   締め   本文のあとに「プロフィールのリンクから」の枠が出る
 *   切替   次の場面が右から滑り込む(カルーセルをめくる動き)
 *
 * 上端には場面の進み具合の帯を置く(あと何場面あるかが分かると最後まで
 * 見られやすい)。文字は Instagram の表示が重なる余白(IG_FRAMES.reel)の
 * 内側にだけ置く。
 *
 * IgSlide は satori 用で、全要素が既定で flex になる前提で書かれている。
 * こちらは Chrome で描くので display を明示している。
 */

const FRAME = IG_FRAMES.reel;
const WIDTH = innerWidth(FRAME);
const FONT = "ReelSans";
const FONT_STACK = `"${FONT}", "Noto Sans JP", "Hiragino Sans", sans-serif`;

/** 進み具合の帯。余白の上端に置き、中身はその下から始める。 */
const PROGRESS_HEIGHT = 8;
const PROGRESS_GAP = 36;
const CONTENT_TOP = FRAME.top + PROGRESS_HEIGHT + PROGRESS_GAP;

const CLAMP = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/**
 * 日本語の折り返し。既定のままだと「訪/ねた」「タイ/ムズ」のように語の
 * 途中で折れるので、Chrome の文節単位の改行(word-break: auto-phrase。
 * lang="ja" の中でだけ効く)を使う。見出しは行の長さもそろえ、本文は
 * 最後の行に1字だけ残るのを避ける。csstype がまだ auto-phrase を
 * 知らないので型を外している。
 */
const PHRASE = { wordBreak: "auto-phrase" } as unknown as CSSProperties;
const HEADING: CSSProperties = { ...PHRASE, lineBreak: "strict", textWrap: "balance" };
const PROSE: CSSProperties = { ...PHRASE, lineBreak: "strict", textWrap: "pretty" };

/**
 * フォントを読み込むまで描画を止める。読めなければ書き出しを中止する
 * (豆腐や代わりのフォントの動画を出さない)。
 */
function useReelFonts(fonts: ReelProps["fonts"]) {
  const [handle] = useState(() =>
    fonts ? delayRender("リールのフォントを読み込む") : null,
  );
  useEffect(() => {
    if (!fonts || handle === null) return;
    const faces = [
      new FontFace(FONT, `url("${staticFile(fonts.regular)}")`, { weight: "400" }),
      new FontFace(FONT, `url("${staticFile(fonts.bold)}")`, { weight: "700" }),
    ];
    Promise.all(faces.map((face) => face.load()))
      .then((loaded) => {
        for (const face of loaded) document.fonts.add(face);
        continueRender(handle);
      })
      .catch((error) => cancelRender(error));
  }, [fonts, handle]);
}

/**
 * 1字ずつ現れる文字。透明な字も場所を取るので、出揃う前と後で改行位置が
 * 変わらない(字を後から足していくと、行の折り返しが途中で動いてしまう)。
 */
function Reveal({ text, start, cpf }: { text: string; start: number; cpf: number }) {
  const frame = useCurrentFrame();
  return (
    <>
      {Array.from(text).map((ch, i) => (
        <span
          key={i}
          style={{
            opacity: interpolate(frame - start - i / cpf, [0, REVEAL_FADE], [0, 1], CLAMP),
          }}
        >
          {ch}
        </span>
      ))}
    </>
  );
}

function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3;
}

/**
 * 場面の切り替え。カルーセルをめくるように、次の場面が右から不透明のまま
 * 滑り込み、前の場面は少しだけ左へ逃げる。透明度で混ぜると、文字の多い
 * 場面同士が二重写しになって読めない瞬間ができる。
 *
 * 入りと出は同じ曲線で動かすので、2つの場面のあいだに隙間は開かない
 * (次の場面の左端 100(1-e)% は、前の場面の右端 100-30e% より常に左)。
 */
function SceneMotion({
  first,
  last,
  duration,
  children,
}: {
  first: boolean;
  last: boolean;
  duration: number;
  children: ReactNode;
}) {
  const frame = useCurrentFrame();
  const enter = first
    ? 1
    : easeOutCubic(interpolate(frame, [0, REEL_TRANSITION], [0, 1], CLAMP));
  const exit = last
    ? 0
    : easeOutCubic(interpolate(frame, [duration - REEL_TRANSITION, duration], [0, 1], CLAMP));
  const x = (1 - enter) * 100 - exit * 30;
  return (
    <AbsoluteFill style={{ transform: x === 0 ? undefined : `translateX(${x}%)` }}>
      {children}
    </AbsoluteFill>
  );
}

/** 余白の内側に、子を上下に振り分ける。 */
function Column({ children }: { children: ReactNode }) {
  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: `${CONTENT_TOP}px ${FRAME.right}px ${FRAME.bottom}px ${FRAME.left}px`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
}

function Badge({ theme, outline = false }: { theme: IgTheme; outline?: boolean }) {
  return (
    <div
      style={{
        display: "flex",
        color: outline ? theme.strong : "#ffffff",
        backgroundColor: outline ? "rgba(255,255,255,0.7)" : theme.strong,
        border: `3px solid ${theme.strong}`,
        fontSize: 24,
        fontWeight: 700,
        letterSpacing: "5px",
        padding: "9px 24px",
        borderRadius: 999,
        lineHeight: 1.2,
      }}
    >
      {theme.badge}
    </div>
  );
}

function TopRow({
  theme,
  light,
  outline,
}: {
  theme: IgTheme;
  /** 暗い地の上に置くとき true。 */
  light: boolean;
  outline?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        width: WIDTH,
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <Badge theme={theme} outline={outline} />
      <div
        style={{
          color: light ? "rgba(255,255,255,0.9)" : "#94a3b8",
          fontSize: 27,
          fontWeight: 700,
        }}
      >
        {IG_SITE}
      </div>
    </div>
  );
}

function SiteRow({ light }: { light: boolean }) {
  return (
    <div
      style={{
        display: "flex",
        width: WIDTH,
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <div style={{ color: light ? "#ffffff" : "#0f172a", fontSize: 27, fontWeight: 700 }}>
        {IG_SITE}
      </div>
      <div style={{ color: light ? "rgba(255,255,255,0.6)" : "#94a3b8", fontSize: 24 }}>
        {light ? IG_TAGLINE : IG_DOMAIN}
      </div>
    </div>
  );
}

function AccentBar({ color, progress = 1 }: { color: string; progress?: number }) {
  return (
    <div
      style={{
        width: 72 * progress,
        height: 7,
        borderRadius: 7,
        backgroundColor: color,
      }}
    />
  );
}

function PhotoCover({
  props,
  theme,
  duration,
}: {
  props: ReelProps;
  theme: IgTheme;
  duration: number;
}) {
  const frame = useCurrentFrame();
  const zoom = interpolate(frame, [0, duration], [1, 1.08], CLAMP);
  const photo = props.photo;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#111827",
        backgroundImage: photo ? undefined : theme.panel,
        overflow: "hidden",
      }}
    >
      {photo && (
        <Img
          src={staticFile(photo.file)}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            // 縦長の写真は上寄せ(人物の頭を残す)。IgSlide の coverRect と同じ 0.3。
            objectPosition: "50% 30%",
            transform: `scale(${zoom})`,
            transformOrigin: "50% 30%",
          }}
        />
      )}
      {photo && <AbsoluteFill style={{ backgroundImage: photoShade(FRAME) }} />}
      <Column>
        <TopRow theme={theme} light />
        <div style={{ display: "flex", flexDirection: "column", width: WIDTH }}>
          <div style={{ marginBottom: 30 }}>
            <AccentBar color={theme.accent} />
          </div>
          <div
            style={{
              ...HEADING,
              width: WIDTH,
              color: "#ffffff",
              fontSize: coverHeadSize(props.coverHead),
              fontWeight: 700,
              lineHeight: 1.25,
              letterSpacing: "-1px",
            }}
          >
            {props.coverHead}
          </div>
          {props.coverTail && (
            <div
              style={{
                ...PROSE,
                width: WIDTH,
                marginTop: 28,
                color: "rgba(255,255,255,0.9)",
                fontSize: 38,
                lineHeight: 1.5,
              }}
            >
              {props.coverTail}
            </div>
          )}
          {photo && props.credit && (
            <div
              style={{
                width: WIDTH,
                marginTop: 40,
                color: "rgba(255,255,255,0.62)",
                fontSize: 20,
                lineHeight: 1.4,
                overflowWrap: "anywhere",
              }}
            >
              {IG_CREDIT_PREFIX + props.credit}
            </div>
          )}
        </div>
      </Column>
    </AbsoluteFill>
  );
}

function WordCover({
  props,
  theme,
  duration,
}: {
  props: ReelProps;
  theme: IgTheme;
  duration: number;
}) {
  const frame = useCurrentFrame();
  const breathe = interpolate(frame, [0, duration], [1, 1.04], CLAMP);
  const word = props.word ?? "";

  return (
    <AbsoluteFill style={{ backgroundColor: "#ffffff", backgroundImage: theme.page }}>
      {/* 記事ページのヘッダーにある淡い丸と、引用ブロックと同じ左端のレール。 */}
      <div
        style={{
          position: "absolute",
          top: -180,
          right: -150,
          width: 560,
          height: 560,
          borderRadius: 560,
          backgroundColor: "rgba(244, 63, 94, 0.10)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -220,
          left: -170,
          width: 460,
          height: 460,
          borderRadius: 460,
          backgroundColor: "rgba(56, 189, 248, 0.10)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 18,
          height: FRAME.height,
          backgroundImage: `linear-gradient(180deg, ${theme.strong} 0%, ${theme.accent} 100%)`,
        }}
      />
      <Column>
        <TopRow theme={theme} light={false} />
        <div style={{ display: "flex", flexDirection: "column", width: WIDTH }}>
          <div
            style={{
              ...HEADING,
              width: WIDTH,
              color: "#e11d48",
              fontSize: wordSize(word),
              fontWeight: 700,
              lineHeight: 1.1,
              letterSpacing: "-2px",
              transform: `scale(${breathe})`,
              transformOrigin: "left center",
            }}
          >
            {word}
          </div>
          <div
            style={{
              ...HEADING,
              width: WIDTH,
              marginTop: 44,
              color: "#111827",
              fontSize: textUnits(props.coverHead) <= 16 ? 60 : 52,
              fontWeight: 700,
              lineHeight: 1.4,
            }}
          >
            {props.coverHead}
          </div>
          {props.coverTail && (
            <div
              style={{
                ...PROSE,
                width: WIDTH,
                marginTop: 24,
                color: "#6b7280",
                fontSize: 36,
                lineHeight: 1.5,
              }}
            >
              {props.coverTail}
            </div>
          )}
        </div>
        <div
          style={{
            display: "flex",
            width: WIDTH,
            justifyContent: "flex-end",
            color: "#9ca3af",
            fontSize: 24,
          }}
        >
          {IG_DOMAIN}
        </div>
      </Column>
    </AbsoluteFill>
  );
}

function PointScene({ point, theme }: { point: ReelProps["points"][number]; theme: IgTheme }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const labelIn = spring({
    frame: frame - 4,
    fps,
    config: { damping: 13, stiffness: 140, mass: 0.8 },
  });
  const titleStart = 10;
  const titleEnd = titleStart + revealFrames(point.title, REVEAL_TITLE_CPF);
  const bar = interpolate(frame, [titleStart + 6, titleStart + 22], [0, 1], CLAMP);
  const bodyStart = titleEnd + 2;

  return (
    <AbsoluteFill style={{ backgroundColor: "#ffffff", backgroundImage: theme.page }}>
      <Column>
        <TopRow theme={theme} light={false} outline />
        <div style={{ display: "flex", flexDirection: "column", width: WIDTH }}>
          <div
            style={{
              width: WIDTH,
              color: theme.strong,
              fontSize: labelSize(point.label, WIDTH),
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: "-3px",
              whiteSpace: "nowrap",
              opacity: Math.min(1, labelIn * 1.4),
              transform: `translateY(${(1 - labelIn) * 36}px) scale(${0.86 + 0.14 * labelIn})`,
              transformOrigin: "left bottom",
            }}
          >
            {point.label}
          </div>
          <div
            style={{
              ...HEADING,
              width: WIDTH,
              marginTop: 30,
              color: "#0f172a",
              fontSize: 56,
              fontWeight: 700,
              lineHeight: 1.35,
            }}
          >
            <Reveal text={point.title} start={titleStart} cpf={REVEAL_TITLE_CPF} />
          </div>
          <div style={{ marginTop: 36 }}>
            <AccentBar color={theme.accent} progress={bar} />
          </div>
          <div
            style={{
              ...PROSE,
              width: WIDTH,
              marginTop: 36,
              color: "#334155",
              fontSize: 40,
              lineHeight: 1.7,
            }}
          >
            <Reveal text={point.body} start={bodyStart} cpf={REVEAL_BODY_CPF} />
          </div>
        </div>
        <SiteRow light={false} />
      </Column>
    </AbsoluteFill>
  );
}

function ClosingScene({ props, theme }: { props: ReelProps; theme: IgTheme }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleStart = 10;
  const titleEnd = titleStart + revealFrames(props.closingTitle, REVEAL_TITLE_CPF);
  const bodyStart = titleEnd + 2;
  const bodyEnd = bodyStart + revealFrames(props.closingBody, REVEAL_BODY_CPF);
  const cta = spring({
    frame: frame - (bodyEnd + 8),
    fps,
    config: { damping: 14, stiffness: 120 },
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#111827", backgroundImage: theme.dark }}>
      <Column>
        <TopRow theme={theme} light />
        <div style={{ display: "flex", flexDirection: "column", width: WIDTH }}>
          <div
            style={{
              ...HEADING,
              width: WIDTH,
              color: "#ffffff",
              fontSize: 60,
              fontWeight: 700,
              lineHeight: 1.35,
            }}
          >
            <Reveal text={props.closingTitle} start={titleStart} cpf={REVEAL_TITLE_CPF} />
          </div>
          <div
            style={{
              ...PROSE,
              width: WIDTH,
              marginTop: 30,
              color: "rgba(255,255,255,0.86)",
              fontSize: 40,
              lineHeight: 1.7,
            }}
          >
            <Reveal text={props.closingBody} start={bodyStart} cpf={REVEAL_BODY_CPF} />
          </div>

          {/* 誘導。キャプションのリンクは押せないので、プロフィールへ送る。 */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              width: WIDTH,
              marginTop: 64,
              padding: "40px 44px",
              borderRadius: 28,
              backgroundColor: "#ffffff",
              opacity: Math.min(1, cta * 1.5),
              transform: `translateY(${(1 - cta) * 40}px) scale(${0.94 + 0.06 * cta})`,
            }}
          >
            <div style={{ color: "#475569", fontSize: 32 }}>{IG_CTA_LEAD}</div>
            <div
              style={{
                marginTop: 6,
                color: "#0f172a",
                fontSize: 52,
                fontWeight: 700,
                lineHeight: 1.3,
              }}
            >
              {IG_CTA_MAIN}
            </div>
            <div style={{ marginTop: 16, color: theme.strong, fontSize: 32, fontWeight: 700 }}>
              {IG_LINK_LABEL}
            </div>
          </div>
        </div>
        <SiteRow light />
      </Column>
    </AbsoluteFill>
  );
}

/** 暗い地の場面か。帯の色を地に合わせて切り替える。 */
function isDarkScene(scene: ReelScene, props: ReelProps): boolean {
  if (scene.kind === "closing") return true;
  if (scene.kind === "cover") return props.category === "column";
  return false;
}

/** 上端の帯。場面ごとに1本、いまの場面が左から満ちていく。 */
function Progress({
  scenes,
  props,
  theme,
}: {
  scenes: ReelScene[];
  props: ReelProps;
  theme: IgTheme;
}) {
  const frame = useCurrentFrame();
  // 帯の色は、次の場面が半分まで滑り込んだところで切り替える。
  const current =
    [...scenes].reverse().find((s) => frame >= s.from + REEL_TRANSITION / 2) ?? scenes[0];
  const dark = isDarkScene(current, props);
  const track = dark ? "rgba(255,255,255,0.32)" : "rgba(15,23,42,0.12)";
  const fill = dark ? "#ffffff" : theme.strong;

  return (
    <div
      style={{
        position: "absolute",
        top: FRAME.top,
        left: FRAME.left,
        display: "flex",
        gap: 10,
        width: WIDTH,
        height: PROGRESS_HEIGHT,
      }}
    >
      {scenes.map((scene, i) => {
        const span = i === scenes.length - 1 ? scene.duration : scene.duration - REEL_TRANSITION;
        const filled = interpolate(frame, [scene.from, scene.from + span], [0, 1], CLAMP);
        return (
          <div
            key={scene.index}
            style={{
              flex: 1,
              height: PROGRESS_HEIGHT,
              borderRadius: 999,
              backgroundColor: track,
              overflow: "hidden",
            }}
          >
            <div style={{ width: `${filled * 100}%`, height: "100%", backgroundColor: fill }} />
          </div>
        );
      })}
    </div>
  );
}

export function IgReel(props: ReelProps) {
  useReelFonts(props.fonts);
  const theme = IG_THEMES[props.category];
  const scenes = reelScenes(props);

  const sceneOf = (scene: ReelScene) => {
    switch (scene.kind) {
      case "cover":
        return props.category === "british-english" ? (
          <WordCover props={props} theme={theme} duration={scene.duration} />
        ) : (
          <PhotoCover props={props} theme={theme} duration={scene.duration} />
        );
      case "point":
        return <PointScene point={props.points[scene.index - 1]} theme={theme} />;
      case "closing":
        return <ClosingScene props={props} theme={theme} />;
    }
  };

  return (
    <AbsoluteFill
      lang="ja"
      style={{
        backgroundColor: "#ffffff",
        fontFamily: FONT_STACK,
        WebkitFontSmoothing: "antialiased",
      }}
    >
      {scenes.map((scene) => (
        <Sequence
          key={scene.index}
          from={scene.from}
          durationInFrames={scene.duration}
          name={`${scene.index + 1} ${scene.kind}`}
        >
          <SceneMotion
            first={scene.index === 0}
            last={scene.index === scenes.length - 1}
            duration={scene.duration}
          >
            {sceneOf(scene)}
          </SceneMotion>
        </Sequence>
      ))}
      <Progress scenes={scenes} props={props} theme={theme} />
    </AbsoluteFill>
  );
}
