"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function MainFooter() {
  const pathname = usePathname();
  const isLyrix = pathname.startsWith("/lyrixplorer");

  if (isLyrix) return null;
  return (
    <footer className="bg-white py-8 text-xs text-slate-500">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-3">
          <Link href="/contact">お問い合わせ</Link>
          <Link href="/">Top Pageへ</Link>
          {/* <Link href="/lyrixplorer">和訳サイト</Link> */}
        </div>
        <p className="max-w-md text-[10px] leading-relaxed">
          ロンドん！は、ロンドンの深層に迫る力量も器量もない中途半端な存在ですが、旅の判断をほんの少し整える一文が紛れていれば、それだけで存在理由になります。
        </p>
      </div>
    </footer>
  );
}
