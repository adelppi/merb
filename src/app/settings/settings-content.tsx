"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { localeNames, locales } from "@/i18n/locale";
import { saveLocale } from "@/i18n/storage";

export function SettingsContent() {
  const t = useTranslations("Settings");
  const current = useLocale();
  return (
    <main>
      <h1>{t("title")}</h1>
      <fieldset>
        <legend>{t("language")}</legend>
        {locales.map((locale) => (
          <label key={locale} lang={locale}>
            <input
              type="radio"
              name="locale"
              value={locale}
              checked={locale === current}
              onChange={() => saveLocale(locale)}
            />
            {localeNames[locale]}
          </label>
        ))}
      </fieldset>
      <Link href="/">{t("back")}</Link>
    </main>
  );
}
