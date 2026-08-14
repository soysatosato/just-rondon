/**
 * TfL Unified API から地下鉄・DLR・エリザベス線・オーバーグラウンドの
 * 運行状況を取得する。
 *
 * 設計メモ:
 * 1. APIキーは不要。無登録でも 1分50回まで叩ける(登録すると500回)。
 *    サーバー側で数分キャッシュして配るので、無登録の枠で十分足りる。
 * 2. TfL の statusSeverity は 0〜20 の数値。数字が小さいほど深刻で、
 *    10 が「Good Service」。この境界は TfL 側の仕様なので定数に固定する。
 * 3. 英語の statusSeverityDescription をそのまま出すと日本語話者には
 *    伝わらないので、日本語ラベルへ写像する。未知の値が来ても落とさず
 *    英語のまま出す(TfL は稀に新しい severity を追加する)。
 */

/** TfL が返す運行状況のうち、実際に使うフィールドだけを写した型。 */
type TflLineStatusEntry = {
  statusSeverity: number;
  statusSeverityDescription: string;
  reason?: string;
};

type TflLineStatusResponse = {
  id: string;
  name: string;
  modeName: string;
  lineStatuses?: TflLineStatusEntry[];
};

/** 表示上の深刻度。UIの色分けはこの3段階だけに寄せる。 */
export type SeverityLevel = "good" | "minor" | "severe";

export type LineStatus = {
  id: string;
  name: string;
  /** 日本語に直した状況ラベル。例: 「平常運転」 */
  label: string;
  /** TfL の英語表記。原文を確認したい読者のために残す。 */
  labelEn: string;
  level: SeverityLevel;
  /** 遅延理由。平常運転のときは undefined。 */
  reason?: string;
};

export type TflStatusResult = {
  lines: LineStatus[];
  /** 取得時刻(ISO)。「何時時点の情報か」の表示に使う。 */
  fetchedAt: string;
};

/** TfL 仕様: severity 10 が Good Service。 */
const SEVERITY_GOOD = 10;

/**
 * severity(0〜20) → 表示上の深刻度。
 *
 * 大小比較で段階分けしてはいけない。TfL の severity は深刻さの
 * 一次元の尺度ではなく、10 を境に番号が振り直された分類コードだから。
 * 実際 11 は Part Closed、16 は Not Running で、どちらも 10(Good Service)
 * より大きいが平常ではない。範囲比較にすると運休を「平常運転」と
 * 表示してしまう。TfL の /Line/Meta/Severity の値をそのまま写す。
 */
const SEVERITY_LEVEL: Record<number, SeverityLevel> = {
  0: "minor", // Special Service (特別ダイヤ。運休ではない)
  1: "severe", // Closed
  2: "severe", // Suspended
  3: "severe", // Part Suspended
  4: "severe", // Planned Closure
  5: "severe", // Part Closure
  6: "severe", // Severe Delays
  7: "minor", // Reduced Service
  8: "minor", // Bus Service
  9: "minor", // Minor Delays
  10: "good", // Good Service
  11: "severe", // Part Closed
  12: "minor", // Exit Only
  13: "minor", // No Step Free Access
  14: "minor", // Change of frequency
  15: "minor", // Diverted
  16: "severe", // Not Running
  17: "minor", // Issues Reported
  18: "good", // No Issues
  19: "minor", // Information
  20: "severe", // Service Closed (運行時間外)
};

/**
 * TfL の英語ラベル → 日本語。
 * TfL が公開している severity 一覧に対応する。
 */
const STATUS_LABEL_JA: Record<string, string> = {
  "Good Service": "平常運転",
  "Minor Delays": "軽い遅延",
  "Severe Delays": "大幅な遅延",
  "Part Suspended": "一部区間で運転見合わせ",
  "Suspended": "全線運転見合わせ",
  "Part Closure": "一部区間で運休",
  "Planned Closure": "計画運休",
  "Part Closed": "一部区間で運休",
  "Closed": "運休",
  "Service Closed": "運行終了",
  "Reduced Service": "減便",
  "Bus Service": "代行バス",
  "Diverted": "迂回運転",
  "Not Running": "運行なし",
  "Issues Reported": "運行に乱れ",
  "No Issues": "平常運転",
  "Information": "お知らせあり",
  "Exit Only": "出口専用",
  "No Step Free Access": "段差なしルート利用不可",
  "Change of frequency": "運転間隔の変更",
  "Special Service": "特別ダイヤ",
};

/**
 * 未知の severity は "minor" に倒す。
 * TfL が新しいコードを足したときに "good" に倒すと、実際には乱れて
 * いる路線を平常運転と表示してしまう。逆に "severe" に倒すと平常時に
 * 赤が出て誤解を招く。どちらの誤りも避けられる中間を既定にする。
 */
function toLevel(severity: number): SeverityLevel {
  return SEVERITY_LEVEL[severity] ?? "minor";
}

/**
 * TfL の reason は "Bakerloo Line: Minor delays due to ..." のように
 * 路線名を頭に繰り返し、末尾に空白を残していることが多い。
 * 路線名は UI 側で別に出しているので、重複部分を落として読みやすくする。
 */
function cleanReason(reason: string | undefined, lineName: string): string | undefined {
  if (!reason) return undefined;
  const trimmed = reason.replace(new RegExp(`^${lineName} Line:\\s*`, "i"), "").trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

/** 取得対象。旅行者が実際に乗る路線に絞る(バスは本数が多すぎるので除く)。 */
const MODES = "tube,dlr,elizabeth-line,overground";

const ENDPOINT = `https://api.tfl.gov.uk/Line/Mode/${MODES}/Status`;

/**
 * キャッシュ秒数。TfL 自体の更新間隔が数分なのでこれ以上短くしても
 * 中身は変わらず、無登録の利用枠(1分50回)を無駄に削るだけになる。
 * 逆に長すぎると「遅延しているのに平常運転と出る」時間が伸びる。
 */
export const TFL_REVALIDATE_SECONDS = 120;

/**
 * 運行状況を取得する。
 *
 * ネットワーク障害や TfL 側の不調で落ちることがあるため、
 * 失敗は例外として投げる。呼び出し側(route handler)で握りつぶし、
 * ウィジェット自体を非表示にする方針。
 */
export async function fetchTflStatus(): Promise<TflStatusResult> {
  const res = await fetch(ENDPOINT, {
    headers: { Accept: "application/json" },
    // no-store にすると route handler の revalidate と衝突して
    // ルートが強制的に動的になり、キャッシュが一切効かなくなる。
    // 秒数はここで持ち、route handler 側と揃える。
    next: { revalidate: TFL_REVALIDATE_SECONDS },
  });

  if (!res.ok) {
    throw new Error(`TfL API responded ${res.status}`);
  }

  const data = (await res.json()) as TflLineStatusResponse[];

  const lines: LineStatus[] = data.map((line) => {
    // 1路線に複数の status が付くことがある(例: 一部運休 + 軽い遅延)。
    // 最も深刻なものを代表として見せる。
    const statuses = line.lineStatuses ?? [];
    const worst = statuses.reduce<TflLineStatusEntry | undefined>(
      (acc, cur) => (!acc || cur.statusSeverity < acc.statusSeverity ? cur : acc),
      undefined,
    );

    const severity = worst?.statusSeverity ?? SEVERITY_GOOD;
    const labelEn = worst?.statusSeverityDescription ?? "Good Service";

    return {
      id: line.id,
      name: line.name,
      label: STATUS_LABEL_JA[labelEn] ?? labelEn,
      labelEn,
      level: toLevel(severity),
      reason: cleanReason(worst?.reason, line.name),
    };
  });

  // 乱れている路線を上に。同じ深刻度なら TfL の返す順(おおむね五十音/アルファベット順)を保つ。
  const levelOrder: Record<SeverityLevel, number> = { severe: 0, minor: 1, good: 2 };
  lines.sort((a, b) => levelOrder[a.level] - levelOrder[b.level]);

  return { lines, fetchedAt: new Date().toISOString() };
}
