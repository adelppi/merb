# D-0015 TypeScript、pnpm、Zod、Biome、Vitest を続けて使い、操作テストの道具は画面ができるときに決める

- 日付: 2026-11-03
- 決めた人: AI が試した結果をもとに推奨を選び、PR で確認する
- 関係する Issue と PR: #32
- 解決した未解決の項目: OQ-015 のうち、D-0003 のうち変えない項目、単体テストと操作テストの道具、`vision.md` の「スマートフォンでも使える」の書き方
- 置き換える記録: なし

## 背景

Expo のプロジェクトを作るにあたり、[D-0003](D-0003-tech-stack.md) で選んだ道具のうち、そのまま使えるものを確かめる必要があった。ブラウザーで操作を試していた Playwright の代わりも要る。

## 決定

- TypeScript、pnpm、Zod、Biome、Vitest は、そのまま使う。
- TypeScript の版は、Expo SDK 58 が求める 6.0 系（`~6.0.3`）にする。それまで入れていた 5.9.3 から上げる。
- 単体テストは Vitest で続ける。対象は `src/questions/`、`src/quiz/`、`src/i18n/` の純粋な関数と reducer。
- 問題の JSON は `src/questions/bundled.ts` で静的に読み込んで同梱し、Zod で検査する。`src/questions/load.ts`（Node の `fs` で読む）は、Vitest の検査にだけ使う。
- 画面の部品の操作テストと、実機に近い操作テストの道具は、画面を作る Issue（#35 以降）で、必要になったときに決める。この Issue では決めない。
- `vision.md` の「スマートフォンでも使える」は、書き換えない。ネイティブアプリはスマートフォンで使うアプリなので、いまの書き方と食い違わない。

## ほかの選択肢

- TypeScript を 5.9.3 に固定し続ける案。型検査は通ったが、`expo-doctor` が版の不一致を報告するので採らなかった。
- 単体テストを Jest に替える案。Vitest のまま、既存の単体テストが通り、バンドルした問題の読み込みも試せたので採らなかった。
- 操作テストの道具を今決める案。画面がまだなく、試せないので採らなかった。候補は React Native Testing Library（部品の操作）と Maestro（実機やシミュレーターの操作）。
- `vision.md` の「スマートフォンでも使える」を「iOS のアプリとして使える」などに書き換える案。「スマートフォンでも操作しやすいこと」という判断の基準は変わらず、書き換える合意が要るため採らなかった。

## 根拠

- 試した結果は次のとおり。Expo SDK 58、Expo Router 58、React Native 0.88、React 19.3.0 を入れた状態で、`pnpm lint`、`pnpm typecheck`、`pnpm test`（Vitest）が通り、`expo export --platform ios` が iOS のバンドルを作った。
- `src/questions/schema.ts` は Zod だけに依存するので、React Native のバンドルに入れられる。`katex` を使う `src/questions/latex.ts` は、アプリの画面からは読まない。

## 影響

- `AGENTS.md` の「コードを書くとき」を、Expo の状態に書き換える。
- `katex` は `src/questions/latex.ts` が検査で使うので残す。数式の描画に使う道具は #33 で決める。
- `package.json` に Expo の依存と、`pnpm start`、`pnpm ios` を足した。`pnpm dev`、`pnpm build`、`pnpm test:e2e` は用意しない。
