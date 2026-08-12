/**
 * 旧設問（選択式）の回答を、新設問の自由記述欄に移行する。
 *
 * アンケートの設問を入れ替えた際、賄い・労働条件・職場環境の選択式設問は
 * mealComment / generalComment の自由記述に統合された。すでに寄せられていた
 * 選択式の回答はダッシュボードに表示されなくなったため、読める形に文章化して
 * 対応する自由記述欄へ移す。
 *
 * - 自由記述が空欄なら、生成した文章をそのまま入れる
 * - すでに本人の記述がある場合は、末尾に区切りを挟んで追記する
 * - 追記済みかどうかはマーカーで判定するため、再実行しても二重に追記されない
 *
 * 使い方:
 *   npx tsx scripts/migrate-service-charge-legacy-answers.ts          # dry-run
 *   npx tsx scripts/migrate-service-charge-legacy-answers.ts --apply  # 実行
 */
import { PrismaClient } from "@prisma/client";
import {
  MEAL_RESTRICTION_LABEL,
  MEAL_DRINK_LABEL,
  SHIFT_SCHEDULE_LABEL,
  VISA_SUPPORT_LABEL,
  MANAGEMENT_PRESENCE_LABEL,
  WORK_ATMOSPHERE_LABEL,
  ETHNICITY_RATIO_LABEL,
  type MealRestriction,
  type MealDrink,
  type ShiftSchedule,
  type VisaSupport,
  type ManagementPresence,
  type WorkAtmosphere,
  type EthnicityRatio,
} from "../utils/labels";

const db = new PrismaClient();

/** 本人の記述と、移行してきた内容を見分けるための印。再実行時の重複防止も兼ねる。 */
const MARKER = "（以前の設問への回答）";

const MEAL_COUNT_LABEL: Record<string, string> = {
  "0": "賄いなし",
  "1": "1日1回",
  "2plus": "1日2回以上",
};

function buildMealText(r: {
  mealCountPerDay: string | null;
  mealRestrictions: string[];
  mealDrink: string | null;
}): string | null {
  const parts: string[] = [];

  if (r.mealCountPerDay && MEAL_COUNT_LABEL[r.mealCountPerDay]) {
    parts.push(MEAL_COUNT_LABEL[r.mealCountPerDay]);
  }

  const restrictions = (r.mealRestrictions ?? []).filter((v) => v !== "none");
  if (restrictions.length > 0) {
    parts.push(
      `提供されない食材：${restrictions
        .map((v) => MEAL_RESTRICTION_LABEL[v as MealRestriction] ?? v)
        .join("・")}`
    );
  } else if ((r.mealRestrictions ?? []).includes("none")) {
    parts.push("食材の制限は特になし");
  }

  if (r.mealDrink && MEAL_DRINK_LABEL[r.mealDrink as MealDrink]) {
    parts.push(`ドリンク：${MEAL_DRINK_LABEL[r.mealDrink as MealDrink]}`);
  }

  return parts.length > 0 ? parts.join("／") : null;
}

function buildGeneralText(r: {
  shiftSchedule: string | null;
  visaSupport: string | null;
  managementPresence: string | null;
  workAtmosphere: string | null;
  ethnicityRatio: string | null;
}): string | null {
  const parts: string[] = [];

  if (r.shiftSchedule && SHIFT_SCHEDULE_LABEL[r.shiftSchedule as ShiftSchedule]) {
    parts.push(
      `シフト：${SHIFT_SCHEDULE_LABEL[r.shiftSchedule as ShiftSchedule]}`
    );
  }

  // 「分からない」は情報量がないため移行しない。
  if (r.visaSupport && r.visaSupport !== "unknown") {
    const label = VISA_SUPPORT_LABEL[r.visaSupport as VisaSupport];
    if (label) parts.push(label);
  }

  if (
    r.managementPresence &&
    MANAGEMENT_PRESENCE_LABEL[r.managementPresence as ManagementPresence]
  ) {
    parts.push(
      `管理体制：${
        MANAGEMENT_PRESENCE_LABEL[r.managementPresence as ManagementPresence]
      }`
    );
  }

  if (
    r.workAtmosphere &&
    WORK_ATMOSPHERE_LABEL[r.workAtmosphere as WorkAtmosphere]
  ) {
    parts.push(
      `職場の雰囲気：${
        WORK_ATMOSPHERE_LABEL[r.workAtmosphere as WorkAtmosphere]
      }`
    );
  }

  if (
    r.ethnicityRatio &&
    ETHNICITY_RATIO_LABEL[r.ethnicityRatio as EthnicityRatio]
  ) {
    parts.push(
      `スタッフ構成：${
        ETHNICITY_RATIO_LABEL[r.ethnicityRatio as EthnicityRatio]
      }`
    );
  }

  return parts.length > 0 ? parts.join("／") : null;
}

/**
 * 既存の記述と生成文を合成する。
 * すでにマーカーがある場合は移行済みとみなし、null（更新不要）を返す。
 */
function merge(existing: string | null, generated: string): string | null {
  if (!existing || existing.trim() === "") {
    return `${MARKER}${generated}`;
  }
  if (existing.includes(MARKER)) return null;
  return `${existing}\n\n${MARKER}${generated}`;
}

async function main() {
  const apply = process.argv.includes("--apply");

  const all = await db.serviceCharge.findMany({ orderBy: { createdAt: "asc" } });

  let mealFilled = 0;
  let mealAppended = 0;
  let generalFilled = 0;
  let generalAppended = 0;
  let skipped = 0;
  const updates: { id: string; data: Record<string, string> }[] = [];

  for (const r of all) {
    const data: Record<string, string> = {};

    const mealText = buildMealText(r);
    if (mealText) {
      const next = merge(r.mealComment, mealText);
      if (next !== null) {
        data.mealComment = next;
        if (r.mealComment) mealAppended++;
        else mealFilled++;
      }
    }

    const generalText = buildGeneralText(r);
    if (generalText) {
      const next = merge(r.generalComment, generalText);
      if (next !== null) {
        data.generalComment = next;
        if (r.generalComment) generalAppended++;
        else generalFilled++;
      }
    }

    if (Object.keys(data).length === 0) {
      skipped++;
      continue;
    }

    updates.push({ id: r.id, data });

    if (!apply) {
      console.log(`\n[${r.storeName}] ${r.id}`);
      if (data.mealComment) {
        console.log(`  賄い:\n${indent(data.mealComment)}`);
      }
      if (data.generalComment) {
        console.log(`  その他:\n${indent(data.generalComment)}`);
      }
    }
  }

  console.log(`\n${"=".repeat(60)}`);
  console.log(`総レコード数        : ${all.length}`);
  console.log(`更新対象            : ${updates.length}`);
  console.log(`  賄い  空欄を補完  : ${mealFilled}`);
  console.log(`  賄い  末尾に追記  : ${mealAppended}`);
  console.log(`  その他 空欄を補完 : ${generalFilled}`);
  console.log(`  その他 末尾に追記 : ${generalAppended}`);
  console.log(`変更なし            : ${skipped}`);

  if (!apply) {
    console.log(`\nDRY RUN（DBは変更していません）`);
    console.log(`実行するには --apply を付けてください。`);
    return;
  }

  for (const u of updates) {
    await db.serviceCharge.update({ where: { id: u.id }, data: u.data });
  }
  console.log(`\n${updates.length}件を更新しました。`);
}

function indent(text: string): string {
  return text
    .split("\n")
    .map((line) => `    ${line}`)
    .join("\n");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
