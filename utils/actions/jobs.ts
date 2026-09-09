"use server";

import db from "../db";
import { redirect } from "next/navigation";
import { randomUUID } from "crypto";
import { ServiceCharge } from "@prisma/client";
import { sendAdminMail } from "../mail";
import {
  DISTRIBUTION_LABEL,
  JOB_ROLE_LABEL,
  WORK_PERIOD_LABEL,
  YES_NO_UNKNOWN_LABEL,
  labelOf,
} from "../labels";
import {
  buildOverview,
  type ChargeRecord,
  type ServiceChargeOverview,
} from "../service-charge";

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

export async function submitSurvey(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
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
        return { ok: false, message: "店舗名を入力してください。" };
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
      return { ok: false, message: "店舗を選択してください。" };
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
    return {
      ok: false,
      message: "送信に失敗しました。時間をおいて再度お試しください。",
    };
  }

  // 回答は管理画面を見に行かないと気付けないので、届いたことをメールで知らせる。
  // 送信に失敗しても回答自体は保存済みなので、握りつぶして完了ページへ進める。
  if (created) {
    try {
      await sendAdminMail({
        subject: `【アンケート】サービスチャージ: ${created.storeName || "店舗名なし"}`,
        text: buildSurveyMailBody(created),
      });
    } catch (error) {
      console.error("アンケート通知メールの送信に失敗しました", error);
    }
  }

  redirect("/jobs/service-charges/thanks");
}

/** 管理者宛の通知メール本文。回答をそのまま読める形に整えるだけ。 */
function buildSurveyMailBody(charge: ServiceCharge): string {
  const siteUrl = process.env.NEXT_PUBLIC_WEBSITE_URL ?? "";
  const lines: string[] = [
    "サービスチャージのアンケートに新しい回答が届きました。",
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

  if (!charge.isVerified) {
    lines.push(
      "",
      "※ 店舗が候補になく手入力で登録された回答です。集計には反映されていません。",
      "実在する店舗であれば ServiceCharge.isVerified と Store.isVerified を true にしてください。"
    );
  }

  lines.push(
    "",
    `詳細: ${siteUrl}/jobs/service-charges/dashboard/${charge.placeId}`
  );

  return lines.join("\n");
}

/* ============================================================
 * 集計の取り出し
 *
 * 集計はSQLではなくJS側でまとめて行う。回答は数十件しかなく、
 * groupBy を設問の数だけ並べるより、1回読んで utils/service-charge.ts の
 * 純関数に渡すほうが、店舗単位と回答単位の数字が食い違わない。
 * ========================================================== */

/** 集計に使う列だけを選ぶ。自由記述は別途取るのでここには含めない。 */
const RECORD_SELECT = {
  id: true,
  placeId: true,
  storeName: true,
  storeAddress: true,
  borough: true,
  postcode: true,
  lat: true,
  lng: true,
  createdAt: true,
  serviceChargeCollected: true,
  distributionType: true,
  amountPeriod: true,
  amountValue: true,
  monthlyHours: true,
  chargeRatePercent: true,
  jobRole: true,
  workPeriod: true,
  kitchenIncluded: true,
  onPayslip: true,
  writtenPolicy: true,
  serviceChargeComment: true,
  mealComment: true,
  generalComment: true,
} as const;

export async function fetchServiceChargeOverview(): Promise<ServiceChargeOverview> {
  const records = await db.serviceCharge.findMany({
    where: { isVerified: true },
    orderBy: { createdAt: "desc" },
    select: RECORD_SELECT,
  });
  return buildOverview(records as ChargeRecord[]);
}

/**
 * 店舗詳細で使う回答。ここだけ isVerified を見ない。
 * 手入力で登録された回答は一覧には出さないが、通知メールのリンクから
 * 内容を確認できる必要があるため。
 */
export async function fetchServiceChargesByPlaceId(
  placeId: string
): Promise<ChargeRecord[]> {
  const records = await db.serviceCharge.findMany({
    where: { placeId },
    orderBy: { createdAt: "desc" },
    select: RECORD_SELECT,
  });
  return records as ChargeRecord[];
}

export type ResponseFeedFilter = {
  /** 分配方法での絞り込み。 */
  dist?: string;
  /** 自由記述のある回答だけに絞る。 */
  withComment?: boolean;
};

function feedWhere(filter?: ResponseFeedFilter) {
  const clauses: any[] = [{ isVerified: true }];
  if (
    filter?.dist &&
    ["equal", "gradient", "fixed", "none"].includes(filter.dist)
  ) {
    clauses.push({ distributionType: filter.dist });
  }
  if (filter?.withComment) {
    clauses.push({
      OR: [
        { serviceChargeComment: { not: null } },
        { mealComment: { not: null } },
        { generalComment: { not: null } },
      ],
    });
  }
  return { AND: clauses };
}

export async function fetchResponseCount(
  filter?: ResponseFeedFilter
): Promise<number> {
  return db.serviceCharge.count({ where: feedWhere(filter) });
}

/** 回答を1件ずつ新着順に返す。店舗ごとにまとめない「声の一覧」用。 */
export async function fetchResponseFeed(
  page: number,
  itemsPerPage: number,
  filter?: ResponseFeedFilter
): Promise<ChargeRecord[]> {
  const records = await db.serviceCharge.findMany({
    where: feedWhere(filter),
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * itemsPerPage,
    take: itemsPerPage,
    select: RECORD_SELECT,
  });
  return records as ChargeRecord[];
}
