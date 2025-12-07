import Link from "next/link";
import LyrixLogo from "../home/LyrixLogo";

export default function LyrixHeader() {
  return (
    <header className="w-full border-b bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4">
        {/* Logo */}
        <Link href="/lyrixplorer">
          <LyrixLogo />
        </Link>
      </div>
    </header>
  );
}
