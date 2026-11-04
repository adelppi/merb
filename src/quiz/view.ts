import { wrongPositions } from "../questions/cards";
import { canMoveCards, canReveal, type QuizState } from "./reducer";

// 出題の画面の4つの状態（docs/specs/quiz.md の「画面」の節）で、何を出すか。
export type QuizView = {
  // 札置き場を出すか。出さないときは、回答エリアの札も運べない。
  showPool: boolean;
  // 「不正解」を出すか
  showIncorrect: boolean;
  // 「正解」と「ほかの読み方」を出すか
  showCorrect: boolean;
  // 「答え」を出すか
  showAnswers: boolean;
  showCheck: boolean;
  showReveal: boolean;
  showNext: boolean;
  // 回答エリアの札を緑で出すか。ほかの状態は、不正解のときも藍で出す。
  placedGreen: boolean;
  // 赤で出す回答エリアの札の id。不正解の表示が出ているあいだだけ入る。
  wrongIds: number[];
};

export function quizView(state: QuizState): QuizView {
  const movable = canMoveCards(state);
  return {
    showPool: movable,
    showIncorrect: state.phase === "incorrect",
    showCorrect: state.phase === "correct",
    showAnswers: state.phase === "revealed",
    showCheck: movable,
    showReveal: canReveal(state),
    showNext: !movable,
    placedGreen: state.phase === "correct",
    wrongIds: wrongIds(state),
  };
}

// 不正解の表示が出ているあいだ、間違った札の id を返す。
function wrongIds(state: QuizState): number[] {
  if (state.phase !== "incorrect") {
    return [];
  }
  const texts = state.placed.map(
    (id) => state.cards.find((card) => card.id === id)?.text ?? "",
  );
  return wrongPositions(texts, state.question).map((i) => state.placed[i]);
}
