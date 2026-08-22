import Link from "next/link";
import { TWITTER_HANDLE } from "@/lib/seo";

export default function MainFooter() {
  return (
    <footer className="border-t bg-background py-8 text-xs text-muted-foreground">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-3">
          <Link href="/contact">お問い合わせ</Link>
          <Link href="/about">サイト概要</Link>
          <Link href="/terms">利用規約</Link>
          <Link href="/privacy">プライバシーポリシー</Link>
          <Link href="/">Top Pageへ</Link>
        </div>

        {/*
          サイト唯一の再訪導線。検索から来た読者が読んで帰るだけにならないよう、
          新着を受け取る先を示す。メールでの購読フォームは、送信先も購読者を
          保存する仕組みも無いまま画面にだけ残っていたため取り止めた。
        */}
        <a
          href={`https://x.com/${TWITTER_HANDLE.replace("@", "")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex w-fit items-center gap-1.5 whitespace-nowrap
            rounded-full border border-border px-3 py-1.5 transition
            hover:border-neutral-400 hover:text-foreground"
        >
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="h-3.5 w-3.5 fill-current"
          >
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
          Xで新着を受け取る
        </a>
        <p className="max-w-md text-[10px] leading-relaxed">
          ジャスト・ロンドンは、ロンドンの深層に迫る力量も器量もない中途半端な存在ですが、旅の判断をほんの少し整える一文が紛れていれば、それだけで存在理由になります。
        </p>
      </div>
    </footer>
  );
}
