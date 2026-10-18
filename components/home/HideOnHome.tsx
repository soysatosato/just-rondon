"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/**
 * トップページでだけ中身を出さない。
 *
 * フッターの索引に使っている。トップは最下部に全リンクの索引
 * (「このサイトにあるもの」)を持っているので、その直下に同じ区分の
 * 索引をもう一度並べることになるため。
 */
export default function HideOnHome({ children }: { children: ReactNode }) {
  return usePathname() === "/" ? null : <>{children}</>;
}
