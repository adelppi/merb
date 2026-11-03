import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { defaultLocale, type Locale } from "./locale";
import { type Messages, messages } from "./messages";
import { loadLocale, saveLocale } from "./storage";

type I18n = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  messages: Messages;
};

const I18nContext = createContext<I18n | null>(null);

// 端末に保存した言語を読み、その言語の文言を子に渡す。読み終えるまでは何も出さない
// （英語を保存した人に、日本語が一瞬見えないようにするため）。
export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale | null>(null);

  useEffect(() => {
    let active = true;
    loadLocale(AsyncStorage).then((loaded) => {
      if (active) setLocaleState((current) => current ?? loaded);
    });
    return () => {
      active = false;
    };
  }, []);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    void saveLocale(AsyncStorage, next);
  }, []);

  const value = useMemo<I18n>(() => {
    const current = locale ?? defaultLocale;
    return { locale: current, setLocale, messages: messages[current] };
  }, [locale, setLocale]);

  if (locale === null) return null;
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

// 画面の文言と、言語を切り替える関数を返す。I18nProvider の中で使う。
export function useI18n(): I18n {
  const value = useContext(I18nContext);
  if (value === null) throw new Error("I18nProvider の外では使えません");
  return value;
}
