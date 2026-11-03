import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { type Question, questionFileSchema } from "./schema";

// 問題の JSON を置くフォルダ。環境変数 MERB_QUESTIONS_DIR があれば、そちらを読む。
export function questionsDir(): string {
  return process.env.MERB_QUESTIONS_DIR ?? "content/questions";
}

// フォルダのすべての JSON を読み、Zod の形にかけて、すべての問題を返す。
// 形に合わない JSON があれば例外を投げる。フォルダがなければ空の配列を返す。
// ページはビルドのときに静的に作るので、ここで読むファイルを本番のサーバーに含めない（turbopackIgnore）。
export function loadQuestions(dir: string = questionsDir()): Question[] {
  if (!existsSync(/*turbopackIgnore: true*/ dir)) {
    return [];
  }
  return readdirSync(/*turbopackIgnore: true*/ dir)
    .filter((name) => name.endsWith(".json"))
    .sort()
    .flatMap((name) => {
      const data: unknown = JSON.parse(
        readFileSync(join(/*turbopackIgnore: true*/ dir, name), "utf8"),
      );
      return questionFileSchema.parse(data).questions;
    });
}
