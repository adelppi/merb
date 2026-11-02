import type { Locale } from "./locale";
import en from "./messages/en.json";
import ja from "./messages/ja.json";

export type Messages = typeof ja;

export const messages: Record<Locale, Messages> = { ja, en };

declare module "next-intl" {
  interface AppConfig {
    Locale: Locale;
    Messages: Messages;
  }
}
