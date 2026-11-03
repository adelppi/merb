import { dealCards } from "../questions/cards";
import type { Question } from "../questions/schema";
import type { Card } from "./reducer";
import { type Random, shuffle } from "./shuffle";

// 問題で出す札に id を付け、混ぜて返す。
export function dealShuffled(question: Question, random: Random): Card[] {
  return shuffle(
    dealCards(question).map((text, id) => ({ id, text })),
    random,
  );
}
