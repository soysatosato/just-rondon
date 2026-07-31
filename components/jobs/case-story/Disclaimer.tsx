export default function Disclaimer() {
  return (
    <aside className="mt-10 rounded-lg border border-amber-300 dark:border-amber-800/60 bg-amber-50 dark:bg-amber-950/30 p-4 text-xs leading-relaxed text-amber-900 dark:text-amber-200">
      <p className="font-semibold">この記事について</p>
      <p className="mt-2">
        これは私個人の経験にもとづく記録であり、法律アドバイスではありません。
        手続きの内容や期限は変わることがあります。ご自身のケースについては、Acasや
        Citizens Advice、資格のある専門家に確認してください。
      </p>
      <p className="mt-2">
        第三者の氏名（相手方の関係者、代理人、担当者、同僚、証人など）、事件番号、
        連絡先はすべて省略または匿名化しています。会社名は、公開されている記録で
        確認できる範囲にとどめています。
      </p>
      <p className="mt-2">
        本文では、審判所が実際に判断した事項と、私自身が受けた説明や当時の受け止めとを
        区別して書いています。後者はあくまで私の認識であり、事実認定ではありません。
      </p>
    </aside>
  );
}
