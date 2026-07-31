"use server";

import db from "../db";
import { redirect } from "next/navigation";
import { randomUUID } from "crypto";
import { ServiceCharge } from "@prisma/client";

type ActionState = { ok: true } | { ok: false; message: string };

export async function submitSurvey(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const placeId = formData.get("storePlaceId")?.toString();

    const latStr = formData.get("lat")?.toString();
    const lngStr = formData.get("lng")?.toString();
    const lat = latStr ? Number(latStr) : NaN;
    const lng = lngStr ? Number(lngStr) : NaN;

    if (!placeId || Number.isNaN(lat) || Number.isNaN(lng)) {
      return { ok: false, message: "店舗を選択してください。" };
    }

    const collected = formData.get("collected") === "yes";

    const amountValueStr = formData.get("amountValue")?.toString().trim() ?? "";
    const amountPeriodStr =
      formData.get("amountPeriod")?.toString().trim() ?? "";

    const hasAmountValue = amountValueStr !== "";
    const hasAmountPeriod =
      amountPeriodStr === "weekly" || amountPeriodStr === "monthly";

    if (collected && hasAmountValue !== hasAmountPeriod) {
      return {
        ok: false,
        message:
          "サービスチャージ金額を入力する場合は、週額・月額のどちらかも選択してください（金額を入力しない場合は選択も不要です）。",
      };
    }

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

    await db.serviceCharge.create({
      data: {
        id: randomUUID(),
        placeId,
        storeName: formData.get("storeName")?.toString() ?? "",
        storeAddress: formData.get("storeAddress")?.toString() ?? "",
        lat,
        lng,
        borough: formData.get("borough")?.toString() || null,
        postcode: formData.get("postcode")?.toString() || null,
        serviceChargeCollected: collected,
        distributionType: collected
          ? formData.get("distribution")?.toString() ?? null
          : null,
        amountPeriod: collected && hasAmountPeriod ? amountPeriodStr : null,
        amountValue: collected ? amountValue : null,
        serviceChargeComment:
          formData.get("serviceChargeComment")?.toString().slice(0, 1000) ||
          null,
        mealCountPerDay: formData.get("mealCountPerDay")?.toString() || null,

        mealRestrictions: formData.getAll("mealRestrictions").map(String),

        mealComment:
          formData.get("mealComment")?.toString().slice(0, 500) || null,

        mealDrink: formData.get("mealDrink")?.toString() || null,

        shiftSchedule: formData.get("shiftSchedule")?.toString() || null,

        visaSupport: formData.get("visaSupport")?.toString() || null,

        managementPresence:
          formData.get("managementPresence")?.toString() || null,

        workAtmosphere: formData.get("workAtmosphere")?.toString() || null,

        ethnicityRatio: formData.get("ethnicityRatio")?.toString() || null,

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
  redirect("/jobs/service-charges/thanks");
}

export async function fetchServiceCharges(q?: string) {
  const data = await db.serviceCharge.groupBy({
    by: ["placeId", "storeName", "storeAddress"],
    where: q
      ? {
          OR: [
            { storeName: { contains: q, mode: "insensitive" } },
            { postcode: { contains: q, mode: "insensitive" } },
          ],
        }
      : undefined,
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
  if (!filter) return undefined;
  const clauses: any[] = [];
  if (filter.q) {
    clauses.push({
      OR: [
        { storeName: { contains: filter.q, mode: "insensitive" } },
        { postcode: { contains: filter.q, mode: "insensitive" } },
      ],
    });
  }
  if (filter.collected === "yes") clauses.push({ serviceChargeCollected: true });
  if (filter.collected === "no") clauses.push({ serviceChargeCollected: false });
  return clauses.length ? { AND: clauses } : undefined;
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
    db.serviceCharge.count(),
    db.serviceCharge.groupBy({
      by: ["serviceChargeCollected"],
      _count: { _all: true },
    }),
    db.serviceCharge.groupBy({
      by: ["distributionType"],
      where: { serviceChargeCollected: true },
      _count: { _all: true },
    }),
    db.serviceCharge.groupBy({
      by: ["workAtmosphere"],
      _count: { _all: true },
    }),
    db.serviceCharge.groupBy({
      by: ["amountPeriod"],
      where: { serviceChargeCollected: true, amountValue: { not: null } },
      _avg: { amountValue: true },
      _count: { _all: true },
    }),
    db.serviceCharge.groupBy({ by: ["placeId"] }),
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
