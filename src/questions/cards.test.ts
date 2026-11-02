import { describe, expect, it } from "vitest";
import { dealCards, judge } from "./cards";
import type { Question } from "./schema";

const fifthPower: Question = {
  id: "scripts-powers-roots-001",
  perspective: "n乗（序数＋power）",
  latex: "x^5",
  answers: [
    { cards: ["x", "to", "the", "fifth", "power"] },
    { cards: ["x", "to", "the", "fifth"] },
  ],
  distractors: ["five"],
};

const fourier: Question = {
  id: "combined-001",
  perspective: "フーリエ変換",
  latex: "F(\\omega)",
  answers: [{ cards: ["F", "of", "omega"] }],
  distractors: ["f"],
};

describe("dealCards", () => {
  it("どの正解も組み立てられるだけの正解の札と、まぎらわしい札を出す", () => {
    expect(dealCards(fifthPower)).toEqual([
      "x",
      "to",
      "the",
      "fifth",
      "power",
      "five",
    ]);
  });

  it("同じ文字列の札は、その文字列をいちばん多く使う正解の枚数だけ出す", () => {
    const question: Question = {
      ...fifthPower,
      answers: [
        { cards: ["the", "a", "the"] },
        { cards: ["the", "b"] },
        { cards: ["a", "a", "a"] },
      ],
      distractors: [],
    };
    const dealt = dealCards(question);
    expect(dealt.filter((c) => c === "the")).toHaveLength(2);
    expect(dealt.filter((c) => c === "a")).toHaveLength(3);
    expect(dealt.filter((c) => c === "b")).toHaveLength(1);
    expect(dealt).toHaveLength(6);
  });
});

describe("judge", () => {
  it("answers のどれか1つと同じ並びなら正解にする", () => {
    expect(judge(["x", "to", "the", "fifth", "power"], fifthPower)).toBe(true);
    expect(judge(["x", "to", "the", "fifth"], fifthPower)).toBe(true);
  });

  it("順番が違えば正解にしない", () => {
    expect(judge(["x", "the", "to", "fifth"], fifthPower)).toBe(false);
  });

  it("長さが違えば正解にしない", () => {
    expect(
      judge(["x", "to", "the", "fifth", "power", "five"], fifthPower),
    ).toBe(false);
    expect(judge(["x", "to", "the"], fifthPower)).toBe(false);
    expect(judge([], fifthPower)).toBe(false);
  });

  it("まぎらわしい札を使えば正解にしない", () => {
    expect(judge(["x", "to", "the", "five"], fifthPower)).toBe(false);
  });

  it("大文字と小文字を区別する", () => {
    expect(judge(["F", "of", "omega"], fourier)).toBe(true);
    expect(judge(["f", "of", "omega"], fourier)).toBe(false);
  });

  it("余った札があっても、並べた札だけで判定する", () => {
    // dealCards で出した札のうち power と five が余るが、正解になる。
    expect(dealCards(fifthPower)).toContain("power");
    expect(judge(["x", "to", "the", "fifth"], fifthPower)).toBe(true);
  });
});
