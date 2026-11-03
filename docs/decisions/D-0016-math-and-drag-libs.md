# D-0016 数式の描画は WebView の中の KaTeX、札のドラッグは Reanimated と Gesture Handler で組む

- 日付: 2026-11-03
- 決めた人: AI が候補を調べて推奨を選び、adelppi が PR で確かめる
- 関係する Issue と PR: #33
- 解決した未解決の項目: OQ-015 のうち、数式の描画と札のドラッグ
- 置き換える記録: D-0003 のうち、数式の描画（KaTeX）と札のドラッグ（dnd-kit）の点。KaTeX は使い続けるので、置き換えるのは描く場所と札のドラッグだけ

## 背景

[D-0003](D-0003-tech-stack.md) で選んだ KaTeX と dnd-kit は、ブラウザーの DOM を前提にしている。[D-0012](D-0012-native-app.md) でアプリを React Native と Expo にしたので、数式の描画と札のドラッグに使うものを選び直す必要があった。基準は `vision.md` の判断の基準の1つ目「出す問題の読み方が正しいこと」と、3つ目「スマートフォンでも操作しやすいこと」。Expo SDK 58、iOS だけが対象（[D-0014](D-0014-ios-expo-router.md)）。

## 決定

- 数式は KaTeX で描く。`katex.renderToString` で作った HTML を、`react-native-webview` の WebView で表示する。
  - 描く設定は、問題の JSON の検査と同じ `katexOptions`（`src/questions/latex.ts`）にする。
  - KaTeX の CSS と書体（woff2）はアプリに同梱し、実行時に読み込んで HTML に入れる。通信はしない。
  - WebView は数式の高さを `postMessage` で React Native 側へ返し、その高さに合わせる。
- 札の文字は React Native の `Text` で、KaTeX の書体（`KaTeX_Main` の立体と `KaTeX_Math` の斜体）を `expo-font` で読み込んで出す。書体の決まりは [D-0009](D-0009-card-font.md) のまま。
- 札のドラッグと並べ替えは、`react-native-gesture-handler` と `react-native-reanimated` で組む。
  - タップは `Pressable` の `onPress`、ドラッグは `Gesture.Pan()` を 250 ミリ秒の長押しのあとに始める。
  - 札の位置は `onLayout` で集め、指を離した位置と照らして、回答エリアの何番目か、札置き場かを決める。
  - 運んだ結果は、既存の reducer の `place`、`unplace`、`move` で表す。
- 追加する依存は `react-native-webview`、`react-native-gesture-handler`、`react-native-reanimated`、`react-native-worklets`、`expo-asset`、`expo-file-system`、`expo-font`。いずれも Expo SDK 58 向けの版（`expo install` が選ぶ版）にする。
- `katex` は引き続き `src/questions/latex.ts` の検査と、WebView に渡す HTML の生成に使う。検査で描ける問題は、画面でも同じ HTML で描ける。

## ほかの選択肢

数式の描画

- `react-native-mathjax-svg`（0.9.9）。MathJax で SVG に変えて `react-native-svg` で描く。WebView は要らないが、最後の更新が 2022 年 5 月で、メンテされていない。MathJax と KaTeX は描ける記法が少し違うので、検査（KaTeX）を通った問題が描けるとは限らず、1つ目の基準に合わないので採らなかった。
- `react-native-math-view`（3.9.5）。同じく MathJax と `react-native-svg` を使い、最後の更新が 2022 年 5 月なので採らなかった。
- `react-native-katex`（1.3.0）。KaTeX を WebView で描く点は同じ。最後の更新が 2025 年 1 月で、書体と CSS の読み込み、高さの決め方、描く設定を、問題の検査と合わせる余地が小さいので、同じ作りを自分で書くほうを選んだ。
- KaTeX の出力を MathML だけにして WebView に出す案。KaTeX の書体を同梱せずに済むが、数式の見た目が札の書体（D-0009）と合わなくなるので採らなかった。
- KaTeX の HTML を React Native の部品に直して描く案。KaTeX の CSS（絶対配置、負の余白）を React Native の style で再現する必要があり、採らなかった。

札のドラッグ

- `react-native-reorderable-list`（0.18.3）と `react-native-draggable-flatlist`（4.0.3）。どちらも1つのリストの中での並べ替えの部品で、札置き場と回答エリアの間の移動を持たない。仕様の「札を運ぶ」には、その間の移動が要るので、どちらを使っても自分で組む部分が残る。`react-native-draggable-flatlist` は最後の更新が 2025 年 5 月で、Reanimated 4 と Gesture Handler 3 への対応を確かめられなかった。採らなかった。
- Reanimated を使わず、React Native 標準の `PanResponder` と `Animated` で組む案。ネイティブのスレッドでジェスチャーを扱えず、長押しのあとにドラッグを始める操作と、タップの切り分けを自分で書く量が増えるので採らなかった。

## 根拠

- 1つ目の基準について。KaTeX の HTML を使うので、問題の JSON の検査（Vitest）で描けた数式は、画面でも同じ HTML で描ける。`src/questions/latex.test.ts` で、同梱したすべての問題（8分類）の `latex` を、画面で使う `renderLatexHtml` で描けることを確かめた。
- 3つ目の基準について。Gesture Handler はネイティブのタッチ処理を使うので、長押しのあとにドラッグを始め、短い操作をタップとして扱うという仕様（`quiz.md` の「札を運ぶ」の7）を作りやすい。
- どちらも、Expo SDK 58 の `expo install` で入る版で動く。`expo export --platform ios` で iOS のバンドルを作れた（KaTeX、WebView、Reanimated、Gesture Handler を含む）。

## 試した範囲と、試していない範囲

確かめたことと確かめていないことは、PR の本文に書いた。この記録の時点で、実機の操作は確かめていない点がある。

## 影響

- `open-questions.md` の OQ-015 から、数式の描画と札のドラッグを「解決した分」へ移した。
- `package.json` に上の依存を足し、`app.json` の `plugins` に `expo-asset` と `expo-font` を足した。`metro.config.cjs` で、`.css` をコードではなくアセットとして同梱する。
- `src/components/` に `MathView`（数式）、`CardBoard`（札置き場と回答エリア）、`katex-fonts.ts` を置いた。`src/app/prototype.tsx` は試すための画面で、出題の画面を作る #35 で置き換える。
- `src/questions/latex.ts` に `renderLatexHtml` を足した。
- `docs/specs/quiz.md` は、画面を作り直す #35 で書き換える。この PR では振る舞いを足していない。
