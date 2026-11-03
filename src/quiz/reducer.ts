import { judge } from "../questions/cards";
import type { Answer, Question } from "../questions/schema";

// 札の1枚。同じ文字列の札を見分けるため、問題の中で重ならない id を付ける。
export type Card = { id: number; text: string };

// 出題の進み具合。docs/specs/quiz.md の「答え合わせ」の節に当たる。
// solving: 解いている、correct: 正解、incorrect: 不正解、revealed: 答えを見ている
export type Phase = "solving" | "correct" | "incorrect" | "revealed";

export type QuizState = {
  // 出している問題の番号
  index: number;
  question: Question;
  // 混ぜたあとの札。札置き場には、この順のうち回答エリアにない札を並べる。
  cards: Card[];
  // 回答エリアに並んだ札の id
  placed: number[];
  phase: Phase;
};

export type QuizAction =
  | { type: "start"; index: number; question: Question; cards: Card[] }
  // 札置き場の札を回答エリアへ運ぶ。at がなければ末尾、あれば at 番目に入れる。
  | { type: "place"; id: number; at?: number }
  // 回答エリアの札を札置き場へ戻す。
  | { type: "unplace"; id: number }
  // 回答エリアの中で札を to 番目へ移す。
  | { type: "move"; id: number; to: number }
  | { type: "check" }
  | { type: "retry" }
  | { type: "reveal" };

// 問題を出したときの状態を作る。
export function startState(
  index: number,
  question: Question,
  cards: Card[],
): QuizState {
  return { index, question, cards, placed: [], phase: "solving" };
}

export function quizReducer(state: QuizState, action: QuizAction): QuizState {
  switch (action.type) {
    case "start":
      return startState(action.index, action.question, action.cards);
    case "place": {
      if (
        state.phase !== "solving" ||
        state.placed.includes(action.id) ||
        !state.cards.some((card) => card.id === action.id)
      ) {
        return state;
      }
      const placed = [...state.placed];
      const at = clamp(action.at ?? placed.length, 0, placed.length);
      placed.splice(at, 0, action.id);
      return { ...state, placed };
    }
    case "unplace":
      if (state.phase !== "solving" || !state.placed.includes(action.id)) {
        return state;
      }
      return {
        ...state,
        placed: state.placed.filter((id) => id !== action.id),
      };
    case "move": {
      const from = state.placed.indexOf(action.id);
      if (state.phase !== "solving" || from < 0) {
        return state;
      }
      const placed = state.placed.filter((id) => id !== action.id);
      placed.splice(clamp(action.to, 0, placed.length), 0, action.id);
      return { ...state, placed };
    }
    case "check":
      if (state.phase !== "solving") {
        return state;
      }
      return {
        ...state,
        phase: judge(placedTexts(state), state.question)
          ? "correct"
          : "incorrect",
      };
    case "retry":
      return state.phase === "incorrect"
        ? { ...state, phase: "solving" }
        : state;
    case "reveal":
      return state.phase === "incorrect"
        ? { ...state, phase: "revealed" }
        : state;
  }
}

// 回答エリアに並んだ札の文字列を、並んだ順に返す。
export function placedTexts(state: QuizState): string[] {
  return placedCards(state).map((card) => card.text);
}

// 回答エリアに並んだ札を、並んだ順に返す。
export function placedCards(state: QuizState): Card[] {
  return state.placed.flatMap((id) => {
    const card = state.cards.find((c) => c.id === id);
    return card ? [card] : [];
  });
}

// 札置き場の札を、混ぜたときの順に返す。
export function poolCards(state: QuizState): Card[] {
  return state.cards.filter((card) => !state.placed.includes(card.id));
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

// 正解したときに「ほかの読み方」として見せる正解。回答エリアに並べたもの以外を answers の順に返す。
export function otherAnswers(state: QuizState): Answer[] {
  const texts = placedTexts(state);
  return state.question.answers.filter(
    (answer) =>
      answer.cards.length !== texts.length ||
      answer.cards.some((card, i) => card !== texts[i]),
  );
}
