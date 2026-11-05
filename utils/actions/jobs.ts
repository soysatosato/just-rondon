"use server";

import db from "../db";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";
import { ServiceCharge } from "@prisma/client";
import { sendAdminMail } from "../mail";
import { POST_LIMITS, RATE_LIMITED, looksLikeBot, since } from "../form-guard";
import { SITE_URL } from "@/lib/seo";
import { STORES_BASE, storePath, storeSlug } from "@/lib/jobs/store-slug";
import {
  DISTRIBUTION_LABEL,
  JOB_ROLE_LABEL,
  WORK_PERIOD_LABEL,
  YES_NO_UNKNOWN_LABEL,
  labelOf,
} from "../labels";
import { thanksPath } from "@/components/jobs/survey/entry";

type ActionState = { ok: true } | { ok: false; message: string };

export type StoreSearchResult = {
  id: string;
  name: string;
  address: string;
  lat: number | null;
  lng: number | null;
  borough: string | null;
  postcode: string | null;
};

export async function searchStores(query: string): Promise<StoreSearchResult[]> {
  const q = query.trim();
  if (q.length < 2) return [];

  const stores = await db.store.findMany({
    where: {
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { aliases: { has: q } },
      ],
    },
    orderBy: { name: "asc" },
    take: 10,
  });

  return stores.map((s) => ({
    id: s.id,
    name: s.name,
    address: s.address,
    lat: s.lat,
    lng: s.lng,
    borough: s.borough,
    postcode: s.postcode,
  }));
}


/* ============================================================
 * 回答の受け取り
 * ========================================================== */

/** 選択式の設問。想定外の値が POST されても列に入れない。 */
function pickEnum<T extends string>(
  formData: FormData,
  name: string,
  allowed: readonly T[],
): T | null {
  const raw = formData.get(name)?.toString();
  if (!raw) return null;
  return (allowed as readonly string[]).includes(raw) ? (raw as T) : null;
}

/** 数値の設問。空欄と不正値はどちらも「未回答」に落とす。 */
function pickNumber(
  formData: FormData,
  name: string,
  max: number,
): number | null {
  const raw = formData.get(name)?.toString().trim();
  if (!raw) return null;
  const parsed = Number(raw);
  if (Number.isNaN(parsed) || parsed < 0 || parsed > max) return null;
  return parsed;
}

const YES_NO_UNKNOWN = ["yes", "no", "unknown"] as const;

/** 送信処理が返す文言。英語版のアンケートには英語で返す。 */
const SURVEY_MESSAGES = {
  ja: {
    storeName: "店舗名を入力してください。",
    store: "店舗を選択してください。",
    failed: "送信に失敗しました。時間をおいて再度お試しください。",
    rateLimited: RATE_LIMITED,
  },
  en: {
    storeName: "Please enter the restaurant's name.",
    store: "Please choose a restaurant.",
    failed: "Sorry, your answers couldn't be sent. Please try again later.",
    rateLimited: "Too many answers have been sent. Please try again later.",
  },
} as const;

export async function submitSurvey(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const locale = formData.get("locale") === "en" ? "en" : "ja";
  const messages = SURVEY_MESSAGES[locale];
  const thanks = thanksPath(locale);

  // ボットには保存せずに完了画面を返す(弾いたと知らせると回避策を学ぶ)。
  if (looksLikeBot(formData)) redirect(thanks);

  // 回答には IP を保存していないので、サイト全体の件数で連投を止める。
  // 店舗の手入力も新しい行を作るので、ここで止めないと候補表まで荒らされる。
  const recent = await db.serviceCharge.count({
    where: { createdAt: since(POST_LIMITS.global.windowMs) },
  });
  if (recent >= POST_LIMITS.global.max) {
    return { ok: false, message: messages.rateLimited };
  }

  // 通知メールは保存が確定してから送る。redirect() は例外で抜けるため、
  // 保存した回答を try の外へ持ち出しておく。
  let created: ServiceCharge | null = null;

  try {
    let placeId = formData.get("storePlaceId")?.toString();
    const manualName = formData.get("manualStoreName")?.toString().trim();

    let storeName = formData.get("storeName")?.toString() ?? "";
    let storeAddress = formData.get("storeAddress")?.toString() ?? "";
    let lat: number | null = null;
    let lng: number | null = null;
    let borough = formData.get("borough")?.toString() || null;
    let postcode = formData.get("postcode")?.toString() || null;
    let isVerified = true;

    const latStr = formData.get("lat")?.toString();
    const lngStr = formData.get("lng")?.toString();
    if (latStr) lat = Number(latStr);
    if (lngStr) lng = Number(lngStr);

    if (!placeId && manualName) {
      if (manualName.length < 2) {
        return { ok: false, message: messages.storeName };
      }
      const manualAddress =
        formData.get("manualStoreAddress")?.toString().trim() ?? "";

      const created = await db.store.create({
        data: {
          id: randomUUID(),
          name: manualName,
          address: manualAddress,
          isVerified: false,
        },
      });

      placeId = created.id;
      storeName = manualName;
      storeAddress = manualAddress;
      lat = null;
      lng = null;
      borough = null;
      postcode = null;
      isVerified = false;
    }

    if (!placeId) {
      return { ok: false, message: messages.store };
    }

    const collected = formData.get("collected") === "yes";

    const amountValue = pickNumber(formData, "amountValue", 100000);
    // 月に744時間(31日×24)を超える申告は入力ミスなので受け取らない。
    const monthlyHours = pickNumber(formData, "monthlyHours", 744);

    created = await db.serviceCharge.create({
      data: {
        id: randomUUID(),
        placeId,
        storeName,
        storeAddress,
        lat,
        lng,
        borough,
        postcode,
        isVerified,
        serviceChargeCollected: collected,

        workPeriod: pickEnum(formData, "workPeriod", [
          "current",
          "within1y",
          "1to3y",
          "over3y",
        ]),
        jobRole: pickEnum(formData, "jobRole", [
          "floor",
          "kitchen",
          "both",
          "other",
        ]),

        distributionType: collected
          ? pickEnum(formData, "distribution", [
              "equal",
              "gradient",
              "fixed",
              "none",
            ])
          : null,
        chargeRatePercent: collected
          ? pickNumber(formData, "chargeRatePercent", 100)
          : null,
        kitchenIncluded: collected
          ? pickEnum(formData, "kitchenIncluded", YES_NO_UNKNOWN)
          : null,
        onPayslip: collected
          ? pickEnum(formData, "onPayslip", YES_NO_UNKNOWN)
          : null,
        // 徴収していない職場では、この設問はそもそも表示していない。
        // 途中で「徴収なし」に変えた場合に前の選択が残るのを防ぐため、ここでも落とす。
        writtenPolicy: collected
          ? pickEnum(formData, "writtenPolicy", YES_NO_UNKNOWN)
          : null,

        // 金額の設問は月額に一本化した。過去データには週額(weekly)も存在するため
        // amountPeriod 列は残し、新規回答には常に monthly を記録する。
        amountPeriod: collected && amountValue !== null ? "monthly" : null,
        amountValue: collected ? amountValue : null,
        monthlyHours: collected ? monthlyHours : null,

        serviceChargeComment:
          formData.get("serviceChargeComment")?.toString().slice(0, 1000) ||
          null,

        mealComment:
          formData.get("mealComment")?.toString().slice(0, 1000) || null,

        generalComment:
          formData.get("generalComment")?.toString().slice(0, 1000) || null,
      },
    });
  } catch (e) {
    console.error(e);
    return { ok: false, message: messages.failed };
  }

  // 回答は管理画面を見に行かないと気付けないので、届いたことをメールで知らせる。
  // 送信に失敗しても回答自体は保存済みなので、握りつぶして完了ページへ進める。
  if (created) {
    try {
      await sendAdminMail({
        subject: `【アンケート${locale === "en" ? "・英語版" : ""}】サービスチャージ: ${created.storeName || "店舗名なし"}`,
        text: buildSurveyMailBody(created, locale),
      });
    } catch (error) {
      console.error("アンケート通知メールの送信に失敗しました", error);
    }

    // 店舗ページと一覧は1時間ごとの再生成なので、そのままだと送った回答が
    // しばらく出てこない。完了画面から店舗ページへ案内するため、ここで捨てておく。
    const slug = storeSlug(created);
    revalidatePath(STORES_BASE);
    revalidatePath(storePath(slug));

    // 完了画面から「前に働いた店も答える」短縮版へ進むとき、職種を聞き直さない。
    const params = new URLSearchParams();
    // 手入力の店舗は確認が済むまで集計に出ないので、店舗ページへは案内しない。
    if (created.isVerified) params.set("store", slug);
    if (created.jobRole) params.set("role", created.jobRole);
    const qs = params.toString();
    redirect(qs ? `${thanks}?${qs}` : thanks);
  }

  redirect(thanks);
}

/** 管理者宛の通知メール本文。回答をそのまま読める形に整えるだけ。 */
function buildSurveyMailBody(
  charge: ServiceCharge,
  locale: "ja" | "en",
): string {
  const siteUrl = SITE_URL;
  const lines: string[] = [
    "サービスチャージのアンケートに新しい回答が届きました。",
    // 英語版の回答は列に残していない。どちらから来たかはこの通知でだけ分かる。
    ...(locale === "en"
      ? ["英語版（/en/jobs/service-charges/survey）からの回答です。"]
      : []),
    "",
    `店舗: ${charge.storeName || "(未入力)"}`,
    `住所: ${charge.storeAddress || "(未入力)"}`,
    `日時: ${charge.createdAt.toLocaleString("ja-JP", {
      timeZone: "Asia/Tokyo",
    })}`,
    `時期: ${labelOf(WORK_PERIOD_LABEL, charge.workPeriod)}`,
    `職種: ${labelOf(JOB_ROLE_LABEL, charge.jobRole)}`,
    `サービスチャージ: ${charge.serviceChargeCollected ? "あり" : "なし"}`,
  ];

  if (charge.serviceChargeCollected) {
    const hours = charge.monthlyHours;
    const amount = charge.amountValue;
    lines.push(
      `料率: ${charge.chargeRatePercent !== null ? `${charge.chargeRatePercent}%` : "未回答"}`,
      `分配方法: ${labelOf(DISTRIBUTION_LABEL, charge.distributionType)}`,
      `キッチンにも分配: ${labelOf(YES_NO_UNKNOWN_LABEL, charge.kitchenIncluded)}`,
      `給与明細に記載: ${labelOf(YES_NO_UNKNOWN_LABEL, charge.onPayslip)}`,
      `書面のチップポリシー: ${labelOf(YES_NO_UNKNOWN_LABEL, charge.writtenPolicy)}`,
      `月額: ${amount !== null ? `約£${amount}` : "未回答"}`,
      `月の勤務時間: ${hours !== null ? `約${hours}時間` : "未回答"}`,
      `時給換算: ${
        amount !== null && hours !== null && hours > 0
          ? `£${(amount / hours).toFixed(2)}`
          : "算出不可"
      }`
    );
  }

  const comments: [string, string | null][] = [
    ["サービスチャージについて", charge.serviceChargeComment],
    ["賄いについて", charge.mealComment],
    ["その他", charge.generalComment],
  ];
  for (const [label, body] of comments) {
    if (!body) continue;
    lines.push("", `${label}:`, "----", body, "----");
  }
  if (comments.some(([, body]) => body)) {
    lines.push(
      "",
      "自由記述は承認するまでサイトに出ません。",
      `承認: ${siteUrl}/admin/service-charges#r-${charge.id}`
    );
  }

  if (!charge.isVerified) {
    lines.push(
      "",
      "※ 店舗が候補になく手入力で登録された回答です。集計には反映されていません。",
      "実在する店舗であれば ServiceCharge.isVerified と Store.isVerified を true にしてください。"
    );
  }

  lines.push("", `詳細: ${siteUrl}${storePath(storeSlug(charge))}`);

  return lines.join("\n");
}
