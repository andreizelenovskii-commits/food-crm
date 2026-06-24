import { spawn } from "node:child_process";
import { createServer } from "node:net";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { randomBytes } from "node:crypto";

export const frontendDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
export const localDatabaseUrl = "postgresql://food_crm_local:food_crm_local_dev@127.0.0.1:5432/food_crm_local?schema=public";
export const localDir = resolve(frontendDir, ".local");
export const localPidsDir = resolve(localDir, "pids");
export const localLogsDir = resolve(localDir, "logs");
export const localLocksDir = resolve(localDir, "locks");
export const localBackupsDir = resolve(localDir, "backups");
export const localReportsDir = resolve(localDir, "reports");
export const runtimeFile = resolve(localDir, "runtime.json");
export const pidFile = resolve(localPidsDir, "local-dev-pids.json");

export function ensureLocalDirs() {
  for (const dir of [localDir, localPidsDir, localLogsDir, localLocksDir, localBackupsDir, localReportsDir]) {
    mkdirSync(dir, { recursive: true });
  }
}

export function localPath(...parts) {
  ensureLocalDirs();
  return resolve(localDir, ...parts);
}

export function sleep(ms) {
  return new Promise((resolvePromise) => setTimeout(resolvePromise, ms));
}

export function findBackendDir() {
  const candidates = [
    process.env.FOODLIKE_BACKEND_DIR,
    "../food-crm-backend",
    "../food-crm-backend-dev",
    "../food-crm-backend-clone",
  ].filter(Boolean);

  for (const candidate of candidates) {
    const dir = resolve(frontendDir, candidate);

    if (existsSync(resolve(dir, "package.json")) && existsSync(resolve(dir, "prisma/schema.prisma"))) {
      return dir;
    }
  }

  throw new Error("Backend repo not found. Set FOODLIKE_BACKEND_DIR or place it next to frontend.");
}

export function run(command, args, options = {}) {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(command, args, {
      cwd: options.cwd ?? frontendDir,
      env: { ...process.env, ...(options.env ?? {}) },
      stdio: options.stdio ?? "inherit",
      shell: false,
    });

    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) {
        resolvePromise();
      } else {
        reject(new Error(`${command} ${args.join(" ")} exited with ${code}`));
      }
    });
  });
}

export function spawnPrefixed(prefix, command, args, options = {}) {
  const child = spawn(command, args, {
    cwd: options.cwd ?? frontendDir,
    env: { ...process.env, ...(options.env ?? {}) },
    stdio: ["ignore", "pipe", "pipe"],
    shell: false,
  });

  const write = (stream, chunk) => {
    for (const line of chunk.toString().split(/\r?\n/)) {
      if (line) {
        stream.write(`${prefix} ${line}\n`);
      }
    }
  };

  child.stdout.on("data", (chunk) => write(process.stdout, chunk));
  child.stderr.on("data", (chunk) => write(process.stderr, chunk));

  return child;
}

export function randomSecret() {
  return randomBytes(48).toString("base64url");
}

export function readEnvFile(path) {
  if (!existsSync(path)) {
    return new Map();
  }

  const values = new Map();
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const index = trimmed.indexOf("=");
    if (index === -1) continue;
    values.set(trimmed.slice(0, index), trimmed.slice(index + 1));
  }
  return values;
}

export function assertLocalDatabaseUrl(databaseUrl) {
  const url = new URL(databaseUrl);
  const hostname = url.hostname;
  const database = url.pathname.replace(/^\//, "");

  if (!["localhost", "127.0.0.1"].includes(hostname) || database !== "food_crm_local") {
    throw new Error("Refusing non-local DATABASE_URL. Expected localhost/127.0.0.1 and database food_crm_local.");
  }
}

export function getBackendEnv(backendDir = findBackendDir()) {
  return readEnvFile(resolve(backendDir, ".env"));
}

export function assertBackendEnvIsLocal(backendDir = findBackendDir()) {
  const backendEnv = getBackendEnv(backendDir);
  assertLocalDatabaseUrl(backendEnv.get("DATABASE_URL") ?? "");
  return backendEnv;
}

export function writeFrontendEnvIfMissing() {
  const target = resolve(frontendDir, ".env.local");

  if (existsSync(target)) {
    return false;
  }

  writeFileSync(target, [
    "SESSION_SECRET=" + randomSecret(),
    "BACKEND_API_URL=http://127.0.0.1:4000",
    "BACKEND_INTERNAL_API_URL=http://127.0.0.1:4000",
    "BACKEND_SESSION_COOKIE_NAME=food_crm_local_api_session",
    "LOCAL_SMOKE_PHONE=+7 900 100-00-09",
    "LOCAL_SMOKE_PASSWORD=" + randomSecret(),
    "NEXT_PUBLIC_PUBLIC_SITE_URL=http://localhost:3000",
    "NEXT_PUBLIC_CRM_PRODUCTION_URL=http://localhost:3000",
    "NEXT_PUBLIC_APP_ENV=local",
    "",
  ].join("\n"), { mode: 0o600 });
  return true;
}

export function writeBackendEnvIfMissing(backendDir) {
  const target = resolve(backendDir, ".env");

  if (existsSync(target)) {
    return false;
  }

  writeFileSync(target, [
    "NODE_ENV=development",
    "HOST=127.0.0.1",
    "PORT=4000",
    `DATABASE_URL=${localDatabaseUrl}`,
    "SESSION_SECRET=" + randomSecret(),
    "BACKEND_SESSION_COOKIE_NAME=food_crm_local_api_session",
    "BACKEND_CLIENT_SESSION_COOKIE_NAME=food_crm_local_client_session",
    "BACKEND_SESSION_COOKIE_DOMAIN=",
    "BACKEND_SESSION_TTL_DAYS=30",
    "BACKEND_CORS_ORIGIN=http://localhost:3000,http://127.0.0.1:3000",
    "SMSAERO_ENABLED=false",
    "SMSAERO_EMAIL=",
    "SMSAERO_API_KEY=",
    "SMSAERO_SIGN=SMS Aero",
    "BUSINESS_TIME_ZONE=Asia/Sakhalin",
    "LOCAL_DEV_TOOLS_ENABLED=true",
    "LOCAL_SMOKE_PHONE=+7 900 100-00-09",
    "LOCAL_SMOKE_PASSWORD=" + randomSecret(),
    "",
  ].join("\n"), { mode: 0o600 });
  return true;
}

export async function waitForUrl(url, label, timeoutMs = 60_000) {
  const startedAt = Date.now();
  let lastError = null;

  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(url, { cache: "no-store" });
      if (response.ok || response.status < 500) {
        return;
      }
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolvePromise) => setTimeout(resolvePromise, 1000));
  }

  throw new Error(`${label} did not become ready at ${url}${lastError ? `: ${lastError.message}` : ""}`);
}

export async function waitForPostgres(timeoutMs = 60_000) {
  const startedAt = Date.now();
  let lastError = null;

  while (Date.now() - startedAt < timeoutMs) {
    try {
      await run("docker", [
        "compose",
        "exec",
        "-T",
        "postgres",
        "pg_isready",
        "-U",
        "food_crm_local",
        "-d",
        "food_crm_local",
      ], { stdio: "ignore" });
      return;
    } catch (error) {
      lastError = error;
      await sleep(1000);
    }
  }

  throw new Error(`PostgreSQL did not become ready${lastError instanceof Error ? `: ${lastError.message}` : ""}`);
}

export async function ensureDockerReady(timeoutMs = 120_000) {
  try {
    await run("docker", ["--version"], { stdio: "ignore" });
  } catch (error) {
    if (error instanceof Error && error.message.includes("ENOENT")) {
      throw new Error("Docker CLI was not found. Install Docker Desktop and make sure `docker` is available in PATH.");
    }
  }

  if (process.platform === "darwin") {
    await run("open", ["-ga", "Docker"], { stdio: "ignore" }).catch(() => undefined);
  }

  const startedAt = Date.now();
  let lastError = null;
  while (Date.now() - startedAt < timeoutMs) {
    try {
      await run("docker", ["info"], { stdio: "ignore" });
      return;
    } catch (error) {
      lastError = error;
      await sleep(2000);
    }
  }

  throw new Error(`Docker did not become ready${lastError instanceof Error ? `: ${lastError.message}` : ""}`);
}

export function checkPortFree(port) {
  return new Promise((resolvePromise) => {
    const server = createServer();
    server.once("error", () => resolvePromise(false));
    server.once("listening", () => {
      server.close(() => resolvePromise(true));
    });
    server.listen(port, "127.0.0.1");
  });
}

export function savePids(pids) {
  ensureLocalDirs();
  writeFileSync(pidFile, `${JSON.stringify({ pids }, null, 2)}\n`);
}

export function readPids() {
  if (!existsSync(pidFile)) {
    return [];
  }

  try {
    const payload = JSON.parse(readFileSync(pidFile, "utf8"));
    return Array.isArray(payload.pids) ? payload.pids.filter(Number.isInteger) : [];
  } catch {
    return [];
  }
}

export function removeIfExists(path) {
  if (existsSync(path)) {
    rmSync(path, { force: true, recursive: false });
  }
}
