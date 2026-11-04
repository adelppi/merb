import { describe, expect, it } from "vitest";
import type { CategoryId, QuestionFile } from "../questions/schema";
import {
  availableCategories,
  canStart,
  categoriesHref,
  isAllSelected,
  parseCategories,
  selectQuestions,
  toggleAllCategories,
  toggleCategory,
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
    expect(parseCategories("calculus,numbers")).toEqual([
      "numbers",
      "calculus",
    ]);
  });

  it("クエリが重なって配列で渡されても読める", () => {
    expect(parseCategories(["calculus", "numbers,fractions"])).toEqual([
      "numbers",
      "fractions",
      "calculus",
    ]);
  });

  it("分類の id でないものと、重なったものを除く", () => {
    expect(parseCategories("numbers,foo,numbers,NUMBERS,")).toEqual([
      "numbers",
    ]);
    expect(parseCategories("foo")).toEqual([]);
    expect(parseCategories("")).toEqual([]);
    expect(parseCategories([])).toEqual([]);
    expect(parseCategories(undefined)).toEqual([]);
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
    expect(ids(parseCategories("foo"))).toHaveLength(4);
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
  it("選んだ分類を、表の順にコンマでつないで categories に付ける", () => {
    expect(categoriesHref("/quiz", ["scripts-powers-roots", "numbers"])).toBe(
      "/quiz?categories=numbers,scripts-powers-roots",
    );
  });

  it("分類を1つ選んだときは、コンマを付けない", () => {
    expect(categoriesHref("/quiz", ["fractions"])).toBe(
      "/quiz?categories=fractions",
    );
  });

  it("分類を1つも選んでいなければ、クエリを付けない", () => {
    expect(categoriesHref("/quiz", [])).toBe("/quiz");
  });

  it("付けたクエリを parseCategories で元の分類に戻せる", () => {
    const href = categoriesHref("/quiz", ["calculus", "fractions"]);
    const value = href.split("categories=")[1];
    expect(parseCategories(value)).toEqual(["fractions", "calculus"]);
  });
});

describe("toggleCategory", () => {
  const available = availableCategories(files);

  it("選んでいない分類を選び、選んでいる分類を外す", () => {
    expect(toggleCategory([], "fractions", available)).toEqual(["fractions"]);
    expect(toggleCategory(["fractions"], "fractions", available)).toEqual([]);
  });

  it("複数の分類を選べて、結果は分類の表の順に並ぶ", () => {
    const first = toggleCategory([], "calculus", available);
    const second = toggleCategory(first, "numbers", available);
    expect(second).toEqual(["numbers", "calculus"]);
    expect(toggleCategory(second, "numbers", available)).toEqual(["calculus"]);
  });

  it("問題がない分類は、選べない", () => {
    expect(toggleCategory([], "relations", available)).toEqual([]);
    expect(toggleCategory(["numbers"], "relations", available)).toEqual([
      "numbers",
    ]);
  });
});

describe("toggleAllCategories", () => {
  const available = availableCategories(files);

  it("問題がある分類をすべて選ぶ。問題がない分類は選ばない", () => {
    expect(toggleAllCategories([], available)).toEqual([
      "numbers",
      "fractions",
      "calculus",
    ]);
    expect(toggleAllCategories(["calculus"], available)).toEqual([
      "numbers",
      "fractions",
      "calculus",
    ]);
  });

  it("すべて選んでいるときは、すべて外す", () => {
    expect(toggleAllCategories(available, available)).toEqual([]);
  });
});

describe("isAllSelected", () => {
  const available = availableCategories(files);

  it("問題がある分類をすべて選んでいるかを返す", () => {
    expect(isAllSelected([], available)).toBe(false);
    expect(isAllSelected(["numbers"], available)).toBe(false);
    expect(isAllSelected(available, available)).toBe(true);
  });

  it("問題がある分類がなければ、すべて選んだことにしない", () => {
    expect(isAllSelected([], [])).toBe(false);
  });
});

describe("canStart", () => {
  it("分類を1つも選んでいなければ押せず、1つ以上選んでいれば押せる", () => {
    expect(canStart([])).toBe(false);
    expect(canStart(["numbers"])).toBe(true);
    expect(canStart(["numbers", "calculus"])).toBe(true);
  });
});
