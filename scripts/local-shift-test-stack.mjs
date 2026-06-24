import { createHmac } from "node:crypto";
import { spawn } from "node:child_process";
import { openSync, closeSync, rmSync } from "node:fs";
import { resolve } from "node:path";
import {
  ensureLocalDirs,
  ensureDockerReady,
  findBackendDir,
  localReportsDir,
  run,
  sleep,
  waitForUrl,
} from "./local-utils.mjs";

export const shiftTest = {
  frontendUrl: "http://127.0.0.1:3001",
  backendUrl: "http://127.0.0.1:4001",
  databaseUrl: "postgresql://food_crm_shift_test:food_crm_shift_test_dev@127.0.0.1:5433/food_crm_shift_test?schema=public",
  sessionSecret: "foodlike-local-shift-test-secret",
  employeeCookieName: "food_crm_shift_test_api_session",
  clientCookieName: "food_crm_shift_test_client_session",
};

export function makePublicClientCookie(phone = "79002000001") {
  const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000;
  const payload = Buffer.from(JSON.stringify({ phone, expiresAt })).toString("base64url");
  const signature = createHmac("sha256", shiftTest.sessionSecret)
    .update(`client:${payload}`)
    .digest("hex");
  return `${shiftTest.clientCookieName}=${payload}.${signature}`;
}

export async function waitForShiftPostgres(timeoutMs = 60_000) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    try {
      await run("docker", [
        "compose",
        "-f",
        "docker-compose.shift-test.yml",
        "exec",
        "-T",
        "postgres-shift-test",
        "pg_isready",
        "-U",
        "food_crm_shift_test",
        "-d",
        "food_crm_shift_test",
      ], { stdio: "ignore" });
      return;
    } catch {
      await sleep(1000);
    }
  }
  throw new Error("Shift test PostgreSQL did not become ready");
}

export async function prepareShiftDatabase() {
  const backendDir = findBackendDir();
  await ensureDockerReady();
  await run("docker", ["compose", "-f", "docker-compose.shift-test.yml", "up", "-d", "postgres-shift-test"]);
  await waitForShiftPostgres();
  await run("npx", ["prisma", "generate"], { cwd: backendDir });
  await run("npm", ["run", "db:deploy"], { cwd: backendDir, env: { DATABASE_URL: shiftTest.databaseUrl } });
  await run("npm", ["run", "db:seed:dev"], { cwd: backendDir, env: { DATABASE_URL: shiftTest.databaseUrl } });
}

export async function startShiftBackend() {
  ensureLocalDirs();
  const backendDir = findBackendDir();
  const clockFile = resolve(localReportsDir, "shift-test-clock.json");
  const logFile = resolve(localReportsDir, "shift-test-backend.log");
  const out = openSync(logFile, "a");
  const err = openSync(logFile, "a");
  const child = spawn("npm", ["run", "dev"], {
    cwd: backendDir,
    env: {
      ...process.env,
      NODE_ENV: "development",
      HOST: "127.0.0.1",
      PORT: "4001",
      DATABASE_URL: shiftTest.databaseUrl,
      SESSION_SECRET: shiftTest.sessionSecret,
      BACKEND_SESSION_COOKIE_NAME: shiftTest.employeeCookieName,
      BACKEND_CLIENT_SESSION_COOKIE_NAME: shiftTest.clientCookieName,
      BACKEND_SESSION_COOKIE_DOMAIN: "",
      BACKEND_CORS_ORIGIN: "http://127.0.0.1:3001,http://localhost:3001",
      SMSAERO_ENABLED: "false",
      BUSINESS_TIME_ZONE: "Asia/Sakhalin",
      LOCAL_DEV_TOOLS_ENABLED: "true",
      LOCAL_DEV_CLOCK_FILE: clockFile,
    },
    stdio: ["ignore", out, err],
    shell: false,
  });
  closeSync(out);
  closeSync(err);
  await waitForUrl(`${shiftTest.backendUrl}/api/v1/health`, "shift backend");
  return { child, clockFile };
}

export async function setShiftClock(value, backendDir = findBackendDir(), clockFile = resolve(localReportsDir, "shift-test-clock.json")) {
  await run("npm", ["run", "local:time:set", "--", value], {
    cwd: backendDir,
    env: {
      NODE_ENV: "development",
      LOCAL_DEV_TOOLS_ENABLED: "true",
      LOCAL_DEV_CLOCK_FILE: clockFile,
    },
  });
}

export async function cleanupShiftTest(child, clockFile) {
  if (child && !child.killed) {
    child.kill("SIGTERM");
    await sleep(500);
  }
  if (clockFile) {
    rmSync(clockFile, { force: true });
  }
  await run("docker", ["compose", "-f", "docker-compose.shift-test.yml", "down", "-v"]).catch(() => undefined);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  prepareShiftDatabase()
    .then(() => console.log("Shift test database is ready"))
    .catch((error) => {
      console.error(error instanceof Error ? error.message : error);
      process.exit(1);
    });
}
