import type { Question } from "./schema";

// 「出す札」の決まりで、1つの問題で出す札を返す。
// 同じ文字列の札は、その文字列をいちばん多く使う正解の枚数だけ出す。
// 並べる順は、正解の札が先で、まぎらわしい札が後。混ぜるのは出題の画面ですること。
export function dealCards(question: Question): string[] {
  const maxCounts = new Map<string, number>();
  for (const answer of question.answers) {
    for (const [card, count] of countCards(answer.cards)) {
      maxCounts.set(card, Math.max(maxCounts.get(card) ?? 0, count));
    }
  }
  const cards: string[] = [];
  for (const [card, count] of maxCounts) {
    for (let i = 0; i < count; i++) {
      cards.push(card);
    }
  }
  return [...cards, ...question.distractors];
}

// 「判定」の節のとおりに、回答エリアに並んだ札の文字列が正解かどうかを返す。
export function judge(placed: readonly string[], question: Question): boolean {
  return question.answers.some(
    (answer) =>
      answer.cards.length === placed.length &&
      answer.cards.every((card, i) => card === placed[i]),
  );
}

// 札の文字列ごとの枚数を数える。
export function countCards(cards: readonly string[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const card of cards) {
    counts.set(card, (counts.get(card) ?? 0) + 1);
  }
  return counts;
}
