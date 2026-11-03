import { defaultLocale, type Locale, parseLocale, storageKey } from "./locale";

// 言語の保存先に求める操作。AsyncStorage がこの形を満たす。テストでは代わりの保存先を渡す。
export type LocaleStorage = {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
};

// 保存した言語を読む。保存がないとき、読めないとき、日本語か英語のどちらでもないときは、既定の言語にする。
export async function loadLocale(storage: LocaleStorage): Promise<Locale> {
  try {
    return parseLocale(await storage.getItem(storageKey));
  } catch {
    return defaultLocale;
  }
}

// 言語を保存する。保存できたかどうかを返す。失敗しても例外は出さない（選んだ言語は、アプリを閉じるまで使う）。
export async function saveLocale(
  storage: LocaleStorage,
  locale: Locale,
): Promise<boolean> {
  try {
    await storage.setItem(storageKey, locale);
    return true;
  } catch {
    return false;
  }
}
