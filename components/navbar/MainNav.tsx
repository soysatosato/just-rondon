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
  NavigationMenuViewport,
} from "@/components/ui/navigation-menu";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import LinksDropdown from "./LinksDropdown";
import { useState } from "react";
import { MdMail } from "react-icons/md";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <nav className="w-full">
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
                />
              </span>
              <span className="text-xs text-muted-foreground font-normal italic opacity-70">
                JUST RONDON - ロンドン観光・旅行・現地ガイド
              </span>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            {/* <LinksDropdown /> */}
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="p-2">
                  <Menu className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64">
                <SheetHeader>
                  <SheetTitle className="flex justify-between items-center">
                    <span>Menu</span>
                  </SheetTitle>
                </SheetHeader>

                <nav className="flex flex-col space-y-3 mt-4">
                  <Link
                    href="/"
                    className=" hover:text-red-600 transition"
                    onClick={() => setOpen(false)}
                  >
                    トップページ
                  </Link>
                  <Link
                    href="/sightseeing"
                    className=" hover:text-red-600 transition"
                    onClick={() => setOpen(false)}
                  >
                    ロンドン観光ナビ
                  </Link>
                  <Accordion type="single" collapsible>
                    <AccordionItem value="museums" className="border-b-0">
                      <AccordionTrigger className="font-medium hover:text-red-600 transition text-base py-0">
                        美術館・博物館
                      </AccordionTrigger>
                      <AccordionContent className="flex flex-col space-y-2 ml-2 mt-2">
                        <Link
                          href="/museums"
                          className="text-sm hover:text-red-600 transition"
                          onClick={() => setOpen(false)}
                        >
                          美術館ナビ
                        </Link>
                        <Link
                          href="/museums/best-10-museums"
                          className="text-sm hover:text-red-600 transition"
                          onClick={() => setOpen(false)}
                        >
                          絶対に行くべき美術館10選
                        </Link>
                        <Link
                          href="/museums/best-museums-for-kids"
                          className="text-sm hover:text-red-600 transition"
                          onClick={() => setOpen(false)}
                        >
                          キッズ向け美術館
                        </Link>
                        <Link
                          href="/museums/banksy-artworks"
                          className="text-sm hover:text-red-600 transition"
                          onClick={() => setOpen(false)}
                        >
                          街で見つかるバンクシー
                        </Link>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                  <Link
                    href="/musicals"
                    className="hover:text-red-600 transition"
                    onClick={() => setOpen(false)}
                  >
                    ミュージカル
                  </Link>
                  <Link
                    href="/news"
                    className=" hover:text-red-600 transition"
                    onClick={() => setOpen(false)}
                  >
                    ニュース
                  </Link>
                  <Link
                    href="/matome"
                    className=" hover:text-red-600 transition"
                    onClick={() => setOpen(false)}
                  >
                    ロンドンの声・話題まとめ
                  </Link>
                  <Link
                    href="/chatboard"
                    className=" hover:text-red-600 transition"
                    onClick={() => setOpen(false)}
                  >
                    掲示板
                  </Link>
                  <Link
                    href="/contact"
                    className=" hover:text-red-600 transition"
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
                />
              </span>
              <span className="text-xs text-gray-600 font-normal italic opacity-70">
                Live.Love.London. - 最強ロンドンガイド
              </span>
            </div>
          </Link>
        </div>
        <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
          <NavigationMenu>
            <NavigationMenuList className="gap-x-6">
              <NavigationMenuItem className="pr-6">
                <NavigationMenuLink asChild>
                  <Link href="/sightseeing" className="hover:underline">
                    ロンドン観光ナビ
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger>美術館</NavigationMenuTrigger>
                <NavigationMenuContent className="grid grid-cols-2 gap-6 p-6 min-w-[600px]">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-red-600">美術館を探す</h4>
                    <p className="text-sm text-gray-600">
                      ロンドンの世界的な美術館やギャラリーを発見しよう。歴史的なコレクションから現代アートまで幅広く楽しめます。
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <Link
                      href="/museums/british-museum"
                      className="hover:underline"
                    >
                      大英博物館
                    </Link>
                    <Link
                      href="/museums/national-gallery"
                      className="hover:underline"
                    >
                      ナショナル・ギャラリー
                    </Link>
                    <Link
                      href="/museums/tate-modern"
                      className="hover:underline"
                    >
                      テート・モダン
                    </Link>
                    <Link
                      href="/museums/best-10-museums"
                      className="hover:underline"
                    >
                      絶対に行くべき美術館10選
                    </Link>
                    <Link
                      href="/museums/best-25-museums"
                      className="hover:underline"
                    >
                      おすすめの美術館
                    </Link>
                    <Link
                      href="/museums/best-museum-for-kids"
                      className="hover:underline"
                    >
                      キッズ向け美術館
                    </Link>
                    <Link
                      href="/museums/banksy-artworks"
                      className="hover:underline"
                    >
                      バンクシー作品
                    </Link>
                    <Link
                      href="/museums"
                      className="hover:underline text-red-600 font-medium"
                    >
                      美術館ナビ
                    </Link>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuTrigger>ミュージカル</NavigationMenuTrigger>
                <NavigationMenuContent className="grid grid-cols-2 gap-6 p-6 min-w-[600px]">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-red-600">
                      ミュージカルを楽しむ
                    </h4>
                    <p className="text-sm text-gray-600">
                      ロンドンで楽しめる人気のミュージカルや話題の舞台作品をチェックして、観劇プランを立てよう。
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <Link
                      href="/musicals/les-miserables"
                      className="hover:underline"
                    >
                      レ・ミゼラブル
                    </Link>
                    <Link
                      href="/musicals/harry-potter-cursed-child"
                      className="hover:underline"
                    >
                      ハリー・ポッターと呪いの子
                    </Link>
                    <Link href="/musicals/wicked" className="hover:underline">
                      ウィキッド
                    </Link>
                    <Link href="/musicals" className="hover:underline">
                      ミュージカルナビ
                    </Link>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem className="pr-6">
                <NavigationMenuLink asChild>
                  <Link href="/news" className="hover:underline">
                    ニュース
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link href="/chatboard" className="hover:underline">
                    掲示板
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link href="/contact" className="hover:underline">
                    <div className="flex">
                      <MdMail className="w-5 h-5" />
                    </div>
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              {/* 
              <NavigationMenuItem>
                <LinksDropdown />
              </NavigationMenuItem> */}
            </NavigationMenuList>
            <NavigationMenuViewport />
          </NavigationMenu>
        </div>
      </div>
    </nav>
  );
}
