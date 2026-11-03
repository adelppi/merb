import { NextIntlClientProvider } from "next-intl";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { messages } from "@/i18n/messages";
import type { CategoryId } from "@/questions/schema";
import { CategorySelect } from "./category-select";

function render(
  locale: "ja" | "en",
  available: CategoryId[],
  initial: CategoryId[] = [],
) {
  return renderToString(
    createElement(NextIntlClientProvider, {
      locale,
      messages: messages[locale],
      timeZone: "Asia/Tokyo",
      // biome-ignore lint/correctness/noChildrenProp: NextIntlClientProvider の型が children を props で求める
      children: createElement(CategorySelect, { available, initial }),
    }),
  );
}

// 分類のチェックボックスを、並びの順に取り出す。
function checkboxes(html: string) {
  return [...html.matchAll(/<input type="checkbox"[^>]*>/g)].map(([tag]) => ({
    value: tag.match(/value="([^"]+)"/)?.[1],
    checked: tag.includes("checked"),
    disabled: tag.includes("disabled"),
  }));
}

describe("CategorySelect", () => {
  it("8つの分類を並べ、問題がない分類は選べない", () => {
    const boxes = checkboxes(render("ja", ["fractions", "calculus"]));
    expect(boxes.map((box) => box.value)).toEqual([
      "numbers",
      "fractions",
      "scripts-powers-roots",
      "arithmetic",
      "vectors-functions",
      "calculus",
      "relations",
      "combined",
    ]);
    expect(
      boxes.filter((box) => !box.disabled).map((box) => box.value),
    ).toEqual(["fractions", "calculus"]);
  });

  it("開いたときに選ぶ分類のうち、問題がある分類だけを選んだ状態にする", () => {
    const boxes = checkboxes(
      render("ja", ["fractions"], ["fractions", "numbers"]),
    );
    expect(boxes.filter((box) => box.checked).map((box) => box.value)).toEqual([
      "fractions",
    ]);
  });

  it("分類を1つも選んでいないときは、始めるボタンを押せない", () => {
    expect(render("ja", ["fractions"])).toMatch(
      /<button type="submit" disabled="">選んだ分類で始める<\/button>/,
    );
    expect(render("ja", ["fractions"], ["fractions"])).toMatch(
      /<button type="submit">選んだ分類で始める<\/button>/,
    );
  });

  it("文言と分類の名前を、選んでいる言語で出す", () => {
    const ja = render("ja", ["fractions"]);
    expect(ja).toContain("分類を選ぶ");
    expect(ja).toContain("添え字・累乗・根号");
    expect(ja).toContain("すべての分類から出す");
    const en = render("en", ["fractions"]);
    expect(en).toContain("Choose categories");
    expect(en).toContain("Suffixes, powers, roots");
    expect(en).toContain("From all categories");
  });
});
