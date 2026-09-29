# CLAUDE.md

Project-specific instructions for Claude Code when working in this repository.

## Verification

- 動作確認(devサーバー起動・ブラウザでの目視確認・curlでのHTML確認など)は不要。型チェック(`npx tsc --noEmit`)やビルド(`next build`)などの静的な確認で十分。
- ユーザーから明示的に「確認して」と言われた場合のみ、動作確認を行う。
- 日本語本文をDBに投入する前(コラム・british-english・modern-britain・event週次ダイジェスト・観光スポット・その他マークダウン本文を持つコンテンツ全般)は、太字(`**`)が正しく描画されるかを確認する。CommonMarkのright-flanking規則により、閉じ`**`の直前が句読点・閉じ括弧で直後が日本語文字だと`**`が生のまま表示される。react-markdownで実際にレンダリングして生の`**`が残っていないか確認し、残っていれば投入前に修正する。column/british-english/modern-britain/event-weekly-briefの既存データの点検には`scripts/fix-content-markdown-bold.ts --dry`が使える。

## Commit

- タスクが完了したら、都度ユーザーに確認を取らずgit commitまで行ってよい。
- commit messageは英語で記載。
- git push は対象外。明示的に頼まれた時のみ行う。
