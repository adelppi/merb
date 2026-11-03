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
- 画面の部品の操作テストと実機に近い操作テストの道具は、画面を作り直す Issue（#35 以降）で決める（D-0015）。
- 数式の描画と札のドラッグの道具は #33、文言の切り替えと言語の保存は #37 で決める（OQ-015）。それまで `katex` は、問題の JSON の検査（`src/questions/latex.ts`）のために残す。

ソースコードの置き場は次のとおり。理由は `docs/decisions/D-0005-architecture.md` に書いてある。

| 場所 | 中身 |
|---|---|
| `src/app/` | Expo Router の画面。薄く保ち、問題を読んで画面の部品に渡すだけにする。いまは `_layout.tsx` と、問題の数を出すだけの `index.tsx` がある |
| `src/questions/` | 問題の形、札の生成、判定、問題の JSON の検査。純粋な関数で書く。アプリに同梱する問題は `bundled.ts` が読み込む。`content/questions/` に JSON を足したら、`bundled.ts` にも足す |
| `src/quiz/` | 出題の進行。reducer、札を混ぜる処理、次の問題を選ぶ処理、`useQuiz` |
| `src/i18n/` | 言語の型と値の検査（`locale.ts`）。文言のファイルは `src/i18n/messages/` に置く |
| `content/` | 観点シートと問題の JSON |
| `src/**/*.test.ts` | Vitest の単体テスト。テストするファイルと同じフォルダに置く |
| `app.json` | Expo の設定 |

画面の部品（`src/components/` など）の置き場は、画面の作り直し（#35〜#37）で決める。

使うコマンドは次のとおり。`package.json` に同じ名前でスクリプトを用意してある。

| コマンド | すること |
|---|---|
| `pnpm install` | 依存するパッケージを入れる |
| `pnpm start` | Expo の開発用サーバーを起動する |
| `pnpm ios` | 開発用サーバーを起動し、iOS のシミュレーターで開く（Xcode が要る） |
| `pnpm lint` | Biome で lint と整形を検査する |
| `pnpm typecheck` | TypeScript の型を検査する |
| `pnpm test` | Vitest で単体テストと問題の JSON の検査を実行する |

実機やシミュレーターがない環境では、`pnpm exec expo export --platform ios` で iOS のバンドルが作れることを確かめる。Expo の設定と依存の版の検査には `pnpm dlx expo-doctor` を使える。

PR を出す前に、次をすべて通す。

1. `pnpm lint`
2. `pnpm typecheck`
3. `pnpm test`

操作テストの道具が決まるまで、操作テストの実行は PR を出す前の確認に入れない。

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
