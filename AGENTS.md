# merb

このファイルは、このリポジトリで作業する AI（Claude Code、Codex など）への指示をまとめる。Claude Code は `CLAUDE.md` からこのファイルを読み込む。

## 開発の進め方

作業は `docs/workflow.md` の決まりに従う。作業を始める前に `docs/README.md` の「読む順番」のとおりに読む。要点は次のとおり。

- 作業は Issue から始め、1つの Issue に1つの PR を対応させる。
- 1つの PR の中で、ドキュメントを先に書き、そのあとでソースコードを書く。
- `docs/specs/` の仕様とソースコードを食い違わせない。振る舞いを変えるときは、同じ PR で仕様も書き換える。
- 決められないことは推測で決めず、`docs/open-questions.md` に書いて尋ねる。
- 決めたことは `docs/decisions/` に追記する。既存の記録は消さず、本文も書き換えない。
- `docs/vision.md` の「やらないこと」に当たる機能は作らない。

## コードを書くとき

技術スタックは次のとおり。TypeScript、React Native、Expo（SDK 58）、Expo Router を使い、パッケージマネージャーは pnpm にする。問題の JSON の検査は Zod、lint と整形は Biome、単体テストは Vitest で行う。経緯は `docs/decisions/` の D-0003、D-0012、D-0014、D-0015 にある。

- 対象 OS は iOS だけにする。Android はあとで別の Issue で扱う（D-0014）。
- Next.js の Web 版は削除した（D-0012、Issue #31）。Vercel との連携もやめた（D-0013）。
- 画面の操作テストは Maestro で書き、フローを `maestro/` に置く（D-0021）。React Native Testing Library と `jest-expo` は入れない。画面が見せる状態の判断と、札の運び先の決定は、純粋な関数にして Vitest で確かめる。
- 数式の描画と札のドラッグの道具は D-0016、文言の切り替え（自作の Context）と言語の保存（AsyncStorage）は D-0019 で決めた。`katex` は、問題の JSON の検査（`src/questions/latex.ts`）と数式の描画に使う。

ソースコードの置き場は次のとおり。理由は `docs/decisions/D-0005-architecture.md` に書いてある。

| 場所 | 中身 |
|---|---|
| `src/app/` | Expo Router の画面。薄く保ち、問題を読んで画面の部品に渡すだけにする。`_layout.tsx` が `I18nProvider` を載せる。いまは `index.tsx`（ホーム。分類を選ぶ画面を兼ねる）、`quiz.tsx`（出題）、`settings.tsx`（設定）がある |
| `src/questions/` | 問題の形、札の生成、判定、問題の JSON の検査。純粋な関数で書く。アプリに同梱する問題は `bundled.ts` が読み込む。`content/questions/` に JSON を足したら、`bundled.ts` にも足す |
| `src/quiz/` | 出題の進行。reducer、札を混ぜる処理、次の問題を選ぶ処理、`useQuiz`。分類の選択の処理（`categories.ts`）と、選んだ分類の保存（`selection-storage.ts`、`selection-provider.tsx`）もここに置く |
| `src/mistakes/` | 間違えた問題の id の記録。追加と削除の処理、再挑戦で出す問題の選び方、AsyncStorage への保存と読み出し（`storage.ts`）、`MistakesProvider` と `useMistakes()`（`provider.tsx`） |
| `src/i18n/` | 言語の型と値の検査（`locale.ts`）、言語の保存と読み出し（`storage.ts`）、`I18nProvider` と `useI18n()`（`provider.tsx`）。文言のファイルは `src/i18n/messages/` に置く |
| `src/components/` | 画面の部品と、画面で共有する色（`theme.ts`）。画面ごとのフォルダは作らず、ここに並べる |
| `content/` | 観点シートと問題の JSON |
| `src/**/*.test.ts` | Vitest の単体テスト。テストするファイルと同じフォルダに置く |
| `maestro/` | Maestro の操作テストのフロー（YAML）。シミュレーターの Expo Go に対して手元で実行する |
| `app.json` | Expo の設定 |

画面の文言は、`useI18n()` が返す `messages` から読む。キーを足すときは、`ja.json` と `en.json` に同じ構造で足す。

使うコマンドは次のとおり。`package.json` に同じ名前でスクリプトを用意してある。

| コマンド | すること |
|---|---|
| `pnpm install` | 依存するパッケージを入れる |
| `pnpm start` | Expo の開発用サーバーを起動する |
| `pnpm ios` | 開発用サーバーを起動し、iOS のシミュレーターで開く（Xcode が要る） |
| `pnpm ios:device` | 接続した iPhone の実機にビルドして入れる（Xcode と Apple ID の署名が要る）。生成される `ios/` はコミットしない |
| `pnpm lint` | Biome で lint と整形を検査する |
| `pnpm typecheck` | TypeScript の型を検査する |
| `pnpm test` | Vitest で単体テストと問題の JSON の検査を実行する |

実機やシミュレーターがない環境では、`pnpm exec expo export --platform ios` で iOS のバンドルが作れることを確かめる。Expo の設定と依存の版の検査には `pnpm dlx expo-doctor` を使える。

PR を出す前に、次をすべて通す。

1. `pnpm lint`
2. `pnpm typecheck`
3. `pnpm test`

Maestro の操作テストは、PR を出す前の確認に入れない。シミュレーターと Expo Go と開発用サーバーが要り、CI もないので、画面の操作を確かめたいときに手元で実行する。実行のしかたは次のとおり。

1. シミュレーターを起動し、Expo Go を入れておく。
2. `EXPO_NO_TYPESCRIPT_SETUP=1 pnpm exec expo start --port 8099` で開発用サーバーを動かす。
3. `maestro test maestro/correct.yaml` のように、フローを指定して実行する。フローは、Expo Go を開き直してから、`exp://127.0.0.1:8099/...` のリンクで画面を開く。

札のドラッグは、Maestro の `swipe` で送れる（D-0023）。ドラッグの途中の見た目は、手で操作して確かめる。

Claude Design の iOS デザインは、参照資料として `docs/design/ios/` に置いてある（`docs/decisions/D-0017-design-import.md`）。コードではないので、lint、型検査、テストの対象に入れない。仕様との差は `docs/design/README.md` に書いてある。画面を作るときは、あわせて読む。

## 日本語の文体（yomiyasu）

このリポジトリで AI が書く日本語は、すべて yomiyasu スキルの規則に従う。スキルの本体は `.claude/skills/yomiyasu/` にあり、Codex は `.agents/skills/yomiyasu`（本体へのシンボリックリンク）から読む。対象は次のとおり。

- 会話の返答（作業報告、説明、質問）
- リポジトリに書くファイルの日本語（README、ドキュメント、コードのコメント、UI の文言）
- コミットメッセージ、PR の説明、Issue やレビューのコメント

守り方は次のとおり。

- 日本語を書く作業を始める前に、まだこのセッションで読んでいなければ yomiyasu スキルの `SKILL.md` を読み込む。
- 新しく書くときも、最初からスキルの規則で書く。特に「意味の保持」と「情報の不増補」を優先し、元の資料や会話にない事実、効果、感想を足さない。
- ファイルに書いた日本語の文書（`.md` など）は、書き終えたら付属の検査を1回かけ、出た候補を文脈と照らして直すか残すかを決める。

  ```bash
  python3 -B .claude/skills/yomiyasu/scripts/yomiyasu_lint.py <ファイル>
  ```

- 会話の返答では、スキルの完了報告の欄（「変えたところ」「確認の記録」など）は付けない。これらはユーザーが推敲を頼んだときだけ付ける。
- コード、識別子、コマンド、ログ、引用した原文は書き換えない。

`.claude/skills/yomiyasu/` は https://github.com/nanaism/yomiyasu の `skills/yomiyasu/`（v2.0.1、コミット 84e1f5b）を写したもの。更新するときは同じフォルダを写し直す。
