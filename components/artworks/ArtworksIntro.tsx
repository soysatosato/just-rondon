export default function ArtworksIntro({
  museumName,
  total,
  mustSeeCount,
  roomCount,
}: {
  museumName: string;
  total: number;
  mustSeeCount: number;
  roomCount: number;
}) {
  const stats = [
    { label: "掲載作品", value: `${total}点` },
    { label: "必見", value: `${mustSeeCount}点` },
    { label: "展示室", value: `${roomCount}室` },
  ];

  return (
    <header className="mb-8 space-y-4">
      <span className="inline-block rounded-full bg-indigo-600 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white">
        Collection
      </span>
      <h1 className="text-xl font-extrabold leading-tight tracking-tight md:text-3xl">
        {museumName} の有名作品・主要作品のガイド・徹底解説
      </h1>
      <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground md:text-base">
        館内で回りやすいように、展示室ごとに並べています。作品名・作者名での検索、
        時間がないときの「必見のみ」への絞り込みができます。
        カードを選ぶと、その作品の背景と見どころの解説ページに移ります。
      </p>
      <dl className="flex flex-wrap gap-x-6 gap-y-2">
        {stats.map((s) => (
          <div key={s.label} className="flex items-baseline gap-1.5">
            <dt className="text-xs text-muted-foreground">{s.label}</dt>
            <dd className="text-base font-bold tabular-nums">{s.value}</dd>
          </div>
        ))}
      </dl>
    </header>
  );
}
