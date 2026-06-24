import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

function read(path: string) {
  return readFileSync(resolve(path), "utf8");
}

describe("local development environment contracts", () => {
  it("local reset refuses non-local databases", () => {
    expect(read("scripts/local-utils.mjs")).toContain("Refusing non-local DATABASE_URL");
    expect(read("scripts/local-reset.mjs")).toContain("RESET LOCAL DATABASE");
  });

  it("frontend env example keeps browser backend override disabled by default", () => {
    const source = read(".env.local.example");

    expect(source).toContain("NEXT_PUBLIC_APP_ENV=local");
    expect(source).not.toMatch(/^NEXT_PUBLIC_BACKEND_API_URL=/m);
    expect(source).not.toContain("api.crmandromeda.ru");
  });

  it("local UI is gated by NEXT_PUBLIC_APP_ENV", () => {
    expect(read("shared/app-env.ts")).toContain('APP_ENV === "local"');
    expect(read("app/dev/page.tsx")).toContain("notFound()");
  });

  it("background process manager owns only explicit local pids", () => {
    const source = read("scripts/local-process-manager.mjs");

    expect(source).toContain("start.lock");
    expect(source).toContain("stale");
    expect(source).toContain("is already used by PID");
    expect(source).toContain("stopService");
    expect(source).not.toContain("killall");
  });

  it("reset and restore use local backups with explicit safety guards", () => {
    expect(read("scripts/local-backup.mjs")).toContain("food-crm-local-");
    expect(read("scripts/local-reset.mjs")).toContain("scripts/local-backup.mjs");
    expect(read("scripts/local-reset.mjs")).toContain("--no-backup");
    expect(read("scripts/local-restore.mjs")).toContain(".dump");
    expect(read("scripts/local-restore.mjs")).toContain("RESTORE LOCAL DATABASE");
  });

  it("shift automation uses isolated ports and sanitized reports", () => {
    expect(read("docker-compose.shift-test.yml")).toContain("5433:5432");
    expect(read("scripts/local-shift-test-stack.mjs")).toContain("4001");
    expect(read("scripts/local-shift-test-stack.mjs")).toContain("3001");
    expect(read("scripts/local-shift-check.mjs")).toContain("food_crm_shift_test");
    expect(read("scripts/local-shift-check.mjs")).not.toContain("api.crmandromeda.ru");
    expect(read(".gitignore")).toContain(".local/");
  });

  it("macOS autostart never resets data or opens a browser", () => {
    const source = read("scripts/local-autostart-runner.sh.template");

    expect(source).toContain("local:start");
    expect(source).not.toContain("local:reset");
    expect(source).not.toContain("local:fresh");
    expect(source).not.toContain(" open ");
  });
});
