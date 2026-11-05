# D-0035 読み方の音声は expo-speech で出し、数式の文字の a は ay として読み上げる

- 日付: 2026-11-05
- 決めた人: adelppi（Issue #88 の依頼）。読み上げる文字列の変え方は Claude Code が決めた。adelppi が音で確かめる
- 関係する Issue と PR: #88
- 解決した未解決の項目: なし
- 置き換える記録: なし

## 背景

adelppi が、正解の読み方を音声で聞くボタンを依頼した。問題の読み方では、`a plus b` の `a` は数式の文字で、`a half` の `a` は冠詞である。札の文字はどちらも `a` なので、そのまま読み上げると区別できない。

## 決定

- 音声は `expo-speech` で出す。言語は `en-US` にする。
- ボタンは、「正解」の行と、「ほかの読み方」「答え」の各行に置く。
- 読み上げる文字列では、数式の文字の `a` と `A` を `ay` に変える。
- `half`、`third`、`quarter`、`fourth`、`fifth`、`hundred`、`thousand`、`remainder` の直前の小文字の `a` は冠詞として変えない。
- 問題の JSON にキーは足さない。読み上げる文字列は `src/questions/speech.ts` の純粋な関数で作る。
- `expo-audio` は入れない。消音モードの扱いは OQ-023 に残す。

## ほかの選択肢

- 大文字の `A` にして渡す案。下の測定で `a` と同じ長さになり、読み分けられないので採らなかった。
- 問題の JSON に読み上げ用のキーを足す案。いまの問題では語の並びで決まるので採らなかった。
- 実行時に Web の音声合成サービスを呼ぶ案。アプリが通信を増やし、`vision.md` の方針より大きいので採らなかった。

## 根拠

- macOS の `AVSpeechSynthesizer`（Samantha の声）で音声の長さを測った。`a plus b` と `A plus b` はどちらも 0.728 秒、`ay plus b` は 0.797 秒だった。`a half` と `A half` はどちらも 0.531 秒、`ay half` は 0.588 秒だった。
- この測定は長さの比較で、発音そのものは確かめていない。iPhone の声とも同じとは限らないので、adelppi が音で確かめる。
- `content/questions/` の192の読み方のうち、`a` を含むものは39ある。

## 影響

- `docs/specs/quiz.md` に「読み方を聞く」を足した。
- `expo-speech` を足した。ネイティブのパッケージなので、最初のストア提出の前に入れる。
- `src/questions/speech.ts` を足し、`src/components/QuizView.tsx` にボタンを足した。
