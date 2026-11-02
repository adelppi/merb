import { describe, expect, it } from "vitest";
import { parseLocale } from "./locale";

describe("parseLocale", () => {
  it("日本語と英語は、そのまま返す", () => {
    expect(parseLocale("ja")).toBe("ja");
    expect(parseLocale("en")).toBe("en");
  });

  it("保存していないときや、日本語と英語のどちらでもないときは、日本語にする", () => {
    expect(parseLocale(null)).toBe("ja");
    expect(parseLocale("fr")).toBe("ja");
    expect(parseLocale("EN")).toBe("ja");
  });
});
