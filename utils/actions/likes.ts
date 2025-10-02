"use server";

import db from "../db";
import { revalidatePath } from "next/cache";
import { getAuthUser, renderError } from "./museums";

export const fetchMuseumFavoriteId = async ({
  museumId,
}: {
  museumId: string;
}) => {
  const user = await getAuthUser();
  const favorite = await db.favoriteMuseum.findFirst({
    where: { museumId, profileId: user.id },
    select: { id: true },
  });
  return favorite?.id || null;
};
export const fetchHasVisitedId = async ({ museumId }: { museumId: string }) => {
  const user = await getAuthUser();
  const favorite = await db.hasVisited.findFirst({
    where: { museumId, profileId: user.id },
    select: { id: true },
  });
  return favorite?.id || null;
};

export const fetchArtworkFavoriteId = async ({
  artworkId,
}: {
  artworkId: string;
}) => {
  const user = await getAuthUser();
  const favorite = await db.favoriteArtwork.findFirst({
    where: { artworkId, profileId: user.id },
    select: { id: true },
  });
  return favorite?.id || null;
};

export const toggleMuseumFavoriteAction = async (prevState: {
  museumId: string;
  favoriteId: string | null;
  pathname: string;
}) => {
  const { museumId, favoriteId, pathname } = prevState;
  const user = await getAuthUser();

  // データベースに通信する処理なので、例外発生時の対応として try-catch を使う。
  try {
    if (favoriteId) {
      await db.favoriteMuseum.delete({
        where: {
          id: favoriteId,
        },
      });
    } else {
      await db.favoriteMuseum.create({
        data: {
          museumId,
          profileId: user.id,
        },
      });
    }
    revalidatePath(pathname);
    return {
      message: favoriteId ? "Removed from favorites" : "Added to favorites",
    };

    // お気に入りの変更があったページを再生成し、最新状態に更新する
  } catch (error) {
    return renderError(error);
  }
};
export const togglehasVisitedAction = async (prevState: {
  museumId: string;
  favoriteId: string | null;
  pathname: string;
}) => {
  const { museumId, favoriteId, pathname } = prevState;
  const user = await getAuthUser();

  // データベースに通信する処理なので、例外発生時の対応として try-catch を使う。
  try {
    if (favoriteId) {
      await db.hasVisited.delete({
        where: {
          id: favoriteId,
        },
      });
    } else {
      await db.hasVisited.create({
        data: {
          museumId,
          profileId: user.id,
        },
      });
    }
    revalidatePath(pathname);
    return {
      message: favoriteId ? "Removed" : "Added",
    };

    // お気に入りの変更があったページを再生成し、最新状態に更新する
  } catch (error) {
    return renderError(error);
  }
};
export const toggleArtworkFavoriteAction = async (prevState: {
  artworkId: string;
  favoriteId: string | null;
  pathname: string;
}) => {
  const { artworkId, favoriteId, pathname } = prevState;
  const user = await getAuthUser();

  try {
    if (favoriteId) {
      await db.favoriteArtwork.delete({
        where: {
          id: favoriteId,
        },
      });
    } else {
      await db.favoriteArtwork.create({
        data: {
          artworkId,
          profileId: user.id,
        },
      });
    }
    revalidatePath(pathname);
    return {
      message: favoriteId ? "Removed from favorites" : "Added to favorites",
    };
  } catch (error) {
    return renderError(error);
  }
};

export const fetchMuseumFavorites = async () => {
  const user = await getAuthUser();
  const favorites = await db.favoriteMuseum.findMany({
    where: {
      profileId: user.id,
    },
    select: {
      museum: true,
    },
  });
  return favorites;
};

export const fetchArtworkFavorites = async () => {
  const user = await getAuthUser();
  const favorites = await db.favoriteArtwork.findMany({
    where: {
      profileId: user.id,
    },
    include: {
      artwork: true,
    },
  });
  return favorites.map((fav) => fav.artwork);
};

type ToggleFavoriteParams = {
  type: "museum" | "artwork" | "visited";
  targetId: string; // museumId or artworkId
  favoriteId: string | null;
  pathname: string;
};

export const toggleFavoriteUnifiedAction = async (
  prevState: ToggleFavoriteParams
): Promise<{ message: string }> => {
  const { type, targetId, favoriteId, pathname } = prevState;
  const user = await getAuthUser();

  try {
    if (favoriteId) {
      switch (type) {
        case "museum":
          await db.favoriteMuseum.delete({ where: { id: favoriteId } });
          break;
        case "artwork":
          await db.favoriteArtwork.delete({ where: { id: favoriteId } });
          break;
        case "visited":
          await db.hasVisited.delete({ where: { id: favoriteId } });
          break;
        default:
          throw new Error("Unknown toggle type");
      }
    } else {
      switch (type) {
        case "museum":
          await db.favoriteMuseum.create({
            data: {
              museumId: targetId,
              profileId: user.id,
            },
          });
          break;
        case "artwork":
          await db.favoriteArtwork.create({
            data: {
              artworkId: targetId,
              profileId: user.id,
            },
          });
          break;
        case "visited":
          await db.hasVisited.create({
            data: {
              museumId: targetId,
              profileId: user.id,
            },
          });
          break;
        default:
          throw new Error("Unknown toggle type");
      }
    }

    revalidatePath(pathname);

    return {
      message: favoriteId
        ? type === "visited"
          ? "訪問記録を削除しました"
          : "お気に入りから削除しました"
        : type === "visited"
        ? "訪問済みに追加しました"
        : "お気に入りに追加しました",
    };
  } catch (error) {
    return renderError(error);
  }
};
