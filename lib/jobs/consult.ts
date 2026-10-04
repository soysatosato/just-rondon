import type { AcasStatus } from "./claim-deadline";

/** サービスチャージ未払いの相談フォーム。当事者の記録の各ページから案内する。 */
export const CONSULT_PATH = "/jobs/service-charges/consult";
export const CONSULT_CONFIRM_PATH = `${CONSULT_PATH}/confirm`;

export type Employment = "employed" | "left";

export const EMPLOYMENT_OPTIONS: { value: Employment; label: string }[] = [
  { value: "employed", label: "いまも働いている" },
  { value: "left", label: "もう辞めた" },
];

export const ACAS_OPTIONS: { value: AcasStatus; label: string }[] = [
  { value: "not_yet", label: "まだ" },
  { value: "started", label: "連絡して、手続き中" },
  { value: "certificate", label: "certificateが出た" },
];

export function optionLabel(
  options: { value: string; label: string }[],
  value: string,
) {
  return options.find((o) => o.value === value)?.label ?? value;
}
