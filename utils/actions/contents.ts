"use server";

import db from "../db";

export const fetchChristmasMarket = async () => {
  // ページごとの取得
  const contents = await db.content.findMany({
    where: { category: "christmas-market" },
    include: { sections: true },
  });

  return contents;
};

export const fetchKidsFreeActivities = async () => {
  const contents = await db.content.findMany({
    where: { category: "free-london-kids" },
    include: { sections: true },
  });

  return contents;
};

export const fetchRoyalActivities = async () => {
  const contents = await db.content.findMany({
    where: { category: "royal-london" },
    include: { sections: true },
  });

  return contents;
};

export const fetchHPActivities = async () => {
  const contents = await db.content.findMany({
    where: { category: "harry-potter" },
    include: { sections: true },
    orderBy: {
      createdAt: "desc",
    },
  });

  return contents;
};
