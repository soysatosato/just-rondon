"use server";

import {
  artworkFormSchema,
  // createReviewMuseumSchema,
  imageSchema,
  museumExhibitionSchema,
  museumFormSchema,
  museumInfoSchema,
  museumTriviaSchema,
  profileSchema,
  validateWithZodSchema,
} from "../schemas";
import db from "../db";
import { clerkClient, currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { uploadImage } from "../supabase";
import { formatDate } from "../format";

export const getAuthUser = async () => {
  const user = await currentUser();
  if (!user) throw new Error("You must be logged in to access this route.");
  if (!user.privateMetadata.hasProfile) redirect("/profile/create");
  return user;
};

export const getAdminUser = async () => {
  const user = await getAuthUser();
  const isAdmin = user.id === process.env.ADMIN_USER_ID;
  if (!isAdmin) redirect("/");
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

type IncomingHour = {
  day: string;
  open: string | null;
  close: string | null;
  closed: boolean;
};

function transformOpeningHours(jsonStr: string, museumId: string) {
  const rawHours: IncomingHour[] = JSON.parse(jsonStr);

  const validHours = rawHours.map((h) => ({
    museumId,
    dayOfWeek: h.day,
    openTime: h.open,
    closeTime: h.close,
  }));

  return validHours;
}
export const createMuseumAction = async (
  prevState: any,
  formData: FormData
): Promise<{ message: string }> => {
  await getAdminUser();
  try {
    const rawData = Object.fromEntries(formData);
    const openingHoursJson = rawData.openingHours?.toString() ?? "[]";
    const validatedFields = validateWithZodSchema(museumFormSchema, rawData);
    const file = formData.get("image") as File;
    const validatedFile = validateWithZodSchema(imageSchema, { image: file });
    const fullPath = await uploadImage(validatedFile.image);
    const museum = await db.museum.create({
      data: { ...validatedFields, image: fullPath },
    });
    const openingData = transformOpeningHours(openingHoursJson, museum.id);
    await db.openingHours.createMany({
      data: openingData,
    });
    return { message: "uploaded" };
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

export const updateMuseumAction = async (
  prevState: any,
  formData: FormData
): Promise<{ message: string }> => {
  await getAdminUser();
  const museumId = formData.get("id") as string;

  try {
    const rawData = Object.fromEntries(formData);
    const validatedFields = validateWithZodSchema(museumFormSchema, rawData);
    await db.museum.update({
      where: {
        id: museumId,
      },
      data: {
        ...validatedFields,
      },
    });
    const openingHoursJson = rawData.openingHours?.toString() ?? "[]";
    const openingData = transformOpeningHours(openingHoursJson, museumId);
    await db.openingHours.deleteMany({
      where: { museumId },
    });
    await db.openingHours.createMany({
      data: openingData,
    });

    revalidatePath(`/rentals/${museumId}/edit`);
    return { message: "Updated" };
  } catch (error) {
    return renderError(error);
  }
};

export const updateMuseumImageAction = async (
  prevState: any,
  formData: FormData
): Promise<{ message: string }> => {
  await getAdminUser();
  const museumId = formData.get("id") as string;

  try {
    const image = formData.get("image") as File;
    const validatedFields = validateWithZodSchema(imageSchema, { image });
    const fullPath = await uploadImage(validatedFields.image);

    await db.museum.update({
      where: {
        id: museumId,
      },
      data: {
        image: fullPath,
      },
    });
    revalidatePath(`/admin/museum/${museumId}/edit`);
    return { message: "Museum Image Updated Successful" };
  } catch (error) {
    return renderError(error);
  }
};

export const fetchMuseumDetails = (id: string) => {
  return db.museum.findUnique({
    where: {
      id,
    },
    include: {
      openingHours: true,
    },
  });
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

export const createArtworkAction = async (
  prevState: any,
  formData: FormData
): Promise<{ message: string }> => {
  await getAdminUser();
  try {
    const rawData = Object.fromEntries(formData);
    const validatedFields = validateWithZodSchema(artworkFormSchema, rawData);
    const file = formData.get("image") as File;
    const validatedFile = validateWithZodSchema(imageSchema, { image: file });
    const fullPath = await uploadImage(validatedFile.image);
    console.log(fullPath);
    await db.artwork.create({
      data: { ...validatedFields, image: fullPath },
    });
    return { message: "" };
  } catch (error) {
    return renderError(error);
  }
  // redirect("/");
};

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

export const updateArtworkAction = async (
  prevState: any,
  formData: FormData
): Promise<{ message: string }> => {
  const artworkId = formData.get("id") as string;

  try {
    const rawData = Object.fromEntries(formData);
    const validatedFields = validateWithZodSchema(artworkFormSchema, rawData);
    await db.artwork.update({
      where: {
        id: artworkId,
      },
      data: {
        ...validatedFields,
      },
    });

    revalidatePath(`/rentals/${artworkId}/edit`);
    return { message: "Update Successful" };
  } catch (error) {
    return renderError(error);
  }
};

export const updateArtworkImageAction = async (
  prevState: any,
  formData: FormData
): Promise<{ message: string }> => {
  const user = await getAdminUser();
  const artworkId = formData.get("id") as string;

  try {
    const file = formData.get("image") as File;
    const validatedFile = validateWithZodSchema(imageSchema, { image: file });
    const fullPath = await uploadImage(validatedFile.image);

    await db.artwork.update({
      where: {
        id: artworkId,
      },
      data: {
        image: fullPath,
      },
    });
    revalidatePath(`/admin/artwork/${artworkId}/edit`);
    return { message: "Artwork Image Updated Successful" };
  } catch (error) {
    return renderError(error);
  }
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

export const handleMuseumInfoAction = async (
  prevState: any,
  formData: FormData
) => {
  try {
    const rawData = Object.fromEntries(formData);
    const validatedFields = validateWithZodSchema(museumInfoSchema, rawData);

    if (validatedFields.id) {
      // すでに存在 → 更新処理
      await db.museumInfo.update({
        where: { id: validatedFields.id },
        data: { ...validatedFields },
      });
    } else {
      // idなし → 新規作成処理
      const { id, ...dataWithoutId } = validatedFields;
      await db.museumInfo.create({
        data: dataWithoutId,
      });
    }
    revalidatePath(`/admin/museum/${validatedFields.museumId}`);
    return { message: "Musium Info Updated Successful" };
  } catch (error) {
    return renderError(error);
  }
};

export const fetchMuseumInfo = (id: string) => {
  return db.museumInfo.findFirst({
    where: {
      museumId: id,
    },
  });
};

export async function handleTriviaAction(prevState: any, formData: FormData) {
  try {
    const rawData = Object.fromEntries(formData);
    const validatedFields = validateWithZodSchema(museumTriviaSchema, rawData);

    if (validatedFields.id) {
      // update
      await db.trivia.update({
        where: { id: validatedFields.id },
        data: { ...validatedFields },
      });
    } else {
      // create
      await db.trivia.create({
        data: { ...validatedFields },
      });
    }
    redirect(`/admin/museum/${validatedFields.museumId}/museumTrivia`);
  } catch (error) {
    return renderError(error);
  }
}

export const fetchMuseumTrivias = (id: string) => {
  return db.trivia.findMany({
    where: {
      museumId: id,
    },
  });
};
export const fetchMuseumTrivia = (id: string) => {
  return db.trivia.findUnique({
    where: {
      id,
    },
  });
};

export async function handleExhibitionAction(
  prevState: any,
  formData: FormData
) {
  try {
    const rawData = Object.fromEntries(formData);
    const validatedFields = validateWithZodSchema(
      museumExhibitionSchema,
      rawData
    );

    if (validatedFields.id) {
      // update
      await db.exhibition.update({
        where: { id: validatedFields.id },
        data: { ...validatedFields },
      });
    } else {
      // create
      await db.exhibition.create({
        data: { ...validatedFields },
      });
    }
    redirect(`/admin/museum/${validatedFields.museumId}/museumExhibition`);
  } catch (error) {
    return renderError(error);
  }
}

export const fetchMuseumExhibitions = (id: string) => {
  return db.exhibition.findMany({
    where: {
      museumId: id,
    },
  });
};
export const fetchMuseumExhibition = (id: string) => {
  return db.exhibition.findUnique({
    where: {
      id,
    },
  });
};
