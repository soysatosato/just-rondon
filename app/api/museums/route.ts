import { type NextRequest } from "next/server";
import db from "@/utils/db";

export const GET = async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);

  const search = searchParams.get("search") || "";
  const freeOnly = searchParams.get("freeOnly") === "true";

  const where: any = {};

  if (search) {
    where.name = {
      contains: search,
      mode: "insensitive", // 大文字小文字区別なし
    };
  }

  if (freeOnly) {
    where.price = 0;
  }

  const museums = await db.museum.findMany({
    where,
    orderBy: {
      name: "asc",
    },
  });

  return Response.json(museums);
};
