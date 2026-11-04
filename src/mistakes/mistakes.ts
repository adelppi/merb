import type { Question, QuestionFile } from "../questions/schema";
import type { QuizState } from "../quiz/reducer";

// 間違えた問題の記録を保存するローカルストレージのキー。決まりは docs/specs/mistakes.md に書いてある。
export const storageKey = "merb.mistakes";

// 再挑戦の出題を開くクエリの名前。値が "1" のとき、記録した問題だけで出題する。
export const mistakesParam = "mistakes";

// 記録に問題の id を足す。すでにあれば変えない。
export function addMistake(ids: readonly string[], id: string): string[] {
  return ids.includes(id) ? [...ids] : [...ids, id];
}

// 記録から問題の id を消す。なければ変えない。
export function removeMistake(ids: readonly string[], id: string): string[] {
  return ids.filter((item) => item !== id);
}

// 保存した値（JSON の文字列）を記録にする。読めないとき、配列でないときは空にする。
// 文字列でない要素と、重なった id は除く。
export function parseMistakes(value: string | null): string[] {
  if (value === null) {
    return [];
  }
  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.reduce<string[]>(
      (ids, item) => (typeof item === "string" ? addMistake(ids, item) : ids),
      [],
    );
  } catch {
    return [];
  }
}

// 再挑戦で出す問題を返す。同梱した問題にない id は除く。問題は同梱した問題の順に並べる。
export function selectMistakeQuestions(
  files: readonly QuestionFile[],
  ids: readonly string[],
): Question[] {
  return files
    .flatMap((file) => file.questions)
    .filter((question) => ids.includes(question.id));
}

export type MistakeChange = { type: "add" | "remove"; id: string };

// 出題の状態から、記録をどう変えるかを決める。変えないときは null を返す。
// 不正解になったら足す。再挑戦で、一度も間違えずに正解したら消す。
export function mistakeChange(
  state: QuizState,
  retry: boolean,
): MistakeChange | null {
  const id = state.question.id;
  if (state.phase === "incorrect") {
    return { type: "add", id };
  }
  if (retry && state.phase === "correct" && !state.missed) {
    return { type: "remove", id };
  }
  return null;
}
