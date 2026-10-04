"use server";
import { revalidatePath } from "next/cache";
import db from "../db";
import { isAdmin } from "@/lib/admin";

// /tweets の操作。アクションは画面を通さず直接呼べるので、毎回確かめる。
function assertAdmin() {
  if (!isAdmin()) throw new Error("Not found");
}

export async function markTweetPosted(id: string) {
  assertAdmin();
  await db.tweetDraft.update({
    where: { id },
    data: { status: "posted", postedAt: new Date() },
  });
  revalidatePath("/tweets");
}

export async function markTweetRejected(id: string) {
  assertAdmin();
  await db.tweetDraft.update({
    where: { id },
    data: { status: "rejected" },
  });
  revalidatePath("/tweets");
}
