import { spawn } from "node:child_process";
import {
  ensureDockerReady,
  ensureLocalDirs,
  run,
  waitForPostgres,
  waitForUrl,
} from "./local-utils.mjs";
import {
  checkServiceHealth,
  serviceStatus,
  startService,
  withStartLock,
} from "./local-process-manager.mjs";

async function main() {
  ensureLocalDirs();

  await withStartLock(async () => {
    await ensureDockerReady();
    await run("docker", ["compose", "up", "-d", "postgres"]);
    await waitForPostgres();

    const backend = await serviceStatus("backend");
    const frontend = await serviceStatus("frontend");

    if (
      backend.status === "RUNNING" &&
      frontend.status === "RUNNING" &&
      await checkServiceHealth("http://127.0.0.1:4000/api/v1/health") &&
      await checkServiceHealth("http://localhost:3000/api/health")
    ) {
      console.log("FoodLike local environment is already running");
      return;
    }

    const api = await startService("backend");
    console.log(`${api.started ? "Started" : "Reused"} backend PID ${api.pid}`);
    await waitForUrl("http://127.0.0.1:4000/api/v1/health", "backend");

    const web = await startService("frontend");
    console.log(`${web.started ? "Started" : "Reused"} frontend PID ${web.pid}`);
    await waitForUrl("http://localhost:3000/api/health", "frontend");

    console.log("");
    console.log("Local FoodLike is ready in background");
    console.log("Dev health: http://localhost:3000/dev");
    console.log("Login:      http://localhost:3000/login");
    console.log("");
    console.log("Useful commands:");
    console.log("  npm run local:logs");
    console.log("  npm run local:status");
    console.log("  npm run local:stop");

    if (process.argv.includes("--open") && process.platform === "darwin") {
      spawn("open", ["http://localhost:3000/dev"], { detached: true, stdio: "ignore" }).unref();
    }
  });
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
