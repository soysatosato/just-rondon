import { cn } from "@/lib/utils";

/**
 * /stamps/together で「誰が行ったか」を示す色の丸。
 *
 * 色だけに頼らないよう、丸の中にユーザーネームの頭文字を入れる。
 * 金の輪は現地で押したスタンプ(スタンプ帳の金と同じ意味)。
 *
 * 色の数が lib/stamp-friends-shared.ts の MAX_TOGETHER + 1(自分)を決めている。
 * 金(amber)と紛れる黄・橙系は避け、自分はスタンプ帳と同じ rose にする。
 * Tailwind がクラス名を拾えるよう、文字列は組み立てずにそのまま書くこと。
 */
export const MEMBER_COLORS = [
  { dot: "bg-rose-500", text: "text-rose-600 dark:text-rose-400" },
  { dot: "bg-sky-600", text: "text-sky-600 dark:text-sky-400" },
  { dot: "bg-emerald-600", text: "text-emerald-600 dark:text-emerald-400" },
  { dot: "bg-violet-500", text: "text-violet-600 dark:text-violet-400" },
  { dot: "bg-slate-500", text: "text-slate-600 dark:text-slate-300" },
  { dot: "bg-lime-700", text: "text-lime-700 dark:text-lime-400" },
] as const;

export function memberColor(index: number) {
  return MEMBER_COLORS[index % MEMBER_COLORS.length];
}

export default function MemberDot({
  index,
  username,
  onSite = false,
  size = "sm",
}: {
  /** 何人目か。0 が自分。 */
  index: number;
  username: string;
  onSite?: boolean;
  size?: "sm" | "md";
}) {
  const label = onSite ? `${username}(現地で押した)` : username;
  return (
    <span
      title={label}
      className={cn(
        "inline-flex shrink-0 select-none items-center justify-center rounded-full font-bold uppercase text-white",
        memberColor(index).dot,
        size === "sm" ? "h-5 w-5 text-[10px]" : "h-7 w-7 text-xs",
        onSite &&
          "ring-2 ring-amber-400 ring-offset-1 ring-offset-background",
      )}
    >
      <span aria-hidden>{username.slice(0, 1)}</span>
      <span className="sr-only">{label}</span>
    </span>
  );
}
