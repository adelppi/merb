# リリースの手順

App Store への提出と、公開後の修正の手順を書く。理由は [D-0031](decisions/D-0031-release-policy.md) にある。

## 最初の提出の前に

最初の提出の前に、次を1回だけ行う。

1. App Store Connect で、アプリの ID を `com.adelppi.merb`、名前を `merb` にしてアプリを作る。
2. 作ったアプリの「Apple ID」の数字を、`eas.json` の `submit.production.ios.ascAppId` に書く。
3. `eas credentials --platform ios` を実行し、Apple ID でログインして、署名の証明書と提出用の API キーを用意する。

## 配信のしかたの選び方

| 変更 | 配信のしかた |
|---|---|
| 問題の JSON、文言、JS と TS の修正 | OTA |
| パッケージの追加と更新、Expo の更新 | ストア |
| `app.json` のネイティブの設定、アイコン | ストア |

迷ったら `eas fingerprint:compare` で、提出済みのビルドと手元の差を確かめる。差があれば、ストアへ提出する。

## バージョンの決め方

- 機能を足すストア版は、`version` の2つ目の数を上げる（`1.1.0`）。
- 修正だけのストア版は、3つ目の数を上げる（`1.0.1`）。
- OTA では `version` を変えない。
- iOS のビルド番号は EAS が増やすので、手で変えない。

## ストア版の手順

### 1. 提出の前に確かめる

`main` の最新のコミットで、次をすべて通す。

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm dlx expo-doctor
```

TestFlight の配布をしないので、Release 構成のビルドを実機に入れて確かめる。

```bash
pnpm exec expo run:ios --device --configuration Release
```

実機では次を確かめる。

- ホーム画面にアイコンが出ること
- 日本語と英語の両方で、出題から答え合わせまで進めること
- 機内モードでも出題できること
- アプリを閉じて開き直しても、間違えた問題と選んだ分類が残っていること

### 2. 版を上げる

Issue を立て、`app.json` の `version` と `package.json` の `version` を同じ値に上げる PR を出す。

### 3. ビルドして提出する

```bash
eas build --platform ios --profile production --auto-submit
```

処理が終わると、ビルドが App Store Connect に出る。

### 4. タグを付ける

提出したビルドのコミットにタグを付け、GitHub に Release を作る。

```bash
git tag v1.0.0 <コミット>
git push origin v1.0.0
gh release create v1.0.0 --generate-notes
```

### 5. 審査に出す

App Store Connect で、提出したビルドを選んで審査に出す。審査に通ったら公開する。

## OTA の手順

`main` に修正をマージしたあと、そのコミットで次を実行する。

```bash
pnpm lint && pnpm typecheck && pnpm test
eas update --channel production --environment production --message "<変更の内容>"
git tag v1.0.0-ota.1
git push origin v1.0.0-ota.1
```

- タグの `1.0.0` は、配信先のストア版の `version` にする。
- 末尾の番号は、そのストア版の中で 1 から増やす。
- 利用者のアプリは、起動したときに更新を確かめて取り込み、次の起動で反映する。

OTA に問題があったときは、次を実行して前の状態に戻す。

```bash
eas update:rollback
```

## 掲載情報

App Store Connect の名前は `merb` にする。無料で、全地域に配信する。説明文、スクリーンショット、プライバシーポリシー、サポートの URL は、掲載情報の Issue で用意する。
