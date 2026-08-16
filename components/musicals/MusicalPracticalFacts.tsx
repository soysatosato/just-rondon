import { Clock, Languages, Users } from "lucide-react";
import {
  ENGLISH_FORM_LABELS,
  ENGLISH_FORM_NOTES,
  formatFactsVerifiedAt,
  formatMinAge,
  formatRuntime,
  hasAnyFacts,
  isEnglishForm,
  type MusicalFacts,
} from "./facts";

/**
 * 予約前に読者が必ず調べる実用情報。
 *
 * 「基本情報」(MusicalInfo)がおすすめ度や原作といった作品の紹介なのに対し、
 * こちらは滞在日程を組むための情報。分けているのは、読者が見る場面が
 * 違うため——作品を選ぶ段階と、観る日を決める段階。
 *
 * 未確認の項目は行ごと出さない。推定を出すと、それを前提に夕食を
 * 予約した読者が間に合わなくなる。
 */
export default function MusicalPracticalFacts({
  name,
  facts,
  factsVerifiedAt,
}: {
  name: string;
  facts: MusicalFacts;
  factsVerifiedAt: Date | null;
}) {
  if (!hasAnyFacts(facts)) return null;

  const runtime = formatRuntime(facts.runtimeMinutes, facts.intervalMinutes);
  const minAge = formatMinAge(facts.minAgeGuidance);
  const form = isEnglishForm(facts.englishForm) ? facts.englishForm : null;

  return (
    <section className="rounded-2xl border border-border bg-card p-6 sm:p-8">
      <h2 className="text-xl md:text-2xl font-semibold tracking-wide text-foreground mb-2">
        観に行く前に
      </h2>
      <p className="text-sm text-muted-foreground mb-6">
        {name} を観る日を決めるための情報です。
        {factsVerifiedAt && `${formatFactsVerifiedAt(factsVerifiedAt)}。`}
        演出の改訂で上演時間が変わることがあるため、当日の予定は
        公式サイトの案内も確認したうえで組んでください。
      </p>

      <dl className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
        {runtime && (
          <FactRow icon={Clock} label="上演時間" value={runtime} />
        )}
        {minAge && (
          <FactRow
            icon={Users}
            label="年齢の目安"
            value={minAge}
            note="劇場が案内する推奨年齢です。入場制限とは限りません。"
          />
        )}
        {form && (
          <FactRow
            icon={Languages}
            label="英語のハードル"
            value={ENGLISH_FORM_LABELS[form]}
            // 形式そのものの説明に、作品固有の事情(englishNote)を続ける。
            // 根拠を出さずに「わかりやすい」とだけ言わないための構成。
            note={
              facts.englishNote
                ? `${ENGLISH_FORM_NOTES[form]}${facts.englishNote}`
                : ENGLISH_FORM_NOTES[form]
            }
            wide
          />
        )}
      </dl>
    </section>
  );
}

function FactRow({
  icon: Icon,
  label,
  value,
  note,
  wide = false,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  note?: string;
  wide?: boolean;
}) {
  return (
    <div className={wide ? "sm:col-span-2" : undefined}>
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Icon size={18} />
        </span>
        <div className="min-w-0">
          <dt className="text-xs uppercase tracking-widest font-semibold text-muted-foreground">
            {label}
          </dt>
          <dd className="mt-1 text-sm font-medium text-foreground">{value}</dd>
          {note && (
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
              {note}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
