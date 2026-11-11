import type { OgPhoto } from "@/lib/og";
import {
  IG_LIMITS,
  IG_SLIDE_COUNT,
  clampText,
  type IgCategory,
  type IgPoint,
} from "@/lib/instagram/limits";
import { IG_LINK_LABEL } from "@/lib/instagram/caption";
import {
  IG_CREDIT_PREFIX as CREDIT_PREFIX,
  IG_CTA_LEAD as CTA_LEAD,
  IG_CTA_MAIN as CTA_MAIN,
  IG_DOMAIN as DOMAIN,
  IG_SITE as SITE,
  IG_TAGLINE as TAGLINE,
  IG_THEMES,
  coverHeadSize,
  innerWidth,
  labelSize,
  photoShade,
  textUnits,
  wordSize,
  type IgFrame,
  type IgTheme,
} from "@/lib/instagram/design";

// 寸法と配色は lib/instagram/design.ts に置いた(リールの動画と共有するため)。
// 既存の import 先を変えないよう、ここからも出す。
export { IG_FRAMES, type IgFrame } from "@/lib/instagram/design";

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
