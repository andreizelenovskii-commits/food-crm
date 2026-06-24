import { test, expect } from "@playwright/test";

test("local shift browser workflow entrypoint is wired to isolated ports", async ({ page }) => {
  await page.goto("/dev");
  await expect(page).toHaveURL(/127\.0\.0\.1:3001/);
});
