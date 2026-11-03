import { describe, expect, it } from "vitest";
import { isLetterCard } from "./letter";

describe("isLetterCard", () => {
  it("英字1文字の札を英字1文字とみなす", () => {
    for (const text of ["x", "n", "F", "A", "z"]) {
      expect(isLetterCard(text)).toBe(true);
    }
  });

  it("英単語の a も英字1文字とみなす", () => {
    expect(isLetterCard("a")).toBe(true);
  });

  it("ほかの札は英字1文字とみなさない", () => {
    for (const text of [
      "to",
      "the",
      "fifth",
      "the square root of",
      "x y",
      "1",
      "é",
      "",
    ]) {
      expect(isLetterCard(text)).toBe(false);
    }
  });
});
