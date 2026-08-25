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

import { NAV_SECTIONS, GROUP_COLS, MENU_WIDTH } from "./menu";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  // モバイルはアコーディオンと素のリンクを別々に並べる必要があるので、
  // 種類ごとに分ける。NAV_SECTIONS は menu を先、link を後に並べてあるため、
  // この分割で定義順どおりの表示になる。
  const menuSections = NAV_SECTIONS.filter((s) => s.kind === "menu");
  const linkSections = NAV_SECTIONS.filter((s) => s.kind === "link");

  return (
    <nav className="w-full">
      {/* モバイル */}
      <div className="md:hidden">
        <div className="flex justify-between px-6 py-2">
          <Link href="/">
            <div className="flex flex-col">
              <span className="font-bold text-2xl text-red-400">
                ロンド
                <img
                  src="/logo.png"
                  alt="Logo"
                  width={32}
                  height={32}
                  className="inline-block mb-2"
                  loading="lazy"
                  decoding="async"
                  fetchPriority="low"
                />
              </span>
              <span className="text-xs text-muted-foreground font-normal italic opacity-70">
                JUST RONDON - ロンドン観光・旅行・現地ガイド
              </span>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="p-2">
                  <Menu className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72 overflow-y-auto">
                <SheetHeader>
                  <SheetTitle className="flex justify-between items-center">
                    <span>Menu</span>
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
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* デスクトップ */}
      <div className="hidden md:flex flex-col border-b">
        <div className="flex flex-col items-center justify-center py-2">
          <Link href="/">
            <div className="flex flex-col items-center">
              <span className="font-bold text-2xl text-red-600">
                ロンド
                <img
                  src="/logo.png"
                  alt="Logo"
                  width={32}
                  height={32}
                  className="inline-block mb-2"
                  loading="lazy"
                  decoding="async"
                  fetchPriority="low"
                />
              </span>
              <span className="text-xs text-gray-600 font-normal italic opacity-70">
                Live.Love.London. - 最強ロンドンガイド
              </span>
            </div>
          </Link>
        </div>
        <div className="flex items-center justify-center overflow-x-auto px-6 py-3 max-w-7xl mx-auto">
          <NavigationMenu className="max-w-none shrink-0">
            <NavigationMenuList className="flex-nowrap gap-x-2">
              {NAV_SECTIONS.map((section) => {
                if (section.kind === "link") {
                  return (
                    <NavigationMenuItem key={section.href} className="shrink-0">
                      <NavigationMenuLink asChild>
                        <Link
                          href={section.href}
                          className="inline-flex h-9 items-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                        >
                          {section.label}
                        </Link>
                      </NavigationMenuLink>
                    </NavigationMenuItem>
                  );
                }

                return (
                  <NavigationMenuItem key={section.label} className="shrink-0">
                    <NavigationMenuTrigger className="whitespace-nowrap">
                      {section.label}
                    </NavigationMenuTrigger>
                    <NavigationMenuContent
                      className={`p-6 ${MENU_WIDTH[section.groups.length] ?? MENU_WIDTH[1]}`}
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
                          className={`grid flex-1 gap-x-6 gap-y-4 ${
                            GROUP_COLS[section.groups.length] ?? GROUP_COLS[1]
                          }`}
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
            </NavigationMenuList>
          </NavigationMenu>
        </div>
      </div>
    </nav>
  );
}
