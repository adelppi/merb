import { describe, expect, it } from "vitest";
import { indexOfQuestion, pickNextIndex } from "./next";

describe("pickNextIndex", () => {
  it("問題がなければ null を返す", () => {
    expect(pickNextIndex(0, null, () => 0)).toBeNull();
  });

  it("問題が1問なら、その問題を選ぶ", () => {
    expect(pickNextIndex(1, null, () => 0.5)).toBe(0);
    expect(pickNextIndex(1, 0, () => 0.5)).toBe(0);
  });

  it("問題が2問以上あれば、直前と同じ問題を選ばない", () => {
    for (let previous = 0; previous < 4; previous++) {
      for (const r of [0, 0.3, 0.5, 0.7, 0.999]) {
        const index = pickNextIndex(4, previous, () => r);
        expect(index).not.toBe(previous);
        expect(index).toBeGreaterThanOrEqual(0);
        expect(index).toBeLessThan(4);
      }
    }
  });

  it("直前の問題を除いたすべての問題を選びうる", () => {
    const picked = new Set(
      [0, 0.34, 0.67].map((r) => pickNextIndex(4, 1, () => r)),
    );
    expect(picked).toEqual(new Set([0, 2, 3]));
  });
});

describe("indexOfQuestion", () => {
  const questions = [{ id: "a-1" }, { id: "a-2" }, { id: "b-1" }];

  it("id が一致する問題の番号を返す", () => {
    expect(indexOfQuestion(questions, "b-1")).toBe(2);
  });

  it("一致する問題がないときと、id がないときは null を返す", () => {
    expect(indexOfQuestion(questions, "c-1")).toBeNull();
    expect(indexOfQuestion(questions, undefined)).toBeNull();
  });
});
