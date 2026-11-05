import { describe, expect, it } from "vitest";
import { bundledQuestions } from "./bundled";
import { readingOf, speechOf } from "./speech";

describe("readingOf", () => {
  it("text があれば text を返す", () => {
    expect(readingOf({ cards: ["a", "b"], text: "a, b" })).toBe("a, b");
  });

  it("text がなければ cards をつなぐ", () => {
    expect(readingOf({ cards: ["a", "over", "b"] })).toBe("a over b");
  });
});

describe("speechOf", () => {
  it.each([
    ["a plus or minus b", "ay plus or minus b"],
    ["four a c", "four ay c"],
    ["two a", "two ay"],
    ["A inverse", "ay inverse"],
    ["x minus a, all over h", "x minus ay, all over h"],
  ])("数式の文字の a を ay にする: %s", (reading, expected) => {
    expect(speechOf({ cards: reading.split(" "), text: reading })).toBe(
      expected,
    );
  });

  it.each([
    "a half",
    "one and a half",
    "a third",
    "a quarter",
    "a fourth",
    "a fifth",
    "a hundred",
    "a hundred thousand",
    "a thousand",
    "three with a remainder of two",
  ])("冠詞の a は変えない: %s", (reading) => {
    expect(speechOf({ cards: reading.split(" ") })).toBe(reading);
  });

  it("a を含む語は変えない", () => {
    expect(speechOf({ cards: ["absolute", "value"] })).toBe("absolute value");
  });

  // 問題を足して冠詞の a が増えたら、この一覧と speech.ts の語を確かめる。
  it("同梱の問題で、冠詞として残す a は決まった読み方だけである", () => {
    const articles = bundledQuestions()
      .flatMap((question) => question.answers)
      .map(speechOf)
      .filter((speech) => /\ba\b/.test(speech));
    expect(articles.sort()).toEqual(
      [
        "a fifth",
        "a fourth",
        "a half",
        "a hundred",
        "a hundred thousand",
        "a quarter",
        "a third",
        "a thousand",
        "one and a half",
        "seventeen divided by five is three with a remainder of two",
        "twenty-three divided by four is five with a remainder of three",
      ].sort(),
    );
  });
});
