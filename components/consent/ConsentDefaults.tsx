/**
 * 同意管理(CMP)が求められる地域。英国・EEA(EU27か国とアイスランド・
 * リヒテンシュタイン・ノルウェー)・スイス。Google の「欧州の規制」向け
 * メッセージが出る範囲と揃えている。ここだけ増やすと、メッセージが
 * 出ないのに拒否から始まり、二度と許可に戻らない地域ができる。
 */
const CONSENT_REGIONS = [
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR",
  "DE", "GR", "HU", "IE", "IT", "LV", "LT", "LU", "MT", "NL",
  "PL", "PT", "RO", "SK", "SI", "ES", "SE",
  "IS", "LI", "NO",
  "GB", "CH",
];

const script = `
window.dataLayer = window.dataLayer || [];
function gtag(){window.dataLayer.push(arguments);}
gtag('consent', 'default', {
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  analytics_storage: 'denied',
  wait_for_update: 500,
  region: ${JSON.stringify(CONSENT_REGIONS)}
});`;

/**
 * Google の同意モードの初期値。英国・EEA・スイスからのアクセスだけ、
 * 広告と分析の Cookie を「拒否」から始める。それ以外の地域は既定の許可のまま。
 *
 * 読者の選択を受け取るのは、AdSense の「プライバシーとメッセージ」で作った
 * 欧州の規制向けメッセージ(Google の CMP)。選ばれると CMP が
 * consent update を送り、GA はそこから Cookie を使い始める。ただし CMP は
 * adsbygoogle.js と一緒にしか読まれないので、広告の無いページ(/privacy・
 * /contact など)には来ない。初期値をここで持たないと、そうしたページで
 * GA が同意の無いまま Cookie を書く。
 *
 * <head> のインラインスクリプトにしているのは、HTML の読み込み中に同期で
 * 実行され、afterInteractive で読まれる GA の config より必ず先に走るため。
 *
 * AdSense 側の「同意モード」の設定(広告目的・分析目的の2つ)を切ると、
 * この地域の GA は Cookie を使わない計測のまま戻らなくなる。
 */
export default function ConsentDefaults() {
  return (
    <script
      id="google-consent-defaults"
      dangerouslySetInnerHTML={{ __html: script }}
    />
  );
}
