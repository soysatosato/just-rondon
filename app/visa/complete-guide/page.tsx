import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function UkVisaGuidePage() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
      <main className="mx-auto max-w-6xl px-4 py-10 lg:py-16">
        {/* ===== Header ===== */}
        <section className="mb-10 lg:mb-14">
          <Card className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 shadow-md">
            <CardHeader className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="bg-emerald-600 text-white">2025年版</Badge>
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  変更が多いため公式情報の再確認推奨
                </span>
              </div>
              <CardTitle className="text-3xl md:text-4xl font-bold tracking-tight">
                UKビザ完全ガイド（2025年版）
              </CardTitle>
              <p className="text-base md:text-lg leading-relaxed text-gray-700 dark:text-gray-200">
                英国へ渡航する目的ごとに異なるビザ要件をまとめた最新ガイド。
                就労・留学・観光・家族との合流など、申請前に必ず確認！
              </p>
            </CardHeader>
          </Card>
        </section>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(260px,1fr)]">
          {/* ===== Main Content ===== */}
          <div className="space-y-10">
            {/* A */}
            <Card
              id="section-a"
              className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700"
            >
              <CardHeader>
                <CardTitle className="text-xl md:text-2xl font-semibold">
                  A：UKビザの主要カテゴリ
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-gray-800 dark:text-gray-200 text-sm md:text-base">
                <p>
                  申請目的に応じて適切なビザを選ぶ必要があります。誤ると入国拒否の可能性も。
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>観光・短期商用・親族訪問</li>
                  <li>英国での就労</li>
                  <li>留学や研究</li>
                  <li>英国居住者の家族との合流</li>
                  <li>EU/EEA/スイス国籍向け制度</li>
                  <li>ウクライナ支援など人道ビザ</li>
                  <li>コモンウェルス諸国向け特別ルート</li>
                </ul>
              </CardContent>
            </Card>

            {/* B */}
            <Card
              id="section-b"
              className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700"
            >
              <CardHeader>
                <CardTitle className="text-xl md:text-2xl">
                  B：ビザ共通の基本要件
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm md:text-base">
                <ul className="list-disc pl-6 space-y-1">
                  <li>有効なパスポート</li>
                  <li>滞在費用の証明</li>
                  <li>帰国意志の証拠（訪問系ビザ）</li>
                  <li>過去の法令遵守（犯罪歴など）</li>
                  <li>健康上の要件（TB検査など）</li>
                </ul>
              </CardContent>
            </Card>

            {/* C */}
            <Card
              id="section-c"
              className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700"
            >
              <CardHeader>
                <CardTitle className="text-xl md:text-2xl">
                  C：一般的な申請手順
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm md:text-base space-y-2">
                <ol className="list-decimal pl-6 space-y-1">
                  <li>GOV.UKで申請ビザ選択</li>
                  <li>オンライン申請フォーム入力</li>
                  <li>手数料支払い</li>
                  <li>本人確認（指紋/顔認証）</li>
                  <li>必要書類提出</li>
                  <li>審査結果待ち</li>
                  <li>許可後に渡航準備</li>
                </ol>
              </CardContent>
            </Card>

            {/* D */}
            <Card
              id="section-d"
              className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700"
            >
              <CardHeader>
                <CardTitle className="text-xl md:text-2xl">
                  D：必要書類チェックリスト
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm md:text-base">
                <ul className="list-disc pl-6 space-y-1">
                  <li>パスポート</li>
                  <li>銀行残高証明などの資金証明</li>
                  <li>滞在先証明</li>
                  <li>渡航目的を示す資料</li>
                  <li>英語力証明（必要な場合）</li>
                  <li>健康関連書類</li>
                </ul>
              </CardContent>
            </Card>

            {/* E：費用表 */}
            <Card
              id="section-e"
              className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700"
            >
              <CardHeader>
                <CardTitle className="text-xl md:text-2xl">
                  E：ビザ費用（一例）
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm md:text-base space-y-3">
                <div className="overflow-x-auto rounded-md border border-gray-300 dark:border-gray-700">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ビザ種類</TableHead>
                        <TableHead className="text-right">料金目安</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>ETA（電子渡航認証）</TableCell>
                        <TableCell className="text-right">£16</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Standard Visitor</TableCell>
                        <TableCell className="text-right">£127</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>学生ビザ</TableCell>
                        <TableCell className="text-right">£524</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  ※必ず最新情報を公式サイトより確認してください
                </p>
              </CardContent>
            </Card>

            {/* F：審査時間 */}
            <Card
              id="section-f"
              className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700"
            >
              <CardHeader>
                <CardTitle className="text-xl md:text-2xl">
                  F：審査期間の目安
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm md:text-base space-y-1">
                <ul className="list-disc pl-6">
                  <li>観光系ビザ：約3週間</li>
                  <li>就労ビザ：約3週間</li>
                  <li>家族ビザ：最大24週間</li>
                </ul>
              </CardContent>
            </Card>

            {/* G：面接 */}
            <Card
              id="section-g"
              className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700"
            >
              <CardHeader>
                <CardTitle className="text-xl md:text-2xl">
                  G：面接対策
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm md:text-base space-y-2">
                <p>頻出質問：</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>渡航目的</li>
                  <li>費用の出どころ</li>
                  <li>帰国後の計画</li>
                </ul>
              </CardContent>
            </Card>

            {/* H：まとめ */}
            <Card
              id="section-h"
              className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700"
            >
              <CardHeader>
                <CardTitle className="text-xl md:text-2xl">H：まとめ</CardTitle>
              </CardHeader>
              <CardContent className="text-sm md:text-base">
                <p>要は、正しいビザを選び、証拠を揃え、早く動くこと！</p>
              </CardContent>
            </Card>

            {/* I：FAQ */}
            <Card
              id="section-i"
              className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700"
            >
              <CardHeader>
                <CardTitle className="text-xl md:text-2xl">I：FAQ</CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible>
                  <AccordionItem value="q1">
                    <AccordionTrigger>いつ申請開始すべき？</AccordionTrigger>
                    <AccordionContent>基本は出発3ヶ月前</AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="q2">
                    <AccordionTrigger>訪問ビザで働ける？</AccordionTrigger>
                    <AccordionContent>不可。就労ビザ必須。</AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>

            {/* J：用語集 */}
            <Card
              id="section-j"
              className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700"
            >
              <CardHeader>
                <CardTitle className="text-xl md:text-2xl">J：用語集</CardTitle>
              </CardHeader>
              <CardContent className="text-sm md:text-base">
                <ul className="list-disc pl-6">
                  <li>CoS：就労のスポンサー証明</li>
                  <li>CAS：学生ビザ用の入学確認番号</li>
                </ul>
              </CardContent>
            </Card>

            <footer className="text-center text-xs text-gray-600 dark:text-gray-400">
              この情報は一般案内であり、法的助言ではありません。
            </footer>
          </div>

          {/* ===== Sidebar ===== */}
          <aside className="space-y-6 lg:sticky lg:top-10 h-fit">
            <Card className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm font-semibold">
                  セクションナビ
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <ul className="space-y-1">
                  <li>
                    <a href="#section-a" className="hover:underline">
                      A：カテゴリ
                    </a>
                  </li>
                  <li>
                    <a href="#section-b" className="hover:underline">
                      B：要件
                    </a>
                  </li>
                  <li>
                    <a href="#section-c" className="hover:underline">
                      C：申請手順
                    </a>
                  </li>
                  <li>
                    <a href="#section-d" className="hover:underline">
                      D：書類
                    </a>
                  </li>
                  <li>
                    <a href="#section-e" className="hover:underline">
                      E：費用
                    </a>
                  </li>
                  <li>
                    <a href="#section-f" className="hover:underline">
                      F：審査時間
                    </a>
                  </li>
                  <li>
                    <a href="#section-g" className="hover:underline">
                      G：面接
                    </a>
                  </li>
                  <li>
                    <a href="#section-h" className="hover:underline">
                      H：まとめ
                    </a>
                  </li>
                  <li>
                    <a href="#section-i" className="hover:underline">
                      I：FAQ
                    </a>
                  </li>
                  <li>
                    <a href="#section-j" className="hover:underline">
                      J：用語
                    </a>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </aside>
        </div>
      </main>
    </div>
  );
}
