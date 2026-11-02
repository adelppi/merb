import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, it } from "vitest";
import { checkQuestionFiles } from "./check";
import { parsePerspectives } from "./perspectives";

const questionsDir = "content/questions";

// content/questions/ のすべての JSON を、docs/specs/question-format.md の受け入れ条件で検査する。
it("content/questions/ の問題が仕様に合っている", () => {
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
  expect(checkQuestionFiles(files, perspectives)).toEqual([]);
});
