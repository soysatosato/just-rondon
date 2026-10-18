import Link from "next/link";
import {
  SitePageHeader,
  SitePageShell,
} from "@/components/site/SitePageLayout";
import ConsultForm from "@/components/jobs/consult/ConsultForm";
import {
  CASE_STORY_BASE,
  SERVICE_CHARGES_PATH,
} from "@/components/jobs/case-story/chapters";
import { ACAS_EARLY_CONCILIATION_URL } from "@/lib/jobs/claim-deadline";
import { CONSULT_PATH } from "@/lib/jobs/consult";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  path: CONSULT_PATH,
  title: "サービスチャージ未払いの相談（日本語・無料）",
  description:
    "ロンドンの飲食店でサービスチャージが正しく配られていない方の相談を、日本語で受け付けています。弁護士を立てずに審判所の判決を得て回収まで進めた当事者が、期限と次にやることを一緒に整理します。",
  keywords: [
    "サービスチャージ 未払い 相談",
    "イギリス 労働問題 相談 日本語",
    "Employment Tribunal 相談",
    "Acas 相談",
  ],
});

const CAN = [
  "いまの状況を整理して、次にやることを一緒に決める",
  "期限がいつまでかを確かめる",
  "Acasへの連絡、ET1の書き方、証拠のまとめ方、判決後の回収まで、記録に書いた手続きの具体的なやり方",
];

const CANNOT = [
  "法律相談（弁護士ではありません）",
  "代理や、勤務先とのやり取りの代行",
  "勝てるかどうかの判断",
];

/**
 * 当事者の記録(case-story)の読者から相談を受ける。
 *
 * 何ができて何ができないかを、フォームより先に書く。できないこと(法律相談・
 * 代理)を頼まれても応えられず、相談した側の時間だけが過ぎるので。
 */
export default function ConsultPage() {
  return (
    <SitePageShell>
      <nav className="mb-8 text-xs text-gray-500 dark:text-gray-400">
        <Link href={SERVICE_CHARGES_PATH} className="hover:underline">
          サービスチャージ
        </Link>
        <span className="mx-1.5">/</span>
        <Link href={CASE_STORY_BASE} className="hover:underline">
          当事者の記録
        </Link>
      </nav>

      <SitePageHeader
        kicker="Service charge"
        title="サービスチャージ未払いの相談"
        lede="ロンドンの飲食店で、サービスチャージが正しく配られていない。そう感じている方の相談を、日本語で受け付けています。"
      />

      <div className="mt-10 space-y-8 text-sm leading-7 text-gray-700 dark:text-gray-300 md:text-base md:leading-8">
        <p>
          相談に乗るのは、ロンドンのレストランで未払いのサービスチャージを請求し、弁護士を立てずに審判所の判決を得て、回収まで進めた本人です。経過は
          <Link
            href={CASE_STORY_BASE}
            className="text-blue-600 underline-offset-4 hover:underline dark:text-blue-400"
          >
            当事者の記録
          </Link>
          にすべて書いています。
        </p>

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              できること
            </h2>
            <ul className="mt-2 space-y-2">
              {CAN.map((item) => (
                <li key={item} className="flex gap-2 text-sm leading-7">
                  <span aria-hidden className="text-emerald-700 dark:text-emerald-400">
                    ○
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              できないこと
            </h2>
            <ul className="mt-2 space-y-2">
              {CANNOT.map((item) => (
                <li key={item} className="flex gap-2 text-sm leading-7">
                  <span aria-hidden className="text-gray-400 dark:text-gray-500">
                    ×
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm leading-7 dark:border-neutral-700 dark:bg-neutral-900">
          1週間を目安に、メールで返信します。費用はかかりません。期限が迫っているときは、返信を待たずに
          <a
            href={ACAS_EARLY_CONCILIATION_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline-offset-4 hover:underline dark:text-blue-400"
          >
            Acas
          </a>
          へ連絡してください。
        </p>
      </div>

      <div className="mt-12">
        <ConsultForm />
      </div>
    </SitePageShell>
  );
}
