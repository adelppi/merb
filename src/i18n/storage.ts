import { defaultLocale, type Locale, parseLocale, storageKey } from "./locale";

const listeners = new Set<() => void>();

// ローカルストレージに保存できなかったときに、選んだ言語を画面を開いている間だけ持つ。
let unsavedLocale: Locale | null = null;

// 保存した言語を返す。読めないときは既定の言語を返す。
export function getStoredLocale(): Locale {
  if (unsavedLocale !== null) {
    return unsavedLocale;
  }
  try {
    return parseLocale(window.localStorage.getItem(storageKey));
  } catch {
    return defaultLocale;
  }
}

// 言語を保存し、言語を使っている画面に知らせる。
export function saveLocale(locale: Locale): void {
  try {
    window.localStorage.setItem(storageKey, locale);
    unsavedLocale = null;
  } catch {
    unsavedLocale = locale;
  }
  for (const listener of listeners) {
    listener();
  }
}

// 言語が変わったときに呼ぶ関数を登録する。ほかのタブで変えたときも呼ぶ。
export function subscribeLocale(listener: () => void): () => void {
  const onStorage = (event: StorageEvent) => {
    if (event.key === storageKey) {
      listener();
    }
  };
  listeners.add(listener);
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}
