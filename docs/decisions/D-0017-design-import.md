# D-0017 Claude Design の iOS デザインは docs/design/ios/ に参照資料として置く

- 日付: 2026-11-03
- 決めた人: AI が推奨を選び、adelppi が PR で確かめる
- 関係する Issue と PR: #34
- 解決した未解決の項目: なし
- 置き換える記録: なし

## 背景

画面を React Native で作り直す Issue（#35 出題、#36 分類、#37 設定）の前に、Claude Design で用意した iOS のデザインを取り込み、仕様と照らし合わせる必要があった。デザインのファイルをどこに置くか、仕様との差をどこに記録するかが決まっていなかった。

## 決定

- デザインのファイルは `docs/design/ios/` に、Claude Design から読み取ったままの内容で置く。置くのは `MerbQuiz2.dc.html`、`merb iOS.dc.html`、`ios-frame.jsx`、`support.js` の4つ。これらはコードではなく参照資料で、アプリには読み込まない。
- デザインと仕様の差、取り込む案、取り込まない案、決められないものは `docs/design/README.md` に書く。決められないものは `open-questions.md` に起票する。
- 仕様（`docs/specs/`）の書き換えは、各画面の Issue（#35、#36、#37）で行う。この Issue では仕様を書き換えない。
- Biome と TypeScript の対象は、`src/`、`content/` の JSON、ルートの `*.ts` と `*.json` なので、`docs/design/` は設定を変えなくても対象外になる。

## ほかの選択肢

- 仕様の末尾に「デザインからの差」の節を足す案。仕様は画面の Issue で書き換えるため、その前に仕様を二重に書き換えることになり、採らなかった。
- デザインのファイルをリポジトリに置かず、Claude Design のプロジェクトだけにデザインを置く案。Claude Design のスタンドアロン版は 2026-12-14 に閉じる予定で、あとから読めなくなるおそれがあるので採らなかった。

## 根拠

- 画面を作る Issue で、デザインの寸法、色、文言を同じ場所から読める。
- 参照資料はコードの検査（lint、型検査、テスト）の対象に入れない。

## 影響

- `docs/design/` を新設した。`AGENTS.md` と `docs/README.md` に置き場を書いた。
- 取り込み時に見つかった決められないものを、`open-questions.md` の OQ-018 から OQ-021 に起票した。
