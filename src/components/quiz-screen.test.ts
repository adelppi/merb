import { NextIntlClientProvider } from "next-intl";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { messages } from "@/i18n/messages";
import { QuizScreen } from "./quiz-screen";

function render(locale: "ja" | "en") {
  return renderToString(
    createElement(NextIntlClientProvider, {
      locale,
      messages: messages[locale],
      timeZone: "Asia/Tokyo",
      // biome-ignore lint/correctness/noChildrenProp: NextIntlClientProvider の型が children を props で求める
      children: createElement(QuizScreen, {
        questions: [],
        categoriesHref: "/categories?category=numbers",
      }),
    }),
  );
}

describe("QuizScreen", () => {
  it("問題が1問もないときは「問題がありません」と出す", () => {
    expect(render("ja")).toContain("問題がありません");
    expect(render("en")).toContain("No questions");
  });

  it("分類を選び直すリンクとトップページへ戻るリンクを置く", () => {
    const html = render("ja");
    expect(html).toContain('href="/categories?category=numbers"');
    expect(html).toContain("分類を選び直す");
    expect(html).toContain('href="/"');
  });
});
