import { resolve } from "node:path";
import {
  assertLocalDatabaseUrl,
  checkPortFree,
  findBackendDir,
  frontendDir,
  readEnvFile,
  run,
} from "./local-utils.mjs";

const results = [];

function record(status, label, detail = "") {
  results.push({ status, label, detail });
}

async function commandOk(command, args) {
  try {
    await run(command, args, { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

async function urlOk(url) {
  try {
    const response = await fetch(url, { cache: "no-store" });
    return response.ok;
  } catch {
    return false;
  }
}

async function main() {
  let backendDir = "";

  try {
    backendDir = findBackendDir();
    record("PASS", "backend repo", backendDir);
  } catch (error) {
    record("FAIL", "backend repo", error.message);
  }

  record(await commandOk("node", ["--version"]) ? "PASS" : "FAIL", "node");
  record(await commandOk("npm", ["--version"]) ? "PASS" : "FAIL", "npm");
  record(await commandOk("docker", ["--version"]) ? "PASS" : "FAIL", "docker cli");
  record(await commandOk("docker", ["info"]) ? "PASS" : "FAIL", "docker daemon", "open -a Docker");

  const frontendEnv = readEnvFile(resolve(frontendDir, ".env.local"));
  const backendEnv = backendDir ? readEnvFile(resolve(backendDir, ".env")) : new Map();

  record(frontendEnv.size ? "PASS" : "WARN", "frontend .env.local", "npm run local:setup");
  record(backendEnv.size ? "PASS" : "WARN", "backend .env", "npm run local:setup");

  try {
    assertLocalDatabaseUrl(backendEnv.get("DATABASE_URL") ?? "");
    record("PASS", "DATABASE_URL safety", "food_crm_local");
  } catch (error) {
    record("FAIL", "DATABASE_URL safety", error.message);
  }

  const frontendCookie = frontendEnv.get("BACKEND_SESSION_COOKIE_NAME");
  const backendCookie = backendEnv.get("BACKEND_SESSION_COOKIE_NAME");
  if (!frontendEnv.size || !backendEnv.size) {
    record("WARN", "cookie names match", "npm run local:setup");
  } else {
    record(
      frontendCookie && backendCookie && frontendCookie === backendCookie ? "PASS" : "FAIL",
      "cookie names match",
      "BACKEND_SESSION_COOKIE_NAME must match",
    );
  }

  record(backendEnv.get("SMSAERO_ENABLED") === "false" ? "PASS" : "WARN", "local SMS mode", "SMSAERO_ENABLED=false");
  record(backendEnv.get("BUSINESS_TIME_ZONE") === "Asia/Sakhalin" ? "PASS" : "WARN", "business timezone");

  for (const port of [5432, 4000, 3000]) {
    const free = await checkPortFree(port);
    record(free ? "PASS" : "WARN", `port ${port}`, free ? "free" : "already in use");
  }

  record(await urlOk("http://127.0.0.1:4000/api/v1/health") ? "PASS" : "WARN", "backend health", "not running yet");
  record(await urlOk("http://localhost:3000/api/health") ? "PASS" : "WARN", "frontend health", "not running yet");

  for (const item of results) {
    console.log(`${item.status.padEnd(4)} ${item.label}${item.detail ? ` — ${item.detail}` : ""}`);
  }

  if (results.some((item) => item.status === "FAIL")) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
