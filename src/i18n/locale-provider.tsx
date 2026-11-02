"use client";

import { NextIntlClientProvider } from "next-intl";
import { type ReactNode, useEffect, useSyncExternalStore } from "react";
import { defaultLocale } from "./locale";
import { messages } from "./messages";
import { getStoredLocale, subscribeLocale } from "./storage";

// 保存した言語の文言を子に渡す。ビルドのときは既定の言語で描く。
export function LocaleProvider({ children }: { children: ReactNode }) {
  const locale = useSyncExternalStore(
    subscribeLocale,
    getStoredLocale,
    () => defaultLocale,
  );

  useEffect(() => {
    const root = document.documentElement;
    root.lang = locale;
    // 保存した言語の文言に差し替わったら、<head> のスクリプトが隠した本文を見せる。
    if (locale === getStoredLocale()) {
      root.style.removeProperty("visibility");
    }
  }, [locale]);

  return (
    <NextIntlClientProvider
      locale={locale}
      messages={messages[locale]}
      timeZone="Asia/Tokyo"
    >
      {children}
    </NextIntlClientProvider>
  );
}
