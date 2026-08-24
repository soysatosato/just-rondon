export type ChristmasMarketSection = {
  title: string;
  description: string;
  displayOrder: number;
};

export type ChristmasMarket = {
  slug: string;
  title: string;
  engTitle: string;
  summary: string;
  mainText: string;
  image: string;
  website: string;
  sections: ChristmasMarketSection[];
};

export const christmasMarkets: ChristmasMarket[] = [
  {
    slug: "covent-garden-christmas-market",
    title: "コヴェントガーデン・クリスマスマーケット",
    engTitle: "Covent Garden Christmas Market",
    summary:
      "30万個のライトと巨大ツリー、人工雪の演出など、ロンドン随一のフォトスポットが集まる人気エリア。",
    mainText:
      "**コヴェントガーデン**は、ロンドンの中でも最も華やかで写真映えするクリスマススポット。300,000以上のライト、巨大な英国産ツリー、そして名物の巨大バウル（オーナメント）が見どころ。アップルマーケットやジュビリーマーケットはホリデー仕様になり、ホットチョコ、焼き菓子、アート作品、クラフトギフトなどが並ぶ。\n\nさらに日替わりのイベントとして、**人工雪のシャワー**、ライブパフォーマンス、カクテル実演、没入型体験などが開催され、観光客も地元民も長時間滞在したくなるエリア。クリスマス写真を撮りたいなら最優先で訪れたい場所。",
    image:
      "https://vuovopzkzwmgvlxjtykw.supabase.co/storage/v1/object/public/londonnn/coventgarden.jpeg",
    website: "https://www.coventgarden.london/experience/christmas-in-covent-garden/",
    sections: [
      {
        title: "場所",
        description:
          "[Covent Garden Piazza, London WC2E 8RF](https://www.google.com/maps?q=Covent+Garden+Piazza,+London+WC2E+8RF)",
        displayOrder: 1,
      },
      {
        title: "訪問のコツ",
        description:
          "12月は毎日混むが、**午前中〜午後の早め**が比較的歩きやすい。ホリデー限定の“クリスマスサンドイッチ”はぜひ試したい。",
        displayOrder: 2,
      },
      {
        title: "周辺でできること",
        description:
          "近くにはロンドンの人気スポットが集まる。特に **クリスマスライト散策ルートの終点** がここなので、鑑賞後の買い物に最適。",
        displayOrder: 3,
      },
      {
        title: "期間",
        description: "例年11月中旬 〜 1月上旬（正確な日程は公式サイトで確認）",
        displayOrder: 4,
      },
    ],
  },
  {
    slug: "southbank-centre-winter-market",
    title: "サウスバンク・センター・ウィンターマーケット",
    engTitle: "Southbank Centre Winter Market",
    summary:
      "テムズ川沿いのアルプス風シャレーとストリートフードが魅力。ロンドンで最も雰囲気の良い冬の散策スポット。",
    mainText:
      "サウスバンクは、川沿いのロケーションと温かな雰囲気で人気の高いクリスマスマーケット。アルプス風のシャレーが並び、ホットワイン、チュロス、チーズ料理、焼き菓子などが楽しめる。アート展示、ライトインスタレーション、野外イベント、パフォーマンスが同時に行われ、**食 × 芸術 × 川の景色**が混ざり合うロンドンらしいスポット。\n\n併設の**Winter Festival**では、無料ショー、ポップアップバー、屋台文化を満喫できる“Between the Bridges”なども魅力。ロンドンアイや国会議事堂にも近く、観光と合わせやすい。",
    image:
      "https://vuovopzkzwmgvlxjtykw.supabase.co/storage/v1/object/public/londonnn/winter-cmarket.jpg",
    website: "https://www.southbankcentre.co.uk/activity/winter-market/",
    sections: [
      {
        title: "場所",
        description:
          "[The Queen’s Walk, London SE1 8XX](https://www.google.com/maps?q=The+Queen%E2%80%99s+Walk,+London+SE1+8XX)",
        displayOrder: 1,
      },
      {
        title: "訪問のコツ",
        description:
          "川沿いの“Between the Bridges”は屋台、音楽、カラオケが揃う人気スポットで、**夕方以降に特におすすめ**。",
        displayOrder: 2,
      },
      {
        title: "周辺でできること",
        description:
          "徒歩圏内に **ウェストミンスター寺院** があり、クリスマス時期は装飾も美しい。ロンドンアイやテムズ川沿いの散策とも相性◎。",
        displayOrder: 3,
      },
      {
        title: "期間",
        description: "例年11月上旬 〜 1月上旬（正確な日程は公式サイトで確認）",
        displayOrder: 4,
      },
    ],
  },
  {
    slug: "winter-by-the-river",
    title: "ウィンター・バイ・ザ・リバー（ロンドンブリッジ）",
    engTitle: "Winter by the River (London Bridge)",
    summary:
      "タワーブリッジの絶景を臨む、ロンドンでも最も景観の良いクリスマスマーケット。2階建てアプレスキーテラスが名物。",
    mainText:
      "**Winter by the River** は、ロンドンで最も景観が美しいと言われるクリスマスマーケット。タワーブリッジを背景に木製シャレーが並び、職人ギフト、ホリデードリンク、焼き菓子、ストリートフードが揃う。\n\n近年とくに話題なのが **The Glasshouse Terrace**。2階建てのアプレスキー風会場で、加熱された屋上テラスからは“タワーブリッジ × テムズ川 × クリスマスイルミ”という究極の景色を楽しめる。ライブ音楽、カーリングバー、Aperolバーなど大人が楽しめる要素も豊富。",
    image:
      "https://vuovopzkzwmgvlxjtykw.supabase.co/storage/v1/object/public/londonnn/Winter-By-The-River_cm.jpeg",
    website:
      "https://www.londonbridgecity.co.uk/events/2025/november/winter-by-the-river-2025",
    sections: [
      {
        title: "場所",
        description:
          "[Queen’s Walk, London SE1 2DB](https://www.google.com/maps?q=Queen%E2%80%99s+Walk,+London+SE1+2DB)",
        displayOrder: 1,
      },
      {
        title: "訪問のコツ",
        description:
          "壮大な景色が魅力なので、**夕暮れ〜夜のライトアップ時間帯**が特におすすめ。Hays Galleria の装飾も必見。",
        displayOrder: 2,
      },
      {
        title: "周辺でできること",
        description:
          "近くの **Borough Market** はロンドン冬の定番スポット。食べ歩きとの組み合わせが最強。Queen’s Walk の散策も楽しい。",
        displayOrder: 3,
      },
      {
        title: "期間",
        description: "例年11月中旬 〜 1月上旬（正確な日程は公式サイトで確認）",
        displayOrder: 4,
      },
    ],
  },
  {
    slug: "trafalgar-square-christmas-market",
    title: "トラファルガー広場クリスマスマーケット",
    engTitle: "Trafalgar Square Christmas Market",
    summary:
      "約40のアルプス風シャレーが並ぶ、ロンドン中心の象徴的なクリスマスマーケット。ノルウェーから贈られる巨大ツリーとカロル歌唱が名物。",
    mainText:
      "**トラファルガー広場クリスマスマーケット**は、ロンドンの中心に位置し、ヨーロッパ的な雰囲気と賑わいを最も強く感じられる場所のひとつ。ナショナルギャラリーを背景に、約40の木製シャレーが並び、オーナメント、ノルウェー製ニット、クラシックなクリスマスギフトが揃う。フードも充実しており、ラクレット、ブラートヴルスト、ワッフル、ホットワインなど“ヨーロッパの冬の味”を楽しめる。\n\n12月9日〜23日の期間は**毎日カロルの合唱**が行われ、週末はブラスバンドも登場。フォトブースで“Elfie Selfie”が撮れるなど、大人も子どもも楽しめる仕掛けが満載。巨大ツリーは毎年ノルウェーの贈り物で、ロンドン冬の象徴となっている。混雑は避けられないが、その喧騒こそがこのマーケットの“醍醐味”。",
    image:
      "https://vuovopzkzwmgvlxjtykw.supabase.co/storage/v1/object/public/londonnn/trafalgar-square-christmas.jpeg",
    website:
      "https://www.london.gov.uk/who-we-are/city-halls-buildings-and-squares/trafalgar-square/christmas",
    sections: [
      {
        title: "場所",
        description:
          "[Trafalgar Square, London WC2N 5DS](https://www.google.com/maps?q=Trafalgar+Square,+London+WC2N+5DS)",
        displayOrder: 1,
      },
      {
        title: "訪問のコツ",
        description:
          "最も混雑する時間帯を避けたいなら、**午後の早い時間帯**がベスト。夜は雰囲気は良いが人が多いので、写真を撮るなら明るいうちが狙い目。",
        displayOrder: 2,
      },
      {
        title: "周辺でできること",
        description:
          "ロンドンの名物 **クリスマスライト散策ルート**が広場のすぐ近くで完走できる。ナショナルギャラリーも目の前なので文化鑑賞との相性も良い。",
        displayOrder: 3,
      },
      {
        title: "期間",
        description: "例年11月上旬 〜 1月上旬（正確な日程は公式サイトで確認）",
        displayOrder: 4,
      },
    ],
  },
  {
    slug: "kings-cross-christmas-market",
    title: "キングスクロス・クリスマスマーケット",
    engTitle: "King’s Cross Christmas Markets",
    summary:
      "買い物、ワークショップ、フード、ライブが融合するスタイリッシュな冬のマーケット。暖房付きキャノピーが便利。",
    mainText:
      "**キングスクロス**は複数のマーケットが集まる人気エリアで、Coal Drops Yard、Granary Square、West Handyside Canopy にそれぞれテーマ別のショップやポップアップが展開。デザイナー雑貨、アート作品、ナチュラル系ギフト、ストリートフードなど多彩な魅力が揃う。\n\n暖房完備のキャノピー内でゆっくり買い物でき、ライブ音楽、サンタ登場、クリスマスワークショップ、シネマナイトなど“イベント性”が強いのも魅力。47フィートのノルドマンモミのツリーは名物フォトスポット。",
    image:
      "https://vuovopzkzwmgvlxjtykw.supabase.co/storage/v1/object/public/londonnn/kingscrosscm.jpeg",
    website: "https://www.kingscross.co.uk/christmas",
    sections: [
      {
        title: "場所",
        description:
          "[Coal Drops Yard / Granary Square, London N1C 4DQ](https://www.google.com/maps?q=Coal+Drops+Yard,+London+N1C+4DQ)",
        displayOrder: 1,
      },
      {
        title: "訪問のコツ",
        description:
          "ハンドメイド・デザイン雑貨を狙うなら **TOAST のキュレーションマーケット**が外せない。夕方のライブ演奏も良い雰囲気。",
        displayOrder: 2,
      },
      {
        title: "周辺でできること",
        description:
          "St Pancras 駅前は**フェスティブなライトアップ**が美しい。リージェンツ運河の散策とも相性抜群。",
        displayOrder: 3,
      },
      {
        title: "期間",
        description: "例年11月下旬 〜 12月下旬（正確な日程は公式サイトで確認）",
        displayOrder: 4,
      },
    ],
  },
  {
    slug: "kingston-christmas-market",
    title: "キングストン・クリスマスマーケット",
    engTitle: "Kingston Christmas Market",
    summary:
      "リバーサイドの古い町並みに広がる、伝統的なヨーロッパ風マーケット。カーリングやライブ音楽も楽しめる。",
    mainText:
      "**キングストン**は、古いヨーロッパの村を思わせる雰囲気が魅力。歩行者専用の広場に木製シャレーが並び、ホットワイン、ローストホッグ、ブラートヴルスト、工芸品が揃う。ヴィンテージメリーゴーラウンドやカーリングレーンもあり、家族で楽しめる。\n\n地元のバンド、オープンマイク、キャロラーによるライブが賑やかな空気を演出し、“地域に根ざしたクリスマス感”が味わえる。",
    image:
      "https://vuovopzkzwmgvlxjtykw.supabase.co/storage/v1/object/public/londonnn/kingston-christmas-market.jpeg",
    website: "https://www.kingstonchristmasmarket.co.uk/",
    sections: [
      {
        title: "場所",
        description:
          "[Ancient Market Place, Kingston upon Thames KT1 1JS](https://www.google.com/maps?q=Ancient+Market+Place,+Kingston+upon+Thames+KT1+1JS)",
        displayOrder: 1,
      },
      {
        title: "訪問のコツ",
        description:
          "ローカル感を味わうなら **Eden Crafts テント** をチェック。家族連れは昼間、カップルは夜のライトアップ推奨。",
        displayOrder: 2,
      },
      {
        title: "周辺でできること",
        description:
          "テムズ川沿いは**冬の散歩**に最高。リバーサイドのカフェやパブで休憩する過ごし方も人気。",
        displayOrder: 3,
      },
      {
        title: "期間",
        description:
          "例年11月中旬 〜 12月下旬（※クリスマス当日休業 / クリスマスイブは短縮営業。正確な日程は公式サイトで確認）",
        displayOrder: 4,
      },
    ],
  },
  {
    slug: "winter-wonderland",
    title: "ウィンター・ワンダーランド",
    engTitle: "Winter Wonderland",
    summary:
      "ロンドン最大のクリスマスイベント。巨大マーケット、アトラクション、アイスリンク、ショーが融合した一大テーマパーク。",
    mainText:
      "**Winter Wonderland** はクリスマスマーケットという枠を超えた巨大イベントで、ハイドパーク全体が“冬のテーマパーク”に変わる。スカンジナビア風の木製シャレーが並ぶマーケットエリアに加え、英国最大級の**屋外アイスリンク**、ジェットコースター、サンタグロット、アイスキングダムなどエンタメ要素が満載。\n\n特に人気なのは **Bavarian Village**。ライブ音楽を聴きながらブラートヴルストを食べ、ビールを飲むという“ドイツの冬祭り”が体験できる。家族連れにも夜遊びにも対応した、ロンドン冬最大の名物。",
    image:
      "https://vuovopzkzwmgvlxjtykw.supabase.co/storage/v1/object/public/londonnn/wwl.jpeg",
    website: "https://hydeparkwinterwonderland.com/",
    sections: [
      {
        title: "場所",
        description:
          "[Hyde Park, London W2 2UH](https://www.google.com/maps?q=Hyde+Park,+London+W2+2UH)",
        displayOrder: 1,
      },
      {
        title: "訪問のコツ",
        description:
          "午前10時〜正午は“入場無料”だが、オンライン事前予約は必須。**混雑を避けるなら午前中が最強**。",
        displayOrder: 2,
      },
      {
        title: "周辺でできること",
        description:
          "訪問後はそのまま **ロンドン・クリスマスライト散策** に出発するのがおすすめ。ハイドパークからの動線が最適。",
        displayOrder: 3,
      },
      {
        title: "期間",
        description: "例年11月中旬 〜 1月上旬（※クリスマス当日は休業。正確な日程は公式サイトで確認）",
        displayOrder: 4,
      },
    ],
  },
  {
    slug: "spitalfields-christmas-market",
    title: "スピタルフィールズ・クリスマスマーケット",
    engTitle: "Spitalfields Christmas Market",
    summary:
      "独立系デザイナーや職人ブランドが揃う、ギフト探しに最適なマーケット。ワークショップやライブも開催。",
    mainText:
      "**スピタルフィールズ**は“ギフト品質”で選ぶならロンドン随一。独立系ショップ、デザイナーズブランド、クリエイターのクラフト作品が多く、他にはない一点物が見つかる。12月は“Shopping Lates”やライブ音楽、ワークショップなどイベントも多数。\n\n隣接する **Bishops Square** もホリデー仕様に変わり、新たなシャレーやライトインスタレーションが追加されて、エリア全体がきらめく冬のストリートに変身する。",
    image:
      "https://vuovopzkzwmgvlxjtykw.supabase.co/storage/v1/object/public/londonnn/spitalfields-cmarket.jpeg",
    website:
      "https://www.spitalfields.co.uk/upcoming-events/christmas-spitalfields/",
    sections: [
      {
        title: "場所",
        description:
          "[Old Spitalfields Market, London E1 6EW](https://www.google.com/maps?q=Old+Spitalfields+Market,+London+E1+6EW)",
        displayOrder: 1,
      },
      {
        title: "訪問のコツ",
        description:
          "ギフト探しに最適。**平日 または 午前中**が狙い目。週末は非常に混雑するため余裕を持ちたい。",
        displayOrder: 2,
      },
      {
        title: "周辺でできること",
        description:
          "周辺にはストリートアートの名所が多く、**ショーディッチのアート散策ルート**と合わせて楽しめる。",
        displayOrder: 3,
      },
      {
        title: "期間",
        description: "例年11月下旬 〜 1月上旬（正確な日程は公式サイトで確認）",
        displayOrder: 4,
      },
    ],
  },
  {
    slug: "leicester-square-christmas-market",
    title: "レスター・スクエア・クリスマスマーケット",
    engTitle: "Leicester Square Christmas Market",
    summary:
      "ウェストエンドの中心で楽しむにぎやかなクリスマスマーケット。スピーゲルテントと大人向けショー“LA CLIQUE”が名物。",
    mainText:
      "**レスター・スクエア**は、ロンドンの劇場街の中心に位置するクリスマスのホットスポット。木製シャレーには雑貨、ギフト、ホリデーフードが並び、夜の散策にぴったり。中心には1920年代スタイルの伝統的な**スピーゲルテント**が特設され、人気ショー *La Clique* による大人向けのキャバレー・サーカス・コメディが上演される。\n\n近年は**アイススケートリンクも設置**され、ひときわ華やかな雰囲気に。周囲の劇場と光に囲まれ、ロンドンらしい冬のナイトアウトを楽しむには最高のロケーション。混雑は避けられないが、それも含めて“ウェストエンドのクリスマスらしさ”を体験できる。",
    image:
      "https://vuovopzkzwmgvlxjtykw.supabase.co/storage/v1/object/public/londonnn/leistersqcm.jpeg",
    website:
      "https://leicestersquare.london/newsletters/christmas-in-leicester-square",
    sections: [
      {
        title: "場所",
        description:
          "[Leicester Square, London WC2H 7LU](https://www.google.com/maps?q=Leicester+Square,+London+WC2H+7LU)",
        displayOrder: 1,
      },
      {
        title: "訪問のコツ",
        description:
          "混雑を避けたいなら **午後の早い時間帯** が最適。夜は華やかだが非常に混むため、スケートリンクや飲食を楽しむなら日中が快適。",
        displayOrder: 2,
      },
      {
        title: "周辺でできること",
        description:
          "近くの **パラディウム劇場のパントマイム公演** が冬の人気演目。劇場街なので、夜の観劇と組み合わせると満足度が高い。",
        displayOrder: 3,
      },
      {
        title: "期間",
        description: "例年11月上旬 〜 1月上旬（正確な日程は公式サイトで確認）",
        displayOrder: 4,
      },
    ],
  },
  {
    slug: "battersea-power-christmas-market",
    title: "バタシー・パワーステーション・クリスマスマーケット",
    engTitle: "Battersea Power Station Christmas Market",
    summary:
      "ロンドン唯一のリバーサイド・アイスリンクと150以上のショップを備える巨大クリスマス会場。",
    mainText:
      "**バタシー・パワーステーション**は、テムズ川沿いに位置する再開発エリアで、冬はハイテク装飾とクリスマスイルミネーションで壮観な景色に変わる。ロンドン唯一の**リバーサイドアイスリンク**が登場し、ホリデーシーズンの人気スポットに。\n\n150以上の店舗が出店し、ハンドメイドギフト、パーソナライズド装飾、スイーツ、セラミック、ジュエリーなど幅広い。家族向けにヴィンテージ遊具、カロousel、クリスマスシネマもあり、展望アトラクション“Lift 109”から眺める冬のロンドンは圧巻。",
    image:
      "https://vuovopzkzwmgvlxjtykw.supabase.co/storage/v1/object/public/londonnn/batterseapowerstation-christmas.jpeg",
    website: "https://batterseapowerstation.co.uk/christmas/",
    sections: [
      {
        title: "場所",
        description:
          "[Battersea Power Station, London SW11 8DD](https://www.google.com/maps?q=Battersea+Power+Station,+London+SW11+8DD)",
        displayOrder: 1,
      },
      {
        title: "訪問のコツ",
        description:
          "屋内外の見どころが多いため、**半日〜1日かけて回る**のがおすすめ。Turbine B の“60人の作家マーケット”も必見。",
        displayOrder: 2,
      },
      {
        title: "周辺でできること",
        description:
          "対岸から見る **パワーステーションのライトショー** は圧巻。冬の夜景スポットとして非常に優秀。",
        displayOrder: 3,
      },
      {
        title: "期間",
        description: "例年11月上旬 〜 1月上旬（正確な日程は公式サイトで確認）",
        displayOrder: 4,
      },
    ],
  },
];
