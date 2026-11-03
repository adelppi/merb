# D-0014 対象 OS は iOS だけにし、画面の移動に Expo Router を使う

- 日付: 2026-11-03
- 決めた人: adelppi（対象 OS）。画面の移動は、AI が推奨を選び、PR で確認する
- 関係する Issue と PR: #32
- 解決した未解決の項目: OQ-015 のうち、対象 OS と画面の移動
- 置き換える記録: なし

## 背景

[D-0012](D-0012-native-app.md) でアプリを React Native と Expo にすると決めた。Expo のプロジェクトを作るには、対象にする OS と、画面の移動に使うものを決める必要があった。取り込むデザイン（`merb iOS.dc.html`）は iOS 向けである。

## 決定

- 対象 OS は iOS だけにする。Android は、あとで別の Issue を立てて扱う。
- `app.json` の `platforms` は `["ios"]` にし、iPad 向けの表示（`supportsTablet`）は有効にしない。
- 画面の移動には Expo Router を使う。画面のファイルは `src/app/` に置く。
- 対象にする iOS の最低バージョンは決めない。[OQ-017](../open-questions.md) に書く。

## ほかの選択肢

- iOS と Android の両方を対象にする案。採らなかった。取り込むデザインが iOS 向けで、決める人が iOS だけと決めたため。
- React Navigation を直接使う案。採らなかった。Expo Router は React Navigation の上に作られており、Expo の雛形の標準でもある。画面のファイルを置けば移動先ができ、画面の数が少ない merb では設定が少なくて済む。

## 根拠

- 対象 OS は、決める人（adelppi）が iOS だけと決めた。
- Expo Router を使った雛形で、`expo export --platform ios` が通り、`expo-doctor` の 20 項目の検査もすべて通ることを確かめた。このとき TypeScript の版は [D-0015](D-0015-test-and-toolchain.md) のとおり合わせた。

## 影響

- `AGENTS.md` の「コードを書くとき」に、対象 OS と画面の置き場を書く。
- `src/app/` に、`_layout.tsx` と、問題の数を出すだけの `index.tsx` を置く。画面は #35〜#37 で作り直す。
- Android を対象にするときは、別の Issue と決定で扱う。
