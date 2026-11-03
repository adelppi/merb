# D-0022 札のタップとドラッグは Gesture Handler 3 の hooks で組み、出題の画面のスクロールも Gesture Handler の ScrollView にする

- 日付: 2026-11-03
- 決めた人: adelppi が不具合を報告し、AI が直し方を選んだ。PR で adelppi が確かめる
- 関係する Issue と PR: #48
- 解決した未解決の項目: なし
- 置き換える記録: [D-0016](D-0016-math-and-drag-libs.md) のうち、札のタップとドラッグの組み方（`Pressable` と `Gesture.Pan()`）の点

## 背景

札を長押ししても、ドラッグできなかった。タップでは運べる。[D-0016](D-0016-math-and-drag-libs.md) では、タップを `Pressable` の `onPress`、ドラッグを `Gesture.Pan()` で組み、両方を同じ札に付けていた。出題の画面のスクロールは、React Native の `ScrollView` だった。

## 決定

- 札のタップとドラッグは、`react-native-gesture-handler` 3 の `usePanGesture`（250 ミリ秒の長押しのあとに始める）と `useTapGesture` で組む。2つは `useExclusiveGestures` で1つにまとめ、`GestureDetector` に渡す。長押しの前に指を離したときは、タップとして運ぶ。
- 札から `Pressable` を外す。VoiceOver のダブルタップは `onAccessibilityTap` で受け、タップと同じに運ぶ。
- 出題の画面のスクロールは、`react-native-gesture-handler` の `ScrollView` にする。

## ほかの選択肢

- 旧 API の `Gesture.Pan()` を使い続け、`Pressable` と React Native の `ScrollView` のままにする案。この組み合わせで長押しのドラッグが動かなかったので採らなかった。

## 根拠

- 動かない原因は、実機でもシミュレーターでも確かめていない。`Pressable` が触れた操作を受け取ること、React Native の `ScrollView` が Gesture Handler の外でスクロールを始めることが、長押しのあとの動きを奪っていると考えた。
- 旧 API の `Gesture` は Gesture Handler 3 でも使えるが、`ScrollView` との組み合わせは 3 の hooks と `ScrollView` で扱う作りになっている。
- 直したあとのドラッグの動作は、`pnpm exec expo export --platform ios` でバンドルが作れることまでを確かめた。画面の動作は、手元の確認が要る（[D-0021](D-0021-operation-test-tool.md)）。

## 影響

- `src/components/CardBoard.tsx` と `src/components/QuizView.tsx` を書き換える。
- 札を運ぶ振る舞いは変わらないので、`docs/specs/quiz.md` は書き換えない。
