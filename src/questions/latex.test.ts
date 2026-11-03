import { expect, it } from "vitest";
import { bundledQuestions } from "./bundled";
import { renderLatexHtml } from "./latex";

// 出題の画面（src/components/MathView.tsx）が使う描き方で、全分類の問題の数式を描ける。
it("同梱したすべての問題の latex を、画面で使う設定で描ける", () => {
  const questions = bundledQuestions();
  expect(questions.length).toBeGreaterThan(0);
  for (const question of questions) {
    expect(renderLatexHtml(question.latex), question.id).toContain("katex");
  }
});
