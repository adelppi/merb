import type { Answer } from "./schema";

// 答えを見せるときの読み方。text があれば text を、なければ cards を半角スペース1つでつなぐ。
export function readingText(answer: Answer): string {
  return answer.text ?? answer.cards.join(" ");
}
