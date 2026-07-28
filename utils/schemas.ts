import * as z from "zod";

export const profileSchema = z.object({
  username: z
    .string()
    .min(4, { message: "Username must be at least 4 characters" }),
});

export function validateWithZodSchema<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): T {
  const result = schema.safeParse(data);

  if (!result.success) {
    console.log("Validation errors detail:", result.error.format());
    const message = result.error.issues.map((e) => e.message).join("; ");
    console.log(message);
    throw new Error(message);
  }

  return result.data;
}

export const imageSchema = z.object({
  image: validateFile(),
});

function validateFile() {
  const maxUploadSize = 1024 * 1024 * 100;
  const acceptedFileTypes = ["image/"];
  return z
    .any()
    .refine((file) => {
      return !file || file.size <= maxUploadSize;
    }, "File size must be less than 100 MB")
    .refine((file) => {
      return (
        !file || acceptedFileTypes.some((type) => file.type.startsWith(type))
      );
    }, "File must be an image");
}

// export const createReviewMuseumSchema = z.object({
//   museumId: z.string(),
//   rating: z.coerce.number().int().min(1).max(5),
//   comment: z
//     .string()
//     .trim()
//     .min(4, {
//       message: "コメントは4文字以上で入力してください。",
//     })
//     .max(300, {
//       message: "コメントは300文字以内で入力してください。",
//     }),
// });

// export const createReviewArtworkSchema = z.object({
//   artworkId: z.string(),
//   rating: z.coerce.number().int().min(1).max(5),
//   comment: z
//     .string()
//     .trim()
//     .min(4, {
//       message: "コメントは4文字以上で入力してください。",
//     })
//     .max(300, {
//       message: "コメントは300文字以内で入力してください。",
//     }),
// });

export const postSchema = z.object({
  author: z
    .string()
    .transform((val) => val.trim().slice(0, 10))
    .refine((val) => val.length > 0, {
      message: "必須項目を入力してください",
    }),
  title: z
    .string()
    .trim()
    .min(1, "必須項目を入力してください")
    .max(100, "100字以内で入力してください"),
  content: z
    .string()
    .trim()
    .min(1, "必須項目を入力してください")
    .max(2000, "2000字以内で入力してください"),
  deletePsswrd: z
    .string()
    .trim()
    .length(4, "削除パスワードは4文字ちょうどで入力してください"),
});

export const commentSchema = z.object({
  postId: z.string().min(1, "postId が不正です"),
  parentId: z.preprocess(
    (v) => (v === "" || v === undefined || v === null ? null : String(v)),
    z.string().nullable()
  ),
  content: z
    .string()
    .trim()
    .min(1, "内容を入力してください")
    .max(2000, "2000文字以内で入力してください"),
  author: z
    .string()
    .transform((val) => val.trim().slice(0, 10))
    .refine((val) => val.length > 0, {
      message: "必須項目を入力してください",
    }),
});

export const contactSchema = z.object({
  name: z
    .string()
    .min(1, "お名前を入力してください")
    .max(100, "お名前は100文字以内で入力してください"),
  email: z.string().email("正しいメールアドレスを入力してください"),
  message: z
    .string()
    .min(10, "お問い合わせ内容は10文字以上入力してください")
    .max(1000, "お問い合わせ内容は1000文字以内で入力してください"),
});
