import { type Href, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useMemo } from "react";
import { CategorySelect } from "../components/CategorySelect";
import { mistakesParam, selectMistakeQuestions } from "../mistakes/mistakes";
import { useMistakes } from "../mistakes/provider";
import { bundledQuestionFiles } from "../questions/bundled";
import { availableCategories, categoriesHref } from "../quiz/categories";

// ホーム。分類を選ぶ画面を兼ねる。大見出しと右上の歯車は、_layout.tsx のヘッダーで出す。
export default function Home() {
  const router = useRouter();
  const { ids } = useMistakes();
  const available = useMemo(
    () => availableCategories(bundledQuestionFiles()),
    [],
  );
  const hasMistakes = useMemo(
    () => selectMistakeQuestions(bundledQuestionFiles(), ids).length > 0,
    [ids],
  );
  return (
    <>
      <CategorySelect
        available={available}
        hasMistakes={hasMistakes}
        onStart={(selected) =>
          router.push(categoriesHref("/quiz", selected) as Href)
        }
        onRetry={() => router.push(`/quiz?${mistakesParam}=1`)}
      />
      <StatusBar style="auto" />
    </>
  );
}
