import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { findBackendDir, run } from "./local-utils.mjs";
import { checkServiceHealth, serviceStatus } from "./local-process-manager.mjs";

async function dockerPostgresRunning() {
  try {
    await run("docker", ["compose", "exec", "-T", "postgres", "pg_isready", "-U", "food_crm_local", "-d", "food_crm_local"], {
      stdio: "ignore",
    });
    return true;
  } catch {
    return false;
  }
}

async function readOrderingStatus() {
  try {
    const response = await fetch("http://127.0.0.1:4000/api/v1/public/ordering-status", { cache: "no-store" });
    const payload = await response.json();
    return payload.data;
  } catch {
    return null;
  }
}

function readClockState() {
  const clockFile = resolve(findBackendDir(), ".local-dev-clock.json");
  if (!existsSync(clockFile)) {
    return "REAL";
  }

  try {
    const payload = JSON.parse(readFileSync(clockFile, "utf8"));
    return payload.now ? `OVERRIDDEN ${payload.now}` : "OVERRIDDEN";
  } catch {
    return "OVERRIDDEN invalid file";
  }
}

function line(label, value) {
  console.log(`${label.padEnd(15)} ${value}`);
}

async function main() {
  const [backend, frontend, db, backendHealth, frontendHealth, ordering] = await Promise.all([
    serviceStatus("backend"),
    serviceStatus("frontend"),
    dockerPostgresRunning(),
    checkServiceHealth("http://127.0.0.1:4000/api/v1/health"),
    checkServiceHealth("http://localhost:3000/api/health"),
    readOrderingStatus(),
  ]);

  line("Database", db ? "RUNNING" : "STOPPED");
  line("Backend", backend.status + (backend.pid ? ` PID ${backend.pid}` : ""));
  line("Frontend", frontend.status + (frontend.pid ? ` PID ${frontend.pid}` : ""));
  line("Backend health", backendHealth ? "OK" : "FAIL");
  line("Frontend health", frontendHealth ? "OK" : "FAIL");
  line("Current clock", readClockState());
  line("Current shift", ordering?.reason ?? "UNKNOWN");
  line("Ordering", ordering ? (ordering.acceptingOrders ? "OPEN" : "CLOSED") : "UNKNOWN");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
