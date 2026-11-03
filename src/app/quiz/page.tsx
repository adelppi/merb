import { Suspense } from "react";
import { CategoryQuiz } from "@/components/category-quiz";
import { loadQuestionFiles } from "@/questions/load";

// URL のクエリはブラウザーで読むので、その部分を Suspense で囲み、ページは静的に作る。
export default function Quiz() {
  return (
    <Suspense>
      <CategoryQuiz files={loadQuestionFiles()} />
    </Suspense>
  );
}
