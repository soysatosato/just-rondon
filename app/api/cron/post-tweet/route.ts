import { type NextRequest } from "next/server";
import db from "@/utils/db";
import { postTweet } from "@/lib/x-post";

export const GET = async (req: NextRequest) => {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const draft = await db.tweetDraft.findFirst({
    where: { status: "draft" },
    orderBy: { createdAt: "asc" },
  });

  if (!draft) {
    return Response.json({ posted: false, reason: "no draft available" });
  }

  try {
    const { id: tweetId } = await postTweet(draft.body);
    await db.tweetDraft.update({
      where: { id: draft.id },
      data: { status: "posted", postedAt: new Date() },
    });
    return Response.json({ posted: true, draftId: draft.id, tweetId });
  } catch (e) {
    await db.tweetDraft.update({
      where: { id: draft.id },
      data: { status: "failed" },
    });
    console.error("Failed to post tweet", draft.id, e);
    return Response.json(
      { posted: false, draftId: draft.id, error: String(e) },
      { status: 500 }
    );
  }
};
