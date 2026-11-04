import {
  type CategoryId,
  categoryIds,
  type Question,
  type QuestionFile,
} from "../questions/schema";

// 選んだ分類を渡す URL のクエリの名前。決まりは docs/specs/category-select.md に書いてある。
export const categoryParam = "categories";

// クエリ categories の値（コンマ区切りの文字列。Expo Router は重なると配列で返す）を、分類の id の配列にする。
// 分類の id でないものと重なったものを除き、分類の表の順に並べる。
export function parseCategories(
  value: string | readonly string[] | undefined,
): CategoryId[] {
  const values = (typeof value === "string" ? [value] : (value ?? [])).flatMap(
    (item) => item.split(","),
  );
  return categoryIds.filter((id) => values.includes(id));
}

// 分類の行をタップしたときの、選んだ分類を返す。問題がない分類（available にないもの）は切り替えない。
// 結果は分類の表の順に並べる。
export function toggleCategory(
  selected: readonly CategoryId[],
  id: CategoryId,
  available: readonly CategoryId[],
): CategoryId[] {
  if (!available.includes(id)) {
    return [...selected];
  }
  return categoryIds.filter((item) =>
    item === id ? !selected.includes(id) : selected.includes(item),
  );
}

// 問題がある分類をすべて選んでいるか。
export function isAllSelected(
  selected: readonly CategoryId[],
  available: readonly CategoryId[],
): boolean {
  return available.length > 0 && available.every((id) => selected.includes(id));
}

// 「すべて選択」と「すべて解除」のボタンを押したときの、選んだ分類を返す。
export function toggleAllCategories(
  selected: readonly CategoryId[],
  available: readonly CategoryId[],
): CategoryId[] {
  if (isAllSelected(selected, available)) {
    return [];
  }
  return categoryIds.filter((id) => available.includes(id));
}

// 「選んだ分類で始める」を押せるか。分類を1つ以上選んでいるときだけ押せる。
export function canStart(selected: readonly CategoryId[]): boolean {
  return selected.length > 0;
}

// 問題が1問以上ある分類を、分類の表の順に返す。
export function availableCategories(
  files: readonly QuestionFile[],
): CategoryId[] {
  return categoryIds.filter((id) =>
    files.some((file) => file.category === id && file.questions.length > 0),
  );
}

// 選んだ分類の問題を返す。分類を1つも選んでいなければ、すべての分類の問題を返す。
export function selectQuestions(
  files: readonly QuestionFile[],
  categories: readonly CategoryId[],
): Question[] {
  return files
    .filter(
      (file) => categories.length === 0 || categories.includes(file.category),
    )
    .flatMap((file) => file.questions);
}

// 選んだ分類を付けた URL を返す（例: /quiz?categories=numbers,fractions）。
// 分類は分類の表の順に並べる。分類を1つも選んでいなければ、クエリを付けない。
export function categoriesHref(
  path: string,
  categories: readonly CategoryId[],
): string {
  if (categories.length === 0) {
    return path;
  }
  const ordered = categoryIds.filter((id) => categories.includes(id));
  return `${path}?${categoryParam}=${ordered.join(",")}`;
}
