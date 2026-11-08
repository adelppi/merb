# D-0031 App Store へ TestFlight の配布なしで出し、公開後の修正に EAS Update を使う

- 日付: 2026-11-04
- 決めた人: adelppi（Issue #72 の依頼）。依頼に書かれていない細部は Claude Code が決めた。adelppi が PR で確かめる
- 関係する Issue と PR: #72
- 解決した未解決の項目: なし
- 置き換える記録: なし

## 背景

adelppi がアイコンを作り、App Store へ出す準備を依頼した。ビルド、リリース手順、GitHub のタグ、EAS、EAS Update の扱いを決める必要があった。依頼の時点で、EAS のプロジェクト、`eas.json`、`expo-updates`、GitHub のタグはなかった。

## 決定

- App Store での名前は `merb`、アプリの ID は `com.adelppi.merb` にする。
- 最初のバージョンは `1.0.0` にし、無料で、全地域に配信する。
- TestFlight の配布はせず、最初のビルドから本番の審査に出す。提出の前の確認は、Release 構成のビルドを手元の実機に入れて行う。
- ビルドと提出は EAS Build と EAS Submit で行う。`ios/` はコミットせず、EAS のビルドのたびに生成する。
- `version` は人が決め、iOS のビルド番号は EAS のリモートの値を自動で増やす（`appVersionSource: "remote"`、`autoIncrement: true`）。
- 公開後の修正には EAS Update を使う。チャネルは `production` にする。
- `runtimeVersion` のポリシーは `fingerprint` にする。
- `expo-updates` は、最初にストアへ提出するビルドから入れる。
- ストア版のタグは `v1.0.0` の形にし、提出したビルドのコミットに付ける。OTA のタグは `v1.0.0-ota.1` の形にし、配信したコミットに付ける。
- リリースは最初は手で実行する。EAS Workflows での自動化は、手順が固まってから別の Issue で扱う。

手順は [release.md](../release.md) に書く。

## ほかの選択肢

- TestFlight で確かめてから審査に出す案。adelppi の判断で採らなかった。
- `runtimeVersion` を `appVersion` にする案。ネイティブのコードを変えて `version` を上げ忘れると、合わないビルドに OTA が届くので採らなかった。
- `expo-updates` を公開のあとで入れる案。OTA を受け取るには `expo-updates` を含むビルドが要り、ストアの審査がもう1回要るので採らなかった。
- 最初から EAS Workflows で自動化する案。この時点で CI がなく、手順も試していないので採らなかった。

## 根拠

- `docs/vision.md` の判断の基準の1つ目は「出す問題の読み方が正しいこと」である。EAS Update があれば、読み方の誤りを審査を待たずに直せる。
- 問題の JSON の扱いは [D-0012](D-0012-native-app.md) のまま変えない。問題は JS バンドルに同梱し、Zod の検査を通す。EAS Update が届けるのはバンドルの更新で、問題だけをサーバーから配信するものではない。
- [Expo の Runtime versions の資料](https://docs.expo.dev/eas-update/runtime-versions/)に、`fingerprint` は実行環境に影響する変更があると値が変わり、合わない更新が届く可能性をとても低くできる、とある。ただし、ビルドの回数は増える。
- [Apple の要件](https://developer.apple.com/news/upcoming-requirements/?id=04282026a)により、2026年4月28日からのアップロードには Xcode 26 以降と iOS 26 の SDK が要る。

## 影響

- `docs/release.md` を足し、`docs/README.md` の一覧に足した。
- ライセンスの種類を [OQ-022](../open-questions.md#oq-022) に書き、[D-0032](D-0032-license.md) で決めた。
- `app.json`、`eas.json`、`package.json` はこの決定の PR では変えない。別の Issue で変える。

D-0037 で配信地域の決定を置き換えた。

D-0038 で 1.0.0 の提出の前の確認を置き換えた。

D-0039 で TestFlight の内部テストの扱いを置き換えた。

D-0039 でビルドと提出の手順を置き換えた。
