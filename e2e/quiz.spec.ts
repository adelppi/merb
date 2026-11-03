import { expect, type Page, test } from "@playwright/test";

// テスト用の問題（e2e/fixtures/questions/）のうち、分類 scripts-powers-roots の x^5 の1問で試す。
// 正解は「x to the fifth power」と「x to the fifth」、まぎらわしい札は「five」。
const quizUrl = "/quiz?category=scripts-powers-roots";

function answerArea(page: Page) {
  return page.getByRole("region", { name: "回答エリア" });
}

function pool(page: Page) {
  return page.getByRole("region", { name: "札置き場" });
}

// 答え合わせの結果。dnd-kit も role="status" の要素を置くので、それと分ける。
function result(page: Page) {
  return page.getByRole("status").filter({ hasText: /\S/ });
}

async function tapFromPool(page: Page, ...texts: string[]) {
  for (const text of texts) {
    await pool(page).getByRole("button", { name: text, exact: true }).click();
  }
}

test("開くと、数式と札が出る", async ({ page }) => {
  await page.goto(quizUrl);
  await expect(page.locator(".katex")).toBeVisible();
  await expect(pool(page).getByRole("button")).toHaveCount(6);
  await expect(answerArea(page).getByRole("button")).toHaveCount(0);
});

test("札をタップで運んで正解すると、ほかの読み方と次の問題が出る", async ({
  page,
}) => {
  await page.goto(quizUrl);
  await tapFromPool(page, "x", "to", "the", "fifth", "power");
  await expect(answerArea(page).getByRole("button")).toHaveText([
    "x",
    "to",
    "the",
    "fifth",
    "power",
  ]);

  // 回答エリアの札をタップすると、札置き場へ戻る。
  await answerArea(page).getByRole("button", { name: "power" }).click();
  await expect(answerArea(page).getByRole("button")).toHaveCount(4);
  await expect(pool(page).getByRole("button")).toHaveCount(2);
  await tapFromPool(page, "power");

  await page.getByRole("button", { name: "答え合わせ" }).click();
  await expect(result(page)).toHaveText("正解");
  await expect(
    page.getByRole("region", { name: "ほかの読み方" }).getByRole("listitem"),
  ).toHaveText(["x to the fifth"]);

  await page.getByRole("button", { name: "次の問題" }).click();
  await expect(answerArea(page).getByRole("button")).toHaveCount(0);
  await expect(pool(page).getByRole("button")).toHaveCount(6);
});

test("間違えると、もう一度解くか答えを見るかを選べる", async ({ page }) => {
  await page.goto(quizUrl);
  await tapFromPool(page, "x", "to", "the", "five");
  await page.getByRole("button", { name: "答え合わせ" }).click();
  await expect(result(page)).toHaveText("不正解");

  // もう一度解くと、並べた札のまま解き直せる。
  await page.getByRole("button", { name: "もう一度解く" }).click();
  await expect(answerArea(page).getByRole("button")).toHaveText([
    "x",
    "to",
    "the",
    "five",
  ]);
  await expect(page.getByRole("button", { name: "答え合わせ" })).toBeVisible();

  await page.getByRole("button", { name: "答え合わせ" }).click();
  await page.getByRole("button", { name: "答えを見る" }).click();
  await expect(
    page.getByRole("region", { name: "答え" }).getByRole("listitem"),
  ).toHaveText(["x to the fifth power", "x to the fifth"]);
  await expect(page.getByRole("button", { name: "次の問題" })).toBeVisible();
});

test("札が1枚もなくても答え合わせができる", async ({ page }) => {
  await page.goto(quizUrl);
  await page.getByRole("button", { name: "答え合わせ" }).click();
  await expect(result(page)).toHaveText("不正解");
});

test("札置き場の札を、ドラッグで回答エリアへ運べる", async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, "タッチのドラッグは Playwright で動かせないため");
  await page.goto(quizUrl);
  await tapFromPool(page, "to");

  // 「x」を、回答エリアの「to」の上に落とすと、その前に入る。
  const card = pool(page).getByRole("button", { name: "x", exact: true });
  const target = answerArea(page).getByRole("button", { name: "to" });
  await dragTo(page, card, target);
  await expect(answerArea(page).getByRole("button")).toHaveText(["x", "to"]);

  // 回答エリアの札を札置き場に落とすと、札置き場へ戻る。
  await dragTo(
    page,
    answerArea(page).getByRole("button", { name: "x" }),
    pool(page),
  );
  await expect(answerArea(page).getByRole("button")).toHaveText(["to"]);
});

async function dragTo(
  page: Page,
  from: ReturnType<Page["locator"]>,
  to: ReturnType<Page["locator"]>,
) {
  const a = await from.boundingBox();
  const b = await to.boundingBox();
  if (!a || !b) {
    throw new Error("札か落とす先が見えない");
  }
  await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2);
  await page.mouse.down();
  await page.mouse.move(a.x + a.width / 2 + 10, a.y + a.height / 2, {
    steps: 5,
  });
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 10 });
  await page.mouse.up();
}

test("英語を選んでいるときは、英語の文言で出る", async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem("merb.locale", "en");
  });
  await page.goto(quizUrl);
  await expect(page.getByRole("button", { name: "Check" })).toBeVisible();
  await expect(page.getByRole("region", { name: "Answer area" })).toBeVisible();
  await page.getByRole("button", { name: "Check" }).click();
  await expect(result(page)).toHaveText("Incorrect");
});
