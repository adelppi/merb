import { describe, expect, it } from "vitest";
import type { Question } from "../questions/schema";
import {
  type Card,
  canMoveCards,
  canReveal,
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

  it("答えを見ると revealed になる", () => {
    const state = run(place(0), { type: "check" }, { type: "reveal" });
    expect(state.phase).toBe("revealed");
  });

  it("正解したあとと答えを見たあとは、次の問題を出すまで札を運べない", () => {
    for (const state of [
      run(...correct, { type: "check" }),
      run(place(0), { type: "check" }, { type: "reveal" }),
    ]) {
      expect(canMoveCards(state)).toBe(false);
      expect(quizReducer(state, place(5))).toBe(state);
      expect(quizReducer(state, { type: "unplace", id: 0 })).toBe(state);
      expect(quizReducer(state, { type: "move", id: 0, to: 1 })).toBe(state);
      expect(quizReducer(state, { type: "check" })).toBe(state);
      expect(quizReducer(state, { type: "reveal" })).toBe(state);
    }
  });

  it("答えを見るは、間違えたあとだけできる", () => {
    const solving = run(place(0));
    expect(canReveal(solving)).toBe(false);
    expect(quizReducer(solving, { type: "reveal" })).toBe(solving);
    const correctState = run(...correct, { type: "check" });
    expect(canReveal(correctState)).toBe(false);
    expect(quizReducer(correctState, { type: "reveal" })).toBe(correctState);
  });

  it("次の問題を出すと、間違えたことも忘れ、札がすべて札置き場に戻り、解いている状態になる", () => {
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
    expect(state.missed).toBe(false);
    expect(canReveal(state)).toBe(false);
  });
});

describe("間違えたあとに解き直す", () => {
  const wrong: QuizAction[] = [
    place(0),
    place(1),
    place(2),
    place(5),
    { type: "check" },
  ];

  it("ボタンを押さずに札を運び、もう一度答え合わせができる", () => {
    const missed = run(...wrong);
    expect(missed.phase).toBe("incorrect");
    expect(canMoveCards(missed)).toBe(true);

    // 「five」を戻し、「fifth」と「power」を運んで正解にする。
    const actions: QuizAction[] = [
      { type: "unplace", id: 5 },
      place(3),
      place(4),
      { type: "check" },
    ];
    const state = actions.reduce(quizReducer, missed);
    expect(state.phase).toBe("correct");
    expect(placedTexts(state)).toEqual(["x", "to", "the", "fifth", "power"]);
  });

  it("札を運んで並びが変わると「不正解」を消し、「答えを見る」は残す", () => {
    const missed = run(...wrong);
    for (const action of [
      place(3),
      { type: "unplace", id: 5 },
      { type: "move", id: 5, to: 0 },
    ] as QuizAction[]) {
      const state = quizReducer(missed, action);
      expect(state.phase).toBe("solving");
      expect(canReveal(state)).toBe(true);
      expect(quizReducer(state, { type: "reveal" }).phase).toBe("revealed");
    }
  });

  it("並びが変わらない操作では「不正解」を消さない", () => {
    const missed = run(...wrong);
    expect(quizReducer(missed, { type: "move", id: 5, to: 3 })).toBe(missed);
    expect(quizReducer(missed, place(0))).toBe(missed);
  });

  it("並べ直さずに、そのまま答え合わせをし直せる", () => {
    const state = run(...wrong, { type: "check" });
    expect(state.phase).toBe("incorrect");
    expect(placedTexts(state)).toEqual(["x", "to", "the", "five"]);
  });

  it("答え合わせのたびに、出し直すきっかけの値が変わる", () => {
    const first = run(...wrong);
    const second = quizReducer(first, { type: "check" });
    const third = quizReducer(quizReducer(second, { type: "unplace", id: 5 }), {
      type: "check",
    });
    expect(new Set([first.checks, second.checks, third.checks]).size).toBe(3);
  });
});
