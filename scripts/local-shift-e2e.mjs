import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { localReportsDir, run } from "./local-utils.mjs";

async function hasPlaywright() {
  try {
    await import("@playwright/test");
    return true;
  } catch {
    return false;
  }
}

async function main() {
  if (!await hasPlaywright()) {
    console.log("Playwright is not installed.");
    console.log("Install it with:");
    console.log("  npm install -D @playwright/test");
    console.log("  npx playwright install chromium");
    process.exitCode = 2;
    return;
  }

  const reportDir = resolve(localReportsDir, "playwright-shift");
  mkdirSync(reportDir, { recursive: true });
  await run("npx", ["playwright", "test", "-c", "playwright.local.config.ts"]);
  if (!existsSync(resolve(reportDir, "README.txt"))) {
    writeFileSync(resolve(reportDir, "README.txt"), "Playwright shift report directory.\n");
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
