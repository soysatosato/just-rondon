import type { SeasonItem } from "./types";

/**
 * クリスマスの時期の舞台(/musicals/christmas-shows)。
 *
 * 会期・料金・上演時間は各劇場の公式の案内で確かめたものだけ。演目は
 * 年ごとに替わるので、その年の演目名と配役は editions の notes に書き、
 * summary には毎年変わらない劇場の性格だけを書く(ミュージカルのガイドの
 * 「作品名を本文に直書きしない」と同じ考え方)。
 *
 * 12月25日の公演の有無は、どの劇場もまだ書いていないので christmasDay は
 * 省いてある(画面では「25日は未確認」になる)。
 *
 * 毎年秋にやること: 各劇場の新しい年の演目と会期を確かめ、editions に1件足す。
 */

const CHECKED = "2026-10-18";

export const christmasShows: SeasonItem[] = [
  {
    slug: "palladium-panto",
    kind: "show",
    title: "ロンドン・パラディアムのパント",
    shortTitle: "パラディアムのパント",
    engTitle: "The London Palladium Pantomime",
    summary:
      "ウエスト・エンドの大劇場で、テレビの人気者をそろえて上演する豪華なパント。演目は毎年替わる。2016年に、29年ぶりにこの劇場へパントを呼び戻した。",
    station: "オックスフォード・サーカス駅",
    href: "/musicals/christmas-shows#palladium-panto",
    free: false,
    entry: "有料(座席指定)",
    usualTiming: "例年12月上旬〜1月上旬",
    editions: [
      {
        year: 2026,
        start: "2026-12-05",
        end: "2027-01-10",
        booking: { status: "公式サイトで購入できる", url: "https://lwtheatres.co.uk/whats-on/cinderella/" },
        notes: [
          "2026年の演目は『シンデレラ』。ドーン・フレンチとジェニファー・ソーンダースが意地悪な姉たちを、ジュリアン・クラリーが妖精の名付け親を演じる。",
        ],
        sources: [
          { label: "LW Theatres – Cinderella", url: "https://lwtheatres.co.uk/whats-on/cinderella/" },
        ],
        checkedAt: CHECKED,
      },
    ],
  },
  {
    slug: "hackney-empire-panto",
    kind: "show",
    title: "ハックニー・エンパイアのパント",
    shortTitle: "ハックニー・エンパイアのパント",
    engTitle: "Hackney Empire Pantomime",
    summary:
      "1901年に開場した東ロンドンの劇場の、昔ながらのパント。客席と舞台の掛け合いを楽しむ、地元の家族連れの冬の行事になっている。",
    station: "ハックニー・セントラル駅(オーバーグラウンド)",
    href: "/musicals/christmas-shows#hackney-empire-panto",
    free: false,
    entry: "有料(座席指定)",
    usualTiming: "例年11月下旬〜12月31日",
    editions: [
      {
        year: 2026,
        start: "2026-11-21",
        end: "2026-12-31",
        price: "£10〜£48(1枚につき手数料£1.50)",
        booking: {
          status: "公式サイトで購入できる",
          url: "https://www.hackneyempire.co.uk/events/jack-and-the-beanstalk",
        },
        notes: [
          "2026年の演目は『ジャックと豆の木』。劇場の125周年の年で、クライヴ・ロウが演出と、デイム(男性が演じる母親役)を務める。",
          "4歳未満は大人の膝の上で観られる。4歳からは自分の席が要る。",
        ],
        sources: [
          {
            label: "Hackney Empire – Jack and the Beanstalk",
            url: "https://www.hackneyempire.co.uk/events/jack-and-the-beanstalk",
          },
        ],
        checkedAt: CHECKED,
      },
    ],
  },
  {
    slug: "royal-ballet-nutcracker",
    kind: "show",
    title: "ロイヤル・バレエの『くるみ割り人形』",
    shortTitle: "ロイヤル・バレエ『くるみ割り人形』",
    engTitle: "The Nutcracker – The Royal Ballet",
    summary:
      "コヴェント・ガーデンのロイヤル・オペラ・ハウスで、ピーター・ライト版の『くるみ割り人形』を上演する。英国のクリスマスのバレエの定番。",
    station: "コヴェント・ガーデン駅",
    href: "/musicals/christmas-shows#royal-ballet-nutcracker",
    free: false,
    entry: "有料(座席指定)",
    usualTiming: "例年12月上旬〜1月上旬",
    editions: [
      {
        year: 2026,
        start: "2026-12-03",
        end: "2027-01-13",
        price: "£10〜£238",
        booking: {
          status: "公式サイトで購入できる",
          url: "https://www.rbo.org.uk/production/the-nutcracker-peter-wright",
        },
        notes: [
          "上演時間は休憩を含めて約2時間20分。5歳から。",
          "振付のピーター・ライトの生誕100年の年にあたる。",
        ],
        sources: [
          {
            label: "Royal Ballet and Opera – The Nutcracker",
            url: "https://www.rbo.org.uk/production/the-nutcracker-peter-wright",
          },
        ],
        checkedAt: CHECKED,
      },
    ],
    places: [{ spot: "royal-ballet-opera-london", relation: "here" }],
  },
  {
    slug: "enb-nutcracker",
    kind: "show",
    title: "イングリッシュ・ナショナル・バレエの『くるみ割り人形』",
    shortTitle: "ENB『くるみ割り人形』",
    engTitle: "Nutcracker – English National Ballet",
    summary:
      "ロンドン・コロシアムで上演する、2024年に初演された新しい演出の『くるみ割り人形』。チャイコフスキーの曲は劇団のオーケストラが生で演奏する。",
    station: "レスター・スクエア駅、チャリング・クロス駅",
    href: "/musicals/christmas-shows#enb-nutcracker",
    free: false,
    entry: "有料(座席指定)",
    usualTiming: "例年12月中旬〜1月上旬",
    editions: [
      {
        year: 2026,
        start: "2026-12-17",
        end: "2027-01-10",
        price: "£27.25〜(手数料込み)。16歳未満は25%引き",
        booking: { status: "公式サイトで購入できる", url: "https://www.ballet.org.uk/production/nutcracker/" },
        notes: ["上演時間は休憩20分を含めて約2時間。5歳から。"],
        sources: [
          {
            label: "English National Ballet – Nutcracker",
            url: "https://www.ballet.org.uk/production/nutcracker/",
          },
          {
            label: "London Coliseum – Nutcracker",
            url: "https://londoncoliseum.org/events/nutcracker-2026/",
          },
        ],
        checkedAt: CHECKED,
      },
    ],
  },
  {
    slug: "old-vic-christmas-carol",
    kind: "show",
    title: "オールド・ヴィックの『クリスマス・キャロル』",
    shortTitle: "オールド・ヴィック『クリスマス・キャロル』",
    engTitle: "A Christmas Carol – The Old Vic",
    summary:
      "ディケンズの物語を、ジャック・ソーンの脚色、マシュー・ウォーカスの演出で上演する芝居。2017年から毎冬の定番になっている。",
    station: "ウォータールー駅",
    href: "/musicals/christmas-shows#old-vic-christmas-carol",
    free: false,
    entry: "有料(座席指定)",
    usualTiming: "例年11月中旬〜1月上旬",
    editions: [
      {
        year: 2026,
        start: "2026-11-10",
        end: "2027-01-09",
        booking: {
          status: "公式サイトで購入できる",
          url: "https://www.oldvictheatre.com/stage/a-christmas-carol-2026/",
        },
        notes: [
          "11月10〜23日はプレビュー公演、1月1〜9日は安めのオフピークの公演。",
          "上演時間は休憩20分を含めて約2時間。",
        ],
        sources: [
          {
            label: "Old Vic – A Christmas Carol",
            url: "https://www.oldvictheatre.com/stage/a-christmas-carol-2026/",
          },
        ],
        checkedAt: CHECKED,
      },
    ],
  },
  {
    slug: "the-snowman",
    kind: "show",
    title: "ピーコック劇場の『スノーマン』",
    shortTitle: "『スノーマン』",
    engTitle: "The Snowman – Peacock Theatre",
    summary:
      "レイモンド・ブリッグズの絵本とアニメで知られる『スノーマン』の舞台。これまでの舞台は、台詞を使わずに踊りと音楽だけで物語を見せてきた。",
    station: "ホルボーン駅",
    href: "/musicals/christmas-shows#the-snowman",
    free: false,
    entry: "有料(座席指定)",
    usualTiming: "例年11月下旬〜1月上旬",
    editions: [
      {
        year: 2026,
        start: "2026-11-21",
        end: "2027-01-03",
        price: "£18〜(別に手数料£4)",
        booking: {
          status: "公式サイトで購入できる",
          url: "https://www.sadlerswells.com/whats-on/the-snowman-2026/",
        },
        notes: ["2026年は新しい演出の初演になる。"],
        sources: [
          {
            label: "Sadler's Wells – The Snowman",
            url: "https://www.sadlerswells.com/whats-on/the-snowman-2026/",
          },
        ],
        checkedAt: CHECKED,
      },
    ],
  },
  {
    slug: "dickens-christmas-carol",
    kind: "show",
    title: "ディケンズの家で観る『クリスマス・キャロル』",
    shortTitle: "ディケンズの家の『クリスマス・キャロル』",
    engTitle: "A Christmas Carol performed by Mark & Oliver Dickens",
    summary:
      "ディケンズが『オリヴァー・ツイスト』を書いた家(チャールズ・ディケンズ博物館)の客間で、ディケンズの子孫が演じる1時間の『クリスマス・キャロル』。",
    station: "ラッセル・スクエア駅",
    href: "/musicals/christmas-shows#dickens-christmas-carol",
    free: false,
    entry: "有料(要予約)",
    usualTiming: "例年11〜12月に数回",
    editions: [
      {
        year: 2026,
        start: "2026-11-21",
        end: "2026-12-11",
        onlyDates: ["2026-11-21", "2026-11-26", "2026-12-11"],
        hours: "11月21日(土)15:00、26日(木)17:00、12月11日(金)20:00",
        price: "£29",
        booking: {
          status: "発売中。毎年すぐ売り切れると案内されている",
          url: "https://dickensmuseum.com/blogs/all-events/a-christmas-carol-dickens-decendents-2026",
        },
        notes: ["マーク・ディケンズとオリヴァー・ディケンズが演じる。上演は60分。"],
        sources: [
          {
            label: "Charles Dickens Museum – A Christmas Carol performed by Mark & Oliver Dickens",
            url: "https://dickensmuseum.com/blogs/all-events/a-christmas-carol-dickens-decendents-2026",
          },
        ],
        checkedAt: CHECKED,
      },
    ],
    places: [{ museum: "charles-dickens-museum", relation: "here" }],
  },
];
