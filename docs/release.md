# リリースの手順

App Store への提出と、公開後の修正の手順を書く。理由は [D-0031](decisions/D-0031-release-policy.md) と [D-0039](decisions/D-0039-build-then-submit.md) にある。

## 最初の提出の前に

最初の提出の前に、次を1回だけ行う。

1. App Store Connect で、アプリの ID を `com.adelppi.merb`、名前を `merb` にしてアプリを作る。
2. 作ったアプリの「Apple ID」の数字を、`eas.json` の `submit.production.ios.ascAppId` に書く。
3. 署名の証明書、プロビジョニングプロファイル、提出用の API キーを用意する。ターミナルで `eas build --platform ios --profile production` を対話で実行し、Apple ID でログインして、作成を聞かれたらすべて作る。`--non-interactive` では作れない。
4. App Store Connect で、配信地域、価格、トレーダーの申告、プライバシーの申告、年齢区分を入力する。内容は [store-listing.md](store-listing.md) にある。

1.0.0 では、ここまでを済ませた。次のバージョンでは要らない。

## 配信のしかたの選び方

| 変更 | 配信のしかた |
|---|---|
| 問題の JSON、文言、JS と TS の修正 | OTA |
| パッケージの追加と更新、Expo の更新 | ストア |
| `app.json` のネイティブの設定、アイコン | ストア |

迷ったら、次のコマンドで、公開中のストア版のビルドと手元の fingerprint を比べる。一致すれば OTA で届き、違えばストアへ提出する。

```bash
eas fingerprint:compare --build-id <公開中のビルドの ID> --environment production
```

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
- 読み方の音声が鳴ること。消音モードを切って確かめる
- アプリを閉じて開き直しても、間違えた問題と選んだ分類が残っていること

1.0.0 では、adelppi の判断でこの確認を省いた（[D-0038](decisions/D-0038-skip-device-check.md)）。

### 2. 版を上げる

Issue を立て、`app.json` の `version` と `package.json` の `version` を同じ値に上げる PR を出す。

### 3. ビルドする

```bash
eas build --platform ios --profile production
```

ビルドは EAS のサーバーで行い、数十分かかる。`eas build:list --platform ios --limit 1` で、状態が `finished` になったことを確かめる。

### 4. App Store Connect に送る

```bash
eas submit --platform ios --id <ビルドの ID>
```

`eas submit` は審査に出すのではなく、ビルドを App Store Connect に送るだけである。処理が終わると、ビルドが App Store Connect に出る。

### 5. タグを付ける

提出したビルドのコミットにタグを付け、GitHub に Release を作る。

```bash
git tag v1.0.0 <コミット>
git push origin v1.0.0
gh release create v1.0.0 --generate-notes
```

### 6. 審査に出す

App Store Connect で、送ったビルドを選び、新しいバージョンの「このバージョンの新機能」を書いて審査に出す。審査用のメモには [store-listing.md](store-listing.md) の文面を使い、実機の画面収録を添える。審査に通ったら公開する。

1.0.0 の最初の審査では、メモの情報が足りず Guideline 2.1 で戻された。求められたのは、起動から始まる実機の画面収録、目的と対象者、使い方、外部サービス、地域差、規制と第三者の素材の説明である。

## OTA の手順

`main` に修正をマージしたあと、そのコミットで次を実行する。最初に fingerprint を比べ、配信先のストア版と一致することを確かめる。一致しなければ、OTA ではなくストア版を出す。

```bash
pnpm lint && pnpm typecheck && pnpm test
eas fingerprint:compare --build-id <公開中のビルドの ID> --environment production
eas update --channel production --environment production --message "<変更の内容>"
git tag v1.0.0-ota.1
git push origin v1.0.0-ota.1
```

- タグの `1.0.0` は、配信先のストア版の `version` にする。
- 末尾の番号は、そのストア版の中で 1 から増やす。
- 利用者のアプリは、起動したときに更新を確かめて取り込み、次の起動で反映する。
- 配信したあと、公開版のアプリを2回開き直して、変更が出ることを確かめる。
- 審査中のアプリには配信しない。審査するアプリの中身が変わるため。

OTA に問題があったときは、次を実行して前の状態に戻す。

```bash
eas update:rollback
```

## 掲載情報

App Store Connect に入力する内容は [store-listing.md](store-listing.md) に書いてある。
