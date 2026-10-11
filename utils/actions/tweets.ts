"use server";
import { revalidatePath } from "next/cache";
import db from "../db";
import { isAdminSession } from "@/lib/admin";

// /tweets の操作。アクションは画面を通さず直接呼べるので、毎回確かめる。
// 必ず await すること。忘れると例外が宙に浮き、下の更新はそのまま走る。
async function assertAdmin() {
  if (!(await isAdminSession())) throw new Error("Not found");
}

export async function markTweetPosted(id: string) {
  await assertAdmin();
  await db.tweetDraft.update({
    where: { id },
    data: { status: "posted", postedAt: new Date() },
  });
  revalidatePath("/tweets");
}

export async function markTweetRejected(id: string) {
  await assertAdmin();
  await db.tweetDraft.update({
    where: { id },
    data: { status: "rejected" },
  });
  revalidatePath("/tweets");
}
