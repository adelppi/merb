import { describe, expect, it } from "vitest";
import type { CategoryId, QuestionFile } from "../questions/schema";
import {
  availableCategories,
  categoriesHref,
  parseCategories,
  selectQuestions,
} from "./categories";
import { pickNextIndex } from "./next";

function file(category: CategoryId, count: number): QuestionFile {
  return {
    category,
    questions: Array.from({ length: count }, (_, i) => ({
      id: `${category}-00${i + 1}`,
      perspective: "p",
      prompt: { ja: "問題文", en: "Prompt" },
      latex: "x",
      answers: [{ cards: ["x"] }],
      distractors: [],
    })),
  };
}

const files = [file("fractions", 2), file("numbers", 1), file("calculus", 1)];

function ids(categories: CategoryId[]): string[] {
  return selectQuestions(files, categories).map((q) => q.id);
}

describe("parseCategories", () => {
  it("分類の id を、分類の表の順に並べて返す", () => {
    expect(parseCategories(["calculus", "numbers"])).toEqual([
      "numbers",
      "calculus",
    ]);
  });

  it("分類の id でないものと、重なったものを除く", () => {
    expect(parseCategories(["numbers", "foo", "numbers", "NUMBERS"])).toEqual([
      "numbers",
    ]);
    expect(parseCategories(["foo"])).toEqual([]);
    expect(parseCategories([])).toEqual([]);
  });
});

describe("selectQuestions", () => {
  it("選んだ分類の問題だけを返す", () => {
    expect(ids(["fractions"])).toEqual(["fractions-001", "fractions-002"]);
    expect(ids(["numbers", "calculus"])).toEqual([
      "numbers-001",
      "calculus-001",
    ]);
  });

  it("分類を1つも選んでいなければ、すべての分類の問題を返す", () => {
    expect(ids([])).toEqual([
      "fractions-001",
      "fractions-002",
      "numbers-001",
      "calculus-001",
    ]);
  });

  it("分類の id でないものしかなければ、すべての分類から出す", () => {
    expect(ids(parseCategories(["foo"]))).toHaveLength(4);
  });

  it("問題がない分類だけを選ぶと、問題を返さない", () => {
    expect(ids(["relations"])).toEqual([]);
  });

  it("選んだ分類の問題の中から、次の問題を続けて選ぶ", () => {
    const questions = selectQuestions(files, ["fractions"]);
    let previous: number | null = null;
    for (const value of [0, 0.5, 0.99, 0]) {
      const index = pickNextIndex(questions.length, previous, () => value);
      expect(index).not.toBeNull();
      expect(questions[index as number].id).toMatch(/^fractions-/);
      expect(index).not.toBe(previous);
      previous = index;
    }
  });
});

describe("availableCategories", () => {
  it("問題が1問以上ある分類を、分類の表の順に返す", () => {
    expect(availableCategories(files)).toEqual([
      "numbers",
      "fractions",
      "calculus",
    ]);
    expect(availableCategories([])).toEqual([]);
  });
});

describe("categoriesHref", () => {
  it("選んだ分類を category のクエリに1つずつ付ける", () => {
    expect(categoriesHref("/quiz", ["numbers", "scripts-powers-roots"])).toBe(
      "/quiz?category=numbers&category=scripts-powers-roots",
    );
  });

  it("分類を1つも選んでいなければ、クエリを付けない", () => {
    expect(categoriesHref("/categories", [])).toBe("/categories");
  });
});
