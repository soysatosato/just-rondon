import { Eye, EyeOff } from "lucide-react";

/**
 * スタンプ帳をつなぐと、相手に何が見えて何が見えないか。
 *
 * つなぐ前(招待ページ)とつないだあと(/stamps/together)の両方に同じ文を置く。
 * 片方だけ直すと、つなぐときに聞いた話と違うことになる。
 */
export default function SharingNote() {
  return (
    <ul className="space-y-2 text-xs leading-relaxed text-muted-foreground">
      <li className="flex items-start gap-2">
        <Eye className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
        <span>
          お互いに見えるのは、ユーザーネームと、スタンプを押した場所・現地で押した金のスタンプかどうかです。
        </span>
      </li>
      <li className="flex items-start gap-2">
        <EyeOff className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
        <span>
          押した日時、メールアドレス、ログインの方法は見えません。解除はどちらからでもいつでもでき、相手に通知はされません。
        </span>
      </li>
    </ul>
  );
}
