import { describe, expect, it } from "vitest";
import type { Question } from "../questions/schema";
import {
  type Card,
  otherAnswers,
  placedTexts,
  poolCards,
  type QuizAction,
  type QuizState,
  quizReducer,
  startState,
} from "./reducer";

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

// 混ぜたあとの札。id は混ぜる前の順。
const cards: Card[] = [
  { id: 5, text: "five" },
  { id: 2, text: "the" },
  { id: 0, text: "x" },
  { id: 4, text: "power" },
  { id: 1, text: "to" },
  { id: 3, text: "fifth" },
];

function run(...actions: QuizAction[]): QuizState {
  return actions.reduce(quizReducer, startState(0, fifthPower, cards));
}

const place = (id: number, at?: number): QuizAction => ({
  type: "place",
  id,
  at,
});

describe("札を運ぶ", () => {
  it("札置き場の札を、回答エリアの末尾へ運ぶ", () => {
    const state = run(place(0), place(1));
    expect(placedTexts(state)).toEqual(["x", "to"]);
    expect(poolCards(state).map((c) => c.text)).toEqual([
      "five",
      "the",
      "power",
      "fifth",
    ]);
  });

  it("位置を指定すると、その位置へ入れる", () => {
    const state = run(place(0), place(2), place(1, 1));
    expect(placedTexts(state)).toEqual(["x", "to", "the"]);
  });

  it("回答エリアの札を、札置き場の元の位置へ戻す", () => {
    const state = run(place(2), place(0), { type: "unplace", id: 2 });
    expect(placedTexts(state)).toEqual(["x"]);
    expect(poolCards(state)).toEqual(cards.filter((c) => c.id !== 0));
  });

  it("回答エリアの中で並べ替える", () => {
    const placed = [place(0), place(1), place(2), place(3)];
    expect(placedTexts(run(...placed, { type: "move", id: 3, to: 0 }))).toEqual(
      ["fifth", "x", "to", "the"],
    );
    expect(placedTexts(run(...placed, { type: "move", id: 0, to: 3 }))).toEqual(
      ["to", "the", "fifth", "x"],
    );
  });

  it("回答エリアにある札や、ない札は運ばない", () => {
    const state = run(place(0));
    expect(quizReducer(state, place(0))).toBe(state);
    expect(quizReducer(state, place(99))).toBe(state);
    expect(quizReducer(state, { type: "unplace", id: 1 })).toBe(state);
    expect(quizReducer(state, { type: "move", id: 1, to: 0 })).toBe(state);
  });
});

describe("答え合わせ", () => {
  const correct = [place(0), place(1), place(2), place(3), place(4)];

  it("正解なら correct になり、ほかの読み方を返す", () => {
    const state = run(...correct, { type: "check" });
    expect(state.phase).toBe("correct");
    expect(otherAnswers(state)).toEqual([fifthPower.answers[1]]);
  });

  it("余った札があっても、どれかの正解と同じなら正解", () => {
    const state = run(place(0), place(1), place(2), place(3), {
      type: "check",
    });
    expect(state.phase).toBe("correct");
    expect(otherAnswers(state)).toEqual([fifthPower.answers[0]]);
  });

  it("間違えると incorrect になる", () => {
    expect(run(place(0), place(5), { type: "check" }).phase).toBe("incorrect");
  });

  it("札が1枚もなくても答え合わせができ、不正解になる", () => {
    expect(run({ type: "check" }).phase).toBe("incorrect");
  });

  it("もう一度解くと、並べた札のまま解いている状態に戻る", () => {
    const state = run(place(0), place(5), { type: "check" }, { type: "retry" });
    expect(state.phase).toBe("solving");
    expect(placedTexts(state)).toEqual(["x", "five"]);
  });

  it("答えを見ると revealed になる", () => {
    const state = run(place(0), { type: "check" }, { type: "reveal" });
    expect(state.phase).toBe("revealed");
  });

  it("答え合わせのあとは、次の操作をするまで札を運べない", () => {
    for (const state of [
      run(...correct, { type: "check" }),
      run(place(0), { type: "check" }),
      run(place(0), { type: "check" }, { type: "reveal" }),
    ]) {
      expect(quizReducer(state, place(5))).toBe(state);
      expect(quizReducer(state, { type: "unplace", id: 0 })).toBe(state);
      expect(quizReducer(state, { type: "move", id: 0, to: 1 })).toBe(state);
      expect(quizReducer(state, { type: "check" })).toBe(state);
    }
  });

  it("もう一度解くと答えを見るは、間違えたときだけできる", () => {
    const solving = run(place(0));
    expect(quizReducer(solving, { type: "retry" })).toBe(solving);
    expect(quizReducer(solving, { type: "reveal" })).toBe(solving);
    const correctState = run(...correct, { type: "check" });
    expect(quizReducer(correctState, { type: "reveal" })).toBe(correctState);
  });

  it("次の問題を出すと、札がすべて札置き場に戻り、解いている状態になる", () => {
    const state = run(
      ...correct,
      { type: "check" },
      {
        type: "start",
        index: 1,
        question: fifthPower,
        cards,
      },
    );
    expect(state.phase).toBe("solving");
    expect(state.index).toBe(1);
    expect(state.placed).toEqual([]);
  });
});
