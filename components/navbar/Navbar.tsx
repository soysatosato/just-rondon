"use client";

import { usePathname } from "next/navigation";
import MainNav from "./MainNav";
import LyrixNav from "./LyrixNav";

export default function Navbar() {
  const pathname = usePathname();
  const isLyrix = pathname.startsWith("/lyrixplorer");

  return isLyrix ? <LyrixNav /> : <MainNav />;
}
