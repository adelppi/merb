import { describe, expect, it } from "vitest";
import en from "./messages/en.json";
import ja from "./messages/ja.json";

// 文言のオブジェクトのキーを、入れ子を "." でつないだ形で並べる。
function keys(value: unknown, prefix = ""): string[] {
  if (typeof value !== "object" || value === null) {
    return [prefix];
  }
  return Object.entries(value)
    .flatMap(([key, child]) => keys(child, prefix ? `${prefix}.${key}` : key))
    .sort();
}

describe("文言のファイル", () => {
  it("日本語と英語が同じキーを持つ", () => {
    expect(keys(en)).toEqual(keys(ja));
  });
});
