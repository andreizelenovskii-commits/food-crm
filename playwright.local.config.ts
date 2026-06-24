import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  retries: 1,
  reporter: [["html", { outputFolder: ".local/reports/playwright-shift", open: "never" }]],
  use: {
    baseURL: "http://127.0.0.1:3001",
    screenshot: "only-on-failure",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { browserName: "chromium" },
    },
  ],
});
