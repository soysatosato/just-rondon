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
                  fetchPriority="low"
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
                  <Accordion type="single" collapsible>
                    <AccordionItem value="sightseeing" className="border-b-0">
                      <AccordionTrigger className="font-medium hover:text-red-600 transition text-base py-0">
                        ロンドン観光
                      </AccordionTrigger>
                      <AccordionContent className="flex flex-col space-y-2 ml-2 mt-2">
                        <Link
                          href="/sightseeing"
                          className="text-sm hover:text-red-600 transition"
                          onClick={() => setOpen(false)}
                        >
                          ロンドン観光ナビ トップ
                        </Link>
                        <Link
                          href="/sightseeing/itinerary"
                          className="text-sm hover:text-red-600 transition"
                          onClick={() => setOpen(false)}
                        >
                          モデルコース（1〜5日）
                        </Link>
                        <Link
                          href="/sightseeing/hotels"
                          className="text-sm hover:text-red-600 transition"
                          onClick={() => setOpen(false)}
                        >
                          宿泊エリアの選び方
                        </Link>
                        <Link
                          href="/sightseeing/transport"
                          className="text-sm hover:text-red-600 transition"
                          onClick={() => setOpen(false)}
                        >
                          地下鉄・Oyster・空港アクセス
                        </Link>
                        <Link
                          href="/sightseeing/travel-tips"
                          className="text-sm hover:text-red-600 transition"
                          onClick={() => setOpen(false)}
                        >
                          旅の実用情報
                        </Link>
                        <Link
                          href="/sightseeing/must-see"
                          className="text-sm hover:text-red-600 transition"
                          onClick={() => setOpen(false)}
                        >
                          必見スポット
                        </Link>
                        <Link
                          href="/sightseeing/eta-uk-visa-guide"
                          className="text-sm hover:text-red-600 transition"
                          onClick={() => setOpen(false)}
                        >
                          ETA（電子渡航認証）
                        </Link>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
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
                  <Accordion type="single" collapsible>
                    <AccordionItem value="visa" className="border-b-0">
                      <AccordionTrigger className="font-medium hover:text-red-600 transition text-base py-0">
                        ビザ
                      </AccordionTrigger>
                      <AccordionContent className="flex flex-col space-y-2 ml-2 mt-2">
                        <Link
                          href="/visa"
                          className="text-sm hover:text-red-600 transition"
                          onClick={() => setOpen(false)}
                        >
                          英国ビザガイド トップ
                        </Link>
                        <Link
                          href="/sightseeing/eta-uk-visa-guide"
                          className="text-sm hover:text-red-600 transition"
                          onClick={() => setOpen(false)}
                        >
                          ETA（電子渡航認証）
                        </Link>
                        <Link
                          href="/visa/youth-mobility-scheme"
                          className="text-sm hover:text-red-600 transition"
                          onClick={() => setOpen(false)}
                        >
                          YMS（ワーホリ）
                        </Link>
                        <Link
                          href="/visa/skilled-worker"
                          className="text-sm hover:text-red-600 transition"
                          onClick={() => setOpen(false)}
                        >
                          Skilled Worker（就労）
                        </Link>
                        <Link
                          href="/visa/global-talent"
                          className="text-sm hover:text-red-600 transition"
                          onClick={() => setOpen(false)}
                        >
                          Global Talent（卓越人材）
                        </Link>
                        <Link
                          href="/visa/student"
                          className="text-sm hover:text-red-600 transition"
                          onClick={() => setOpen(false)}
                        >
                          Student／Graduate
                        </Link>
                        <Link
                          href="/visa/family"
                          className="text-sm hover:text-red-600 transition"
                          onClick={() => setOpen(false)}
                        >
                          家族・配偶者ビザ
                        </Link>
                        <Link
                          href="/visa/after-arrival"
                          className="text-sm hover:text-red-600 transition"
                          onClick={() => setOpen(false)}
                        >
                          渡英後の手続き
                        </Link>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                  <Accordion type="single" collapsible>
                    <AccordionItem value="jobs" className="border-b-0">
                      <AccordionTrigger className="font-medium hover:text-red-600 transition text-base py-0">
                        働く・暮らす
                      </AccordionTrigger>
                      <AccordionContent className="flex flex-col space-y-2 ml-2 mt-2">
                        <Link
                          href="/jobs"
                          className="text-sm hover:text-red-600 transition"
                          onClick={() => setOpen(false)}
                        >
                          労働問題ガイド トップ
                        </Link>
                        <Link
                          href="/jobs/minimum-wage"
                          className="text-sm hover:text-red-600 transition"
                          onClick={() => setOpen(false)}
                        >
                          最低賃金・給与明細
                        </Link>
                        <Link
                          href="/jobs/employment-contract"
                          className="text-sm hover:text-red-600 transition"
                          onClick={() => setOpen(false)}
                        >
                          労働契約・就業規則
                        </Link>
                        <Link
                          href="/jobs/visa-and-work"
                          className="text-sm hover:text-red-600 transition"
                          onClick={() => setOpen(false)}
                        >
                          ビザと就労
                        </Link>
                        <Link
                          href="/jobs/workplace-harassment"
                          className="text-sm hover:text-red-600 transition"
                          onClick={() => setOpen(false)}
                        >
                          ハラスメント相談先
                        </Link>
                        <Link
                          href="/jobs/service-charges"
                          className="text-sm hover:text-red-600 transition"
                          onClick={() => setOpen(false)}
                        >
                          サービスチャージ完全ガイド
                        </Link>
                        <Link
                          href="/jobs/service-charges/case-story"
                          className="text-sm hover:text-red-600 transition"
                          onClick={() => setOpen(false)}
                        >
                          審判所申立ての実体験
                        </Link>
                        <Link
                          href="/jobs/service-charges/dashboard"
                          className="text-sm hover:text-red-600 transition"
                          onClick={() => setOpen(false)}
                        >
                          店舗別データベース
                        </Link>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                  <Link
                    href="/events"
                    className=" hover:text-red-600 transition"
                    onClick={() => setOpen(false)}
                  >
                    イベント
                  </Link>
                  <Link
                    href="/column"
                    className=" hover:text-red-600 transition"
                    onClick={() => setOpen(false)}
                  >
                    コラム
                  </Link>
                  {/* <Link
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
                  </Link> */}
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
                  fetchPriority="low"
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
                <NavigationMenuTrigger>ロンドン観光</NavigationMenuTrigger>
                <NavigationMenuContent className="grid grid-cols-2 gap-6 p-6 min-w-[600px]">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-red-600">
                      ロンドン観光を計画する
                    </h4>
                    <p className="text-sm text-gray-600">
                      どこに泊まり、どう移動し、何日で何を回るか。定番スポットの情報だけでなく、旅の準備に必要なことをまとめています。
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <Link
                      href="/sightseeing/itinerary"
                      className="hover:underline"
                    >
                      モデルコース（1〜5日）
                    </Link>
                    <Link
                      href="/sightseeing/hotels"
                      className="hover:underline"
                    >
                      宿泊エリアの選び方
                    </Link>
                    <Link
                      href="/sightseeing/transport"
                      className="hover:underline"
                    >
                      地下鉄・Oyster・空港
                    </Link>
                    <Link
                      href="/sightseeing/travel-tips"
                      className="hover:underline"
                    >
                      旅の実用情報
                    </Link>
                    <Link
                      href="/sightseeing/must-see"
                      className="hover:underline"
                    >
                      必見スポット
                    </Link>
                    <Link
                      href="/sightseeing/eta-uk-visa-guide"
                      className="hover:underline"
                    >
                      ETA（電子渡航認証）
                    </Link>
                    <Link
                      href="/sightseeing/all"
                      className="hover:underline"
                    >
                      観光スポット一覧
                    </Link>
                    <Link
                      href="/sightseeing"
                      className="hover:underline text-red-600 font-medium"
                    >
                      観光ナビ トップ
                    </Link>
                  </div>
                </NavigationMenuContent>
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

              <NavigationMenuItem>
                <NavigationMenuTrigger>ビザ</NavigationMenuTrigger>
                <NavigationMenuContent className="grid grid-cols-2 gap-6 p-6 min-w-[600px]">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-red-600">
                      英国ビザを調べる
                    </h4>
                    <p className="text-sm text-gray-600">
                      観光のETAから、ワーホリ、就労、留学、家族ビザ、渡英後の手続きまで。目的・期間から自分に必要なビザを見つけられます。
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <Link
                      href="/sightseeing/eta-uk-visa-guide"
                      className="hover:underline"
                    >
                      ETA（電子渡航認証）
                    </Link>
                    <Link href="/visa/uk-visa-guide" className="hover:underline">
                      英国ビザ全ルート比較
                    </Link>
                    <Link
                      href="/visa/youth-mobility-scheme"
                      className="hover:underline"
                    >
                      YMS（ワーホリ）
                    </Link>
                    <Link href="/visa/skilled-worker" className="hover:underline">
                      Skilled Worker（就労）
                    </Link>
                    <Link href="/visa/global-talent" className="hover:underline">
                      Global Talent（卓越人材）
                    </Link>
                    <Link href="/visa/student" className="hover:underline">
                      Student／Graduate
                    </Link>
                    <Link href="/visa/family" className="hover:underline">
                      家族・配偶者ビザ
                    </Link>
                    <Link href="/visa/after-arrival" className="hover:underline">
                      渡英後の手続き
                    </Link>
                    <Link
                      href="/visa"
                      className="hover:underline text-red-600 font-medium col-span-2"
                    >
                      英国ビザガイド トップ
                    </Link>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuTrigger>働く・暮らす</NavigationMenuTrigger>
                <NavigationMenuContent className="grid grid-cols-2 gap-6 p-6 min-w-[600px]">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-red-600">
                      ロンドンで働く・暮らす
                    </h4>
                    <p className="text-sm text-gray-600">
                      最低賃金、労働契約、ビザ、サービスチャージなど、ロンドンで働く日本人のための労働法ガイド。実体験に基づく記録も公開しています。
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <Link
                      href="/jobs/minimum-wage"
                      className="hover:underline"
                    >
                      最低賃金・給与明細
                    </Link>
                    <Link
                      href="/jobs/employment-contract"
                      className="hover:underline"
                    >
                      労働契約・就業規則
                    </Link>
                    <Link href="/jobs/visa-and-work" className="hover:underline">
                      ビザと就労
                    </Link>
                    <Link
                      href="/jobs/workplace-harassment"
                      className="hover:underline"
                    >
                      ハラスメント相談先
                    </Link>
                    <Link
                      href="/jobs/service-charges"
                      className="hover:underline"
                    >
                      サービスチャージ完全ガイド
                    </Link>
                    <Link
                      href="/jobs/service-charges/case-story"
                      className="hover:underline"
                    >
                      審判所申立ての実体験
                    </Link>
                    <Link
                      href="/jobs/service-charges/dashboard"
                      className="hover:underline"
                    >
                      店舗別データベース
                    </Link>
                    <Link
                      href="/jobs"
                      className="hover:underline text-red-600 font-medium"
                    >
                      労働問題ガイド トップ
                    </Link>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem className="pr-6">
                <NavigationMenuLink asChild>
                  <Link href="/events" className="hover:underline">
                    イベント
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              <NavigationMenuItem className="pr-6">
                <NavigationMenuLink asChild>
                  <Link href="/column" className="hover:underline">
                    コラム
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              {/* <NavigationMenuItem className="pr-6">
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
              </NavigationMenuItem> */}

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
