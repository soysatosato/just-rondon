"use server";
import { revalidatePath } from "next/cache";
import db from "../db";

export async function markTweetPosted(id: string) {
  await db.tweetDraft.update({
    where: { id },
    data: { status: "posted", postedAt: new Date() },
  });
  revalidatePath("/tweets");
}

export async function markTweetRejected(id: string) {
  await db.tweetDraft.update({
    where: { id },
    data: { status: "rejected" },
  });
  revalidatePath("/tweets");
}
