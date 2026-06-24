import { spawn } from "node:child_process";
import {
  findBackendDir,
  frontendDir,
  run,
  savePids,
  spawnPrefixed,
  waitForPostgres,
  waitForUrl,
} from "./local-utils.mjs";

async function main() {
  const backendDir = findBackendDir();

  await run("node", ["scripts/local-doctor.mjs"]);
  await run("docker", ["compose", "up", "-d", "postgres"]);
  await waitForPostgres();

  const api = spawnPrefixed("[API]", "npm", ["run", "dev"], {
    cwd: backendDir,
    env: { NODE_ENV: "development", LOCAL_DEV_TOOLS_ENABLED: "true" },
  });
  savePids([api.pid].filter(Boolean));
  await waitForUrl("http://127.0.0.1:4000/api/v1/health", "backend");

  const web = spawnPrefixed("[WEB]", "npm", ["run", "dev"], { cwd: frontendDir });
  savePids([api.pid, web.pid].filter(Boolean));
  await waitForUrl("http://localhost:3000/api/health", "frontend");

  console.log("");
  console.log("Local FoodLike is ready");
  console.log("CRM:             http://localhost:3000/login");
  console.log("Dispatcher:      http://localhost:3000/dispatcher/orders");
  console.log("Kitchen:         http://localhost:3000/kitchen");
  console.log("Shift history:   http://localhost:3000/dashboard/sales/shifts");
  console.log("Public site:     http://localhost:3000/menu/пицца");
  console.log("Dev health:      http://localhost:3000/dev");
  console.log("Backend health:  http://127.0.0.1:4000/api/v1/health");

  if (process.platform === "darwin" && !process.env.FOODLIKE_NO_OPEN) {
    spawn("open", ["http://localhost:3000/login"], { stdio: "ignore", detached: true }).unref();
  }

  const stop = () => {
    for (const child of [web, api]) {
      if (!child.killed) {
        child.kill("SIGTERM");
      }
    }
    savePids([]);
    process.exit(0);
  };

  process.on("SIGINT", stop);
  process.on("SIGTERM", stop);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
