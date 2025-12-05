"use server";

import db from "../db";

export const fetchChristmasMarkets = async () => {
  const contents = await db.content.findMany({
    where: { category: "christmas-market" },
    include: { sections: true },
  });

  return contents;
};

export const fetchChristmasMarketBySlug = async (slug: string) => {
  const content = await db.content.findFirst({
    where: { category: "christmas-market", slug },
    include: { sections: true },
  });

  return content;
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

export const fetchThamesRiverCruises = async () => {
  const contents = await db.content.findMany({
    where: { category: "thames-cruise" },
    include: { sections: true },
  });

  return contents;
};

export const fetchStadiumTours = async () => {
  const contents = await db.content.findMany({
    where: { category: "stadium-tour" },
    include: { sections: true },
  });

  return contents;
};

export const fetchContentBySlug = async (slug: string) => {
  const content = await db.content.findFirst({
    where: { slug },
    include: { sections: { orderBy: { displayOrder: "asc" } } },
  });
  return content;
};
