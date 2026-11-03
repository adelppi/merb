import { defineConfig, devices } from "@playwright/test";

const port = 3100;

export default defineConfig({
  testDir: "./e2e",
  use: {
    baseURL: `http://localhost:${port}`,
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    command: `pnpm build && pnpm start --port ${port}`,
    // 出題の画面は、e2e/fixtures/questions/ のテスト用の問題を読んでビルドする（docs/specs/quiz.md）。
    env: { MERB_QUESTIONS_DIR: "e2e/fixtures/questions" },
    url: `http://localhost:${port}`,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
