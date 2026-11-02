import { countCards, dealCards } from "./cards";
import { findLatexError } from "./latex";
import { type Question, questionFileSchema } from "./schema";

export type QuestionFileInput = {
  // content/questions/ の中のファイル名（例: numbers.json）
  fileName: string;
  // JSON を読んだ値
  data: unknown;
};

// docs/specs/question-format.md の受け入れ条件で、問題のファイルを検査する。
// 見つけた誤りを、ファイル名と問題の id を付けた文言の配列で返す。誤りがなければ空の配列を返す。
export function checkQuestionFiles(
  files: readonly QuestionFileInput[],
  perspectives: ReadonlySet<string>,
): string[] {
  const errors: string[] = [];
  const seenIds = new Map<string, string>();

  for (const { fileName, data } of files) {
    const parsed = questionFileSchema.safeParse(data);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const path = issue.path.join(".") || "(全体)";
        errors.push(`${fileName}: ${path}: 形が合っていない: ${issue.message}`);
      }
      continue;
    }
    const { category, questions } = parsed.data;

    if (fileName !== `${category}.json`) {
      errors.push(
        `${fileName}: category の ${category} がファイル名と合っていない`,
      );
    }

    const idPattern = new RegExp(`^${category}-\\d{3}$`);
    for (const question of questions) {
      const where = `${fileName}: ${question.id}`;
      if (!idPattern.test(question.id)) {
        errors.push(
          `${where}: id が ${category}-<3桁の連番> の形になっていない`,
        );
      }
      const firstFile = seenIds.get(question.id);
      if (firstFile !== undefined) {
        errors.push(`${where}: id が ${firstFile} の問題と重なっている`);
      } else {
        seenIds.set(question.id, fileName);
      }
      for (const message of checkQuestion(question, perspectives)) {
        errors.push(`${where}: ${message}`);
      }
    }
  }
  return errors;
}

// 1つの問題の中身を検査する。
function checkQuestion(
  question: Question,
  perspectives: ReadonlySet<string>,
): string[] {
  const errors: string[] = [];

  if (!perspectives.has(question.perspective)) {
    errors.push(`perspective の「${question.perspective}」が観点シートにない`);
  }

  const latexError = findLatexError(question.latex);
  if (latexError !== null) {
    errors.push(`latex を KaTeX で描けない: ${latexError}`);
  }

  const answerCards = new Set(question.answers.flatMap((a) => a.cards));
  for (const card of new Set([...answerCards, ...question.distractors])) {
    const message = findCardError(card);
    if (message !== null) {
      errors.push(`札「${card}」が${message}`);
    }
  }

  for (const card of question.distractors) {
    if (answerCards.has(card)) {
      errors.push(`distractors の「${card}」が answers の札と同じ`);
    }
  }

  question.answers.forEach((answer, i) => {
    if (
      answer.text !== undefined &&
      normalizeText(answer.text) !== answer.cards.join(" ")
    ) {
      errors.push(`answers[${i}] の text が cards と食い違っている`);
    }
  });

  const dealt = countCards(dealCards(question));
  question.answers.forEach((answer, i) => {
    for (const [card, count] of countCards(answer.cards)) {
      if ((dealt.get(card) ?? 0) < count) {
        errors.push(`answers[${i}] を出す札から組み立てられない`);
        break;
      }
    }
  });

  return errors;
}

// 「札」の節の決まりに合わなければ、その理由を返す。合えば null を返す。
export function findCardError(card: string): string | null {
  if (card === "") {
    return "空になっている";
  }
  if (/[,.;:!?]/.test(card)) {
    return "句読点を含んでいる";
  }
  if (!/^\S+( \S+)*$/.test(card)) {
    return "前後に空白があるか、単語の間が半角スペース1つになっていない";
  }
  return null;
}

// text からカンマを除き、空白を半角スペース1つにそろえる。
function normalizeText(text: string): string {
  return text.replaceAll(",", "").trim().split(/\s+/).join(" ");
}
