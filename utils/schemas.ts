import * as z from "zod";
import { isValidLastPaidOn } from "@/lib/jobs/claim-deadline";

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

/** 任意の入力欄。空欄は undefined にする(DB には NULL で入る)。 */
const optionalText = (max: number, label: string) =>
  z
    .string()
    .trim()
    .max(max, `${label}は${max}文字以内で入力してください`)
    .transform((val) => val || undefined)
    .optional();

/** サービスチャージの相談フォーム(utils/actions/consult.ts)。 */
export const consultationSchema = z.object({
  employment: z.enum(["employed", "left"], {
    error: "いまの状況を選んでください",
  }),
  lastPaidOn: z
    .string()
    .optional()
    .transform((val) => val || undefined)
    .refine((val) => val === undefined || isValidLastPaidOn(val), {
      message: "未来の日付は入力できません",
    }),
  acas: z.enum(["not_yet", "started", "certificate"], {
    error: "Acasへの連絡の状況を選んでください",
  }),
  chargeRate: optionalText(50, "サービスチャージの率"),
  sharing: optionalText(200, "還元のされ方"),
  message: z
    .string()
    .trim()
    .min(10, "相談したいことは10文字以上で入力してください")
    .max(3000, "相談したいことは3000文字以内で入力してください"),
  nickname: optionalText(50, "呼び名"),
  email: z.string().email("正しいメールアドレスを入力してください"),
  publishOk: z
    .string()
    .optional()
    .transform((val) => val === "on"),
});
