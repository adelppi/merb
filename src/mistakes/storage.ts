import { parseMistakes, storageKey } from "./mistakes";

// 記録の保存先に求める操作。AsyncStorage がこの形を満たす。テストでは代わりの保存先を渡す。
export type MistakesStorage = {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
};

// 保存した記録を読む。保存がないとき、読めないときは空にする。
export async function loadMistakes(
  storage: MistakesStorage,
): Promise<string[]> {
  try {
    return parseMistakes(await storage.getItem(storageKey));
  } catch {
    return [];
  }
}

// 記録を保存する。保存できたかどうかを返す。失敗しても例外は出さない（記録は、アプリを閉じるまで持つ）。
export async function saveMistakes(
  storage: MistakesStorage,
  ids: readonly string[],
): Promise<boolean> {
  try {
    await storage.setItem(storageKey, JSON.stringify(ids));
    return true;
  } catch {
    return false;
  }
}
