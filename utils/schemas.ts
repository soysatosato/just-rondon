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

export const museumFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  tagline: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  highlights: z.preprocess((val) => {
    if (typeof val === "string") {
      try {
        return JSON.parse(val); // ← JSON文字列を配列に変換
      } catch {
        return []; // パースできなかったら空配列などに
      }
    }
    return val;
  }, z.array(z.string())),
  price: z.coerce.number().min(0, "Price must be positive"),
  tourPrice: z.coerce.number().min(0, "Price must be positive"),
  address: z.string().min(1, "Address is required"),
  lat: z.coerce
    .number()
    .min(-90)
    .max(90, "Latitude must be between -90 and 90"),
  lng: z.coerce
    .number()
    .min(-180)
    .max(180, "Longitude must be between -180 and 180"),
  website: z.url().optional().nullable(),
});

export const artworkFormSchema = z.object({
  id: z.string().optional(), // 新規作成時は省略可能
  title: z.string().min(1, "タイトルは必須です"),
  artist: z.string().optional().nullable(),
  year: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  room: z.string().optional().nullable(),
  highlights: z.preprocess((val) => {
    if (typeof val === "string") {
      try {
        return JSON.parse(val); // ← JSON文字列を配列に変換
      } catch {
        return []; // パースできなかったら空配列などに
      }
    }
    return val;
  }, z.array(z.string())),
  description: z.string().optional().nullable(),
  isOnDisplay: z.coerce.boolean().default(true),
  museumId: z.string(),
  recommendLevel: z.coerce.number().int().min(0).max(3).default(0),
  mustSee: z.coerce.boolean().default(false),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

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

export const museumInfoSchema = z.object({
  id: z.string().optional(), // update時のみ使用

  museumId: z.string().min(1, "博物館IDは必須です"),

  admissionFeeAdult: z.coerce.number().min(0).optional(),
  admissionFeeStudent: z.coerce.number().min(0).optional(),
  admissionFeeChild: z.coerce.number().min(0).optional(),

  photographyAllowed: z.string().optional(),
  recommendedDuration: z.coerce.number().int().min(0).optional(),

  reservationRequired: z.coerce.boolean().optional(),

  cloakroomInfo: z.string().optional(),

  nearestStation: z.string().optional(),
  stationWalkingMinutes: z.coerce.number().int().min(0).optional(),

  nearestBusStop: z.string().optional(),
  busStopWalkingMinutes: z.coerce.number().int().min(0).optional(),

  guidedTourAvailable: z.coerce.boolean().optional(),
  guidedTourFee: z.coerce.number().min(0).optional(),
  guidedTourLanguages: z.string().optional(),

  cafeteriaAvailable: z.coerce.boolean().optional().default(true),
  shopAvailable: z.coerce.boolean().optional().default(true),
  wifiAvailable: z.coerce.boolean().optional().default(true),

  website: z.url("URLの形式が正しくありません").optional(),
});

export const museumTriviaSchema = z.object({
  id: z.string().optional(), // 編集時のみ存在
  museumId: z.string().min(1, "博物館IDが必要です"),
  title: z.string().min(1, "タイトルを入力してください"),
  content: z.string().min(1, "内容を入力してください"),
});

export const museumExhibitionSchema = z.object({
  id: z.string().optional(), // 編集時のみ使用
  museumId: z.string().min(1, "博物館IDは必須です"),
  name: z.string().min(1, "展示会名は必須です"),
  description: z.string().min(1, "説明は必須です"),
  startDate: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "開始日は有効な日付である必要があります",
    })
    .transform((val) => new Date(`${val}T00:00:00.000Z`)),
  endDate: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "開始日は有効な日付である必要があります",
    })
    .transform((val) => new Date(`${val}T00:00:00.000Z`)),
  admission: z.coerce.number().min(0, "料金は必須です"),
});

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
