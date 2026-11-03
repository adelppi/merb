import { Suspense } from "react";
import {
  CategorySelect,
  CategorySelectFromQuery,
} from "@/components/category-select";
import { loadQuestionFiles } from "@/questions/load";
import { availableCategories } from "@/quiz/categories";

// URL のクエリはブラウザーで読むので、その部分を Suspense で囲み、ページは静的に作る。
// ビルドのときは、どの分類も選んでいない画面を描いておく。
export default function Categories() {
  const available = availableCategories(loadQuestionFiles());
  return (
    <Suspense fallback={<CategorySelect available={available} initial={[]} />}>
      <CategorySelectFromQuery available={available} />
    </Suspense>
  );
}
