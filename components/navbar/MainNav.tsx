"use client";

import Link from "next/link";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuContent,
} from "@/components/ui/navigation-menu";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { useState } from "react";
import { MdMail } from "react-icons/md";

import { NAV_SECTIONS, groupColsFor, menuWidthFor } from "./menu";
import Wordmark from "./Wordmark";
import AuthMenu from "./AuthMenu";
import { useAutoHideHeader } from "./useAutoHideHeader";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  // スマホのヘッダーは下へ読むと隠れ、少し戻すと出る(useAutoHideHeader.ts)。
  const header = useAutoHideHeader({ paused: open });

  // モバイルはアコーディオンと素のリンクを別々に並べる必要があるので、
  // 種類ごとに分ける。NAV_SECTIONS は menu を先、link を後に並べてあるため、
  // この分割で定義順どおりの表示になる。
  const menuSections = NAV_SECTIONS.filter((s) => s.kind === "menu");
  const linkSections = NAV_SECTIONS.filter((s) => s.kind === "link");

  return (
    <nav
      onFocusCapture={header.reveal}
      className={`sticky top-0 z-40 w-full bg-background transition-transform duration-300 motion-reduce:transition-none print:hidden xl:static ${
        header.hidden ? "max-xl:-translate-y-full" : ""
      }`}
    >
      {/*
        モバイル。タブレット(768〜1279px)もこちらを使う。

        デスクトップの横並びは中身が約1,200pxあり、以前は md(768px)から
        切り替えていたため、iPad の幅ではナビが画面からはみ出してページ全体が
        横スクロールになり、「観光」の頭と右端のスタンプ帳・ログインに
        届かなかった。全項目が1行に収まる xl(1280px)まではメニューに畳む。
      */}
      <div ref={header.ref} className="border-b border-border/60 xl:hidden">
        <div className="flex justify-between px-6 py-2">
          <Link href="/">
            <div className="flex flex-col">
              <Wordmark className="h-[30px]" />
              <span className="mt-1 text-xs text-muted-foreground font-normal italic opacity-70">
                JUST RONDON - ロンドン観光・旅行・現地ガイド
              </span>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                {/* 44px 四方にしてあるのは、追従するヘッダーで最もよく押す
                    ボタンだから。以前は 34×36px で、名前も無かった。 */}
                <Button
                  variant="outline"
                  aria-label="メニューを開く"
                  className="h-11 w-11 p-0"
                >
                  <Menu className="w-6 h-6" aria-hidden />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72 overflow-y-auto">
                <SheetHeader>
                  <SheetTitle className="flex justify-between items-center">
                    <span>メニュー</span>
                  </SheetTitle>
                </SheetHeader>

                <nav className="flex flex-col space-y-3 mt-4">
                  <Link
                    href="/"
                    className="hover:text-red-600 transition"
                    onClick={() => setOpen(false)}
                  >
                    トップページ
                  </Link>

                  <Accordion type="single" collapsible>
                    {menuSections.map((section) => {
                      if (section.kind !== "menu") return null;
                      return (
                        <AccordionItem
                          key={section.label}
                          value={section.label}
                          className="border-b-0"
                        >
                          <AccordionTrigger className="font-medium hover:text-red-600 transition text-base py-2">
                            {section.label}
                          </AccordionTrigger>
                          <AccordionContent className="flex flex-col space-y-3 ml-2 mt-1 pb-3">
                            {/* 区分そのもののハブへ。デスクトップのドロップダウンには
                                前からあるが、モバイルは groups しか出しておらず、
                                /reading などのハブに辿り着けなかった。 */}
                            <Link
                              href={section.href}
                              className={`text-sm font-semibold ${section.accent.text}`}
                              onClick={() => setOpen(false)}
                            >
                              {section.hubLabel} →
                            </Link>
                            {section.groups.map((group, index) => (
                              <div
                                key={group.heading ?? index}
                                className="flex flex-col space-y-2"
                              >
                                {group.heading && (
                                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                    {group.heading}
                                  </p>
                                )}
                                {group.links.map((link) => (
                                  <Link
                                    key={link.href}
                                    href={link.href}
                                    className="text-sm hover:text-red-600 transition"
                                    onClick={() => setOpen(false)}
                                  >
                                    {link.label}
                                  </Link>
                                ))}
                              </div>
                            ))}
                          </AccordionContent>
                        </AccordionItem>
                      );
                    })}
                  </Accordion>

                  {linkSections.map((section) => (
                    <Link
                      key={section.href}
                      href={section.href}
                      className="hover:text-red-600 transition"
                      onClick={() => setOpen(false)}
                    >
                      {section.label}
                    </Link>
                  ))}

                  <Link
                    href="/contact"
                    className="hover:text-red-600 transition"
                    onClick={() => setOpen(false)}
                  >
                    <div className="flex gap-x-2">
                      <MdMail className="w-5 h-5 mt-0.5" />
                      お問い合わせ
                    </div>
                  </Link>

                  <AuthMenu variant="mobile" onNavigate={() => setOpen(false)} />
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* デスクトップ(1280px以上) */}
      <div className="hidden xl:flex flex-col border-b">
        <div className="flex flex-col items-center justify-center py-2">
          <Link href="/">
            <div className="flex flex-col items-center">
              <Wordmark className="h-10" />
              <span className="mt-1 text-xs text-gray-600 dark:text-gray-400 font-normal italic opacity-70">
                Live.Love.London. - 最強ロンドンガイド
              </span>
            </div>
          </Link>
        </div>
        {/*
          項目の間隔と左右の余白は詰めてある。1280px の画面で入れ物の内側は
          1,232px しかなく、以前の間隔(gap-x-2 + 各 px-4)では右端のログインが
          常に14px切れていた。万一はみ出しても先頭の「観光」が欠けないよう、
          中央寄せは safe center にしている(はみ出した分は右へ逃がす)。
        */}
        <div className="flex items-center justify-center [justify-content:safe_center] px-6 py-3 max-w-7xl mx-auto">
          <NavigationMenu className="max-w-none shrink-0">
            <NavigationMenuList className="flex-nowrap overflow-x-auto">
              {NAV_SECTIONS.map((section) => {
                if (section.kind === "link") {
                  return (
                    <NavigationMenuItem key={section.href} className="shrink-0">
                      <NavigationMenuLink asChild>
                        <Link
                          href={section.href}
                          className="inline-flex h-9 items-center whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                        >
                          {section.label}
                        </Link>
                      </NavigationMenuLink>
                    </NavigationMenuItem>
                  );
                }

                return (
                  <NavigationMenuItem key={section.label} className="shrink-0">
                    <NavigationMenuTrigger className="whitespace-nowrap px-3">
                      {section.label}
                    </NavigationMenuTrigger>
                    <NavigationMenuContent
                      className={`p-6 ${menuWidthFor(section.groups.length)}`}
                    >
                      <div className="flex gap-8">
                        <div className="w-52 shrink-0 space-y-2">
                          <p
                            className={`text-[10px] font-semibold uppercase tracking-[0.2em] ${section.accent.text}`}
                          >
                            {section.eyebrow}
                          </p>
                          <h4 className="text-base font-semibold">
                            {section.label}
                          </h4>
                          <p className="text-xs leading-relaxed text-muted-foreground">
                            {section.description}
                          </p>
                          <Link
                            href={section.href}
                            className={`inline-block pt-1 text-xs font-semibold hover:underline ${section.accent.text}`}
                          >
                            {section.hubLabel} →
                          </Link>
                        </div>

                        <div
                          className={`grid flex-1 gap-x-6 gap-y-4 ${groupColsFor(
                            section.groups.length,
                          )}`}
                        >
                          {section.groups.map((group, index) => (
                            <div key={group.heading ?? index}>
                              {group.heading && (
                                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                  {group.heading}
                                </p>
                              )}
                              <ul className="space-y-1.5">
                                {group.links.map((link) => (
                                  <li key={link.href}>
                                    <Link
                                      href={link.href}
                                      className="text-sm hover:underline"
                                    >
                                      {link.label}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                );
              })}

              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link
                    href="/contact"
                    aria-label="お問い合わせ"
                    className="inline-flex h-9 items-center rounded-md px-3 py-2 transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    <MdMail className="w-5 h-5" />
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              {/* スタンプ帳とログイン。区分の並びとは役割が違うので、
                  ドロップダウンを持たせず右端に置く。 */}
              <NavigationMenuItem className="shrink-0 pl-2">
                <AuthMenu variant="desktop" />
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
      </div>
    </nav>
  );
}
