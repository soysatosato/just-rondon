import "server-only";

import { unstable_cache } from "next/cache";
import { formatLondon } from "@/lib/publish-schedule";
import { sendAdminMail } from "@/utils/mail";
import {
  NationalGalleryParseError,
  nationalGalleryFloorplanUrl,
  parseNationalGalleryLocation,
  parseNationalGalleryRoomState,
  type RoomState,
} from "./national-gallery-parse";

/**
 * ナショナル・ギャラリーの名作ページに出す「いまどこにあるか」。
 *
 * 公式は研究センター(2028年開館予定)の工事で部屋を閉め、作品を移している。
 * 訪問案内でも「目当ての作品があるなら、行く前に公式サイトで現在の場所と
 * 閉まっている部屋を確かめて」と書いている(2026-10-30)。手で確かめた記録は
 * その日のうちに古くなりうるので、作品ページと館内図を毎日読む。
 *
 * 作りは衛兵交代式の予定表(lib/guard/schedule.ts)と同じ。
 * - 読めなかったら状況は出さず、ページは手で確かめた記録と公式へのリンクを出す
 * - 4xx と解析の失敗は待っても直らないので、運営者にメールする(1日1通まで)
 * - 確認した時刻は応答の Date ヘッダーから取り、必ずページに出す
 */

/** 作品ページの ISR(app/museums/[slug]/artworks/[id]/page.tsx)と揃える。 */
const REVALIDATE_SECONDS = 60 * 60 * 24;

/** 公式サイトが応答しないときにページの生成を止めないための上限。 */
const FETCH_TIMEOUT_MS = 5000;

/** 通知メールの送信を待つ上限。lib/guard/schedule.ts と同じ。 */
const ALERT_TIMEOUT_MS = 5000;

export type LivePlacement =
  | { state: "on-display"; level: string; room: string; roomState: RoomState }
  | { state: "not-on-display" }
  | { state: "on-loan"; to: string };

export type LivePlacementResult =
  | {
      ok: true;
      placement: LivePlacement;
      /** 公式の作品ページを取得した時刻(ISO)。 */
      checkedAt: string;
    }
  | { ok: false };

function londonToday(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/London",
  }).format(new Date());
}

/**
 * 解析の失敗を運営者に知らせる。本番だけ、ロンドンの日付ごとに1通まで。
 *
 * 作品が何点あっても1日1通にする。館がページの書き方を変えると全点が
 * 一度に失敗するので、作品ごとに送ると同じ知らせが何通も届く。
 */
async function alertOwner(reason: string, pagePath: string): Promise<void> {
  if (process.env.VERCEL_ENV !== "production") return;

  const sendOnce = unstable_cache(
    async () => {
      await sendAdminMail({
        subject: "[just-rondon] ナショナル・ギャラリーの展示状況が読めませんでした",
        text: [
          "名作ページの「いまどこにあるか」が、公式サイトから読めていません。",
          "いまは手で確かめた日の記録と、公式ページへのリンクだけを出しています。",
          "",
          `理由: ${reason}`,
          `ページ: https://www.just-rondon.com${pagePath}`,
          "",
          "公式の作品ページか館内図の書き方が変わった可能性があります。",
          "解析は lib/masterpieces/national-gallery-parse.ts にあります。",
          "npx tsx scripts/check-masterpieces.ts で全点を確かめられます。",
          "このメールは同じ日には1通しか送りません。",
        ].join("\n"),
      });
      return true;
    },
    ["national-gallery-placement-alert", londonToday()],
    { revalidate: 60 * 60 * 24 },
  );

  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    await Promise.race([
      sendOnce(),
      new Promise<never>((_, reject) => {
        timer = setTimeout(
          () => reject(new Error(`${ALERT_TIMEOUT_MS}ms で打ち切り`)),
          ALERT_TIMEOUT_MS,
        );
      }),
    ]);
  } catch (error) {
    console.error("[national-gallery] alert failed", error);
  } finally {
    clearTimeout(timer);
  }
}

async function fetchPage(url: string): Promise<Response | null> {
  try {
    return await fetch(url, {
      headers: { "User-Agent": "just-rondon (+https://www.just-rondon.com)" },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      next: { revalidate: REVALIDATE_SECONDS },
    });
  } catch (error) {
    console.error(`[national-gallery] fetch failed: ${url}`, error);
    return null;
  }
}

/** 館内図から部屋の開閉を読む。読めなければ unknown(作品の場所は出す)。 */
async function fetchRoomState(
  levelSlug: string,
  roomSlug: string,
): Promise<RoomState> {
  const res = await fetchPage(nationalGalleryFloorplanUrl(levelSlug));
  if (!res?.ok) return "unknown";
  return parseNationalGalleryRoomState(await res.text(), levelSlug, roomSlug);
}

/**
 * 作品がいまどこにあるか。失敗しても例外にはせず { ok: false } を返す。
 *
 * 通信の失敗・タイムアウト・5xx は公式サイト側の一時的な不調とみなし、
 * ログだけ残す(次の再生成で直る)。
 */
export async function fetchNationalGalleryPlacement(
  officialUrl: string,
  pagePath: string,
): Promise<LivePlacementResult> {
  const res = await fetchPage(officialUrl);
  if (!res) return { ok: false };

  if (!res.ok) {
    console.error(`[national-gallery] ${officialUrl} responded ${res.status}`);
    if (res.status >= 400 && res.status < 500) {
      await alertOwner(`公式の作品ページが ${res.status} を返した`, pagePath);
    }
    return { ok: false };
  }

  let location;
  try {
    location = parseNationalGalleryLocation(await res.text());
  } catch (error) {
    console.error("[national-gallery] parse failed", error);
    await alertOwner(
      error instanceof NationalGalleryParseError ? error.message : String(error),
      pagePath,
    );
    return { ok: false };
  }

  // 取得時刻は応答の Date ヘッダーから取る。fetch の結果はキャッシュから
  // 返ることがあり、そのとき「いま」を書くと実際より新しい時刻を名乗ってしまう。
  const served = res.headers.get("date");
  const checkedAt =
    served && !Number.isNaN(Date.parse(served))
      ? new Date(served).toISOString()
      : new Date().toISOString();

  if (location.state !== "on-display") {
    return { ok: true, placement: location, checkedAt };
  }

  return {
    ok: true,
    placement: {
      state: "on-display",
      level: location.level,
      room: location.room,
      roomState: await fetchRoomState(location.levelSlug, location.roomSlug),
    },
    checkedAt,
  };
}

/** 「10/30(木) 9:12」。ロンドン時間の確認時刻を出すのに使う。 */
export function formatPlacementCheckedAt(iso: string): string {
  return formatLondon(new Date(iso));
}
