import type { Metadata } from "next";
import type { ReactNode } from "react";
import { localeScript } from "@/i18n/locale";
import { LocaleProvider } from "@/i18n/locale-provider";

export const metadata: Metadata = {
  title: "merb",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    // <head> のスクリプトと LocaleProvider が lang と style を書き換えるので、食い違いの警告を出さない。
    <html lang="ja" suppressHydrationWarning>
      <head>
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: 中身はこのリポジトリで組み立てた固定の文字列 */}
        <script dangerouslySetInnerHTML={{ __html: localeScript }} />
      </head>
      <body>
        <LocaleProvider>{children}</LocaleProvider>
      </body>
    </html>
  );
}
