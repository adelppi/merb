import type { Random } from "./shuffle";

// 次に出す問題の番号を、count 問の中からランダムに選ぶ。
// 2問以上あれば、直前の番号 previous は選ばない。問題がなければ null を返す。
export function pickNextIndex(
  count: number,
  previous: number | null,
  random: Random,
): number | null {
  if (count === 0) {
    return null;
  }
  if (count === 1 || previous === null) {
    return Math.floor(random() * count);
  }
  // 直前の番号を除いた count - 1 個から選び、直前の番号以上なら1つずらす。
  const index = Math.floor(random() * (count - 1));
  return index >= previous ? index + 1 : index;
}

// id が一致する問題の番号を返す。なければ null を返す。
export function indexOfQuestion(
  questions: readonly { id: string }[],
  id: string | undefined,
): number | null {
  const index = questions.findIndex((question) => question.id === id);
  return index < 0 ? null : index;
}
