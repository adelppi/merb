import { describe, expect, it } from "vitest";
import { checkQuestionFiles } from "./check";

const perspectives = new Set(["n乗（序数＋power）", "解の公式"]);

function validQuestion() {
  return {
    id: "scripts-powers-roots-001",
    perspective: "n乗（序数＋power）",
    latex: "x^5",
    answers: [
      { cards: ["x", "to", "the", "fifth", "power"] },
      { cards: ["x", "to", "the", "fifth"] },
    ],
    distractors: ["five"],
  };
}

function check(question: unknown, fileName = "scripts-powers-roots.json") {
  return checkQuestionFiles(
    [
      {
        fileName,
        data: { category: "scripts-powers-roots", questions: [question] },
      },
    ],
    perspectives,
  );
}

describe("checkQuestionFiles", () => {
  it("仕様に合った問題では誤りを返さない", () => {
    expect(check(validQuestion())).toEqual([]);
    expect(checkQuestionFiles([], perspectives)).toEqual([]);
  });

  describe("JSON が仕様の形に合っている", () => {
    it.each([
      ["必須のキーがない", { ...validQuestion(), latex: undefined }],
      ["知らないキーがある", { ...validQuestion(), level: 1 }],
      ["answers が空", { ...validQuestion(), answers: [] }],
      ["cards が空", { ...validQuestion(), answers: [{ cards: [] }] }],
      ["distractors がない", { ...validQuestion(), distractors: undefined }],
    ])("%s", (_, question) => {
      expect(check(question)).toEqual([
        expect.stringContaining("形が合っていない"),
      ]);
    });

    it("questions が空", () => {
      const errors = checkQuestionFiles(
        [
          {
            fileName: "numbers.json",
            data: { category: "numbers", questions: [] },
          },
        ],
        perspectives,
      );
      expect(errors).toEqual([expect.stringContaining("形が合っていない")]);
    });
  });

  describe("category が分類の id のどれかで、ファイル名と同じ", () => {
    it("分類の id にない", () => {
      const errors = checkQuestionFiles(
        [
          {
            fileName: "geometry.json",
            data: { category: "geometry", questions: [validQuestion()] },
          },
        ],
        perspectives,
      );
      expect(errors).toEqual([expect.stringContaining("形が合っていない")]);
    });

    it("ファイル名と違う", () => {
      expect(check(validQuestion(), "numbers.json")).toEqual([
        expect.stringContaining("ファイル名と合っていない"),
      ]);
    });
  });

  describe("問題の id が形に合っていて、すべてのファイルを通して重ならない", () => {
    it.each([
      "scripts-powers-roots-1",
      "scripts-powers-roots-0001",
      "numbers-001",
    ])("形に合わない: %s", (id) => {
      expect(check({ ...validQuestion(), id })).toEqual([
        expect.stringContaining("形になっていない"),
      ]);
    });

    it("別のファイルの問題と重なる", () => {
      const file = (fileName: string) => ({
        fileName,
        data: {
          category: "scripts-powers-roots",
          questions: [validQuestion()],
        },
      });
      const errors = checkQuestionFiles(
        [file("scripts-powers-roots.json"), file("scripts-powers-roots.json")],
        perspectives,
      );
      expect(errors).toEqual([expect.stringContaining("重なっている")]);
    });
  });

  it("perspective が観点シートにない", () => {
    expect(check({ ...validQuestion(), perspective: "n乗" })).toEqual([
      expect.stringContaining("観点シートにない"),
    ]);
  });

  it("latex を KaTeX で描けない", () => {
    expect(check({ ...validQuestion(), latex: "\\frac{x" })).toEqual([
      expect.stringContaining("KaTeX で描けない"),
    ]);
    expect(check({ ...validQuestion(), latex: "\\unknowncommand x" })).toEqual([
      expect.stringContaining("KaTeX で描けない"),
    ]);
  });

  describe("札が「札」の節の決まりに合っている", () => {
    it.each([
      ["空", ""],
      ["句読点を含む", "a,"],
      ["前に空白がある", " the"],
      ["後ろに空白がある", "the "],
      ["単語の間の空白が2つ", "the  square"],
      ["タブを含む", "the\troot"],
    ])("%s", (_, card) => {
      const answerErrors = check({
        ...validQuestion(),
        answers: [{ cards: ["x", card] }],
      });
      expect(answerErrors).toEqual([expect.stringContaining("札「")]);

      const distractorErrors = check({
        ...validQuestion(),
        distractors: [card],
      });
      expect(distractorErrors).toEqual([expect.stringContaining("札「")]);
    });

    it("意味のまとまりを1枚の札にしてよい", () => {
      const question = {
        ...validQuestion(),
        latex: "\\sqrt{2}",
        answers: [{ cards: ["the square root of", "two"] }],
        distractors: [],
      };
      expect(check(question)).toEqual([]);
    });
  });

  it("distractors に answers の札と同じ文字列がある", () => {
    expect(check({ ...validQuestion(), distractors: ["power"] })).toEqual([
      expect.stringContaining("answers の札と同じ"),
    ]);
  });

  describe("text が同じ正解の cards と食い違っていない", () => {
    const withText = (text: string) => ({
      ...validQuestion(),
      answers: [{ cards: ["x", "to", "the", "fifth", "power"], text }],
    });

    it("カンマと空白の違いだけなら食い違いにしない", () => {
      expect(check(withText("x to the fifth,  power"))).toEqual([]);
    });

    it("単語が違えば食い違いにする", () => {
      expect(check(withText("x to the fifth"))).toEqual([
        expect.stringContaining("食い違っている"),
      ]);
    });

    it("大文字と小文字が違えば食い違いにする", () => {
      expect(check(withText("X to the fifth power"))).toEqual([
        expect.stringContaining("食い違っている"),
      ]);
    });
  });

  it("「出す札」の決まりで出した札から、すべての正解を組み立てられる", () => {
    // 出す札は正解から作るので、仕様に合った問題では必ず組み立てられる。
    // 同じ文字列を何枚も使う正解があっても組み立てられることを確かめる。
    const question = {
      ...validQuestion(),
      latex: "x^{x}",
      answers: [
        { cards: ["x", "to", "the", "x"] },
        { cards: ["x", "to", "the", "power", "of", "x"] },
      ],
      distractors: [],
    };
    expect(check(question)).toEqual([]);
  });
});
