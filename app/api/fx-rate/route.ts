import { fetchGbpJpyRate, FX_REVALIDATE_SECONDS } from "@/lib/fx/rate";

/** GBP→JPY の参考レートを配る。 */
export const revalidate = FX_REVALIDATE_SECONDS;

export async function GET() {
  try {
    const result = await fetchGbpJpyRate();
    return Response.json(result, {
      headers: {
        "Cache-Control": `public, s-maxage=${FX_REVALIDATE_SECONDS}, stale-while-revalidate=86400`,
      },
    });
  } catch (error) {
    console.error("[fx-rate]", error);
    return Response.json({ error: "unavailable" }, { status: 503 });
  }
}
