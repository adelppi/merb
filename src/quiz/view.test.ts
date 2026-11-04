import { describe, expect, it } from "vitest";
import type { Question } from "../questions/schema";
import {
  type Card,
  type QuizAction,
  type QuizState,
  quizReducer,
  startState,
} from "./reducer";
import { quizView } from "./view";

const question: Question = {
  id: "t-1",
  perspective: "テスト",
  prompt: { ja: "問題", en: "Question" },
  latex: "x",
  answers: [{ cards: ["a", "b"] }, { cards: ["b", "a"] }],
  distractors: ["c"],
};
const cards: Card[] = [
  { id: 0, text: "a" },
  { id: 1, text: "b" },
  { id: 2, text: "c" },
];

function run(...actions: QuizAction[]): QuizState {
  return actions.reduce(quizReducer, startState(0, question, cards));
}

describe("quizView", () => {
  it("解いているとき（2a）は、札置き場と「答え合わせ」を出す", () => {
    expect(quizView(run())).toEqual({
      showPool: true,
      showIncorrect: false,
      showCorrect: false,
      showAnswers: false,
      showCheck: true,
      showReveal: false,
      showNext: false,
      placedGreen: false,
      wrongIds: [],
    });
  });

  it("不正解のとき（2b）は、「不正解」、札置き場、「答えを見る」、「答え合わせ」を出し、間違った札だけ赤にする", () => {
    const state = run({ type: "place", id: 2 }, { type: "check" });
    expect(quizView(state)).toEqual({
      showPool: true,
      showIncorrect: true,
      showCorrect: false,
      showAnswers: false,
      showCheck: true,
      showReveal: true,
      showNext: false,
      placedGreen: false,
      wrongIds: [2],
    });
  });

  it("不正解のあとに札を運ぶと、「不正解」を消し、「答えを見る」は残す", () => {
    const state = run(
      { type: "place", id: 2 },
      { type: "check" },
      { type: "unplace", id: 2 },
    );
    const view = quizView(state);
    expect(view.showIncorrect).toBe(false);
    expect(view.showReveal).toBe(true);
    expect(view.showCheck).toBe(true);
  });

  it("正解のとき（2c）は、札置き場を出さず、札を緑にし、「次の問題」を出す", () => {
    const state = run(
      { type: "place", id: 0 },
      { type: "place", id: 1 },
      { type: "check" },
    );
    expect(quizView(state)).toEqual({
      showPool: false,
      showIncorrect: false,
      showCorrect: true,
      showAnswers: false,
      showCheck: false,
      showReveal: false,
      showNext: true,
      placedGreen: true,
      wrongIds: [],
    });
  });

  it("答えを見たあと（2d）は、「答え」と「次の問題」だけを出し、「不正解」と札置き場は出さない", () => {
    const state = run(
      { type: "place", id: 2 },
      { type: "check" },
      { type: "reveal" },
    );
    expect(quizView(state)).toEqual({
      showPool: false,
      showIncorrect: false,
      showCorrect: false,
      showAnswers: true,
      showCheck: false,
      showReveal: false,
      showNext: true,
      placedGreen: false,
      wrongIds: [],
    });
  });
});
