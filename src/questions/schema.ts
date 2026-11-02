import { z } from "zod";

// 分類の id。docs/specs/question-format.md の「分類」の節と同じ順に並べる。
export const categoryIds = [
  "numbers",
  "fractions",
  "scripts-powers-roots",
  "arithmetic",
  "vectors-functions",
  "calculus",
  "relations",
  "combined",
] as const;

export const categoryIdSchema = z.enum(categoryIds);

export const answerSchema = z.strictObject({
  cards: z.array(z.string()).min(1),
  text: z.string().optional(),
});

export const questionSchema = z.strictObject({
  id: z.string(),
  perspective: z.string(),
  latex: z.string(),
  answers: z.array(answerSchema).min(1),
  distractors: z.array(z.string()),
});

export const questionFileSchema = z.strictObject({
  category: categoryIdSchema,
  questions: z.array(questionSchema).min(1),
});

export type CategoryId = z.infer<typeof categoryIdSchema>;
export type Answer = z.infer<typeof answerSchema>;
export type Question = z.infer<typeof questionSchema>;
export type QuestionFile = z.infer<typeof questionFileSchema>;
