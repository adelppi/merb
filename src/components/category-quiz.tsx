"use client";

import { useSearchParams } from "next/navigation";
import type { QuestionFile } from "@/questions/schema";
import {
  categoriesHref,
  categoryParam,
  parseCategories,
  selectQuestions,
} from "@/quiz/categories";
import { QuizScreen } from "./quiz-screen";

// URL のクエリ category で選んだ分類の問題だけを、出題の画面に渡す。
// 決まりは docs/specs/category-select.md の「出題の画面で出す問題」に書いてある。
export function CategoryQuiz({ files }: { files: readonly QuestionFile[] }) {
  const categories = parseCategories(useSearchParams().getAll(categoryParam));
  return (
    <QuizScreen
      // 選んだ分類が変わったら、出題を始めからやり直す。
      key={categories.join(",")}
      questions={selectQuestions(files, categories)}
      categoriesHref={categoriesHref("/categories", categories)}
    />
  );
}
