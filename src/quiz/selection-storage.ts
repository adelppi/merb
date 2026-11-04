import { type CategoryId, categoryIds } from "../questions/schema";

// 選んだ分類を保存するキー。決まりは docs/specs/category-select.md に書いてある。
export const selectionKey = "merb.categories";

// 選んだ分類の保存先に求める操作。AsyncStorage がこの形を満たす。テストでは代わりの保存先を渡す。
export type SelectionStorage = {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
};

// 保存した値を、選んだ分類にする。分類の id でないもの、問題がない分類、重なったものを除き、分類の表の順に並べる。
// 読めない値は、どの分類も選んでいない状態にする。
export function parseSelection(
  raw: string | null,
  available: readonly CategoryId[],
): CategoryId[] {
  if (raw === null) {
    return [];
  }
  try {
    const values: unknown = JSON.parse(raw);
    if (!Array.isArray(values)) {
      return [];
    }
    return categoryIds.filter(
      (id) => available.includes(id) && values.includes(id),
    );
  } catch {
    return [];
  }
}

// 保存した分類を読む。保存がないとき、読めないときは、どの分類も選んでいない状態にする。
export async function loadSelection(
  storage: SelectionStorage,
  available: readonly CategoryId[],
): Promise<CategoryId[]> {
  try {
    return parseSelection(await storage.getItem(selectionKey), available);
  } catch {
    return [];
  }
}

// 選んだ分類を保存する。保存できたかどうかを返す。失敗しても例外は出さない（選んだ分類は、アプリを閉じるまで持つ）。
export async function saveSelection(
  storage: SelectionStorage,
  selected: readonly CategoryId[],
): Promise<boolean> {
  try {
    await storage.setItem(selectionKey, JSON.stringify(selected));
    return true;
  } catch {
    return false;
  }
}
