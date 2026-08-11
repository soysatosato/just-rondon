import { NextResponse } from "next/server";
import { BANKSY_ARTWORKS } from "@/lib/banksy";

/**
 * 作品データの実体は lib/banksy.ts にある。ページ側はそちらを直接読んで
 * サーバー描画しており、このルートは外部から叩かれた場合の互換用。
 */
export async function GET() {
  return NextResponse.json(BANKSY_ARTWORKS);
}
