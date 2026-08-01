"use server";

import db from "../db";
import { redirect } from "next/navigation";
import { randomUUID } from "crypto";
import { ServiceCharge } from "@prisma/client";

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
