import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, it } from "vitest";
import { checkQuestionFiles } from "./check";
import { parsePerspectives } from "./perspectives";

// フォルダのすべての JSON を、docs/specs/question-format.md の受け入れ条件で検査する。
function check(questionsDir: string): string[] {
  const fileNames = existsSync(questionsDir)
    ? readdirSync(questionsDir).filter((name) => name.endsWith(".json"))
    : [];
  const files = fileNames.map((fileName) => ({
    fileName,
    data: JSON.parse(readFileSync(join(questionsDir, fileName), "utf8")),
  }));
  const perspectives = parsePerspectives(
    readFileSync("content/perspectives.md", "utf8"),
  );
  return checkQuestionFiles(files, perspectives);
}

it("content/questions/ の問題が仕様に合っている", () => {
  expect(check("content/questions")).toEqual([]);
});

// Playwright で使うテスト用の問題も、同じ検査にかける（docs/specs/quiz.md）。
it("e2e/fixtures/questions/ の問題が仕様に合っている", () => {
  expect(check("e2e/fixtures/questions")).toEqual([]);
});
