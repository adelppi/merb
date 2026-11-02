import { expect, test } from "@playwright/test";

test("言語を保存していないときは、日本語で出す", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: "設定" })).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("lang", "ja");
});

test("設定画面で英語を選ぶと英語になり、開き直しても英語のまま", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("link", { name: "設定" }).click();
  await page.getByRole("radio", { name: "English" }).check();

  await expect(page.getByRole("heading", { name: "Settings" })).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");

  await page.goto("/");
  await expect(page.getByRole("link", { name: "Settings" })).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
});

test("英語を選んだあと日本語を選ぶと、日本語に戻る", async ({ page }) => {
  await page.goto("/settings");
  await page.getByRole("radio", { name: "English" }).check();
  await expect(page.getByRole("heading", { name: "Settings" })).toBeVisible();

  await page.getByRole("radio", { name: "日本語" }).check();
  await expect(page.getByRole("heading", { name: "設定" })).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("lang", "ja");

  await page.reload();
  await expect(page.getByRole("heading", { name: "設定" })).toBeVisible();
});

test("保存した値が日本語と英語のどちらでもないときは、日本語で出す", async ({
  page,
}) => {
  await page.addInitScript(() => {
    window.localStorage.setItem("merb.locale", "fr");
  });
  await page.goto("/");
  await expect(page.getByRole("link", { name: "設定" })).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("lang", "ja");
});
