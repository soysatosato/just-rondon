"use server";

import {
  // createReviewMuseumSchema,
  imageSchema,
  profileSchema,
  validateWithZodSchema,
} from "../schemas";
import db from "../db";
import { clerkClient, currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { uploadImage } from "../supabase";

export const getAuthUser = async () => {
  const user = await currentUser();
  if (!user) throw new Error("You must be logged in to access this route.");
  if (!user.privateMetadata.hasProfile) redirect("/profile/create");
  return user;
};

export const renderError = (error: unknown): { message: string } => {
  return {
    message: error instanceof Error ? error.message : "An error occurred.",
  };
};

export const createProfileAction = async (
  prevState: any,
  formData: FormData
) => {
  try {
    const user = await currentUser();

    if (!user) throw new Error("Please login to create a profile");

    const rawData = Object.fromEntries(formData);
    const validatedFields = validateWithZodSchema(profileSchema, rawData);

    const existing = await db.profile.findUnique({
      where: { username: validatedFields.username },
    });

    if (existing) {
      return {
        error: "This username is already taken.",
      };
    }

    await db.profile.create({
      data: {
        clerkId: user.id,
        email: user.emailAddresses[0].emailAddress,
        profileImage: user.imageUrl || "",
        ...validatedFields,
      },
    });
    await clerkClient.users.updateUserMetadata(user.id, {
      privateMetadata: {
        hasProfile: true,
      },
    });
  } catch (error) {
    return renderError(error);
  }
  redirect("/");
};

export const fetchProfileImage = async () => {
  const user = await currentUser();
  if (!user) return null;

  const profile = await db.profile.findUnique({
    where: {
      clerkId: user.id,
    },
    select: {
      profileImage: true,
    },
  });

  return profile?.profileImage;
};

export const fetchProfile = async () => {
  const user = await getAuthUser();
  const profile = await db.profile.findUnique({
    where: {
      clerkId: user.id,
    },
  });
  if (!profile) redirect("/profile/create");
  return profile;
};

export const updateProfileAction = async (
  prevState: any,
  formData: FormData
): Promise<{ message: string }> => {
  const user = await getAuthUser();

  try {
    const rawData = Object.fromEntries(formData.entries());
    const validatedFields = validateWithZodSchema(profileSchema, rawData);
    await db.profile.update({
      where: { clerkId: user.id },
      data: validatedFields,
    });

    revalidatePath("/profile");

    return { message: "Profile updated successfully" };
  } catch (error) {
    return renderError(error);
  }
};

export const updateProfileImageAction = async (
  prevState: any,
  formData: FormData
): Promise<{ message: string }> => {
  const user = await getAuthUser();
  try {
    const image = formData.get("image") as File;
    const validatedFields = validateWithZodSchema(imageSchema, { image });
    const fullPath = await uploadImage(validatedFields.image);
    await db.profile.update({
      where: {
        clerkId: user.id,
      },
      data: {
        profileImage: fullPath,
      },
    });
    revalidatePath("/profile");
    return { message: "Profile image updated successfully." };
  } catch (error) {
    return renderError(error);
  }
};

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

// utils/actions/museums.ts
export async function fetchMuseumsStep10({
  page = 1,
  limit = 10,
}: { page?: number; limit?: number } = {}) {
  const offset = (page - 1) * limit;

  // ミュージアムを10件ずつ取得
  const museums = await db.museum.findMany({
    orderBy: [{ recommendLevel: "desc" }, { createdAt: "asc" }],
    take: limit,
    skip: offset,
  });

  // 総件数も取得（ページネーション用）
  const total = await db.museum.count();

  return { museums, total };
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
export const fetchTop25Museums = async () => {
  const museums = await db.museum.findMany({
    where: {
      recommendLevel: {
        gte: 4,
      },
    },
    orderBy: [{ recommendLevel: "desc" }, { createdAt: "asc" }],
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
  const artworks = await db.artwork.findMany({
    where: {
      museumId,
    },
    orderBy: {
      room: "asc",
    },
  });
  return artworks;
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

