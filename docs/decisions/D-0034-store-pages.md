# D-0034 プライバシーポリシーとサポートは GitHub Pages で公開し、問い合わせは GitHub の Issues で受ける

- 日付: 2026-11-05
- 決めた人: adelppi（Issue #85）。公開のしかたの細部は Claude Code が決めた。adelppi が PR で確かめる
- 関係する Issue と PR: #85
- 解決した未解決の項目: なし
- 置き換える記録: なし

## 背景

App Store に出すには、プライバシーポリシーとサポートの URL が要る。問い合わせ先を決める必要もあった。

## 決定

- `docs/privacy.html` と `docs/support.html` を、`main` の `docs/` から GitHub Pages で公開する。
- `docs/.nojekyll` を置き、Jekyll の変換を使わない。
- 問い合わせは GitHub の Issues で受ける。
- 日本語と英語を1つのページに並べて書く。
- App Store のプライバシーの申告では、「データを収集しない」と答えない。

## ほかの選択肢

- Jekyll で Markdown を変換する案。`docs/design/ios/` に `{{` を含むファイルがあるので採らなかった。
- 公開用のブランチを別に作る案。PR で文面を確かめにくいので採らなかった。
- メールで問い合わせを受ける案。メールアドレスを公開することになるので採らなかった。

## 根拠

- `expo-updates` の `FileDownloader.swift` は、更新の確認で `EAS-Client-ID` を送る。
- [Expo の資料](https://docs.expo.dev/eas/observe/reference/client-id/)に、この id はインストールごとのランダムな値で、仮名の情報として扱うよう書かれている。
- [Expo のプライバシーポリシー](https://expo.dev/privacy)に、更新の機能で OS と、更新を受け取ったかを確かめるランダムなトークンを集めることがある、とある。IP アドレスを自動で集めることも書かれている。

## 影響

- `docs/privacy.html`、`docs/support.html`、`docs/.nojekyll`、`docs/store-listing.md` を足した。
- `docs/` の中のファイルは、Pages の URL でも読めるようになる。リポジトリは公開なので、読める範囲は変わらない。
