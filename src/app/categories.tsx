import { type Href, useRouter } from "expo-router";
import { useMemo } from "react";
import { CategorySelect } from "../components/CategorySelect";
import { bundledQuestionFiles } from "../questions/bundled";
import { availableCategories, categoriesHref } from "../quiz/categories";

// 分類を選ぶ画面。出題の画面を開いても Stack に残るので、戻ると選んだ分類が残る。
export default function Categories() {
  const router = useRouter();
  const available = useMemo(
    () => availableCategories(bundledQuestionFiles()),
    [],
  );
  return (
    <CategorySelect
      available={available}
      onStart={(selected) =>
        router.push(categoriesHref("/quiz", selected) as Href)
      }
      onStartAll={() => router.push("/quiz")}
    />
  );
}
