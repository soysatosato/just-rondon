import type { OgPhoto } from "@/lib/og";
import {
  IG_LIMITS,
  IG_SLIDE_COUNT,
  clampText,
  type IgCategory,
  type IgPoint,
} from "@/lib/instagram/limits";
import { IG_LINK_LABEL } from "@/lib/instagram/caption";

/**
 * Instagram のカルーセル1枚ぶんの版面。並びは 1 表紙 / 2〜4 要点 / 5 締め。
 *
 * 寸法は2つ。フィード用の 1080x1350(4:5、フィードで縦にいちばん大きく
 * 出る比率)と、リール用の 1080x1920(9:16)。リール用はアプリで写真から
 * リールを作るときに使う。上下と右は Instagram の表示(アカウント名・
 * キャプション・いいね等のボタン)が重なるので、文字をそこに置かない。
 * 中身は同じで、余白だけが違う。
 *
 * 表紙はセクションで型が違う。コラムは記事の写真を全面に敷き、下に見出しを
 * 白で重ねる。イギリス英語は写真を使わず、英語の表現そのものを大きく置く
 * (共有カード app/og/british-english と同じ考え方。主役は語)。
 *
 * 2〜4枚目は写真を使わない。節の挿絵は1本あたり平均0.4枚しか無く、
 * 写真の有無で枚ごとの見た目がばらつく。年号や数字の札を大きく置いて、
 * 文字だけでも目が止まる面にする。
 *
 * satori(next/og)の制約は components/og/OgCard.tsx の冒頭と同じ。とくに
 * 文字の箱には幅を実数で与えること(幅が決まらない箱では折り返さない)。
 */

export type IgFrame = {
  width: number;
  height: number;
  /** 文字を置かない余白。リール用は Instagram の表示が重なる範囲を含む。 */
  top: number;
  bottom: number;
  left: number;
  right: number;
};

export const IG_FRAMES = {
  feed: { width: 1080, height: 1350, top: 84, bottom: 76, left: 80, right: 80 },
  reel: { width: 1080, height: 1920, top: 250, bottom: 430, left: 80, right: 140 },
} satisfies Record<string, IgFrame>;

type IgTheme = {
  badge: string;
  /** バッジの地と札の文字。白地の上で読める濃さ。 */
  strong: string;
  /** 罫線と差し色。 */
  accent: string;
  /** 要点の枚の地。 */
  page: string;
  /** 締めの枚の地。 */
  dark: string;
  /** 写真が無い表紙の地。 */
  panel: string;
};

/** 配色は共有カード(components/og/OgCard.tsx の OG_THEMES)とそろえる。 */
const IG_THEMES: Record<IgCategory, IgTheme> = {
  column: {
    badge: "COLUMN",
    strong: "#b45309",
    accent: "#f59e0b",
    page: "linear-gradient(160deg, #fffbeb 0%, #ffffff 50%, #fff7ed 100%)",
    dark: "linear-gradient(160deg, #1c1917 0%, #431407 60%, #9a3412 100%)",
    panel: "linear-gradient(160deg, #f59e0b 0%, #ea580c 55%, #e11d48 100%)",
  },
  "british-english": {
    badge: "BRITISH ENGLISH",
    strong: "#dc2626",
    accent: "#f43f5e",
    page: "linear-gradient(160deg, #fff1f2 0%, #ffffff 50%, #fff7ed 100%)",
    dark: "linear-gradient(160deg, #1f0a0d 0%, #4c0519 60%, #9f1239 100%)",
    panel: "linear-gradient(160deg, #f43f5e 0%, #dc2626 55%, #ea580c 100%)",
  },
};

const SITE = "ジャスト・ロンドン";
const DOMAIN = "just-rondon.com";
const TAGLINE = "ロンドンとイギリスの、歩き方";
const CTA_LEAD = "記事の全文は";
const CTA_MAIN = "プロフィールのリンクから";
const CREDIT_PREFIX = "画像: ";

export type IgSlideInput =
  | {
      type: "cover";
      head: string;
      tail: string | null;
      /** イギリス英語の表現(Content.engTitle)。コラムでは null。 */
      word: string | null;
      photo: OgPhoto | null;
      /** 写真を使ったときの作者とライセンス。 */
      credit: string | null;
    }
  | { type: "point"; /** 2〜4 */ page: number; point: IgPoint }
  | { type: "closing"; title: string; body: string };

/**
 * この枚に出る文字をすべて連結する。フォントのサブセット取得に渡す。
 * 拾い漏らした字だけが豆腐になるので、版面と対で更新すること。
 */
export function igSlideText(slide: IgSlideInput, category: IgCategory): string {
  const fixed = [IG_THEMES[category].badge, SITE, DOMAIN, "0123456789/…"];
  switch (slide.type) {
    case "cover":
      return [
        ...fixed,
        slide.head,
        slide.tail ?? "",
        slide.word ?? "",
        slide.credit ? CREDIT_PREFIX + slide.credit : "",
      ].join("");
    case "point":
      return [...fixed, slide.point.label, slide.point.title, slide.point.body].join("");
    case "closing":
      return [
        ...fixed,
        slide.title,
        slide.body,
        TAGLINE,
        CTA_LEAD,
        CTA_MAIN,
        IG_LINK_LABEL,
      ].join("");
  }
}

/** 全角を1、半角を0.6として数えた幅。札と見出しの文字寸法を決める。 */
function textUnits(text: string): number {
  let units = 0;
  for (const ch of Array.from(text)) units += /[ -~]/.test(ch) ? 0.6 : 1;
  return units;
}

function innerWidth(frame: IgFrame): number {
  return frame.width - frame.left - frame.right;
}

/** 表紙の見出し(日本語)。2〜3行に収まる刻み。 */
function coverHeadSize(text: string): number {
  const u = textUnits(text);
  if (u <= 9) return 100;
  if (u <= 14) return 88;
  if (u <= 20) return 80;
  if (u <= 26) return 72;
  return 66;
}

/** イギリス英語の表紙の主役(英語)。 */
function wordSize(text: string): number {
  const n = text.length;
  if (n <= 8) return 150;
  if (n <= 12) return 124;
  if (n <= 18) return 100;
  if (n <= 26) return 80;
  return 64;
}

/** 要点の札。1行に収まるいちばん大きな寸法(上限160px)。 */
function labelSize(text: string, width: number): number {
  const fit = Math.floor((width / Math.max(textUnits(text), 1)) * 0.95);
  return Math.max(72, Math.min(160, fit));
}

/**
 * 写真を全面に敷くときの位置と寸法。satori は objectPosition を持たないので
 * 自分で計算する。縦長の写真は上寄せ(人物の頭を残す)。理由は OgCard と同じ。
 */
function coverRect(photo: OgPhoto, frame: IgFrame) {
  const scale = Math.max(frame.width / photo.width, frame.height / photo.height);
  const width = Math.ceil(photo.width * scale);
  const height = Math.ceil(photo.height * scale);
  return {
    width,
    height,
    left: Math.round((frame.width - width) / 2),
    top: Math.round((frame.height - height) * 0.3),
  };
}

/**
 * 写真に重ねる影。上はバッジの段の下まで、下は見出しの塊の上から暗くする。
 * 位置を割合で固定するとリール用(上下の余白が大きい)で段に届かないので、
 * 余白から計算する。
 */
function photoShade(frame: IgFrame): string {
  const pct = (px: number) => `${((px / frame.height) * 100).toFixed(1)}%`;
  const topClear = pct(frame.top + 200);
  const fadeStart = pct(frame.height - frame.bottom - 760);
  const dark = pct(frame.height - frame.bottom - 400);
  return (
    `linear-gradient(180deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.35) ${pct(frame.top + 60)}, ` +
    `rgba(0,0,0,0) ${topClear}, rgba(0,0,0,0) ${fadeStart}, rgba(0,0,0,0.72) ${dark}, rgba(0,0,0,0.9) 100%)`
  );
}

function Badge({ theme, outline = false }: { theme: IgTheme; outline?: boolean }) {
  return (
    <div style={{ display: "flex" }}>
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
        }}
      >
        {theme.badge}
      </div>
    </div>
  );
}

/** 上の段。左にバッジ、右にサイト名か枚数。 */
function TopRow({
  theme,
  frame,
  right,
  light,
  outline,
}: {
  theme: IgTheme;
  frame: IgFrame;
  right: string;
  /** 暗い地の上に置くとき true。 */
  light: boolean;
  outline?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        width: innerWidth(frame),
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <Badge theme={theme} outline={outline} />
      <div
        style={{
          display: "flex",
          color: light ? "rgba(255,255,255,0.9)" : "#94a3b8",
          fontSize: 27,
          fontWeight: 700,
        }}
      >
        {right}
      </div>
    </div>
  );
}

function pageLabel(page: number): string {
  return `${page} / ${IG_SLIDE_COUNT}`;
}

/** 外枠。地を敷き、余白の内側に子を上下に振り分ける。 */
function Frame({
  frame,
  background,
  children,
}: {
  frame: IgFrame;
  background: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        width: frame.width,
        height: frame.height,
        padding: `${frame.top}px ${frame.right}px ${frame.bottom}px ${frame.left}px`,
        backgroundColor: "#ffffff",
        backgroundImage: background,
        overflow: "hidden",
      }}
    >
      {children}
    </div>
  );
}

function PhotoCover({
  slide,
  theme,
  frame,
}: {
  slide: Extract<IgSlideInput, { type: "cover" }>;
  theme: IgTheme;
  frame: IgFrame;
}) {
  const width = innerWidth(frame);
  const head = clampText(slide.head, IG_LIMITS.coverHead);
  const tail = slide.tail ? clampText(slide.tail, IG_LIMITS.coverTail) : null;
  const rect = slide.photo ? coverRect(slide.photo, frame) : null;

  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        width: frame.width,
        height: frame.height,
        backgroundColor: "#111827",
        // undefined を値に置くと satori が落ちる(値に trim を呼ぶ)。キーごと外す。
        ...(slide.photo ? {} : { backgroundImage: theme.panel }),
        overflow: "hidden",
      }}
    >
      {slide.photo && rect && (
        // eslint-disable-next-line @next/next/no-img-element -- satori が描く画像の中身で、ページの <img> ではない
        <img
          src={slide.photo.src}
          alt=""
          width={rect.width}
          height={rect.height}
          style={{ position: "absolute", ...rect }}
        />
      )}
      {/* 上はバッジ、下は見出しが読めるように暗くする。中ほどは写真のまま。 */}
      {slide.photo && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: frame.width,
            height: frame.height,
            backgroundImage: photoShade(frame),
          }}
        />
      )}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: frame.width,
          height: frame.height,
          padding: `${frame.top}px ${frame.right}px ${frame.bottom}px ${frame.left}px`,
        }}
      >
        <TopRow theme={theme} frame={frame} right={SITE} light />
        <div style={{ display: "flex", flexDirection: "column", width }}>
          <div
            style={{
              display: "flex",
              width: 72,
              height: 7,
              marginBottom: 30,
              borderRadius: 7,
              backgroundColor: theme.accent,
            }}
          />
          <div
            style={{
              display: "flex",
              width,
              color: "#ffffff",
              fontSize: coverHeadSize(head),
              fontWeight: 700,
              lineHeight: 1.25,
              letterSpacing: "-1px",
            }}
          >
            {head}
          </div>
          {tail && (
            <div
              style={{
                display: "flex",
                width,
                marginTop: 28,
                color: "rgba(255,255,255,0.9)",
                fontSize: 38,
                lineHeight: 1.5,
              }}
            >
              {tail}
            </div>
          )}
          {slide.photo && slide.credit && (
            <div
              style={{
                display: "flex",
                width,
                marginTop: 40,
                color: "rgba(255,255,255,0.62)",
                fontSize: 20,
                lineHeight: 1.4,
              }}
            >
              {CREDIT_PREFIX + slide.credit}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function WordCover({
  slide,
  theme,
  frame,
}: {
  slide: Extract<IgSlideInput, { type: "cover" }>;
  theme: IgTheme;
  frame: IgFrame;
}) {
  const width = innerWidth(frame);
  const word = slide.word ?? "";
  const head = clampText(slide.head, IG_LIMITS.coverHead);
  const tail = slide.tail ? clampText(slide.tail, IG_LIMITS.coverTail) : null;

  return (
    <Frame frame={frame} background={theme.page}>
      {/* 記事ページのヘッダーにある淡い丸。ぼかしは使えないので薄い塗りで。 */}
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
      {/* 引用ブロックと同じ、左端のレール */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 18,
          height: frame.height,
          backgroundImage: `linear-gradient(180deg, ${theme.strong} 0%, ${theme.accent} 100%)`,
        }}
      />

      <TopRow theme={theme} frame={frame} right={SITE} light={false} />
      <div style={{ display: "flex", flexDirection: "column", width }}>
        <div
          style={{
            display: "flex",
            width,
            color: "#e11d48",
            fontSize: wordSize(word),
            fontWeight: 700,
            lineHeight: 1.1,
            letterSpacing: "-2px",
          }}
        >
          {word}
        </div>
        <div
          style={{
            display: "flex",
            width,
            marginTop: 44,
            color: "#111827",
            fontSize: textUnits(head) <= 16 ? 60 : 52,
            fontWeight: 700,
            lineHeight: 1.4,
          }}
        >
          {head}
        </div>
        {tail && (
          <div
            style={{
              display: "flex",
              width,
              marginTop: 24,
              color: "#6b7280",
              fontSize: 36,
              lineHeight: 1.5,
            }}
          >
            {tail}
          </div>
        )}
      </div>
      <div
        style={{
          display: "flex",
          width,
          justifyContent: "flex-end",
          color: "#9ca3af",
          fontSize: 24,
        }}
      >
        {DOMAIN}
      </div>
    </Frame>
  );
}

function PointSlide({
  slide,
  theme,
  frame,
}: {
  slide: Extract<IgSlideInput, { type: "point" }>;
  theme: IgTheme;
  frame: IgFrame;
}) {
  const width = innerWidth(frame);
  const label = clampText(slide.point.label, IG_LIMITS.pointLabel);
  const title = clampText(slide.point.title, IG_LIMITS.pointTitle);
  const body = clampText(slide.point.body, IG_LIMITS.pointBody);

  return (
    <Frame frame={frame} background={theme.page}>
      <TopRow
        theme={theme}
        frame={frame}
        right={pageLabel(slide.page)}
        light={false}
        outline
      />
      <div style={{ display: "flex", flexDirection: "column", width }}>
        <div
          style={{
            display: "flex",
            width,
            color: theme.strong,
            fontSize: labelSize(label, width),
            fontWeight: 700,
            lineHeight: 1.05,
            letterSpacing: "-3px",
          }}
        >
          {label}
        </div>
        <div
          style={{
            display: "flex",
            width,
            marginTop: 30,
            color: "#0f172a",
            fontSize: 56,
            fontWeight: 700,
            lineHeight: 1.35,
          }}
        >
          {title}
        </div>
        <div
          style={{
            display: "flex",
            width: 72,
            height: 6,
            marginTop: 36,
            borderRadius: 6,
            backgroundColor: theme.accent,
          }}
        />
        <div
          style={{
            display: "flex",
            width,
            marginTop: 36,
            color: "#334155",
            fontSize: 40,
            lineHeight: 1.7,
          }}
        >
          {body}
        </div>
      </div>
      <SiteRow frame={frame} light={false} />
    </Frame>
  );
}

function SiteRow({ frame, light }: { frame: IgFrame; light: boolean }) {
  return (
    <div
      style={{
        display: "flex",
        width: innerWidth(frame),
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <div
        style={{
          display: "flex",
          color: light ? "#ffffff" : "#0f172a",
          fontSize: 27,
          fontWeight: 700,
        }}
      >
        {SITE}
      </div>
      <div
        style={{
          display: "flex",
          color: light ? "rgba(255,255,255,0.6)" : "#94a3b8",
          fontSize: 24,
        }}
      >
        {light ? TAGLINE : DOMAIN}
      </div>
    </div>
  );
}

function ClosingSlide({
  slide,
  theme,
  frame,
}: {
  slide: Extract<IgSlideInput, { type: "closing" }>;
  theme: IgTheme;
  frame: IgFrame;
}) {
  const width = innerWidth(frame);
  const title = clampText(slide.title, IG_LIMITS.closingTitle);
  const body = clampText(slide.body, IG_LIMITS.closingBody);

  return (
    <Frame frame={frame} background={theme.dark}>
      <TopRow
        theme={theme}
        frame={frame}
        right={pageLabel(IG_SLIDE_COUNT)}
        light
      />
      <div style={{ display: "flex", flexDirection: "column", width }}>
        <div
          style={{
            display: "flex",
            width,
            color: "#ffffff",
            fontSize: 60,
            fontWeight: 700,
            lineHeight: 1.35,
          }}
        >
          {title}
        </div>
        <div
          style={{
            display: "flex",
            width,
            marginTop: 30,
            color: "rgba(255,255,255,0.86)",
            fontSize: 40,
            lineHeight: 1.7,
          }}
        >
          {body}
        </div>

        {/* 誘導。キャプションのリンクは押せないので、プロフィールへ送る。 */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width,
            marginTop: 64,
            padding: "40px 44px",
            borderRadius: 28,
            backgroundColor: "#ffffff",
          }}
        >
          <div style={{ display: "flex", color: "#475569", fontSize: 32 }}>
            {CTA_LEAD}
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 6,
              color: "#0f172a",
              fontSize: 52,
              fontWeight: 700,
              lineHeight: 1.3,
            }}
          >
            {CTA_MAIN}
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 16,
              color: theme.strong,
              fontSize: 32,
              fontWeight: 700,
            }}
          >
            {IG_LINK_LABEL}
          </div>
        </div>
      </div>
      <SiteRow frame={frame} light />
    </Frame>
  );
}

export function IgSlide({
  slide,
  category,
  frame,
}: {
  slide: IgSlideInput;
  category: IgCategory;
  frame: IgFrame;
}) {
  const theme = IG_THEMES[category];
  switch (slide.type) {
    case "cover":
      return slide.word ? (
        <WordCover slide={slide} theme={theme} frame={frame} />
      ) : (
        <PhotoCover slide={slide} theme={theme} frame={frame} />
      );
    case "point":
      return <PointSlide slide={slide} theme={theme} frame={frame} />;
    case "closing":
      return <ClosingSlide slide={slide} theme={theme} frame={frame} />;
  }
}
