import { useCallback, useEffect, useReducer } from "react";
import type { Question } from "../questions/schema";
import { dealShuffled } from "./deal";
import { pickNextIndex } from "./next";
import {
  type QuizAction,
  type QuizState,
  quizReducer,
  startState,
} from "./reducer";
import type { Random } from "./shuffle";

// 問題を出す前（ビルドのときと、画面を開いた直後）は null。
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
// 問題はブラウザーで選び、札もブラウザーで混ぜる。ビルドのときに描いた画面と食い違わないよう、
// 画面を開いたあとに最初の問題を出す。
export function useQuiz(
  questions: readonly Question[],
  random: Random = Math.random,
) {
  const [state, dispatch] = useReducer(reducer, null);
  const previous = state?.index ?? null;

  const next = useCallback(() => {
    const index = pickNextIndex(questions.length, previous, random);
    if (index === null) {
      return;
    }
    const question = questions[index];
    dispatch({
      type: "start",
      index,
      question,
      cards: dealShuffled(question, random),
    });
  }, [questions, previous, random]);

  // 最初の問題は、画面を開いたときに1回だけ出す。
  // biome-ignore lint/correctness/useExhaustiveDependencies: next は問題を出すたびに変わるので、依存に入れると出し続ける
  useEffect(() => {
    next();
  }, []);

  return { state, dispatch, next };
}
