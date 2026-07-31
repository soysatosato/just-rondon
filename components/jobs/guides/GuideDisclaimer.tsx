export default function GuideDisclaimer() {
  return (
    <aside className="mt-10 rounded-lg border border-amber-300 dark:border-amber-800/60 bg-amber-50 dark:bg-amber-950/30 p-4 text-xs leading-relaxed text-amber-900 dark:text-amber-200">
      <p className="font-semibold">この記事について</p>
      <p className="mt-2">
        本記事は一般的な情報提供を目的としたものであり、法律アドバイスではありません。
        制度や金額、法律の要件は改定されることがあるため、実際の手続きや個別の状況については、
        Acas（0300 123 1100）やCitizens Advice、資格のある専門家に必ずご確認ください。
      </p>
      <p className="mt-2">
        最新の一次情報は、記事末尾の参考リンクからgov.uk・Acas公式サイトで確認できます。
      </p>
    </aside>
  );
}
