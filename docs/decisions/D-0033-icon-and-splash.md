# D-0033 アイコンは Icon Composer のファイルをそのまま使い、起動画面にシグマを出し、アプリを明るい表示に固定する

- 日付: 2026-11-04
- 決めた人: adelppi（Issue #74）。色の値は Claude Code が決めた。adelppi が PR で確かめる
- 関係する Issue と PR: #74
- 解決した未解決の項目: なし
- 置き換える記録: なし

## 背景

adelppi が Icon Composer でアイコンを作った。リポジトリにはアイコンと起動画面の設定がなかった。

## 決定

- アイコンは `assets/merb.icon` に置き、`app.json` の `ios.icon` に指定する。
- 起動画面は `expo-splash-screen` の設定で作る。画面の中央に、幅 120 のシグマを出す。
- 明るい表示の背景は `#f2f2f7`、シグマは藍の `#3658ac` にする。どちらも `src/components/theme.ts` の色である。
- `app.json` の `userInterfaceStyle` を `light` にし、アプリを常に明るい表示で出す。
- シグマの画像は、`merb.icon` の `sigma_white.png` の形から作り、`assets/` に置く。

## ほかの選択肢

- 1024x1024 の PNG を用意し、`ios.icon` に指定する案。Icon Composer のファイルなら明るい表示、ダークモード、色付きの見え方を OS に任せられるので採らなかった。
- `userInterfaceStyle` を `automatic` のままにし、ダークモードで暗い起動画面を出す案。Release のビルドで試すと、暗い起動画面のあとに明るいホームへ切り替わり、ステータスバーの白い文字が明るい背景の上で読めなかったので採らなかった。
- アプリ全体をダークモードに対応させる案。別の Issue の大きさになるので、提出の前には行わない。

## 根拠

- [Expo の App icons の資料](https://docs.expo.dev/develop/user-interface/app-icons/)に、SDK 54 以降は `ios.icon` に `.icon` を指定できるとある。
- `src/components/theme.ts` の色は明るい表示の1組だけで、`src/` にダークモードの処理はない。
- [expo-splash-screen の資料](https://docs.expo.dev/versions/latest/sdk/splash-screen/)に、起動画面は Release のビルドで確かめるよう強く勧めるとある。

## 影響

- `docs/specs/app-launch.md` を足した。
- `app.json`、`package.json`、`pnpm-lock.yaml` を書き換え、`assets/` を足した。
- `AGENTS.md` の置き場の表に `assets/` を足した。
