"use server";

import { revalidatePath } from "next/cache";
import db from "../db";
import { commentSchema, postSchema } from "../schemas";
import { renderError } from "./museums";
import { redirect } from "next/navigation";

type VoteTarget = "post" | "comment";

export async function vote({
  id,
  type,
  target,
}: {
  id: string;
  type: "up" | "down";
  target: VoteTarget;
}) {
  if (!id || !["up", "down"].includes(type)) {
    throw new Error("Invalid request");
  }

  let updated;

  if (target === "post") {
    updated = await db.post.update({
      where: { id },
      data: { votes: type === "up" ? { increment: 1 } : { decrement: 1 } },
    });
    revalidatePath(`/chatboard/${id}`);
  } else if (target === "comment") {
    updated = await db.comment.update({
      where: { id },
      data: { votes: type === "up" ? { increment: 1 } : { decrement: 1 } },
    });
    revalidatePath(`/chatboard/${updated.postId}`);
  }

  return updated;
}

export const createPostAction = async (prevState: any, formData: FormData) => {
  const data = Object.fromEntries(formData.entries());
  const parsed = postSchema.parse(data);
  try {
    await db.post.create({
      data: parsed,
    });
    redirect("/chatboard");
    // return { message: "Post created successfully" };
  } catch (error) {
    return renderError(error);
  }
};

export const fetchPosts = async ({
  page = 1,
  limit = 10,
}: {
  page?: number;
  limit?: number;
}) => {
  const skip = (page - 1) * limit;

  const posts = await db.post.findMany({
    orderBy: { createdAt: "desc" },
    skip,
    take: limit,
    include: {
      _count: {
        select: { comments: true },
      },
    },
  });

  const total = await db.post.count();

  return { posts, total };
};

export const fetchPostTitle = async (id: string) => {
  const existingPost = await db.post.findUnique({
    where: { id },
    select: { title: true },
  });

  if (!existingPost) {
    return null;
  }
  return existingPost;
};

export const fetchPostDetails = async (id: string) => {
  const existingPost = await db.post.findUnique({
    where: { id },
  });

  if (!existingPost) {
    return null;
  }

  const post = await db.post.update({
    where: { id },
    data: {
      views: { increment: 1 },
    },
    include: {
      comments: {
        where: { parentId: null },
        orderBy: { createdAt: "desc" },
        include: {
          children: {
            orderBy: { createdAt: "asc" },
            include: { children: { orderBy: { createdAt: "asc" } } },
          }, // 子コメントもネスト
        },
      },
    },
  });
  return post;
};

export const createCommentAction = async (
  prevState: any,
  formData: FormData
) => {
  const data = Object.fromEntries(formData.entries());
  const parsed = commentSchema.parse(data);
  try {
    await db.comment.create({
      data: parsed,
    });

    revalidatePath(`/chatboard/${parsed.postId}`);
    return { message: "コメントが投稿されました" };
  } catch (error) {
    return renderError(error);
  }
};

export const DeletePostAction = async (prevState: any, formData: FormData) => {
  const data = Object.fromEntries(formData.entries());
  const postId = data.postId as string;
  const deletePsswrd = data.deletePsswrd as string;

  try {
    const post = await db.post.findUnique({ where: { id: postId } });
    if (!post) throw new Error("投稿が見つかりません");

    if (deletePsswrd !== post.deletePsswrd) {
      throw new Error("パスワードが違います");
    }

    await db.post.delete({
      where: { id: postId },
    });

    revalidatePath("/chatboard");
    redirect("/chatboard");
  } catch (error) {
    return renderError(error);
  }
};

export const fetchAllMatome = async ({
  page = 1,
  limit = 10,
  take,
}: {
  page?: number;
  limit?: number;
  take?: number;
} = {}) => {
  const finalLimit = take ?? limit;
  const total = await db.reddit.count();

  // ページごとの取得
  const reddits = await db.reddit.findMany({
    skip: (page - 1) * limit,
    take: finalLimit,
    orderBy: [{ postedAt: "desc" }],
    include: { posts: true },
  });

  return { reddits, total };
};

export const fetchMatome = async (id: string) => {
  const matome = await db.reddit.findUnique({
    where: { id },
    include: {
      posts: {
        orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
      },
    },
  });
  return matome;
};
