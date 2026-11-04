import { describe, expect, it } from "vitest";
import type { Question, QuestionFile } from "../questions/schema";
import { quizReducer, startState } from "../quiz/reducer";
import {
  addMistake,
  mistakeChange,
  parseMistakes,
  removeMistake,
  selectMistakeQuestions,
} from "./mistakes";

const question = (id: string): Question => ({
  id,
  perspective: "テスト",
  prompt: { ja: "問題", en: "Question" },
  latex: "x",
  answers: [{ cards: ["a", "b"] }],
  distractors: ["c"],
});

describe("addMistake / removeMistake", () => {
  it("足した id は重ねても1つのままになる", () => {
    expect(addMistake(["a"], "b")).toEqual(["a", "b"]);
    expect(addMistake(["a"], "a")).toEqual(["a"]);
  });

  it("消す。ない id を消しても変わらない", () => {
    expect(removeMistake(["a", "b"], "a")).toEqual(["b"]);
    expect(removeMistake(["a"], "z")).toEqual(["a"]);
  });
});

describe("parseMistakes", () => {
  it("保存した配列を読む", () => {
    expect(parseMistakes('["a","b"]')).toEqual(["a", "b"]);
  });

  it("保存がない、読めない、配列でないときは空にする", () => {
    expect(parseMistakes(null)).toEqual([]);
    expect(parseMistakes("{")).toEqual([]);
    expect(parseMistakes('{"a":1}')).toEqual([]);
  });

  it("文字列でない要素と重なった id を除く", () => {
    expect(parseMistakes('["a",1,null,"a","b"]')).toEqual(["a", "b"]);
  });
});

describe("selectMistakeQuestions", () => {
  const files = [
    {
      category: "numbers",
      questions: [question("numbers-001"), question("numbers-002")],
    },
    { category: "fractions", questions: [question("fractions-001")] },
  ] as unknown as QuestionFile[];

  it("記録の id の問題を、同梱した問題の順に返す", () => {
    const ids = selectMistakeQuestions(files, [
      "fractions-001",
      "numbers-001",
    ]).map((q) => q.id);
    expect(ids).toEqual(["numbers-001", "fractions-001"]);
  });

  it("同梱した問題にない id は除く", () => {
    expect(selectMistakeQuestions(files, ["gone-001"])).toEqual([]);
  });
});

describe("mistakeChange", () => {
  const q = question("numbers-001");
  const cards = [
    { id: 0, text: "a" },
    { id: 1, text: "b" },
    { id: 2, text: "c" },
  ];
  const start = startState(0, q, cards);
  const wrong = quizReducer(quizReducer(start, { type: "place", id: 2 }), {
    type: "check",
  });
  const right = [0, 1].reduce(
    (s, id) => quizReducer(s, { type: "place", id }),
    start,
  );

  it("不正解になったら足す", () => {
    expect(mistakeChange(wrong, false)).toEqual({ type: "add", id: q.id });
    expect(mistakeChange(wrong, true)).toEqual({ type: "add", id: q.id });
  });

  it("再挑戦で間違えずに正解したら消す", () => {
    const correct = quizReducer(right, { type: "check" });
    expect(mistakeChange(correct, true)).toEqual({ type: "remove", id: q.id });
  });

  it("再挑戦でなければ、正解しても消さない", () => {
    const correct = quizReducer(right, { type: "check" });
    expect(mistakeChange(correct, false)).toBeNull();
  });

  it("間違えてから正解した問題は、消さない", () => {
    const fixed = quizReducer(
      [
        { type: "unplace", id: 2 },
        { type: "place", id: 0 },
        { type: "place", id: 1 },
      ].reduce(
        (s, a) => quizReducer(s, a as Parameters<typeof quizReducer>[1]),
        wrong,
      ),
      { type: "check" },
    );
    expect(fixed.phase).toBe("correct");
    expect(mistakeChange(fixed, true)).toBeNull();
  });

  it("解いている途中は変えない", () => {
    expect(mistakeChange(start, true)).toBeNull();
  });
});
