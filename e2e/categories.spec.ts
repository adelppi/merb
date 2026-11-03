import { expect, type Page, test } from "@playwright/test";

// テスト用の問題（e2e/fixtures/questions/）は、分類 scripts-powers-roots の x^5 と、
// 分類 fractions の 1/5 の2問。ほかの分類には問題がない。

const categoryNames = [
  "数",
  "分数",
  "添え字・累乗・根号",
  "四則演算・括弧",
  "ベクトル・行列・関数",
  "微分・積分・総和",
  "等式・不等式・関係記号",
  "まとまった数式",
];

// 出ている問題の LaTeX。KaTeX が MathML に入れる元の LaTeX を読む。
function latex(page: Page) {
  return page.locator(".katex annotation");
}

// 答えを見てから、次の問題を出す。
async function nextQuestion(page: Page) {
  await page.getByRole("button", { name: "答え合わせ" }).click();
  await page.getByRole("button", { name: "答えを見る" }).click();
  await page.getByRole("button", { name: "次の問題" }).click();
}

test("トップページから開くと、8つの分類が並び、選ぶまで始められない", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("link", { name: "問題を解く" }).click();
  await expect(page).toHaveURL(/\/categories$/);

  const boxes = page.getByRole("checkbox");
  await expect(boxes).toHaveCount(8);
  for (const [i, name] of categoryNames.entries()) {
    await expect(boxes.nth(i)).toHaveAccessibleName(name);
  }

  // 問題がない分類は選べない。
  await expect(
    page.getByRole("checkbox", { name: "分数", exact: true }),
  ).toBeEnabled();
  await expect(
    page.getByRole("checkbox", { name: "添え字・累乗・根号", exact: true }),
  ).toBeEnabled();
  await expect(
    page.getByRole("checkbox", { name: "数", exact: true }),
  ).toBeDisabled();

  const start = page.getByRole("button", { name: "選んだ分類で始める" });
  await expect(start).toBeDisabled();
  await page.getByRole("checkbox", { name: "分数", exact: true }).check();
  await expect(start).toBeEnabled();
  await page.getByRole("checkbox", { name: "分数", exact: true }).uncheck();
  await expect(start).toBeDisabled();
});

test("分類を選んで始めると、その分類の問題だけが続けて出る", async ({
  page,
}) => {
  await page.goto("/categories");
  await page.getByRole("checkbox", { name: "分数", exact: true }).check();
  await page.getByRole("button", { name: "選んだ分類で始める" }).click();
  await expect(page).toHaveURL(/\/quiz\?category=fractions$/);

  for (let i = 0; i < 3; i++) {
    await expect(latex(page)).toHaveText("\\frac{1}{5}");
    await nextQuestion(page);
  }
  await expect(latex(page)).toHaveText("\\frac{1}{5}");
});

test("すべての分類から出すと、どの分類の問題も出る", async ({ page }) => {
  await page.goto("/categories");
  await page.getByRole("link", { name: "すべての分類から出す" }).click();
  await expect(page).toHaveURL(/\/quiz$/);

  // 問題は2問で、直前と同じ問題は出ないので、次の問題で必ずもう一方が出る。
  await expect(latex(page)).toHaveText(/^(x\^5|\\frac\{1\}\{5\})$/);
  const first = await latex(page).textContent();
  await nextQuestion(page);
  await expect(latex(page)).not.toHaveText(first ?? "");
  await expect(latex(page)).toHaveText(/^(x\^5|\\frac\{1\}\{5\})$/);
});

test("出題の画面から、同じ分類を選んだ状態で選び直せる", async ({ page }) => {
  await page.goto("/quiz?category=fractions&category=scripts-powers-roots");
  await page.getByRole("link", { name: "分類を選び直す" }).click();
  await expect(page).toHaveURL(
    /\/categories\?category=fractions&category=scripts-powers-roots$/,
  );
  await expect(
    page.getByRole("checkbox", { name: "分数", exact: true }),
  ).toBeChecked();
  await expect(
    page.getByRole("checkbox", { name: "添え字・累乗・根号", exact: true }),
  ).toBeChecked();
  await expect(
    page.getByRole("checkbox", { name: "数", exact: true }),
  ).not.toBeChecked();

  // 選び直して始めると、選んだ分類だけが出る。
  await page.getByRole("checkbox", { name: "分数", exact: true }).uncheck();
  await page.getByRole("button", { name: "選んだ分類で始める" }).click();
  await expect(page).toHaveURL(/\/quiz\?category=scripts-powers-roots$/);
  await expect(latex(page)).toHaveText("x^5");
});

test("英語を選んでいるときは、分類を選ぶ画面が英語で出る", async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem("merb.locale", "en");
  });
  await page.goto("/categories");
  await expect(
    page.getByRole("heading", { name: "Choose categories" }),
  ).toBeVisible();
  await expect(
    page.getByRole("checkbox", {
      name: "Suffixes, powers, roots",
      exact: true,
    }),
  ).toBeEnabled();
  await expect(
    page.getByRole("button", { name: "Start with selected" }),
  ).toBeDisabled();
  await expect(
    page.getByRole("link", { name: "From all categories" }),
  ).toBeVisible();
});
