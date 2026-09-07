import clsx from "clsx";
import { READING_ACCENT, type ReadingAccentName } from "@/lib/reading-accent";

/**
 * 読み物ハブ4面に共通の題字。
 *
 * 淡いグラデーションのカードを4面それぞれが持っていたが、白い本文の上に
 * 白っぽい面を重ねる作りなので、ハブに来た瞬間の「表紙が変わった」感じが
 * 出なかった。濃い面を1枚敷いて、本文の白と切り替える。
 *
 * 背景に沈めるのは、そのハブの最新記事の挿絵。毎日更新しているセクション
 * なので、題字も毎日変わる。挿絵の明度はまちまちなので、横と縦の2枚の
 * 覆いを重ねて、白い絵が来ても見出しが読めるようにする。
 *
 * 数字(公開本数・最終更新)は以前どのハブでも小さな灰色の1行だったが、
 * 「毎日増えている」ことがこのサイトのいちばんの取り柄なので、題字の
 * 一部として大きく出す。
 */

export type MastheadStat = {
  label: string;
  value: string;
  unit?: string;
};

export default function HubMasthead({
  accent: accentName,
  eyebrow,
  kicker,
  titleLead,
  titleAccent,
  description,
  stats = [],
  image,
  children,
}: {
  accent: ReadingAccentName;
  /** 題字の上の英字。セクションの通り名。 */
  eyebrow: string;
  /** 英字の右に添える一言。「毎日更新」など。 */
  kicker?: string;
  /** 見出しの前半。狭い画面ではここで改行する。 */
  titleLead: string;
  /** 見出しの後半。色が付く。 */
  titleAccent: string;
  description: React.ReactNode;
  stats?: MastheadStat[];
  /** 背景に沈める画像。無ければ濃い面だけになる。 */
  image?: string | null;
  /** 数字の下に足す行(他ページへの導線など)。 */
  children?: React.ReactNode;
}) {
  const accent = READING_ACCENT[accentName];

  return (
    <header className="relative mb-12 overflow-hidden rounded-3xl bg-slate-950 px-6 py-12 text-white sm:px-12 sm:py-16">
      {image && (
        <img
          src={image}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover opacity-40"
          fetchPriority="high"
          decoding="async"
        />
      )}

      {/* 文字は左に寄せているので、左を潰して右に写真を残す。 */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-slate-950/55"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/40"
      />
      <div
        aria-hidden
        className={clsx(
          "pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full blur-3xl",
          accent.glow,
        )}
      />

      <div className="relative">
        <p
          className={clsx(
            "flex flex-wrap items-center gap-2.5 text-[10px] font-bold uppercase tracking-[0.28em]",
            accent.eyebrowOnDark,
          )}
        >
          <span
            className={clsx("h-3 w-0.5 shrink-0 rounded-full", accent.bar)}
          />
          {eyebrow}
          {kicker && (
            <>
              <span className="text-white/25">/</span>
              <span className="tracking-[0.2em] text-white/60">{kicker}</span>
            </>
          )}
        </p>

        <h1 className="mt-5 text-4xl font-black leading-[1.1] tracking-tight sm:text-6xl">
          {titleLead}
          <br className="sm:hidden" />
          <span className={accent.titleOnDark}>{titleAccent}</span>
        </h1>

        <div className="mt-5 max-w-xl text-sm leading-relaxed text-white/70 sm:text-base">
          {description}
        </div>

        {stats.length > 0 && (
          <dl className="mt-9 flex flex-wrap items-end gap-x-10 gap-y-4 border-t border-white/15 pt-5">
            {stats.map((s) => (
              <div key={s.label}>
                <dt className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/45">
                  {s.label}
                </dt>
                <dd className="mt-1 text-2xl font-black leading-none tracking-tight">
                  {s.value}
                  {s.unit && (
                    <span className="ml-1 text-xs font-bold text-white/60">
                      {s.unit}
                    </span>
                  )}
                </dd>
              </div>
            ))}
          </dl>
        )}

        {children}
      </div>
    </header>
  );
}
