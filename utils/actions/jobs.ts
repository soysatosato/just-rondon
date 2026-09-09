"use server";

import db from "../db";
import { redirect } from "next/navigation";
import { randomUUID } from "crypto";
import { ServiceCharge } from "@prisma/client";
import { sendAdminMail } from "../mail";
import { DISTRIBUTION_LABEL, labelOf } from "../labels";

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

    const amountValueStr = formData.get("amountValue")?.toString().trim() ?? "";
    const hasAmountValue = amountValueStr !== "";

    let amountValue: number | null = null;
    if (collected && hasAmountValue) {
      const parsed = Number(amountValueStr);
      if (Number.isNaN(parsed) || parsed < 0) {
        return {
          ok: false,
          message: "サービスチャージ金額は0以上の数値で入力してください。",
        };
      }
      amountValue = parsed;
    }

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
        distributionType: collected
          ? formData.get("distribution")?.toString() ?? null
          : null,
        // 金額の設問は月額に一本化した。過去データには週額(weekly)も存在するため
        // amountPeriod 列は残し、新規回答には常に monthly を記録する。
        amountPeriod: collected && amountValue !== null ? "monthly" : null,
        amountValue: collected ? amountValue : null,
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
    `サービスチャージ: ${charge.serviceChargeCollected ? "あり" : "なし"}`,
  ];

  if (charge.serviceChargeCollected) {
    lines.push(
      `分配方法: ${labelOf(DISTRIBUTION_LABEL, charge.distributionType)}`,
      `金額: ${charge.amountValue !== null ? `月額 約£${charge.amountValue}` : "未回答"}`
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

export async function fetchServiceCharges(q?: string) {
  const data = await db.serviceCharge.groupBy({
    by: ["placeId", "storeName", "storeAddress"],
    where: {
      isVerified: true,
      ...(q
        ? {
            OR: [
              { storeName: { contains: q, mode: "insensitive" } },
              { postcode: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    _count: {
      placeId: true, // ← ここ重要
    },
    orderBy: {
      _count: {
        placeId: "desc",
      },
    },
  });

  return data;
}

export async function fetchServiceChargesByPlaceId(
  placeId: string
): Promise<ServiceCharge[]> {
  return db.serviceCharge.findMany({
    where: { placeId },
    orderBy: { createdAt: "desc" },
  });
}

type ChargeFilter = { q?: string; collected?: "yes" | "no" };

function buildWhere(filter?: ChargeFilter) {
  const clauses: any[] = [{ isVerified: true }];
  if (filter?.q) {
    clauses.push({
      OR: [
        { storeName: { contains: filter.q, mode: "insensitive" } },
        { postcode: { contains: filter.q, mode: "insensitive" } },
      ],
    });
  }
  if (filter?.collected === "yes") clauses.push({ serviceChargeCollected: true });
  if (filter?.collected === "no") clauses.push({ serviceChargeCollected: false });
  return { AND: clauses };
}

export async function fetchServiceChargeCount(filter?: ChargeFilter) {
  const count = await db.serviceCharge.count({ where: buildWhere(filter) });
  return count;
}

export async function fetchServiceChargesPaged(
  page: number,
  itemsPerPage: number,
  filter?: ChargeFilter
) {
  return db.serviceCharge.groupBy({
    by: ["placeId", "storeName"],
    where: buildWhere(filter),
    _count: {
      placeId: true,
    },
    _max: {
      createdAt: true,
      storeAddress: true,
    },
    orderBy: [{ _max: { createdAt: "desc" } }],
    skip: (page - 1) * itemsPerPage,
    take: itemsPerPage,
  });
}

export type ServiceChargeStats = {
  totalReviews: number;
  totalStores: number;
  collectedCount: number;
  notCollectedCount: number;
  distribution: { type: string | null; count: number }[];
  workAtmosphere: { value: string | null; count: number }[];
  amountByPeriod: { period: string; avg: number; count: number }[];
};

export async function fetchServiceChargeStats(): Promise<ServiceChargeStats> {
  const [
    totalReviews,
    collectedGroup,
    distributionGroup,
    atmosphereGroup,
    amountGroup,
    storeGroup,
  ] = await Promise.all([
    db.serviceCharge.count({ where: { isVerified: true } }),
    db.serviceCharge.groupBy({
      by: ["serviceChargeCollected"],
      where: { isVerified: true },
      _count: { _all: true },
    }),
    db.serviceCharge.groupBy({
      by: ["distributionType"],
      where: { isVerified: true, serviceChargeCollected: true },
      _count: { _all: true },
    }),
    db.serviceCharge.groupBy({
      by: ["workAtmosphere"],
      where: { isVerified: true },
      _count: { _all: true },
    }),
    db.serviceCharge.groupBy({
      by: ["amountPeriod"],
      where: {
        isVerified: true,
        serviceChargeCollected: true,
        amountValue: { not: null },
      },
      _avg: { amountValue: true },
      _count: { _all: true },
    }),
    db.serviceCharge.groupBy({ by: ["placeId"], where: { isVerified: true } }),
  ]);

  const collectedCount =
    collectedGroup.find((g) => g.serviceChargeCollected)?._count._all ?? 0;
  const notCollectedCount =
    collectedGroup.find((g) => !g.serviceChargeCollected)?._count._all ?? 0;

  return {
    totalReviews,
    totalStores: storeGroup.length,
    collectedCount,
    notCollectedCount,
    distribution: distributionGroup.map((g) => ({
      type: g.distributionType,
      count: g._count._all,
    })),
    workAtmosphere: atmosphereGroup.map((g) => ({
      value: g.workAtmosphere,
      count: g._count._all,
    })),
    amountByPeriod: amountGroup
      .filter((g) => g.amountPeriod)
      .map((g) => ({
        period: g.amountPeriod as string,
        avg: g._avg.amountValue ?? 0,
        count: g._count._all,
      })),
  };
}
