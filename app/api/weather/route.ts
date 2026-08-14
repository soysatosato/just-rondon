import {
  fetchLondonForecast,
  WEATHER_REVALIDATE_SECONDS,
} from "@/lib/weather/forecast";

/** ロンドンの週間予報を配る。 */
export const revalidate = WEATHER_REVALIDATE_SECONDS;

export async function GET() {
  try {
    const result = await fetchLondonForecast();
    return Response.json(result, {
      headers: {
        "Cache-Control": `public, s-maxage=${WEATHER_REVALIDATE_SECONDS}, stale-while-revalidate=7200`,
      },
    });
  } catch (error) {
    console.error("[weather]", error);
    return Response.json({ error: "unavailable" }, { status: 503 });
  }
}
