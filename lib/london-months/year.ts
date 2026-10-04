import { londonDate } from "@/lib/publish-schedule";

/**
 * 月別ページ(/events/<月>)がどの年を出すか。
 *
 * これから来る月(今月を含む)は今年、もう過ぎた月は来年。10月に
 * 「1月のロンドン」を開く人が知りたいのは、終わった今年の1月ではなく
 * 次に来る1月だから。月が替わった翌日に切り替わる(ページの ISR は1時間)。
 */
export function getDisplayYear(month: number, now: Date = new Date()): number {
  const [year, current] = londonDate(now).split("-").map(Number);
  return month >= current ? year : year + 1;
}
