import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { parsePerspectives } from "./perspectives";

describe("parsePerspectives", () => {
  it("節 1〜7 では「観点」の欄を、節 8 では式の名前を取り出す", () => {
    const markdown = [
      "# 観点シート",
      "",
      "## 1. 数（numbers）",
      "",
      "| 観点 | 例 | LaTeX |",
      "|---|---|---|",
      "| 小数は point の後を1桁ずつ読む | 2.47 → *two point four seven* | `2.47` |",
      "| 絶対値 | \\|x\\| → *the absolute value of x* | `\\lvert x \\rvert` |",
      "",
      "## 8. まとまった数式",
      "",
      "### 代数・解析",
      "",
      "| 式 | LaTeX | 読み | 主な観点 |",
      "|---|---|---|---|",
      "| 解の公式 x = (−b ± √(b² − 4ac)) / 2a | `x` | *x* | all over |",
      "| ベイズの定理 P(A\\|B) = P(B\\|A) P(A) / P(B) | `P` | *P* | given |",
    ].join("\n");
    expect([...parsePerspectives(markdown)]).toEqual([
      "小数は point の後を1桁ずつ読む",
      "絶対値",
      "解の公式",
      "ベイズの定理",
    ]);
  });

  it("content/perspectives.md から観点と式の名前を取り出せる", () => {
    const names = parsePerspectives(
      readFileSync("content/perspectives.md", "utf8"),
    );
    expect(names).toContain("大きな数で a / one を落とさない");
    expect(names).toContain("n乗（序数＋power）");
    expect(names).toContain("≠ / > / ≥ / ≫");
    expect(names).toContain("図形（角・合同）");
    expect(names).toContain("解の公式");
    expect(names).toContain("ガウス積分");
    expect(names).toContain("正規分布");
    expect(names).not.toContain("観点");
    expect(names).not.toContain("式");
  });
});
