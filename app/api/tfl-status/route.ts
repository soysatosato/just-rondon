import { fetchTflStatus, TFL_REVALIDATE_SECONDS } from "@/lib/tfl/status";

/**
 * 地下鉄などの運行状況を配る。
 *
 * キャッシュ秒数は lib 側の定数と共有する。ここに数字を直接書くと
 * fetch 側の revalidate とずれて、意図しない頻度で外部APIを叩く。
 */
export const revalidate = TFL_REVALIDATE_SECONDS;

export async function GET() {
  try {
    const result = await fetchTflStatus();
    return Response.json(result, {
      headers: {
        "Cache-Control": `public, s-maxage=${TFL_REVALIDATE_SECONDS}, stale-while-revalidate=300`,
      },
    });
  } catch (error) {
    console.error("[tfl-status]", error);
    // ウィジェットは補助情報なので、失敗してもページ全体は壊さない。
    // クライアント側はこのステータスを見てウィジェットごと隠す。
    return Response.json({ error: "unavailable" }, { status: 503 });
  }
}
