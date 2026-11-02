"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

export function HomeContent() {
  const t = useTranslations("Home");
  return (
    <main>
      <h1>merb</h1>
      <Link href="/settings">{t("settings")}</Link>
    </main>
  );
}
