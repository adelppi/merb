import { describe, expect, it } from "vitest";
import { bundledQuestions } from "./bundled";
import { loadQuestions } from "./load";

describe("bundledQuestions", () => {
  it("content/questions/ のすべての JSON と同じ問題を返す", () => {
    const expected = loadQuestions("content/questions");
    expect(expected.length).toBeGreaterThan(0);
    expect(bundledQuestions()).toEqual(expected);
  });
});
