import { useCallback, useEffect, useReducer } from "react";
import type { Question } from "../questions/schema";
import { dealShuffled } from "./deal";
import { indexOfQuestion, pickNextIndex } from "./next";
import {
  type QuizAction,
  type QuizState,
  quizReducer,
  startState,
} from "./reducer";
import type { Random } from "./shuffle";

// 問題を出す前（画面を開いた直後）は null。
function reducer(
  state: QuizState | null,
  action: QuizAction,
): QuizState | null {
  if (action.type === "start") {
    return startState(action.index, action.question, action.cards);
  }
  return state && quizReducer(state, action);
}

// 出題の状態と、それを動かす関数をまとめる。
// 問題は画面を開いたあとに選び、札もそのとき混ぜる。
// firstId があり、questions の中にその問題があれば、最初の問題をそれにする（確かめ用）。
export function useQuiz(
  questions: readonly Question[],
  random: Random = Math.random,
  firstId?: string,
) {
  const [state, dispatch] = useReducer(reducer, null);
  const previous = state?.index ?? null;

  const show = useCallback(
    (index: number) => {
      const question = questions[index];
      dispatch({
        type: "start",
        index,
        question,
        cards: dealShuffled(question, random),
      });
    },
    [questions, random],
  );

  const next = useCallback(() => {
    const index = pickNextIndex(questions.length, previous, random);
    if (index !== null) {
      show(index);
    }
  }, [questions, previous, random, show]);

  // 最初の問題は、画面を開いたときに1回だけ出す。
  // biome-ignore lint/correctness/useExhaustiveDependencies: next は問題を出すたびに変わるので、依存に入れると出し続ける
  useEffect(() => {
    const first = indexOfQuestion(questions, firstId);
    if (first === null) {
      next();
    } else {
      show(first);
    }
  }, []);

  return { state, dispatch, next };
}
