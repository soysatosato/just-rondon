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
    console.log("submitSurvey called");
    console.log(Object.fromEntries(formData.entries()));
    const placeId = formData.get("storePlaceId")?.toString();
    if (!placeId) {
      return { ok: false, message: "店舗を選択してください。" };
    }

    const collected = formData.get("collected") === "yes";

    const amountValueStr = formData.get("amountValue")?.toString();
    const amountValue =
      amountValueStr && amountValueStr !== "" ? Number(amountValueStr) : null;

    await db.serviceCharge.create({
      data: {
        id: randomUUID(),
        placeId,
        storeName: formData.get("storeName")?.toString() ?? "",
        storeAddress: formData.get("storeAddress")?.toString() ?? "",
        lat: Number(formData.get("lat")),
        lng: Number(formData.get("lng")),
        borough: formData.get("borough")?.toString() || null,
        postcode: formData.get("postcode")?.toString() || null,
        serviceChargeCollected: collected,
        distributionType: collected
          ? formData.get("distribution")?.toString() ?? null
          : null,
        amountPeriod: collected
          ? formData.get("amountPeriod")?.toString() ?? null
          : null,
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
            { storeAddress: { contains: q, mode: "insensitive" } },
            { borough: { contains: q, mode: "insensitive" } },
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
    take: 10,
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
