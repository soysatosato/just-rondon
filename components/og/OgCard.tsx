import { OG_SIZE, type OgPhoto } from "@/lib/og";

/**
 * 読み物セクションのSNS共有カードの版面。
 *
 * 左に写真、右に文字。写真を全面に敷く案を採らなかったのは、記事の挿絵に
 * 縦長が多いため(60本中15本が縦横比1.2未満、最小は120x248)。全面に敷けば
 * 縦長は大きく切り取られ、人物写真の顔が消える。縦のパネルに縦の写真を
 * 入れれば、どんな比率でも破綻しない。
 *
 * 写真が無い記事とハブページでは、左をグラデーションと大きな地紋の1文字に
 * 差し替える。同じ版面を使い回すので、写真の有無でカードの印象が
 * 別物にならない。
 *
 * satori(next/og の描画エンジン)の制約に沿って書くこと:
 *   - 子を複数持つ要素には必ず display: flex を書く(既定が block ではない)
 *   - blur が使えないので、ぼかしの円は薄い塗りの円で代用する
 *   - 画像は data URI で渡す。外部URLを渡すと取得失敗でカードごと落ちる
 */

export type OgCardTheme = {
  /** バッジの背景。セクションの主色。 */
  badgeBg: string;
  /** 見出しの色ではなく、罫線や地の差し色に使う。 */
  accent: string;
  /** 写真が無いときの左パネル。 */
  panelGradient: string;
  /** 右側の地。ほぼ白だが、セクションの色をわずかに含ませる。 */
  pageGradient: string;
};

export const OG_THEMES = {
  column: {
    badgeBg: "#b45309",
    accent: "#f59e0b",
    panelGradient: "linear-gradient(160deg, #f59e0b 0%, #ea580c 55%, #e11d48 100%)",
    pageGradient: "linear-gradient(135deg, #fffbeb 0%, #ffffff 52%, #f0f9ff 100%)",
  },
  "modern-britain": {
    badgeBg: "#4338ca",
    accent: "#6366f1",
    panelGradient: "linear-gradient(160deg, #4f46e5 0%, #2563eb 55%, #06b6d4 100%)",
    pageGradient: "linear-gradient(135deg, #eef2ff 0%, #ffffff 52%, #ecfeff 100%)",
  },
  "british-english": {
    badgeBg: "#dc2626",
    accent: "#f43f5e",
    panelGradient: "linear-gradient(160deg, #f43f5e 0%, #dc2626 55%, #ea580c 100%)",
    pageGradient: "linear-gradient(135deg, #fff1f2 0%, #ffffff 52%, #fff7ed 100%)",
  },
  site: {
    badgeBg: "#b91c1c",
    accent: "#ef4444",
    panelGradient: "linear-gradient(160deg, #b91c1c 0%, #1e3a8a 60%, #0f172a 100%)",
    pageGradient: "linear-gradient(135deg, #fef2f2 0%, #ffffff 52%, #eff6ff 100%)",
  },
  reading: {
    badgeBg: "#0f172a",
    accent: "#64748b",
    panelGradient: "linear-gradient(160deg, #1e293b 0%, #334155 55%, #0f172a 100%)",
    pageGradient: "linear-gradient(135deg, #f8fafc 0%, #ffffff 52%, #f1f5f9 100%)",
  },
} satisfies Record<string, OgCardTheme>;

export type OgThemeName = keyof typeof OG_THEMES;

const SITE = "ジャスト・ロンドン";
const DOMAIN = "just-rondon.com";
const PANEL_WIDTH = 468;
const RAIL_WIDTH = 10;
const TEXT_WIDTH = OG_SIZE.width - PANEL_WIDTH - RAIL_WIDTH;
/** 右側の内寸。文字の箱はこの幅で折り返す。 */
const TEXT_INNER = TEXT_WIDTH - 58 - 54;

/**
 * 写真をパネルいっぱいに敷くときの位置と寸法。
 *
 * objectFit:"cover" に任せない。satori は objectPosition を持たず、切り抜きは
 * 必ず中央になる。パネルは縦長(468x630)なので、それより縦長の写真——記事の
 * 挿絵の4分の1がこれ——では上下が等しく削られ、人物写真の頭が消える。
 *
 * 横方向は中央のままでよい。横長の写真は高さで合わせるので左右が均等に
 * 余るだけで、中央を残すのが素直。縦方向だけ上に寄せる。
 */
const VERTICAL_FOCUS = 0.3;

function coverRect(photo: OgPhoto) {
  const scale = Math.max(
    PANEL_WIDTH / photo.width,
    OG_SIZE.height / photo.height,
  );
  const width = Math.ceil(photo.width * scale);
  const height = Math.ceil(photo.height * scale);

  return {
    width,
    height,
    left: Math.round((PANEL_WIDTH - width) / 2),
    top: Math.round((OG_SIZE.height - height) * VERTICAL_FOCUS),
  };
}

/**
 * つかみの文字寸法。全角前提。
 *
 * このサイトの読み物の見出しは38〜62字あり、ダッシュで割ったあとの
 * 前半でもまだ長い。3行までは許して、4行に落ちる前に一段小さくする。
 */
function headSize(text: string): number {
  // 右の内寸は約610px。全角はほぼ字送り=文字寸法なので、1行に収めたい
  // 長さは 610/文字寸法 で決まる。13字までを1行に収める刻みにしてある。
  if (text.length <= 10) return 56;
  if (text.length <= 13) return 46;
  if (text.length <= 20) return 42;
  if (text.length <= 30) return 38;
  if (text.length <= 40) return 33;
  return 30;
}

export function truncateOg(text: string, maxLength: number): string {
  return text.length > maxLength ? `${text.slice(0, maxLength)}…` : text;
}

/**
 * このカードに出る文字をすべて連結する。フォントのサブセット取得に渡す。
 * ここで拾い漏らした字だけが豆腐になるので、版面と対で更新すること。
 */
export function ogCardText(input: OgCardInput): string {
  return [
    input.badge,
    input.head,
    input.tail ?? "",
    input.footnote ?? "",
    input.glyph ?? "",
    SITE,
    DOMAIN,
  ].join("");
}

export type OgCardInput = {
  /** 左上のピル。セクション名。 */
  badge: string;
  /** 主役の見出し。 */
  head: string;
  /** 見出しの後半、または要約。無ければ出さない。 */
  tail?: string | null;
  /** 右下の小さな添え物。日付など。 */
  footnote?: string | null;
  /** 写真が無いときに左パネルへ大きく敷く1〜2文字。 */
  glyph?: string | null;
  /** 実寸つきの写真。null なら左パネルはグラデーションになる。 */
  photo?: OgPhoto | null;
  theme: OgCardTheme;
};

export function OgCard({
  badge,
  head,
  tail,
  footnote,
  glyph,
  photo,
  theme,
}: OgCardInput) {
  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        backgroundColor: "#ffffff",
        backgroundImage: theme.pageGradient,
      }}
    >
      {/* 左: 写真、または写真のかわりの面 */}
      <div
        style={{
          position: "relative",
          display: "flex",
          width: PANEL_WIDTH,
          height: OG_SIZE.height,
          flexShrink: 0,
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          backgroundColor: "#111827",
          ...(photo ? {} : { backgroundImage: theme.panelGradient }),
        }}
      >
        {photo ? (
          <img
            src={photo.src}
            width={coverRect(photo).width}
            height={coverRect(photo).height}
            style={{ position: "absolute", ...coverRect(photo) }}
          />
        ) : (
          glyph && (
            <div
              style={{
                display: "flex",
                color: "rgba(255,255,255,0.22)",
                fontSize: 300,
                fontWeight: 700,
                lineHeight: 1,
                letterSpacing: "-10px",
              }}
            >
              {glyph}
            </div>
          )
        )}

        {/* パネルの右端に落とす影。切り抜きの縁を立てて、貼っただけに見せない。 */}
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: 60,
            height: OG_SIZE.height,
            backgroundImage:
              "linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.28) 100%)",
          }}
        />
      </div>

      {/* パネルと本文の境目のレール */}
      <div
        style={{
          display: "flex",
          width: RAIL_WIDTH,
          height: OG_SIZE.height,
          flexShrink: 0,
          backgroundImage: `linear-gradient(180deg, ${theme.badgeBg} 0%, ${theme.accent} 100%)`,
        }}
      />

      {/* 右: 文字。
          幅を flexGrow で伸ばさず実数で置いている。satori は幅が確定して
          いない箱の中で行を折り返さず、長い見出しがカードの外へ流れ出る。 */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: TEXT_WIDTH,
          flexShrink: 0,
          height: OG_SIZE.height,
          padding: "56px 58px 50px 54px",
        }}
      >
        <div style={{ display: "flex" }}>
          <div
            style={{
              display: "flex",
              backgroundColor: theme.badgeBg,
              color: "#ffffff",
              fontSize: 21,
              fontWeight: 700,
              letterSpacing: "5px",
              padding: "11px 24px",
              borderRadius: 999,
            }}
          >
            {badge}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              color: "#0f172a",
              fontSize: headSize(head),
              fontWeight: 700,
              lineHeight: 1.28,
              letterSpacing: "-0.5px",
            }}
          >
            {head}
          </div>

          {tail && (
            <div
              style={{
                display: "flex",
                width: TEXT_INNER,
                marginTop: 20,
                color: "#475569",
                fontSize: 25,
                fontWeight: 400,
                lineHeight: 1.5,
              }}
            >
              {tail}
            </div>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              width: 64,
              height: 4,
              marginBottom: 18,
              borderRadius: 4,
              backgroundColor: theme.accent,
            }}
          />
          <div
            style={{
              display: "flex",
              width: TEXT_INNER,
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div
              style={{
                display: "flex",
                color: "#0f172a",
                fontSize: 25,
                fontWeight: 700,
              }}
            >
              {SITE}
            </div>
            <div
              style={{
                display: "flex",
                color: "#94a3b8",
                fontSize: 22,
                fontWeight: 400,
              }}
            >
              {footnote || DOMAIN}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
