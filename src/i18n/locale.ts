// 画面の文言の言語。決まりは docs/specs/i18n.md に書いてある。
export const locales = ["ja", "en"] as const;

export type Locale = (typeof locales)[number];

// 言語を保存していないときに使う言語。
export const defaultLocale: Locale = "ja";

// 言語を保存するローカルストレージのキー。
export const storageKey = "merb.locale";

// 言語の選択肢の名前。選んでいる言語によらず、それぞれの言語で書く。
export const localeNames: Record<Locale, string> = {
  ja: "日本語",
  en: "English",
};

// ローカルストレージから読んだ値を言語にする。日本語か英語のどちらでもなければ、既定の言語にする。
export function parseLocale(value: unknown): Locale {
  return locales.find((locale) => locale === value) ?? defaultLocale;
}
