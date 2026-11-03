import arithmetic from "../../content/questions/arithmetic.json";
import calculus from "../../content/questions/calculus.json";
import combined from "../../content/questions/combined.json";
import fractions from "../../content/questions/fractions.json";
import numbers from "../../content/questions/numbers.json";
import relations from "../../content/questions/relations.json";
import scriptsPowersRoots from "../../content/questions/scripts-powers-roots.json";
import vectorsFunctions from "../../content/questions/vectors-functions.json";
import { type Question, questionFileSchema } from "./schema";

// アプリに同梱する問題の JSON。Metro は実行時にフォルダを読めないので、ファイルを1つずつ読み込む。
// content/questions/ に JSON を足したら、ここにも足す（bundled.test.ts が足し忘れを検出する）。
const files: unknown[] = [
  arithmetic,
  calculus,
  combined,
  fractions,
  numbers,
  relations,
  scriptsPowersRoots,
  vectorsFunctions,
];

// 同梱したすべての JSON を Zod の形にかけて、すべての問題を返す。形に合わなければ例外を投げる。
export function bundledQuestions(): Question[] {
  return files.flatMap((data) => questionFileSchema.parse(data).questions);
}
