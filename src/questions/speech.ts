import type { Answer } from "./schema";

// 直前の a が冠詞になる語。ここにない語の前の a は数式の文字として読む。
const articleNouns = [
  "half",
  "third",
  "quarter",
  "fourth",
  "fifth",
  "hundred",
  "thousand",
  "remainder",
];

const letterA = new RegExp(
  `\\bA\\b|\\ba\\b(?! (?:${articleNouns.join("|")})\\b)`,
  "g",
);

// 読み方。正解の text があれば text を、なければ cards を半角スペース1つでつないだもの。
export function readingOf(answer: Answer): string {
  return answer.text ?? answer.cards.join(" ");
}

// 読み上げる文字列。音声合成は a と A を文字の名前で読まないので、数式の文字は eigh にする（D-0035）。
export function speechOf(answer: Answer): string {
  return readingOf(answer).replace(letterA, "eigh");
}
