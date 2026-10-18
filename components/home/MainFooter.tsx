import Link from "next/link";
import ConsentSettingsLink from "@/components/consent/ConsentSettingsLink";
import HideOnHome from "@/components/home/HideOnHome";
import {
  LINK_SECTIONS,
  MENU_SECTIONS,
  featuredLinks,
  shortLabel,
} from "@/components/navbar/menu";

/**
 * フッター。上段がサイトの索引、下段が規約などのリンク。
 *
 * 検索から来た読者の97%は記事ページに直接着地し、多くはそのまま記事の
 * 最後まで読む。以前のフッターは規約のリンクしか無く、読み終えた場所に
 * 「次にどこへ行けるか」が何も無かった(スマホではヘッダーも画面外)。
 *
 * 区分とリンクはグローバルナビ(menu.ts)から取る。各区分から5本、
 * 束ごとに1本ずつ拾い、残りは見出し(区分のハブ)から辿ってもらう。
 * 束が5つより多い区分(住む・働く)は束ごとに1本ずつ全部出す。5本で切ると
 * 労働問題とトラブル対応が落ちる——トラブルは被害直後の人が探すので、
 * 区分のハブを経由させたくない(menu.ts の同じ理由の注記を参照)。
 */
const LINKS_PER_SECTION = 5;
const MAX_LINKS_PER_SECTION = 10;

export default function MainFooter() {
  return (
    <footer className="border-t bg-background pb-8 pt-8 text-muted-foreground print:hidden">
      {/* トップは最下部に全リンクの索引を持つので、ここでは出さない。 */}
      <HideOnHome>
        <FooterSiteIndex />
      </HideOnHome>

      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 text-xs sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          <Link href="/contact" className="inline-block py-1">
            お問い合わせ
          </Link>
          <Link href="/about" className="inline-block py-1">
            サイト概要
          </Link>
          <Link href="/terms" className="inline-block py-1">
            利用規約
          </Link>
          <Link href="/privacy" className="inline-block py-1">
            プライバシーポリシー
          </Link>
          {/* 英国・EEA・スイスの読者にだけ出る */}
          <ConsentSettingsLink />
          <Link href="/credits" className="inline-block py-1">
            画像クレジット
          </Link>
        </div>

        <p className="max-w-md text-[11px] leading-relaxed">
          ジャスト・ロンドンは、ロンドンの深層に迫る力量も器量もない中途半端な存在ですが、旅の判断をほんの少し整える一文が紛れていれば、それだけで存在理由になります。
        </p>
      </div>
    </footer>
  );
}

function FooterSiteIndex() {
  return (
    <nav
      aria-label="サイトの区分"
      // 下の規約の行との区切りもここに持たせる。トップではこの索引ごと
      // 出さないので、区切り線だけが残らないように。
      className="mx-auto mb-6 grid max-w-6xl grid-cols-2 gap-x-6 gap-y-8 border-b px-4 pb-10 pt-2 sm:grid-cols-3 lg:grid-cols-7"
    >
      {MENU_SECTIONS.map((section) => (
        <div key={section.href} className="min-w-0">
          <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em]">
            <span
              aria-hidden
              className={`h-3 w-0.5 shrink-0 rounded-full ${section.accent.stripe}`}
            />
            {section.eyebrow}
          </p>
          <Link
            href={section.href}
            className="mt-1 inline-block py-0.5 text-sm font-bold text-foreground hover:underline"
          >
            {section.label}
          </Link>
          <ul className="mt-1.5 space-y-0.5">
            {featuredLinks(
              section,
              Math.min(
                Math.max(LINKS_PER_SECTION, section.groups.length),
                MAX_LINKS_PER_SECTION,
              ),
            ).map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="inline-block py-1 text-[13px] leading-snug hover:text-foreground hover:underline"
                >
                  {shortLabel(link.label)}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}

      <div className="min-w-0">
        <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em]">
          <span
            aria-hidden
            className="h-3 w-0.5 shrink-0 rounded-full bg-indigo-500"
          />
          Use
        </p>
        <p className="mt-1 py-0.5 text-sm font-bold text-foreground">使う</p>
        <ul className="mt-1.5 space-y-0.5">
          {LINK_SECTIONS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="inline-block py-1 text-[13px] leading-snug hover:text-foreground hover:underline"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
