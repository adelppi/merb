# D-0021 操作テストは Maestro で手元から実行し、画面の判断は純粋な関数にして Vitest で確かめる

- 日付: 2026-11-03
- 決めた人: Claude Code（Issue #35 の指示に沿って選んだ。adelppi が PR で確かめる）
- 関係する Issue と PR: #35
- 解決した未解決の項目: OQ-015 のうち、画面の部品の操作テストと実機に近い操作テストの道具
- 置き換える記録: D-0015 のうち、操作テストの道具を画面ができるときに決めるとした点

## 背景

[D-0015](D-0015-test-and-toolchain.md) は、画面の部品の操作テストと実機に近い操作テストの道具を、出題の画面を作る #35 で決めるとした。候補は React Native Testing Library（部品の操作）と Maestro（実機やシミュレーターの操作）だった。このリポジトリには CI がなく、単体テストは Vitest で動いている。

## 決定

- 画面の操作テストは Maestro で書く。フローは `maestro/` に YAML で置き、開発用サーバーを動かした iOS シミュレーターの Expo Go に対して、手元で `maestro test maestro/<フロー>.yaml` として実行する。
- 画面が見せる状態の判断と、札を落とした位置から運び先を決める処理は、React から切り離した純粋な関数（`src/quiz/view.ts`、`src/quiz/drop.ts`）にして、Vitest で確かめる。
- React Native Testing Library と `jest-expo` は入れない。Jest も足さない。
- Maestro は、PR を出す前の確認（lint、型検査、単体テスト）には入れない。シミュレーターと Expo Go と開発用サーバーが要り、CI がないので、仕様の受け入れ条件のうち画面の操作を確かめたいときに実行する。
- 確かめ用に、出題の画面のクエリ `question`（問題の `id`）を足した。フローが決まった問題を出せるようにするためで、画面からは付けない（`quiz.md`）。
- Maestro では、札の長押しドラッグを送れない（下の「根拠」）。ドラッグは、落とす位置から運び先を決める処理を Vitest で確かめ、画面での動きは手で確かめる。

## ほかの選択肢

- React Native Testing Library と `jest-expo`。部品の操作を Node の中で確かめられる。ただし、Vitest のほかに Jest を足すことになり、`jest-expo`、`@testing-library/react-native` などの依存が増える。札の部品は Reanimated、Gesture Handler、WebView、`expo-glass-effect`、`expo-symbols` に頼っていて、それぞれにモックが要る。モックの上で通っても、実機で動くことの裏付けにならない。画面の判断は純粋な関数に出して Vitest で確かめられるので、採らなかった。
- Maestro を CI で動かす案。このリポジトリには CI がなく、macOS のランナーとシミュレーターの準備を足すと、この Issue の範囲を超えるので、採らなかった。
- Detox。ビルドした実機向けのアプリが要り、Expo Go では動かせないので採らなかった。
- 操作テストを入れず、手で確かめるだけにする案。仕様の受け入れ条件との対応を残せないので採らなかった。

## 根拠

- 試した結果は次のとおり。Maestro 2.6.1 は、iOS 26.5 のシミュレーター（iPhone 17 Pro）の Expo Go 58.0.7 に、`openLink` で開発用サーバーのリンクを開き、表示された文字をタップして確かめられた。正解、不正解、答えを見る、戻るボタンの4つのフロー（`maestro/`）が通った。
- 札のタップは Maestro で動いた。札の読み上げ用の名前（札の文字列）で押せる。
- 札のドラッグは動かなかった。Maestro の `swipe` は、押したまま待たずに動かし始める。札は 250 ミリ秒の長押しのあとにドラッグを始める（D-0016）ので、長押しが済む前に指が動き、ドラッグが始まらなかった。`swipe` の `duration` を 2000 ミリ秒にしても、結果は同じだった。
- Simulator.app にマウスの操作を送る方法（`CGEvent`）も試したが、この環境にはアクセシビリティの権限がなく、届かなかった。`idb` は入っていない。

## 影響

- `maestro/` に、`correct.yaml`、`incorrect.yaml`、`reveal.yaml`、`back.yaml` を置いた。
- `docs/specs/quiz.md` の受け入れ条件に、Vitest と Maestro のどちらで確かめるかを書いた。
- `open-questions.md` の OQ-015 を、解決済みへ移した。
- `AGENTS.md` に、Maestro の置き場と、PR を出す前の確認には入れないことを書いた。
- 札のドラッグを画面で確かめる方法は、今後の課題として残る。XCUITest で長押しからのドラッグを書く、または `idb` を入れる方法が考えられる。
