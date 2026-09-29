import { useId, type CSSProperties, type ReactNode } from "react";
import {
  Atom,
  Bone,
  Building2,
  BusFront,
  Castle,
  Church,
  Clock,
  Coffee,
  Crown,
  Drama,
  Feather,
  FerrisWheel,
  Fish,
  Frame,
  Ghost,
  Landmark,
  Library,
  MapPin,
  PawPrint,
  Plane,
  Search,
  Shield,
  Ship,
  ShoppingBag,
  Snowflake,
  Telescope,
  Trees,
  Trophy,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { formatPostmarkDate, type StampType } from "@/lib/stamps";

/**
 * スタンプの印面。スタンプ帳・ボタン・押した直後の画面で同じものを描く。
 *
 * 写真を丸く切り抜いて並べていた頃は、押したものが「行った場所の写真の一覧」
 * にしか見えず、集めている手応えが無かった。駅スタンプや御朱印のように、
 * 場所ごとに違う判が押されていく帳面に見えることを優先している。
 *
 * - 観光スポットは丸印、美術館はギザ縁の印、ミュージカルは入場券の形。
 *   種別が並びの中で見分けられ、帳面に変化が出る。
 * - 外周に英語名、下に押した日、中央に場所の種類の絵。
 * - 現地で押した金のスタンプは、枠が一重多く、中央の文字が ON SITE になる。
 * - 傾きとインクのかすれ方はスタンプごとに決まっている(seed から導く)。
 *   同じスタンプは、スタンプ帳のどこに出ても同じ顔をしている。
 *
 * 文字は等幅書体で組む。字幅が 0.6em に揃うので、円周に何文字入るかを
 * ブラウザに描かせる前に計算できる。
 *
 * サーバーコンポーネントからもクライアントからも使う(hook は useId だけ)。
 */

export type StampArt = {
  type: StampType;
  /** 外周に彫る名前。英語名。 */
  engName: string;
  /** Attraction.category。中央の絵を選ぶのに使う。 */
  category: string | null;
  /** 押した日時(ISO)。 */
  stampedAt: string;
  onSite: boolean;
  /** 傾きとかすれ方の種。Stamp.id を渡す。 */
  seed: string;
};

/* ------------------------------------------------------------------ *
 * 中央の絵
 * ------------------------------------------------------------------ */

/**
 * 名前から分かる絵。カテゴリより優先する。
 *
 * カテゴリだけだと「歴史的建造物」が全部お城になり、帳面が単調になる。
 * 名前に決定的な語があるものだけ拾う(当たらなければカテゴリの絵になる)。
 */
const NAME_ICONS: [RegExp, LucideIcon][] = [
  [/big ben|elizabeth tower/i, Clock],
  [/afternoon tea/i, Coffee],
  [/ghost/i, Ghost],
  [/observatory|planetarium/i, Telescope],
  [/abbey|cathedral|church|chapel/i, Church],
  [/natural history/i, Bone],
  [/science museum/i, Atom],
  [/air force|aviation/i, Plane],
  [/cutty sark|maritime|hms |boat|cruise|canal/i, Ship],
  [/aquarium/i, Fish],
  [/\bzoo\b/i, PawPrint],
  [/stadium|football|rugby|cricket|wimbledon/i, Trophy],
  [/war museum|army museum|cavalry|guards museum/i, Shield],
  [/sherlock/i, Search],
  [/dickens|keats/i, Feather],
  [/library/i, Library],
  [/transport museum/i, BusFront],
  [/opera house|globe theatre|shakespeare.s globe/i, Drama],
  [/gallery|collection|portrait|\btate\b/i, Frame],
  [/market/i, ShoppingBag],
];

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  royal: Crown,
  historic: Castle,
  museum: Landmark,
  entertainment: FerrisWheel,
  garden: Trees,
  tour: BusFront,
  architecture: Building2,
  shop: ShoppingBag,
  seasonal: Snowflake,
};

export function stampIcon(
  type: StampType,
  category: string | null,
  engName: string,
): LucideIcon {
  if (type === "musical") return Drama;
  for (const [pattern, icon] of NAME_ICONS) {
    if (pattern.test(engName)) return icon;
  }
  if (type === "museum") return Landmark;
  return (category && CATEGORY_ICONS[category]) || MapPin;
}

/* ------------------------------------------------------------------ *
 * 寸法
 *
 * 座標は 120×120 の viewBox。角度は SVG の向き(x 軸から時計回り)で、
 * 90° が真下、270° が真上。
 * ------------------------------------------------------------------ */

const C = 60;
/** 外枠と内枠に挟まれた文字帯の、中心の半径。 */
const BAND = 48;
/** 大文字の高さ(em)。等幅書体はおおむね 0.7。 */
const CAP = 0.7;
const DEG = Math.PI / 180;
const MONO =
  "ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace";

/** 印面の数値は小数2桁に丸める。HTML が軽くなる。 */
function f(n: number): number {
  return Math.round(n * 100) / 100;
}

function point(radius: number, deg: number): [number, number] {
  return [C + radius * Math.cos(deg * DEG), C + radius * Math.sin(deg * DEG)];
}

function arcPath(
  radius: number,
  fromDeg: number,
  toDeg: number,
  clockwise: boolean,
): string {
  const [x1, y1] = point(radius, fromDeg);
  const [x2, y2] = point(radius, toDeg);
  const span = clockwise
    ? (toDeg - fromDeg + 360) % 360
    : (fromDeg - toDeg + 360) % 360;
  return `M${f(x1)} ${f(y1)}A${f(radius)} ${f(radius)} 0 ${span > 180 ? 1 : 0} ${
    clockwise ? 1 : 0
  } ${f(x2)} ${f(y2)}`;
}

/** 文字列の幅(em)。等幅の欧文は 0.6、和文は 1。 */
function emWidth(text: string): number {
  let width = 0;
  for (const ch of text) {
    width += /[\u2E80-\u9FFF\uF900-\uFAFF\uFF00-\uFFEF]/.test(ch) ? 1 : 0.6;
  }
  return width;
}

/** FNV-1a。seed から傾きとかすれ方を決めるだけなので、これで足りる。 */
function hash(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

type ArcText = {
  text: string;
  size: number;
  spacing: number;
  /** 文字の並ぶ線(ベースライン)の半径。 */
  radius: number;
  /** 見えている文字列が占める角度の半分。 */
  halfDeg: number;
};

/**
 * 長い英語名は、ダッシュや at の手前で切る。
 * "Warner Bros. Studio Tour London – The Making of Harry Potter" を
 * 全部回すと、文字が 4px を切って模様にしかならない。
 */
function ringName(engName: string): string {
  const name = engName.trim();
  if (name.length <= 36) return name;
  const cut = name.search(/\s[–—-]\s|\s\(|\sat\s|\sby\s|\swith\s/);
  return cut >= 12 ? name.slice(0, cut) : name;
}

/**
 * 上の弧(名前)。真上を中心に、最大で左右 125° まで回り込む。
 *
 * 上の弧では文字は外側へ立つので、ベースラインを文字帯の中心より
 * 字高の半分だけ内側に置くと、文字が帯の真ん中に来る。
 * 短い名前は字間を広げて 96° までは広げる(BIG BEN が真上に
 * 固まっていると、印というより値札に見える)。
 */
function fitTop(label: string): ArcText {
  const text = label.toUpperCase();
  const n = [...text].length;
  const em = emWidth(text);
  const MAX = 9.4;
  const TRACK = 0.14;
  const SPAN = 250 * DEG;

  let size = MAX;
  if (size * (em + TRACK * n) > (BAND - (CAP * size) / 2) * SPAN) {
    size = (BAND * SPAN) / (em + TRACK * n + (CAP * SPAN) / 2);
  }
  const radius = BAND - (CAP * size) / 2;
  const visible = (spacing: number) => size * em + spacing * Math.max(n - 1, 0);

  let spacing = TRACK * size;
  const minLength = 96 * DEG * radius;
  if (n > 1 && visible(spacing) < minLength) {
    spacing = Math.min((minLength - size * em) / (n - 1), size * 1.2);
  }
  return { text, size, spacing, radius, halfDeg: visible(spacing) / 2 / radius / DEG };
}

/** 下の弧(日付)。下の弧では文字が内側へ立つので、ベースラインは外寄り。 */
function fitBottom(text: string): ArcText {
  const size = 7.2;
  const spacing = size * 0.22;
  const radius = BAND + (CAP * size) / 2;
  const n = [...text].length;
  const visible = size * emWidth(text) + spacing * Math.max(n - 1, 0);
  return { text, size, spacing, radius, halfDeg: visible / 2 / radius / DEG };
}

function starPath(x: number, y: number, outer = 2.5, inner = 1.05): string {
  let d = "";
  for (let i = 0; i < 10; i += 1) {
    const angle = -Math.PI / 2 + (i * Math.PI) / 5;
    const r = i % 2 === 0 ? outer : inner;
    d += `${i === 0 ? "M" : "L"}${f(x + r * Math.cos(angle))} ${f(y + r * Math.sin(angle))}`;
  }
  return `${d}Z`;
}

/** 美術館のギザ縁。 */
const SCALLOP = (() => {
  const n = 26;
  const inner = 53.2;
  const outer = 58.6;
  let d = "";
  for (let i = 0; i <= n; i += 1) {
    const [x, y] = point(inner, (360 * i) / n);
    if (i === 0) {
      d += `M${f(x)} ${f(y)}`;
      continue;
    }
    const [cx, cy] = point(outer, (360 * (i - 0.5)) / n);
    d += `Q${f(cx)} ${f(cy)} ${f(x)} ${f(y)}`;
  }
  return `${d}Z`;
})();

/** ミュージカルの入場券。左右の中ほどに切り欠きがある。 */
const TICKET =
  "M5 27H115V53A7 7 0 0 0 115 67V93H5V67A7 7 0 0 0 5 53Z";

/* ------------------------------------------------------------------ *
 * 印面
 * ------------------------------------------------------------------ */

/**
 * インクのかすれ。紙に押した判は、インクの乗らない点がまばらに出て、
 * 縁が少し滲む。ノイズの濃いところを抜いて、同じノイズで縁を揺らす。
 */
function InkFilter({ id, seed }: { id: string; seed: number }) {
  return (
    <filter
      id={id}
      x="-10%"
      y="-10%"
      width="120%"
      height="120%"
      colorInterpolationFilters="sRGB"
    >
      <feTurbulence
        type="fractalNoise"
        baseFrequency="0.45"
        numOctaves={3}
        seed={seed}
        result="grain"
      />
      <feComponentTransfer in="grain" result="wear">
        <feFuncA
          type="discrete"
          tableValues="1 1 1 1 1 1 1 1 1 1 1 1 1 0.55 0.2 0 0 0 0 0"
        />
      </feComponentTransfer>
      <feComposite in="SourceGraphic" in2="wear" operator="in" result="inked" />
      <feDisplacementMap
        in="inked"
        in2="grain"
        scale={2.4}
        xChannelSelector="R"
        yChannelSelector="G"
      />
    </filter>
  );
}

/** 丸印とギザ縁の印。外周の上に名前、下に日付、中央は children。 */
function RingFace({
  uid,
  shape,
  topLabel,
  bottomLabel,
  gold,
  children,
}: {
  uid: string;
  shape: "circle" | "scallop";
  topLabel: string;
  bottomLabel: string;
  gold: boolean;
  children: ReactNode;
}) {
  const top = fitTop(topLabel);
  const bottom = fitBottom(bottomLabel);
  const topLength = top.radius * 270 * DEG;
  const bottomLength = bottom.radius * 120 * DEG;

  // 名前と日付の切れ目に星を置く。名前が長いほど下へ回り込むので、
  // 星の位置も2つの文字列の隙間の真ん中へずらす。
  const gapDeg = 180 - top.halfDeg - bottom.halfDeg;
  const shift = (top.halfDeg - bottom.halfDeg) / 2;

  return (
    <>
      <defs>
        <path id={`${uid}-top`} d={arcPath(top.radius, 135, 45, true)} />
        <path id={`${uid}-bottom`} d={arcPath(bottom.radius, 150, 30, false)} />
      </defs>

      <g fill="none" stroke="currentColor">
        {shape === "circle" ? (
          <>
            <circle cx={C} cy={C} r={55} strokeWidth={3.4} />
            {gold && <circle cx={C} cy={C} r={58.4} strokeWidth={0.9} />}
          </>
        ) : (
          <>
            <path d={SCALLOP} strokeWidth={2.6} strokeLinejoin="round" />
            <circle cx={C} cy={C} r={39.6} strokeWidth={0.7} />
          </>
        )}
        <circle cx={C} cy={C} r={42} strokeWidth={1.3} />
        {gold && (
          <circle
            cx={C}
            cy={C}
            r={shape === "scallop" ? 36.8 : 38.6}
            strokeWidth={1.1}
            strokeDasharray="0.01 2.6"
            strokeLinecap="round"
          />
        )}
      </g>

      <text
        fontFamily={MONO}
        fontWeight={700}
        fontSize={f(top.size)}
        letterSpacing={f(top.spacing)}
        textAnchor="middle"
        fill="currentColor"
      >
        <textPath
          href={`#${uid}-top`}
          startOffset={f(topLength / 2 + top.spacing / 2)}
        >
          {top.text}
        </textPath>
      </text>
      <text
        fontFamily={MONO}
        fontWeight={700}
        fontSize={f(bottom.size)}
        letterSpacing={f(bottom.spacing)}
        textAnchor="middle"
        fill="currentColor"
      >
        <textPath
          href={`#${uid}-bottom`}
          startOffset={f(bottomLength / 2 + bottom.spacing / 2)}
        >
          {bottom.text}
        </textPath>
      </text>

      {gapDeg >= 14 &&
        [shift, 180 - shift].map((deg) => {
          const [x, y] = point(BAND, deg);
          return <path key={deg} d={starPath(x, y)} fill="currentColor" />;
        })}

      {children}
    </>
  );
}

/** 入場券の名前を1行か2行に組む。2行のほうが字が大きくなるときだけ割る。 */
function fitTicket(name: string): { lines: string[]; size: number } {
  const text = name.toUpperCase();
  const WIDTH = 70;
  const MAX = 10.5;
  const TRACK = 0.1;
  const fit = (line: string) =>
    Math.min(MAX, WIDTH / (emWidth(line) + TRACK * [...line].length));

  const single = fit(text);
  const spaces: number[] = [];
  for (let i = 0; i < text.length; i += 1) if (text[i] === " ") spaces.push(i);
  if (single >= 7.5 || spaces.length === 0) return { lines: [text], size: single };

  const middle = text.length / 2;
  const at = spaces.reduce((best, i) =>
    Math.abs(i - middle) < Math.abs(best - middle) ? i : best,
  );
  const lines = [text.slice(0, at), text.slice(at + 1)];
  const double = Math.min(...lines.map(fit));
  return double > single ? { lines, size: double } : { lines: [text], size: single };
}

function TicketFace({
  engName,
  date,
  gold,
  Icon,
}: {
  engName: string;
  date: string;
  gold: boolean;
  Icon: LucideIcon;
}) {
  const { lines, size } = fitTicket(engName);
  const lineGap = size * 1.18;
  const firstBaseline = C - ((lines.length - 1) * lineGap) / 2 + (CAP * size) / 2;
  const nameSpacing = size * 0.1;
  const x = 46.5;

  return (
    <>
      <g fill="none" stroke="currentColor">
        <path d={TICKET} strokeWidth={2.6} strokeLinejoin="round" />
        {/* もぎり線 */}
        <line x1={88} y1={31} x2={88} y2={89} strokeWidth={1.2} strokeDasharray="2 2.4" />
        {gold && (
          <>
            <line x1={11} y1={31.5} x2={83} y2={31.5} strokeWidth={0.8} />
            <line x1={11} y1={88.5} x2={83} y2={88.5} strokeWidth={0.8} />
          </>
        )}
      </g>
      <g fill="currentColor" fontFamily={MONO} textAnchor="middle">
        <text x={x + 0.8} y={41} fontSize={5.8} fontWeight={700} letterSpacing={1.6}>
          {gold ? "★ ON SITE ★" : "ADMIT ONE"}
        </text>
        <text fontSize={f(size)} fontWeight={800} letterSpacing={f(nameSpacing)}>
          {lines.map((line, i) => (
            <tspan key={i} x={f(x + nameSpacing / 2)} y={f(firstBaseline + i * lineGap)}>
              {line}
            </tspan>
          ))}
        </text>
        <text x={x + 0.65} y={83} fontSize={6.2} fontWeight={700} letterSpacing={1.3}>
          {date}
        </text>
      </g>
      <Icon x={91.5} y={50} width={20} height={20} strokeWidth={2.2} />
    </>
  );
}

const INK = {
  red: "text-rose-600 dark:text-rose-400",
  gold: "text-amber-600 dark:text-amber-400",
} as const;

/** useId の値を、url(#…) と href に入れて困らない文字だけにする。 */
function useSvgId(): string {
  return useId().replace(/[^a-zA-Z0-9_-]/g, "");
}

function tiltOf(seed: string): { tilt: number; grain: number } {
  const h = hash(seed);
  return { tilt: ((h % 2001) / 1000 - 1) * 11, grain: (h >>> 11) % 1000 };
}

export default function StampImpression({
  art,
  className,
  pressing = false,
  delay = 0,
  label,
}: {
  art: StampArt;
  className?: string;
  /** 押された瞬間の動き(上から落ちてきて、ぐっと押される)を付ける。 */
  pressing?: boolean;
  /** pressing の開始を遅らせる(ms)。並んだものを順に押すときに使う。 */
  delay?: number;
  /** 読み上げ用の名前。周りに名前の文字が無いときだけ渡す。 */
  label?: string;
}) {
  const uid = useSvgId();
  const { tilt, grain } = tiltOf(art.seed);
  const date = formatPostmarkDate(art.stampedAt);
  const Icon = stampIcon(art.type, art.category, art.engName);
  const gold = art.onSite;

  const style = {
    "--stamp-tilt": `${f(tilt)}deg`,
    transform: `rotate(${f(tilt)}deg)`,
    animationDelay: pressing && delay ? `${delay}ms` : undefined,
  } as CSSProperties;

  return (
    <svg
      viewBox="0 0 120 120"
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      style={style}
      className={cn(
        "block h-auto w-full select-none overflow-visible opacity-[0.93] mix-blend-multiply dark:mix-blend-normal",
        gold ? INK.gold : INK.red,
        pressing && "motion-safe:animate-stamp-press",
        className,
      )}
    >
      <defs>
        <InkFilter id={`${uid}-ink`} seed={grain} />
      </defs>
      <g filter={`url(#${uid}-ink)`}>
        {art.type === "musical" ? (
          <TicketFace engName={art.engName} date={date} gold={gold} Icon={Icon} />
        ) : (
          <RingFace
            uid={uid}
            shape={art.type === "museum" ? "scallop" : "circle"}
            topLabel={ringName(art.engName)}
            bottomLabel={date}
            gold={gold}
          >
            <Icon x={43} y={37} width={34} height={34} strokeWidth={2.1} />
            <text
              x={60.9}
              y={83.5}
              fontFamily={MONO}
              fontWeight={700}
              fontSize={6.2}
              letterSpacing={1.8}
              textAnchor="middle"
              fill="currentColor"
            >
              {gold ? "ON SITE" : "VISITED"}
            </text>
          </RingFace>
        )}
      </g>
    </svg>
  );
}

/**
 * まだ押していない欄。破線の輪郭と薄い絵だけを描く。
 *
 * 押す前から絵が見えているのは、図鑑の空欄と同じ理屈。何が入るか
 * 分かっている空欄のほうが、埋めたくなる。
 */
export function StampSlot({
  type,
  engName,
  category,
  number,
  className,
}: {
  type: StampType;
  engName: string;
  category: string | null;
  /** 台紙の欄の番号。 */
  number?: number;
  className?: string;
}) {
  const Icon = stampIcon(type, category, engName);
  const ticket = type === "musical";
  const label = number === undefined ? null : String(number).padStart(2, "0");

  return (
    <svg
      viewBox="0 0 120 120"
      aria-hidden
      className={cn("block h-auto w-full overflow-visible", className)}
    >
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth={1.7}
        strokeDasharray="3.5 4.5"
        strokeLinecap="round"
      >
        {ticket ? <path d={TICKET} /> : <circle cx={C} cy={C} r={54} />}
      </g>
      {ticket ? (
        <>
          <Icon x={33} y={46} width={28} height={28} strokeWidth={1.6} opacity={0.8} />
          {label && (
            <text x={101.5} y={63} fontFamily={MONO} fontSize={8.5} fontWeight={700} textAnchor="middle" fill="currentColor">
              {label}
            </text>
          )}
        </>
      ) : (
        <>
          <Icon x={45} y={41} width={30} height={30} strokeWidth={1.6} opacity={0.8} />
          {label && (
            <text x={60} y={92} fontFamily={MONO} fontSize={8.5} fontWeight={700} textAnchor="middle" fill="currentColor">
              {label}
            </text>
          )}
        </>
      )}
    </svg>
  );
}

/**
 * 台紙を制覇したときの印。金の丸印の真ん中に「制覇」。
 */
export function CompleteSeal({
  date,
  seed,
  className,
}: {
  /** 最後の欄を埋めた日(ISO)。 */
  date: string | null;
  seed: string;
  className?: string;
}) {
  const uid = useSvgId();
  const { tilt, grain } = tiltOf(`complete:${seed}`);

  return (
    <svg
      viewBox="0 0 120 120"
      aria-hidden
      style={{ transform: `rotate(${f(tilt - 8)}deg)` }}
      className={cn(
        "block h-auto w-full select-none overflow-visible opacity-[0.93] mix-blend-multiply dark:mix-blend-normal",
        INK.gold,
        className,
      )}
    >
      <defs>
        <InkFilter id={`${uid}-ink`} seed={grain} />
      </defs>
      <g filter={`url(#${uid}-ink)`}>
        <RingFace
          uid={uid}
          shape="circle"
          topLabel="Rally Complete"
          bottomLabel={date ? formatPostmarkDate(date) : ""}
          gold
        >
          <text
            x={60}
            y={69}
            fontSize={25}
            fontWeight={900}
            textAnchor="middle"
            fill="currentColor"
          >
            制覇
          </text>
        </RingFace>
      </g>
    </svg>
  );
}
