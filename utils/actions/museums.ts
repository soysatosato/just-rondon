"use server";

import db from "../db";

export const fetchMuseums = async ({
  search = "",
}: { search?: string } = {}) => {
  const museums = await db.museum.findMany({
    where: {
      name: {
        contains: search,
        mode: "insensitive", // 大文字小文字を無視
      },
    },
    orderBy: [{ recommendLevel: "desc" }, { createdAt: "asc" }],
  });
  return museums;
};

/**
 * /museums ハブが必要とするものを1往復でまとめて取る。
 * ハイライトは recommendLevel 5 の先頭6件で、10選ページの部分集合。
 */
export async function fetchMuseumsHubData() {
  const [topMuseums, totalCount, freeCount, kidsCount] = await Promise.all([
    db.museum.findMany({
      where: { recommendLevel: 5 },
      orderBy: { createdAt: "asc" },
      take: 6,
      select: {
        id: true,
        name: true,
        slug: true,
        tagline: true,
        price: true,
        address: true,
        image: true,
      },
    }),
    db.museum.count(),
    db.museum.count({ where: { price: 0 } }),
    db.museum.count({ where: { isForChildren: true } }),
  ]);

  return { topMuseums, totalCount, freeCount, kidsCount };
}

/**
 * 一覧ページ用。全件を一度に返し、絞り込みはクライアント側で行う(47件なので十分軽い)。
 *
 * highlights と summary まで取るのは、カードに置くタグと、収蔵品名での
 * 検索(「恐竜」「ゴッホ」「マグナカルタ」)に使うため。館名しか引けないと、
 * 何が置いてあるかを知らない読者はその館に辿り着けない。
 * description(本文)は重いので含めない。
 */
export async function fetchAllMuseums() {
  return db.museum.findMany({
    orderBy: [{ recommendLevel: "desc" }, { createdAt: "asc" }],
    select: {
      id: true,
      name: true,
      engName: true,
      slug: true,
      tagline: true,
      summary: true,
      highlights: true,
      price: true,
      address: true,
      image: true,
      lat: true,
      lng: true,
      recommendLevel: true,
      isForChildren: true,
      views: true,
      museumInfo: {
        select: { recommendedDuration: true, nearestStation: true },
      },
    },
  });
}

export const fetchMuseumIDandName = async (slug: string) => {
  const museum = await db.museum.findUnique({
    where: {
      slug,
    },
    select: {
      id: true,
      name: true,
    },
  });
  return museum;
};
export const fetchTop10Museums = async () => {
  const museums = await db.museum.findMany({
    where: {
      recommendLevel: 5,
    },
    orderBy: {
      createdAt: "asc",
    },
  });
  return museums;
};
export const fetchKidsMuseums = async () => {
  const museums = await db.museum.findMany({
    where: {
      isForChildren: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });
  return museums;
};

export const fetchMuseumDetailsBySlug = (slug: string) => {
  return db.museum.findUnique({
    where: {
      slug,
    },
    include: {
      openingHours: true,
      museumInfo: true,
      exhibition: true,
      trivia: true,
      highlightSpots: { orderBy: { order: "asc" } },
      visitFlow: { orderBy: { displayOrder: "asc" } },
      artworks: {
        where: {
          recommendLevel: 3,
          mustSee: true,
        },
        select: {
          id: true,
          title: true,
          artist: true,
          year: true,
          description: true,
          image: true,
        },
      },
    },
  });
};

// export const createMuseumReviewAction = async (
//   prevState: any,
//   formData: FormData
// ) => {
//   const user = await getAuthUser();
//   try {
//     const rawData = Object.fromEntries(formData);
//     const validatedFields = validateWithZodSchema(
//       createReviewMuseumSchema,
//       rawData
//     );
//     await db.reviewMuseum.create({
//       data: {
//         ...validatedFields,
//         profileId: user.id,
//       },
//     });
//     revalidatePath(`/museums/${rawData.museumSlug}`);
//     return { message: "Review added successfully" };
//   } catch (error) {
//     return renderError(error);
//   }
// };

// export const fetchMuseumReviews = async (museumId: string) => {
//   const reviews = await db.reviewMuseum.findMany({
//     where: { museumId },
//     select: {
//       id: true,
//       rating: true,
//       comment: true,
//       profile: {
//         select: {
//           username: true,
//           profileImage: true,
//         },
//       },
//     },
//     orderBy: {
//       createdAt: "desc",
//     },
//   });
//   return reviews;
// };

// export const fetchMuseumReviewsByUser = async () => {
//   const user = await getAuthUser();
//   const reviews = await db.reviewMuseum.findMany({
//     where: { profileId: user.id },
//     select: {
//       id: true,
//       rating: true,
//       comment: true,
//       museum: {
//         select: {
//           name: true,
//           image: true,
//         },
//       },
//     },
//     orderBy: {
//       createdAt: "desc",
//     },
//   });

//   return reviews;
// };

// export const deleteMuseumReviewAction = async (prevState: {
//   reviewId: string;
// }) => {
//   const { reviewId } = prevState;
//   const user = await getAuthUser();
//   try {
//     await db.reviewMuseum.delete({
//       where: { id: reviewId, profileId: user.id },
//     });
//     revalidatePath("/reviews");
//     return { message: "Review deleted successfully" };
//   } catch (error) {
//     return renderError(error);
//   }
// };

// export async function fetchMuseumRating(museumId: string) {
//   const result = await db.reviewMuseum.groupBy({
//     by: ["museumId"],
//     _avg: {
//       rating: true,
//     },
//     _count: {
//       rating: true,
//     },
//     where: {
//       museumId,
//     },
//   });
//   return {
//     rating: result[0]?._avg.rating?.toFixed(1) ?? 0,
//     count: result[0]?._count.rating ?? 0,
//   };
// }

// export const findExistingMuseumReview = async (
//   userId: string,
//   museumId: string
// ) => {
//   return db.reviewMuseum.findFirst({
//     where: {
//       profileId: userId,
//       museumId: museumId,
//     },
//   });
// };

export const fetchArtworks = async (museumId: string) => {
  // 一覧ページ用。description まで取ると1館200件超で数十万字を
  // ページの payload に載せることになるので、カードに出す列だけ選ぶ。
  const artworks = await db.artwork.findMany({
    where: {
      museumId,
    },
    select: {
      id: true,
      title: true,
      engTitle: true,
      artist: true,
      year: true,
      room: true,
      image: true,
      mustSee: true,
      recommendLevel: true,
      highlights: true,
    },
    orderBy: {
      room: "asc",
    },
  });
  return artworks;
};

/**
 * 作品一覧ページ(/museums/[slug]/artworks)の generateStaticParams 用。
 * 作品が1件も無い館に一覧を生やすと、本文の無い空ページになる。
 */
export const fetchMuseumSlugsWithArtworks = async () => {
  const museums = await db.museum.findMany({
    where: { artworks: { some: {} } },
    select: { slug: true },
  });
  return museums.map(({ slug }) => ({ slug }));
};

export const fetchArtworkDetails = (id: string) => {
  return db.artwork.findUnique({
    where: {
      id,
    },
    include: {
      museum: {
        select: { name: true },
      },
    },
  });
};

