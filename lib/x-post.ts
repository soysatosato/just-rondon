import db from "@/utils/db";

/**
 * X API v2 への投稿。OAuth 2.0 の Access Token は短命(通常2時間)なので、
 * 呼び出しの都度 Refresh Token で取り直す。X の Refresh Token は使用の都度
 * ローテーション(使い捨て)される仕様のため、環境変数には固定できない。
 * 最新の Refresh Token は `XAuthToken` テーブルの1行に保持し、初回だけ
 * 環境変数 X_REFRESH_TOKEN からDBにseedする。
 */

const TOKEN_URL = "https://api.x.com/2/oauth2/token";
const POST_URL = "https://api.x.com/2/tweets";

async function getStoredRefreshToken(): Promise<string> {
  const existing = await db.xAuthToken.findFirst();
  if (existing) return existing.refreshToken;

  const seed = process.env.X_REFRESH_TOKEN;
  if (!seed) {
    throw new Error(
      "No XAuthToken row in DB and X_REFRESH_TOKEN env var is not set"
    );
  }
  const created = await db.xAuthToken.create({ data: { refreshToken: seed } });
  return created.refreshToken;
}

async function refreshAccessToken(): Promise<string> {
  const clientId = process.env.X_CLIENT_ID;
  const clientSecret = process.env.X_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("X_CLIENT_ID / X_CLIENT_SECRET must be set");
  }

  const refreshToken = await getStoredRefreshToken();
  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString(
    "base64"
  );

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${basicAuth}`,
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to refresh X access token: ${res.status} ${text}`);
  }

  const data = await res.json();

  // ローテーションされた新しい refresh token を必ず保存し直す。
  // 保存を怠ると使い捨てられた古い token しか残らず、次回の refresh が失敗する。
  await db.xAuthToken.deleteMany({});
  await db.xAuthToken.create({ data: { refreshToken: data.refresh_token } });

  return data.access_token;
}

export async function postTweet(body: string): Promise<{ id: string }> {
  const accessToken = await refreshAccessToken();

  const res = await fetch(POST_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ text: body }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to post tweet: ${res.status} ${text}`);
  }

  const data = await res.json();
  return { id: data.data.id };
}
