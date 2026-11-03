import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { loadQuestions } from "./load";

describe("loadQuestions", () => {
  it("フォルダのすべての JSON を読み、すべての問題を返す", () => {
    const dir = mkdtempSync(join(tmpdir(), "merb-"));
    const question = (id: string) => ({
      id,
      perspective: "p",
      prompt: {
        ja: "次の数式を英語で読んでください。",
        en: "Read the expression in English.",
      },
      latex: "x",
      answers: [{ cards: ["x"] }],
      distractors: [],
    });
    writeFileSync(
      join(dir, "numbers.json"),
      JSON.stringify({
        category: "numbers",
        questions: [question("numbers-001"), question("numbers-002")],
      }),
    );
    writeFileSync(
      join(dir, "fractions.json"),
      JSON.stringify({
        category: "fractions",
        questions: [question("fractions-001")],
      }),
    );
    writeFileSync(join(dir, "README.md"), "");
    expect(loadQuestions(dir).map((q) => q.id)).toEqual([
      "fractions-001",
      "numbers-001",
      "numbers-002",
    ]);
  });

  it("形に合わない JSON があれば例外を投げる", () => {
    const dir = mkdtempSync(join(tmpdir(), "merb-"));
    writeFileSync(join(dir, "numbers.json"), JSON.stringify({ questions: [] }));
    expect(() => loadQuestions(dir)).toThrow();
  });

  it("フォルダがなければ空の配列を返す", () => {
    expect(loadQuestions(join(tmpdir(), "merb-none"))).toEqual([]);
  });

  it("テスト用の問題を読める", () => {
    expect(loadQuestions("e2e/fixtures/questions").length).toBeGreaterThan(0);
  });
});
